<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AddressSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Find or create a buyer user
        $buyer = User::where('email', 'buyer@example.com')->first();
        if (!$buyer) {
            $buyer = User::create([
                'name' => 'Test Buyer',
                'email' => 'buyer@example.com',
                'password' => Hash::make('password'),
                'role' => 'buyer',
            ]);
        }

        // Clear existing addresses for this buyer
        Address::where('buyer_id', $buyer->id)->delete();

        // Create sample addresses
        Address::create([
            'buyer_id' => $buyer->id,
            'name' => 'Home Address',
            'address' => '123 Main Street',
            'city' => 'Quezon City',
            'state' => 'Metro Manila',
            'zip_code' => '1100',
            'country' => 'Philippines',
            'phone' => '+63 912 345 6789',
            'is_default' => true,
        ]);

        Address::create([
            'buyer_id' => $buyer->id,
            'name' => 'Office Address',
            'address' => '456 Office Ave',
            'city' => 'Makati City',
            'state' => 'Metro Manila',
            'zip_code' => '1200',
            'country' => 'Philippines',
            'phone' => '+63 998 765 4321',
            'is_default' => false,
        ]);

        Address::create([
            'buyer_id' => $buyer->id,
            'name' => 'Billing Address',
            'address' => '789 Billing Road',
            'city' => 'Pasig City',
            'state' => 'Metro Manila',
            'zip_code' => '1600',
            'country' => 'Philippines',
            'phone' => null,
            'is_default' => false,
        ]);
    }
}

