<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     */
    public function index(Request $request)
    {
        $query = Product::with('seller');
        
        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }
        
        // Filter by search
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }
        
        // For buyers, only show approved and active products
        if (Auth::user()->role === 'buyer') {
            $query->where('is_approved', true)
                  ->where('is_active', true);
        }
        
        // For farmers, show only their products
        if (Auth::user()->role === 'farmer') {
            $query->where('seller_id', Auth::id());
        }
        
        $products = $query->latest()->paginate(12);
        
        $categories = [
            'vegetables' => 'Vegetables',
            'fruits' => 'Fruits',
            'grains' => 'Grains',
            'herbs' => 'Herbs',
            'dairy' => 'Dairy',
            'meat' => 'Meat',
            'fish' => 'Fish',
            'eggs' => 'Eggs',
            'organic' => 'Organic Produce',
            'other' => 'Other',
        ];

        $units = [
            'kg' => 'Kilogram (kg)',
            'g' => 'Gram (g)',
            'lb' => 'Pound (lb)',
            'oz' => 'Ounce (oz)',
            'ton' => 'Ton',
            'piece' => 'Piece',
            'bunch' => 'Bunch',
            'dozen' => 'Dozen',
            'liter' => 'Liter (L)',
            'ml' => 'Milliliter (ml)',
            'pack' => 'Pack',
            'box' => 'Box',
        ];

        return Inertia::render('farmer/Products', [
            'products' => $products,
            'filters' => $request->only(['search', 'category']),
            'categories' => $categories,
            'units' => $units,
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create()
    {
        return Inertia::render('Products/Create');
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'harvest_date' => 'nullable|date',
            'farm_location' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'is_organic' => 'boolean',
        ]);

        $validated['seller_id'] = Auth::id();
        $validated['is_approved'] = true;

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->storeAs('public/products', $imageName);
            $validated['image_url'] = 'products/' . $imageName;
        }

        Product::create($validated);

        return redirect()->route('products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product)
    {
        // Ensure user owns the product
        if ($product->seller_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('farmer.ProductEdit', [
            'auth' => ['user' => Auth::user()],
            'product' => $product,
            'categories' => [
                'vegetables' => 'Vegetables',
                'fruits' => 'Fruits',
                'grains' => 'Grains',
                'herbs' => 'Herbs',
                'dairy' => 'Dairy',
                'meat' => 'Meat',
                'fish' => 'Fish',
                'eggs' => 'Eggs',
                'organic' => 'Organic Produce',
                'other' => 'Other',
            ],
            'units' => [
                'kg' => 'Kilogram (kg)',
                'g' => 'Gram (g)',
                'lb' => 'Pound (lb)',
                'oz' => 'Ounce (oz)',
                'ton' => 'Ton',
                'piece' => 'Piece',
                'bunch' => 'Bunch',
                'dozen' => 'Dozen',
                'liter' => 'Liter (L)',
                'ml' => 'Milliliter (ml)',
                'pack' => 'Pack',
                'box' => 'Box',
            ],
        ]);
    }

    /**
     * Display product details (view).
     */
    public function show(Product $product)
    {
        if ($product->seller_id !== Auth::id() && Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('farmer.ProductView', [
            'auth' => ['user' => Auth::user()],
            'product' => $product,
            'categories' => [
                'vegetables' => 'Vegetables',
                'fruits' => 'Fruits',
                'grains' => 'Grains',
                'herbs' => 'Herbs',
                'dairy' => 'Dairy',
                'meat' => 'Meat',
                'fish' => 'Fish',
                'eggs' => 'Eggs',
                'organic' => 'Organic Produce',
                'other' => 'Other',
            ],
            'units' => [
                'kg' => 'Kilogram (kg)',
                'g' => 'Gram (g)',
                'lb' => 'Pound (lb)',
                'oz' => 'Ounce (oz)',
                'ton' => 'Ton',
                'piece' => 'Piece',
                'bunch' => 'Bunch',
                'dozen' => 'Dozen',
                'liter' => 'Liter (L)',
                'ml' => 'Milliliter (ml)',
                'pack' => 'Pack',
                'box' => 'Box',
            ],
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product)
    {
        // Ensure user owns the product
        if ($product->seller_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'harvest_date' => 'nullable|date',
            'farm_location' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'remove_image' => 'boolean',
            'is_organic' => 'boolean',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image_url) {
                $oldImagePath = storage_path('app/public/' . $product->image_url);
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }
            
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->storeAs('public/products', $imageName);
            $validated['image_url'] = 'products/' . $imageName;
        } else {
            // Preserve or remove existing image
            if ($request->boolean('remove_image')) {
                if ($product->image_url) {
                    $oldImagePath = storage_path('app/public/' . $product->image_url);
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }
                $validated['image_url'] = null;
            } else {
                $validated['image_url'] = $product->image_url;
            }
        }

        $product->update($validated);

        return redirect()->route('farmer.products')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product)
    {
        // Ensure user owns the product or is admin
        if ($product->seller_id !== Auth::id() && Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        // Delete product image if exists
        if ($product->image_url) {
            $imagePath = storage_path('app/public/' . $product->image_url);
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }

        $product->delete();

return redirect()->route('farmer.products')
            ->with('success', 'Product deleted successfully.');
    }

    /**
     * Approve a product (admin only).
     */
    public function approve(Product $product)
    {
        // Only admin can approve products
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $product->update(['is_approved' => true]);

        return redirect()->back()
            ->with('success', 'Product approved successfully.');
    }

    /**
     * Reject a product (admin only).
     */
    public function reject(Product $product)
    {
        // Only admin can reject products
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $product->update(['is_approved' => false]);

        return redirect()->back()
            ->with('success', 'Product rejected successfully.');
    }
}
