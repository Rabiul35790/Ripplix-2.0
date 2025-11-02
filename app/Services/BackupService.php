<?php

namespace App\Services;

use App\Models\Backup;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Illuminate\Support\Facades\DB;

class BackupService
{
    public function createBackup(string $type = 'full', ?int $userId = null): Backup
    {
        $backup = Backup::create([
            'name' => $this->generateBackupName($type),
            'disk' => 'local',
            'path' => '',
            'type' => $type,
            'status' => 'processing',
            'created_by' => $userId,
        ]);

        try {
            // Clear any previous backup temp files
            $this->clearTempDirectory();

            $this->runBackup($type);

            // Get the latest backup file with retry logic
            $latestBackup = $this->getLatestBackupFile();

            if ($latestBackup) {
                $backup->update([
                    'path' => $latestBackup['path'],
                    'size' => $latestBackup['size'],
                    'status' => 'completed',
                ]);
            } else {
                throw new \Exception('Backup file not found after completion');
            }

        } catch (\Exception $e) {
            Log::error('Backup failed: ' . $e->getMessage(), [
                'backup_id' => $backup->id,
                'type' => $type,
                'trace' => $e->getTraceAsString()
            ]);

            $backup->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }

        return $backup->fresh();
    }

    protected function runBackup(string $type): void
    {
        try {
            // Prepare command options
            $options = ['--disable-notifications' => true];

            if ($type === 'database') {
                $options['--only-db'] = true;
            } elseif ($type === 'files') {
                $options['--only-files'] = true;
            }

            // Clear output buffer
            Artisan::call('config:clear');

            // Run backup command
            $exitCode = Artisan::call('backup:run', $options);
            $output = Artisan::output();

            Log::info('Backup command output:', [
                'exit_code' => $exitCode,
                'output' => $output,
                'type' => $type
            ]);

            if ($exitCode !== 0) {
                throw new \Exception("Backup command failed. Output: " . $output);
            }

            // Give the system time to write the file
            sleep(2);

        } catch (\Exception $e) {
            Log::error('Backup command execution failed', [
                'error' => $e->getMessage(),
                'type' => $type
            ]);
            throw new \Exception('Backup execution failed: ' . $e->getMessage());
        }
    }

    protected function getLatestBackupFile(): ?array
    {
        $disk = Storage::disk('local');
        $backupName = config('backup.backup.name', config('app.name'));

        // Try multiple times with delay (in case file is still being written)
        $attempts = 0;
        $maxAttempts = 5;

        while ($attempts < $maxAttempts) {
            try {
                $backupPath = $backupName;

                if (!$disk->exists($backupPath)) {
                    Log::warning("Backup directory not found: {$backupPath}");
                    $attempts++;
                    sleep(1);
                    continue;
                }

                $files = collect($disk->files($backupPath))
                    ->filter(fn($file) => Str::endsWith($file, '.zip'))
                    ->sortByDesc(fn($file) => $disk->lastModified($file));

                if ($files->isEmpty()) {
                    Log::warning("No zip files found in: {$backupPath}, attempt {$attempts}");
                    $attempts++;
                    sleep(1);
                    continue;
                }

                $latestFile = $files->first();

                return [
                    'path' => $latestFile,
                    'size' => $disk->size($latestFile),
                ];

            } catch (\Exception $e) {
                Log::error("Error getting backup file, attempt {$attempts}: " . $e->getMessage());
                $attempts++;
                sleep(1);
            }
        }

        return null;
    }

    protected function clearTempDirectory(): void
    {
        try {
            $tempDir = storage_path('app/backup-temp');
            if (is_dir($tempDir)) {
                $files = glob($tempDir . '/*');
                foreach ($files as $file) {
                    if (is_file($file)) {
                        @unlink($file);
                    }
                }
            }
        } catch (\Exception $e) {
            Log::warning('Could not clear temp directory: ' . $e->getMessage());
        }
    }

    protected function generateBackupName(string $type): string
    {
        $timestamp = now()->format('Y-m-d_H-i-s');
        $appName = Str::slug(config('app.name'));

        return "{$appName}_{$type}_backup_{$timestamp}.zip";
    }

    public function cleanOldBackups(int $daysToKeep = 30): int
    {
        $deletedCount = 0;
        $cutoffDate = now()->subDays($daysToKeep);

        $oldBackups = Backup::where('created_at', '<', $cutoffDate)->get();

        foreach ($oldBackups as $backup) {
            $backup->delete();
            $deletedCount++;
        }

        // Also run the package cleanup
        try {
            Artisan::call('backup:clean');
        } catch (\Exception $e) {
            Log::warning('Backup cleanup command failed: ' . $e->getMessage());
        }

        return $deletedCount;
    }

    public function getBackupStatistics(): array
    {
        $disk = Storage::disk('local');
        $backupPath = config('backup.backup.name', config('app.name'));

        $totalSize = 0;
        $fileCount = 0;

        try {
            if ($disk->exists($backupPath)) {
                $files = $disk->files($backupPath);
                $fileCount = count($files);

                foreach ($files as $file) {
                    $totalSize += $disk->size($file);
                }
            }
        } catch (\Exception $e) {
            Log::error('Error getting backup statistics: ' . $e->getMessage());
        }

        return [
            'total_backups' => Backup::count(),
            'completed_backups' => Backup::where('status', 'completed')->count(),
            'failed_backups' => Backup::where('status', 'failed')->count(),
            'total_size' => $totalSize,
            'file_count' => $fileCount,
            'last_backup' => Backup::where('status', 'completed')
                ->latest()
                ->first()?->created_at,
        ];
    }

    /**
     * Test database connection before backup
     */
    public function testDatabaseConnection(): bool
    {
        try {
            DB::connection()->getPdo();
            return true;
        } catch (\Exception $e) {
            Log::error('Database connection test failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if mysqldump is available
     */
    public function checkMysqldumpAvailable(): bool
    {
        try {
            $process = new Process(['which', 'mysqldump']);
            $process->run();
            return $process->isSuccessful();
        } catch (\Exception $e) {
            Log::error('mysqldump check failed: ' . $e->getMessage());
            return false;
        }
    }
}
