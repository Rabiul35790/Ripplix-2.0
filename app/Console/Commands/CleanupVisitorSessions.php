<?php
// app/Console/Commands/CleanupVisitorSessions.php

namespace App\Console\Commands;

use App\Models\VisitorSession;
use Illuminate\Console\Command;

class CleanupVisitorSessions extends Command
{
    protected $signature = 'visitors:cleanup';
    protected $description = 'Clean up old visitor sessions';

    public function handle()
    {
        $deletedCount = VisitorSession::cleanup();

        $this->info("Cleaned up {$deletedCount} old visitor sessions.");

        return 0;
    }
}
