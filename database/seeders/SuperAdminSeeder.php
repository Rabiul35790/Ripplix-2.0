<?php
// database/seeders/SuperAdminSeeder.php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create Super Admin user
        $superAdmin = User::firstOrCreate([
            'email' => 'admin@ripplix.com'
        ], [
            'name' => 'Super Admin',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);

        // Assign Super Admin role
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin']);
        $superAdmin->assignRole($superAdminRole);
    }
}
