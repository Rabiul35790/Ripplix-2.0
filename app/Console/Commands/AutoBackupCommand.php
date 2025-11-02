<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;

class AutoBackupCommand extends Command
{
    protected $signature = 'backup:auto {--type=full : Type of backup (full, database, files)}';

    protected $description = 'Create automatic backup of database and application files';

    public function handle(BackupService $backupService): int
    {
        $type = $this->option('type');

        if (!in_array($type, ['full', 'database', 'files'])) {
            $this->error('Invalid backup type. Use: full, database, or files');
            return self::FAILURE;
        }

        $this->info("Starting {$type} backup...");

        try {
            $backup = $backupService->createBackup($type);

            $this->info("Backup created successfully!");
            $this->table(
                ['Name', 'Type', 'Status', 'Size'],
                [[$backup->name, $backup->type, $backup->status, $backup->formatted_size]]
            );

            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Backup failed: " . $e->getMessage());
            return self::FAILURE;
        }
    }
}
