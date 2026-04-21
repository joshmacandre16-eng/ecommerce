<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Models\User;

class FarmerController extends Controller
{
    /**
     * Display the farmer dashboard.
     */
    public function dashboard()
    {
        $user = Auth::user();
        
        $products = Product::where('seller_id', $user->id)->get();
        $orders = Order::whereHas('orderItems.product', function ($query) use ($user) {
            $query->where('seller_id', $user->id);
        })->with(['orderItems.product', 'buyer'])->latest()->take(10)->get();
        
        $totalProducts = $products->count();
        $totalOrders = $orders->count();
        $totalRevenue = $orders->where('payment_status', 'paid')
            ->whereIn('order_status', ['delivered', 'completed'])
            ->sum('total_amount');
        $pendingApproval = Product::where('seller_id', $user->id)
            ->where('is_approved', false)
            ->count();
        
        return Inertia::render('farmer/dashboard', [
            'auth' => ['user' => $user],
            'stats' => [
                'totalProducts' => $totalProducts,
                'totalOrders' => $totalOrders,
                'totalRevenue' => $totalRevenue,
                'pendingApproval' => $pendingApproval,
            ],
            'products' => $products,
            'orders' => $orders,
        ]);
    }

    /**
     * Display the products page.
     */
    public function products()
    {
        $user = Auth::user();
        
        // Fetch products for the logged-in farmer
        $products = Product::where('seller_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return Inertia::render('farmer/Products', [
            'auth' => ['user' => $user],
            'products' => $products,
        ]);
    }

    /**
     * Display the create product page.
     */
    public function createProduct()
    {
        $user = Auth::user();
        
        return Inertia::render('farmer/ProductsCreate', [
            'auth' => ['user' => $user],
            'categories' => \App\Models\Product::getCategoryOptions(),
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
     * Display the orders page.
     */
    public function orders(Request $request)
    {
        $user = Auth::user();
        
        $query = Order::with(['buyer', 'orderItems.product'])
            ->whereHas('orderItems.product', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            });
        
        // Filter by status
        if ($request->has('status') && $request->status !== 'all' && $request->status !== '') {
            $query->where('order_status', $request->status);
        }
        
        // Filter by search
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('id', 'like', '%' . $request->search . '%')
                  ->orWhereHas('buyer', function ($bq) use ($request) {
                      $bq->where('name', 'like', '%' . $request->search . '%')
                         ->orWhere('email', 'like', '%' . $request->search . '%');
                  });
            });
        }
        
        $orders = $query->latest()->paginate(10);
        
        // Get stats for the farmer
        $stats = [
            'totalOrders' => Order::whereHas('orderItems.product', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            })->count(),
            'pendingOrders' => Order::whereHas('orderItems.product', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            })->where('order_status', 'pending')->count(),
            'processingOrders' => Order::whereHas('orderItems.product', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            })->whereIn('order_status', ['confirmed', 'preparing'])->count(),
            'completedOrders' => Order::whereHas('orderItems.product', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            })->whereIn('order_status', ['delivered', 'completed'])->count(),
            'totalRevenue' => Order::whereHas('orderItems.product', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            })->where('payment_status', 'paid')
              ->whereIn('order_status', ['delivered', 'completed'])
              ->sum('total_amount'),
        ];
        
        return Inertia::render('farmer/Orders', [
            'auth' => ['user' => $user],
            'orders' => $orders,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Display the analytics page.
     */
    public function analytics()
    {
        $user = Auth::user();
        
        // Get all orders for the farmer's products
        $ordersQuery = Order::whereHas('orderItems.product', function ($query) use ($user) {
            $query->where('seller_id', $user->id);
        })->with(['orderItems.product', 'buyer']);
        
        // Get stats
        $stats = [
            'totalProducts' => Product::where('seller_id', $user->id)->count(),
            'totalOrders' => Order::whereHas('orderItems.product', fn($q) => $q->where('seller_id', $user->id))->count(),
            'pendingOrders' => Order::whereHas('orderItems.product', fn($q) => $q->where('seller_id', $user->id))
                ->where('order_status', 'pending')->count(),
            'processingOrders' => Order::whereHas('orderItems.product', fn($q) => $q->where('seller_id', $user->id))
                ->whereIn('order_status', ['confirmed', 'preparing'])->count(),
            'completedOrders' => Order::whereHas('orderItems.product', fn($q) => $q->where('seller_id', $user->id))
                ->whereIn('order_status', ['delivered', 'completed'])->count(),
            'totalRevenue' => Order::whereHas('orderItems.product', fn($q) => $q->where('seller_id', $user->id))
                ->where('payment_status', 'paid')
                ->whereIn('order_status', ['delivered', 'completed'])
                ->sum('total_amount'),
            'pendingApproval' => Product::where('seller_id', $user->id)
                ->where('is_approved', false)
                ->count(),
        ];
        
        // Get recent orders
        $recentOrders = (clone $ordersQuery)->latest()->take(10)->get();
        
        // Get top products by sales
        $topProducts = Product::where('seller_id', $user->id)
            ->withCount(['orderItems' => function ($query) use ($user) {
                $query->whereHas('order', function ($q) {
                    $q->whereIn('order_status', ['delivered', 'completed', 'shipped']);
                });
            }])
            ->orderBy('order_items_count', 'desc')
            ->take(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'sales' => $product->order_items_count ?? 0,
                    'image' => $product->image,
                ];
            });
        
        // Get revenue data for the last 30 days - OPTIMIZED SINGLE QUERY
        $revenueData = Order::whereHas('orderItems.product', function ($query) use ($user) {
                $query->where('seller_id', $user->id);
            })
            ->where('payment_status', 'paid')
            ->whereIn('order_status', ['delivered', 'completed'])
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'desc')
            ->pluck('revenue', 'date')
            ->toArray();
        
        // Fill all 30 days with 0s for chart
        $fullRevenueData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayRevenue = $revenueData[$date] ?? 0;
            $fullRevenueData[] = [
                'day' => now()->subDays($i)->format('M d'),
                'date' => $date,
                'value' => (float) $dayRevenue,
            ];
        }
        $revenueData = $fullRevenueData;
        
        // Get orders data by status
        $ordersData = [
            'pending' => (clone $ordersQuery)->where('order_status', 'pending')->count(),
            'confirmed' => (clone $ordersQuery)->where('order_status', 'confirmed')->count(),
            'preparing' => (clone $ordersQuery)->where('order_status', 'preparing')->count(),
            'shipped' => (clone $ordersQuery)->where('order_status', 'shipped')->count(),
            'delivered' => (clone $ordersQuery)->where('order_status', 'delivered')->count(),
            'completed' => (clone $ordersQuery)->where('order_status', 'completed')->count(),
            'cancelled' => (clone $ordersQuery)->where('order_status', 'cancelled')->count(),
        ];
        
        // Get product data
        $productData = [
            'total' => Product::where('seller_id', $user->id)->count(),
            'active' => Product::where('seller_id', $user->id)->where('is_active', true)->count(),
            'pending' => Product::where('seller_id', $user->id)->where('is_approved', false)->count(),
            'rejected' => Product::where('seller_id', $user->id)->where('is_approved', false)->whereNotNull('rejection_reason')->count(),
        ];
        
        return Inertia::render('farmer/Analytics', [
            'auth' => ['user' => $user],
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
            'revenueData' => $revenueData,
            'ordersData' => $ordersData,
            'productData' => $productData,
        ]);
    }

    /**
     * Display the inventory page.
     */
    public function inventory()
    {
        $user = Auth::user();
        
        // Fetch all products for the logged-in farmer
        $products = Product::where('seller_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Calculate inventory statistics
        $totalProducts = $products->count();
        $totalStock = $products->sum('stock');
        $lowStockCount = $products->filter(function($product) {
            return $product->stock > 0 && $product->stock <= 10;
        })->count();
        $outOfStockCount = $products->filter(function($product) {
            return $product->stock == 0;
        })->count();
        
        return Inertia::render('farmer/Inventory', [
            'auth' => ['user' => $user],
            'products' => $products,
            'stats' => [
                'totalProducts' => $totalProducts,
                'totalStock' => $totalStock,
                'lowStockCount' => $lowStockCount,
                'outOfStockCount' => $outOfStockCount,
            ],
        ]);
    }

    /**
     * Display the earnings page.
     */
    public function earnings()
    {
        $user = Auth::user();
        
        // OPTIMIZED: Single queries for totals
        $totalEarnings = OrderItem::whereHas('product', fn($q) => $q->where('seller_id', $user->id))
            ->whereHas('order', fn($q) => $q->where('payment_status', 'paid')
                ->whereIn('order_status', ['delivered', 'completed']))
            ->sum(DB::raw('quantity * price'));
        
        $pendingEarnings = OrderItem::whereHas('product', fn($q) => $q->where('seller_id', $user->id))
            ->whereHas('order', fn($q) => $q->where('payment_status', 'paid')
                ->whereIn('order_status', ['pending', 'confirmed', 'preparing', 'shipped']))
            ->sum(DB::raw('quantity * price'));
        
        // OPTIMIZED: Monthly earnings with single query
        $monthlyEarningsRaw = OrderItem::whereHas('product', fn($q) => $q->where('seller_id', $user->id))
            ->whereHas('order', fn($q) => $q->where('payment_status', 'paid')
                ->whereIn('order_status', ['delivered', 'completed'])
                ->where('created_at', '>=', now()->subMonths(12)))
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(quantity * price) as revenue')
            ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m")'))
            ->orderBy('month', 'desc')
            ->pluck('revenue', 'month')
            ->toArray();
        
        $monthlyEarnings = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i)->format('Y-m');
            $monthlyEarnings[] = [
                'month' => now()->subMonths($i)->format('M Y'),
                'monthShort' => now()->subMonths($i)->format('M'),
                'value' => (float) ($monthlyEarningsRaw[$month] ?? 0),
            ];
        }
        
        // Recent transactions - optimized
        $recentTransactions = Order::with(['buyer', 'orderItems.product'])
            ->whereHas('orderItems.product', fn($q) => $q->where('seller_id', $user->id))
            ->where('payment_status', 'paid')
            ->latest()
            ->take(20)
            ->get()
            ->map(function ($order) use ($user) {
                $sellerAmount = $order->orderItems
                    ->filter(fn($item) => $item->product?->seller_id == $user->id)
                    ->sum(fn($item) => $item->quantity * $item->price);
                
                return [
                    'id' => $order->id,
                    'buyer' => $order->buyer,
                    'total_amount' => $order->total_amount,
                    'seller_amount' => $sellerAmount,
                    'payment_status' => $order->payment_status,
                    'order_status' => $order->order_status,
                    'created_at' => $order->created_at,
                ];
            });
        
        $stats = [
            'totalEarnings' => $totalEarnings,
            'pendingEarnings' => $pendingEarnings,
            'completedOrders' => $recentTransactions->whereIn('order_status', ['delivered', 'completed'])->count(),
            'pendingOrders' => $recentTransactions->whereIn('order_status', ['pending', 'confirmed', 'preparing', 'shipped'])->count(),
        ];
        
        return Inertia::render('farmer/Earnings', [
            'auth' => ['user' => $user],
            'stats' => $stats,
            'monthlyEarnings' => $monthlyEarnings,
            'recentTransactions' => $recentTransactions,
        ]);
    }

    /**
     * Display the product track page.
     */
    public function productTrack(Request $request)
    {
        $user = Auth::user();
        
        $query = Product::where('seller_id', $user->id)
            ->selectRaw('products.*, 
                COALESCE(sales_metrics.sales_count, 0) as computed_sales_count, 
                COALESCE(sales_metrics.sales_revenue, 0) as computed_sales_revenue')
            ->leftJoinSub(
                OrderItem::select(
                    'product_id',
                    DB::raw('SUM(quantity) as sales_count'),
                    DB::raw('SUM(quantity * price) as sales_revenue')
                )->whereHas('order', function ($orderQuery) {
                    $orderQuery->where('payment_status', 'paid')
                              ->whereIn('order_status', ['delivered', 'completed']);
                })->groupBy('product_id'),
                'sales_metrics',
                'products.id', '=', 'sales_metrics.product_id'
            )
            ->orderByDesc('computed_sales_revenue')
            ->orderByDesc('computed_sales_count');
        
        // Apply filters
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }
        
        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }
        
        if ($request->has('stock') && $request->stock) {
            if ($request->stock === 'low') {
                $query->where('stock', '>', 0)->where('stock', '<=', 10);
            } elseif ($request->stock === 'out') {
                $query->where('stock', 0);
            }
        }
        
        $products = $query->paginate(15);
        
        // Calculate stats
        $stats = [
            'totalProducts' => Product::where('seller_id', $user->id)->count(),
            'totalSales' => OrderItem::whereHas('product', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            })
            ->whereHas('order', function ($q) {
                $q->where('payment_status', 'paid')
                  ->whereIn('order_status', ['delivered', 'completed']);
            })->sum('quantity'),
            'totalRevenue' => OrderItem::whereHas('product', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            })
            ->whereHas('order', function ($q) {
                $q->where('payment_status', 'paid')
                  ->whereIn('order_status', ['delivered', 'completed']);
            })->sum(DB::raw('quantity * price')),
            'lowStock' => Product::where('seller_id', $user->id)
                ->where('stock', '>', 0)
                ->where('stock', '<=', 10)
                ->count(),
        ];
        
        // Get categories for filter
        $categories = Product::where('seller_id', $user->id)
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values();
        
        return Inertia::render('farmer/ProductTrack', [
            'auth' => ['user' => $user],
            'products' => $products,
            'stats' => $stats,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'stock']),
        ]);
    }

    /**
     * Display the farmer logistics page - orders ready for delivery/shipment.
     */
    public function logistics(Request $request)
    {
        $user = Auth::user();
        
        $query = Order::with(['buyer', 'orderItems.product', 'logisticRider'])
            ->whereHas('orderItems.product', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            })
            ->whereIn('order_status', ['confirmed', 'preparing', 'shipped']); // Logistics-relevant statuses
        
        // Filters
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('order_status', $request->status);
        }
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('id', 'like', '%' . $request->search . '%')
                  ->orWhereHas('buyer', fn($bq) => $bq->where('name', 'like', '%' . $request->search . '%'));
            });
        }
        
        $orders = $query->latest()->paginate(10);
        
        // Stats
        $stats = [
            'totalLogisticsOrders' => Order::whereHas('orderItems.product', fn($q) => $q->where('seller_id', $user->id))
                ->whereIn('order_status', ['confirmed', 'preparing', 'shipped'])->count(),
            'readyForShipment' => Order::whereHas('orderItems.product', fn($q) => $q->where('seller_id', $user->id))
                ->whereIn('order_status', ['confirmed', 'preparing'])->count(),
            'inTransit' => Order::whereHas('orderItems.product', fn($q) => $q->where('seller_id', $user->id))
                ->where('order_status', 'shipped')->count(),
        ];
        
        return Inertia::render('farmer/Logistics', [
            'auth' => ['user' => $user],
            'orders' => $orders,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Display the notifications page.
     */
    public function notifications(Request $request)
    {
        $user = Auth::user();
        
        $query = Notification::where('user_id', $user->id);
        
        // Filter by search
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('message', 'like', '%' . $request->search . '%');
            });
        }
        
        // Filter by type
        if ($request->has('type') && $request->type && $request->type !== '') {
            $query->where('type', $request->type);
        }
        
        // Filter by status
        if ($request->has('status') && $request->status && $request->status !== '') {
            if ($request->status === 'read') {
                $query->where('is_read', true);
            } elseif ($request->status === 'unread') {
                $query->where('is_read', false);
            }
        }
        
        $notifications = $query->latest()->paginate(10);
        
        // Get stats
        $stats = [
            'total' => Notification::where('user_id', $user->id)->count(),
            'unread' => Notification::where('user_id', $user->id)->where('is_read', false)->count(),
            'read' => Notification::where('user_id', $user->id)->where('is_read', true)->count(),
        ];
        
        // Get unique types
        $types = Notification::where('user_id', $user->id)
            ->distinct()
            ->pluck('type')
            ->filter()
            ->values()
            ->toArray();
        
        return Inertia::render('farmer/Notifications', [
            'auth' => ['user' => $user],
            'notifications' => $notifications,
            'stats' => $stats,
            'types' => $types,
            'filters' => $request->only(['search', 'type', 'status']),
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markNotificationAsRead(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
        ]);
        
        try {
            $notification = Notification::where('id', $request->id)
                ->where('user_id', Auth::id())
                ->first();
            
            if ($notification) {
                $notification->markAsRead();
            }
        } catch (\Exception $e) {
            // Ignore if table doesn't exist
        }
        
        return back();
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllNotificationsAsRead()
    {
        try {
            Notification::where('user_id', Auth::id())
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);
        } catch (\Exception $e) {
            // Ignore if table doesn't exist
        }
        
        return back();
    }

    /**
     * Delete a notification.
     */
    public function deleteNotification(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
        ]);
        
        try {
            $notification = Notification::where('id', $request->id)
                ->where('user_id', Auth::id())
                ->first();
            
            if ($notification) {
                $notification->delete();
            }
        } catch (\Exception $e) {
            // Ignore if table doesn't exist
        }
        
        return back();
    }

    /**
     * Display the settings page.
     */
    public function settings()
    {
        return Inertia::render('farmer/Settings');
    }

    /**
     * Display the farmer profile page.
     */
    public function profile(Request $request)
    {
        $user = Auth::user();
        
        // Safe load with null coalescing - optional relations
        // $user->load(['sellerProfile', 'sellerDocuments', 'sellerBankAccount']); // Skip optional relations
        
        return Inertia::render('farmer/profile', [
            'auth' => ['user' => $user],
            'sellerProfile' => $user->sellerProfile ?? null,
            'sellerDocuments' => $user->sellerDocuments ?? collect(),
            'sellerBankAccount' => $user->sellerBankAccount ?? null,
            'flash' => $request->session()->get('flash', []),
        ]);
    }

    /**
     * Display the edit farmer profile page (modal used in frontend, so redirect to profile).
     */
    public function editProfile()
    {
        return redirect()->route('farmer.profile');
    }

    /**
     * Update the farmer profile.
     */
    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        try {
            Log::info('Starting farmer profile update', ['user_id' => $user->id, 'request_data' => $request->validated()]);

            $validated = $request->validated();

            // Handle image upload
            if ($request->hasFile('profile_image')) {
                $image = $request->file('profile_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $imagePath = $image->storeAs('profile_images', $imageName, 'public');
                $validated['profile_image'] = $imagePath;
            }

            // Update user fields
            $user->fill([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'farm_location' => $validated['farm_location'] ?? null,
                'farm_description' => $validated['farm_description'] ?? null,
            ]);

            if (isset($validated['profile_image'])) {
                $user->profile_image = $validated['profile_image'];
            }

            // Reset email verification if email changed
            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }

            $user->save();

            // Update or create seller profile
            $sellerProfileData = [
                'store_name' => $validated['store_name'] ?? null,
                'business_type' => $validated['business_type'] ?? null,
                'business_address' => $validated['business_address'] ?? null,
                'tax_id' => $validated['tax_id'] ?? null,
            ];

            if ($user->sellerProfile) {
                $user->sellerProfile->update($sellerProfileData);
            } else {
                $user->sellerProfile()->create($sellerProfileData);
            }

            Log::info('Farmer profile updated successfully', ['user_id' => $user->id]);

            return redirect()->route('farmer.profile')->with('success', 'Profile updated successfully!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Profile validation failed', ['user_id' => $user->id, 'errors' => $e->errors()]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Profile update failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to update profile. Please try again.');
        }
    }

    /**
     * Store a newly created product for farmer.
     */
    public function storeProduct(Request $request)
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
        $validated['is_approved'] = false; // Pending admin approval

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->storeAs('public/products', $imageName);
            $validated['image_url'] = 'products/' . $imageName;
        }

        Product::create($validated);

        return redirect()->route('farmer.products')->with('success', 'Product created successfully! Pending admin approval.');
    }
}
