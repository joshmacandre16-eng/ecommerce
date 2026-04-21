<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProductSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Create test farmer if not exists
        $farmer = User::where('email', 'farmer@example.com')->first();
        if (!$farmer) {
            $farmer = User::create([
                'name' => 'Test Farmer',
                'email' => 'farmer@example.com',
                'password' => Hash::make('password'),
                'role' => 'farmer',
                'email_verified_at' => now(),
            ]);
        }

        // Clear existing products for this farmer
        Product::where('seller_id', $farmer->id)->delete();

        // Create test products
        $products = [
            [
                'name' => 'Fresh Tomatoes',
                'category' => 'vegetables',
                'description' => 'Organic tomatoes harvested fresh from the farm.',
                'price' => 50.00,
                'stock' => 100,
                'unit' => 'kg',
                'harvest_date' => now()->subDays(3),
                'farm_location' => 'Quezon Province',
                'is_organic' => true,
                'is_approved' => true,
            ],
            [
                'name' => 'Sweet Corn',
                'category' => 'vegetables',
                'description' => 'Sweet corn ready for market.',
                'price' => 80.00,
                'stock' => 50,
                'unit' => 'dozen',
                'harvest_date' => now()->subDays(5),
                'farm_location' => 'Nueva Ecija',
                'is_organic' => false,
                'is_approved' => true,
            ],
            [
                'name' => 'Organic Kale',
                'category' => 'vegetables',
                'description' => 'Premium organic kale.',
                'price' => 120.00,
                'stock' => 25,
                'unit' => 'bunch',
                'harvest_date' => now()->subDays(2),
                'farm_location' => 'Batangas',
                'is_organic' => true,
                'is_approved' => false, // Pending
            ],
        ];

        foreach ($products as $data) {
            $data['seller_id'] = $farmer->id;
            Product::create($data);
        }

        echo "Created farmer@example.com / password with 3 test products\n";
    }
}

