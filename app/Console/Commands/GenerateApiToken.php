<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class GenerateApiToken extends Command
{
    protected $signature = 'api:generate-token {email}';
    protected $description = 'Generate API token for a user';

    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error('User not found!');
            return 1;
        }

        // Delete old tokens (optional)
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('api-access')->plainTextToken;

        $this->info('API Token generated successfully!');
        $this->line('Token: ' . $token);
        $this->warn('Save this token securely. You won\'t be able to see it again!');

        return 0;
    }
}
