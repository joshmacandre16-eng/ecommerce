<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SellerDocument;
use App\Models\RiderDocument;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    /**
     * Display the admin dashboard.
     */ 
    public function dashboard(Request $request)
    {
        try {
            // Aggregate stats (keeps queries small and explicit)
            $stats = [
                'totalUsers' => User::count(),
                'totalFarmers' => User::where('role', 'farmer')->count(),
                'totalBuyers' => User::where('role', 'buyer')->count(),
                'totalLogistics' => User::where('role', 'logistics')->count(),
                'totalProducts' => Product::count(),
                'pendingProductApprovals' => Product::where('is_approved', false)->count(),
                'totalOrders' => Order::count(),
                'pendingOrders' => Order::where('order_status', 'pending')->count(),
                'completedOrders' => Order::whereIn('order_status', ['completed', 'delivered'])->count(),
                'totalRevenue' => Order::sum('total_amount'),
            ];

            // Pending products (eager-load seller to avoid N+1)
            $pendingProducts = Product::where('is_approved', false)
                ->with('seller')
                ->latest()
                ->limit(10)
                ->get();

            // Recent orders with necessary relations
            $recentOrders = Order::with(['buyer', 'orderItems.product'])
                ->latest()
                ->limit(10)
                ->get();

            // Top products by sales (batch product lookup to avoid N+1)
            $topItems = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_sales'))
                ->groupBy('product_id')
                ->orderByDesc('total_sales')
                ->limit(5)
                ->get();

            $productIds = $topItems->pluck('product_id')->filter()->unique()->values();
            $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

            $topProducts = $topItems->map(function ($item) use ($products) {
                $p = $products->get($item->product_id);
                return [
                    'id' => $p?->id,
                    'name' => $p?->name ?? 'Unknown',
                    'sales' => (int) $item->total_sales,
                    'price' => $p?->price ?? 0,
                    'category' => $p?->category ?? 'N/A',
                ];
            });

            // Sales for the last 7 days (simple and cache-friendly loop)
            $salesData = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i)->toDateString();
                $dayName = Carbon::parse($date)->format('D');
                $salesData[] = [
                    'day' => $dayName,
                    'value' => (float) Order::whereDate('created_at', $date)->sum('total_amount'),
                ];
            }

            // Inventory alerts (select only necessary columns)
            $inventoryAlerts = Product::where('stock', '<', 50)
                ->where('is_approved', true)
                ->limit(5)
                ->get(['id', 'stock', 'unit'])
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'quantity' => $product->stock . ' ' . ($product->unit ?? ''),
                        'type' => 'low',
                    ];
                });

            return Inertia::render('admin/dashboard', [
                'auth' => ['user' => $request->user()],
                'stats' => $stats,
                'pendingProducts' => $pendingProducts,
                'recentOrders' => $recentOrders,
                'topProducts' => $topProducts,
                'salesData' => $salesData,
                'inventoryAlerts' => $inventoryAlerts,
            ]);
        } catch (\Throwable $e) {
            Log::error('Admin dashboard rendering failed: ' . $e->getMessage());
            return Inertia::render('admin/dashboard', [
                'auth' => ['user' => $request->user()],
                'stats' => [],
                'pendingProducts' => [],
                'recentOrders' => [],
                'topProducts' => [],
                'salesData' => [],
                'inventoryAlerts' => [],
            ]);
        }
    }

    /**
     * Display the users management page.
     */
    public function users(Request $request)
    {
        $search = $request->search ?? '';
        $role = $request->role ?? '';
        
        $users = User::when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($role, function ($query, $role) {
                $query->where('role', $role);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        return Inertia::render('admin/Users', [
            'users' => $users,
        ]);
    }

    /**
     * Display the products management page.
     */
    public function products(Request $request)
    {
        $search = $request->search ?? '';
        $category = $request->category ?? '';
        $status = $request->status ?? '';
        
        $products = Product::with('seller', 'logistic')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($category && $category !== 'all', function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($status, function ($query, $status) {
                if ($status === 'approved') {
                    $query->where('is_approved', true);
                } elseif ($status === 'pending') {
                    $query->where('is_approved', false);
                }
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        // Transform products to ensure image URL is properly serialized for frontend
        $products->getCollection()->transform(function ($product) {
            // Ensure image attribute returns the full URL
            $product->image = $product->getImageUrlAttribute();
            $product->image_url = $product->getOriginal('image_url'); // Also include raw image_url
            return $product;
        });
        
        $logistics = User::where('role', 'logistics')
            ->where('is_approved', true)
            ->with('riderProfile')
            ->get(['id', 'name', 'email', 'phone']);
        
        return Inertia::render('admin/Products', [
            'auth' => [
                'user' => $request->user(),
            ],
            'products' => $products,
            'logistics' => $logistics,
        ]);
    }

    /**
     * Display the orders management page.
     */
    public function orders(Request $request)
    {
        $search = $request->search ?? '';
        $status = $request->status ?? '';
        $paymentStatus = $request->payment_status ?? '';
        
        $orders = Order::with(['buyer', 'orderItems.product', 'logistic'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                      ->orWhere('tracking_number', 'like', "%{$search}%")
                      ->orWhereHas('buyer', function ($buyerQuery) use ($search) {
                          $buyerQuery->where('name', 'like', "%{$search}%")
                                    ->orWhere('email', 'like', "%{$search}%");
                      })
                      ->orWhereHas('logistic', function ($logisticQuery) use ($search) {
                          $logisticQuery->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($status && $status !== 'all', function ($query, $status) {
                $query->where('order_status', $status);
            })
            ->when($paymentStatus && $paymentStatus !== 'all', function ($query, $paymentStatus) {
                $query->where('payment_status', $paymentStatus);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        $stats = [
            'totalOrders' => Order::count(),
            'pendingOrders' => Order::where('order_status', 'pending')->count(),
            'processingOrders' => Order::whereIn('order_status', ['confirmed', 'preparing', 'shipped'])->count(),
            'completedOrders' => Order::whereIn('order_status', ['delivered', 'completed'])->count(),
            'cancelledOrders' => Order::where('order_status', 'cancelled')->count(),
            'totalRevenue' => Order::where('payment_status', 'paid')->sum('total_amount'),
        ];
        
        return Inertia::render('admin/Orders', [
            'auth' => [
                'user' => $request->user(),
            ],
            'orders' => $orders,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'payment_status' => $paymentStatus,
            ],
        ]);
    }

    /**
     * Display the reports page.
     */
    public function reports(Request $request)
    {
        try {
            // Get date range from request (default to last 30 days)
            $days = $request->days ?? 30;
            
            // Sales reports over time
            $salesReports = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i)->toDateString();
                $dayName = Carbon::parse($date)->format('M d');
                $salesReports[] = [
                    'date' => $dayName,
                    'sales' => (float) Order::whereDate('created_at', $date)->sum('total_amount'),
                    'orders' => Order::whereDate('created_at', $date)->count(),
                ];
            }

            // User growth reports
            $userGrowth = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i)->toDateString();
                $dayName = Carbon::parse($date)->format('M d');
                $userGrowth[] = [
                    'date' => $dayName,
                    'users' => User::whereDate('created_at', $date)->count(),
                ];
            }

            // Order statistics
            $orderStats = [
                'total' => Order::count(),
                'pending' => Order::where('order_status', 'pending')->count(),
                'confirmed' => Order::where('order_status', 'confirmed')->count(),
                'preparing' => Order::where('order_status', 'preparing')->count(),
                'shipped' => Order::where('order_status', 'shipped')->count(),
                'delivered' => Order::where('order_status', 'delivered')->count(),
                'completed' => Order::where('order_status', 'completed')->count(),
                'cancelled' => Order::where('order_status', 'cancelled')->count(),
            ];

            // Revenue statistics
            $revenueStats = [
                'total' => Order::sum('total_amount'),
                'thisMonth' => Order::whereMonth('created_at', Carbon::now()->month)
                    ->whereYear('created_at', Carbon::now()->year)
                    ->sum('total_amount'),
                'lastMonth' => Order::whereMonth('created_at', Carbon::now()->subMonth()->month)
                    ->whereYear('created_at', Carbon::now()->subMonth()->year)
                    ->sum('total_amount'),
                'paid' => Order::where('payment_status', 'paid')->sum('total_amount'),
                'pendingPayment' => Order::where('payment_status', 'pending')->sum('total_amount'),
            ];

            // Product performance
            $topSellingProducts = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_sold'), DB::raw('SUM(price * quantity) as total_revenue'))
                ->groupBy('product_id')
                ->orderByDesc('total_sold')
                ->limit(10)
                ->get();

            $productIds = $topSellingProducts->pluck('product_id')->filter()->unique()->values();
            $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

            $topProducts = $topSellingProducts->map(function ($item) use ($products) {
                $p = $products->get($item->product_id);
                return [
                    'id' => $p?->id,
                    'name' => $p?->name ?? 'Unknown',
                    'total_sold' => (int) $item->total_sold,
                    'total_revenue' => (float) $item->total_revenue,
                ];
            });

            // Category performance
            $categoryStats = Product::select('category', DB::raw('COUNT(*) as count'), DB::raw('AVG(price) as avg_price'))
                ->groupBy('category')
                ->get();

            // User role distribution
            $userStats = [
                'total' => User::count(),
                'farmers' => User::where('role', 'farmer')->count(),
                'buyers' => User::where('role', 'buyer')->count(),
                'logistics' => User::where('role', 'logistics')->count(),
                'admins' => User::where('role', 'admin')->count(),
            ];

            return Inertia::render('admin/Reports', [
                'auth' => [
                    'user' => $request->user(),
                ],
                'salesReports' => $salesReports,
                'userGrowth' => $userGrowth,
                'orderStats' => $orderStats,
                'revenueStats' => $revenueStats,
                'topProducts' => $topProducts,
                'categoryStats' => $categoryStats,
                'userStats' => $userStats,
            ]);
        } catch (\Throwable $e) {
            Log::error('Admin reports rendering failed: ' . $e->getMessage());
            return Inertia::render('admin/Reports', [
                'auth' => [
                    'user' => $request->user(),
                ],
                'salesReports' => [],
                'userGrowth' => [],
                'orderStats' => [],
                'revenueStats' => [],
                'topProducts' => [],
                'categoryStats' => [],
                'userStats' => [],
            ]);
        }
    }

/**
     * Display the documents page.
     */
    public function documents(Request $request)
    {
        try {
            // Get search and filter parameters
            $search = $request->search ?? '';
            $type = $request->type ?? ''; // 'seller' or 'rider'
            $status = $request->status ?? ''; // 'pending', 'verified', 'rejected'

            // Fetch seller documents with user relationship
            $sellerDocuments = SellerDocument::with('user')
                ->when($search, function ($query, $search) {
                    $query->whereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->when($status, function ($query, $status) {
                    $query->where('verification_status', $status);
                })
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            // Fetch rider documents with user relationship
            $riderDocuments = RiderDocument::with('user')
                ->when($search, function ($query, $search) {
                    $query->whereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->when($status, function ($query, $status) {
                    $query->where('verification_status', $status);
                })
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            // Get stats
            $stats = [
                'totalSellerDocuments' => SellerDocument::count(),
                'pendingSellerDocuments' => SellerDocument::where('verification_status', 'pending')->count(),
                'verifiedSellerDocuments' => SellerDocument::where('verification_status', 'verified')->count(),
                'rejectedSellerDocuments' => SellerDocument::where('verification_status', 'rejected')->count(),
                'totalRiderDocuments' => RiderDocument::count(),
                'pendingRiderDocuments' => RiderDocument::where('verification_status', 'pending')->count(),
                'verifiedRiderDocuments' => RiderDocument::where('verification_status', 'verified')->count(),
                'rejectedRiderDocuments' => RiderDocument::where('verification_status', 'rejected')->count(),
            ];

            return Inertia::render('admin/Documents', [
                'auth' => [
                    'user' => $request->user(),
                ],
                'sellerDocuments' => $sellerDocuments,
                'riderDocuments' => $riderDocuments,
                'stats' => $stats,
                'filters' => [
                    'search' => $search,
                    'type' => $type,
                    'status' => $status,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Admin documents rendering failed: ' . $e->getMessage());
            return Inertia::render('admin/Documents', [
                'auth' => [
                    'user' => $request->user(),
                ],
                'sellerDocuments' => [],
                'riderDocuments' => [],
                'stats' => [],
                'filters' => [
                    'search' => '',
                    'type' => '',
                    'status' => '',
                ],
            ]);
        }
    }

    /**
     * Display the notifications page.
     */
    public function notifications(Request $request)
    {
        try {
            $search = $request->search ?? '';
            $type = $request->type ?? '';
            $status = $request->status ?? ''; // 'all', 'read', 'unread'

            // Fetch notifications for the current admin user
            $notifications = \App\Models\Notification::where('user_id', $request->user()->id)
                ->when($search, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('title', 'like', "%{$search}%")
                          ->orWhere('message', 'like', "%{$search}%");
                    });
                })
                ->when($type, function ($query, $type) {
                    $query->where('type', $type);
                })
                ->when($status === 'unread', function ($query) {
                    $query->where('is_read', false);
                })
                ->when($status === 'read', function ($query) {
                    $query->where('is_read', true);
                })
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            // Get notification stats
            $stats = [
                'total' => \App\Models\Notification::where('user_id', $request->user()->id)->count(),
                'unread' => \App\Models\Notification::where('user_id', $request->user()->id)->where('is_read', false)->count(),
                'read' => \App\Models\Notification::where('user_id', $request->user()->id)->where('is_read', true)->count(),
            ];

            // Get notification types for filter
            $types = \App\Models\Notification::where('user_id', $request->user()->id)
                ->distinct()
                ->pluck('type');

            return Inertia::render('admin/Notifications', [
                'auth' => [
                    'user' => $request->user(),
                ],
                'notifications' => $notifications,
                'stats' => $stats,
                'types' => $types,
                'filters' => [
                    'search' => $search,
                    'type' => $type,
                    'status' => $status,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Admin notifications rendering failed: ' . $e->getMessage());
            return Inertia::render('admin/Notifications', [
                'auth' => [
                    'user' => $request->user(),
                ],
                'notifications' => [],
                'stats' => [
                    'total' => 0,
                    'unread' => 0,
                    'read' => 0,
                ],
                'types' => [],
                'filters' => [
                    'search' => '',
                    'type' => '',
                    'status' => '',
                ],
            ]);
        }
    }

    /**
     * Mark a notification as read.
     */
    public function markNotificationAsRead(Request $request, $id)
    {
        try {
            $notification = \App\Models\Notification::where('user_id', $request->user()->id)
                ->findOrFail($id);
            $notification->markAsRead();

            return back()->with('success', 'Notification marked as read');
        } catch (\Throwable $e) {
            Log::error('Mark notification as read failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to mark notification as read');
        }
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllNotificationsAsRead(Request $request)
    {
        try {
            \App\Models\Notification::where('user_id', $request->user()->id)
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);

            return back()->with('success', 'All notifications marked as read');
        } catch (\Throwable $e) {
            Log::error('Mark all notifications as read failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to mark all notifications as read');
        }
    }

    /**
     * Delete a notification.
     */
    public function deleteNotification(Request $request, $id)
    {
        try {
            $notification = \App\Models\Notification::where('user_id', $request->user()->id)
                ->findOrFail($id);
            $notification->delete();

            return back()->with('success', 'Notification deleted');
        } catch (\Throwable $e) {
            Log::error('Delete notification failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete notification');
        }
    }

    /**
     * Display the settings page.
     */
    public function settings(Request $request)
    {
        try {
            // Get all settings grouped by category
            $settings = Setting::getAllGrouped();
            
            return Inertia::render('admin/Settings', [
                'auth' => [
                    'user' => $request->user(),
                ],
                'settings' => $settings,
            ]);
        } catch (\Throwable $e) {
            Log::error('Admin settings rendering failed: ' . $e->getMessage());
            return Inertia::render('admin/Settings', [
                'auth' => [
                    'user' => $request->user(),
                ],
                'settings' => [],
            ]);
        }
    }

    /**
     * Update settings.
     */
    public function updateSettings(Request $request)
    {
        try {
            $settingsData = $request->settings ?? [];
            
            foreach ($settingsData as $key => $value) {
                Setting::set($key, $value);
            }
            
            return back()->with('success', 'Settings updated successfully');
        } catch (\Throwable $e) {
            Log::error('Update settings failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to update settings');
        }
    }

    /**
     * Display the roles & permissions page.
     */
    public function roles(Request $request)
    {
        try {
            // Get search and filter parameters
            $search = $request->search ?? '';
            $role = $request->role ?? '';

            // Get role statistics
            $roleStats = [
                'total' => User::count(),
                'admins' => User::where('role', 'admin')->count(),
                'farmers' => User::where('role', 'farmer')->count(),
                'buyers' => User::where('role', 'buyer')->count(),
                'logistics' => User::where('role', 'logistics')->count(),
            ];

            // Get paginated users with role filter and search
            $users = User::when($search, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%")
                          ->orWhere('phone', 'like', "%{$search}%");
                    });
                })
                ->when($role, function ($query, $role) {
                    $query->where('role', $role);
                })
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return Inertia::render('admin/Roles', [
                'auth' => [
                    'user' => $request->user(),
                ],
                'roleStats' => $roleStats,
                'users' => $users,
                'filters' => [
                    'search' => $search,
                    'role' => $role,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Admin roles rendering failed: ' . $e->getMessage());
            return Inertia::render('admin/Roles', [
                'auth' => [
                    'user' => $request->user(),
                ],
                'roleStats' => [
                    'total' => 0,
                    'admins' => 0,
                    'farmers' => 0,
                    'buyers' => 0,
                    'logistics' => 0,
                ],
                'users' => [],
                'filters' => [
                    'search' => '',
                    'role' => '',
                ],
            ]);
        }
    }

    /**
     * List approved logistics riders for assignment.
     */
    public function logs(Request $request)
    {
        try {
            $search = trim($request->search ?? '');
            $level = trim($request->level ?? '');
            $selectedFile = $request->file;
            $logDir = storage_path('logs');

            $logFiles = [];
            try {
                if (File::exists($logDir)) {
                    foreach (File::files($logDir) as $file) {
                        if ($file->getExtension() !== 'log') {
                            continue;
                        }

                        $logFiles[] = [
                            'name' => $file->getFilename(),
                            'size' => $file->getSize(),
                            'modified' => Carbon::createFromTimestamp($file->getMTime())->format('Y-m-d H:i:s'),
                        ];
                    }
                }
            } catch (\Exception $e) {
                $error = 'Error listing log files: ' . $e->getMessage();
            }

            usort($logFiles, function ($a, $b) {
                return strcmp($b['name'], $a['name']);
            });

            if (!$selectedFile && count($logFiles) > 0) {
                $selectedFile = $logFiles[0]['name'];
            }

            $logs = [];
            $error = null;

            if ($selectedFile) {
                $selectedFile = basename($selectedFile);
                $validFileNames = array_column($logFiles, 'name');

                if (!in_array($selectedFile, $validFileNames, true)) {
                    $error = 'Invalid log file selected.';
                } else {
                    $path = $logDir . DIRECTORY_SEPARATOR . $selectedFile;
                    if (File::exists($path)) {
                        try {
                            $content = File::get($path);
                            $lines = preg_split('/\r\n|\n|\r/', $content);

                            foreach ($lines as $line) {
                                if ($line === '') {
                                    continue;
                                }

                                if ($search && stripos($line, $search) === false) {
                                    continue;
                                }

                                $entry = [
                                    'raw' => $line,
                                    'date' => null,
                                    'environment' => null,
                                    'level' => null,
                                    'message' => $line,
                                ];

                                if (preg_match('/^\[([^\]]+)\]\s+([^\.]+)\.([^:]+):\s*(.*)$/', $line, $matches)) {
                                    $entry['date'] = $matches[1];
                                    $entry['environment'] = $matches[2];
                                    $entry['level'] = $matches[3];
                                    $entry['message'] = $matches[4];
                                }

                                if ($level && $entry['level'] && strcasecmp($entry['level'], $level) !== 0) {
                                    continue;
                                }

                                $logs[] = $entry;
                            }
                        } catch (\Exception $e) {
                            $error = 'Error reading log file: ' . $e->getMessage();
                        }
                    } else {
                        $error = 'Selected log file does not exist.';
                    }
                }
            }

            // Get user logs (login activity)
            $userLogs = $this->getUserActivityLogs();

            // Get suspicious activities
            $suspiciousActivities = $this->detectSuspiciousActivities();

            return Inertia::render('admin/Logs', [
                'auth' => ['user' => $request->user()],
                'logFiles' => $logFiles,
                'logs' => $logs,
                'selectedFile' => $selectedFile,
                'filters' => [
                    'search' => $search,
                    'level' => $level,
                ],
                'error' => $error,
                'userLogs' => $userLogs,
                'suspiciousActivities' => $suspiciousActivities,
            ]);
        } catch (\Throwable $e) {
            Log::error('Admin logs rendering failed: ' . $e->getMessage());
            return Inertia::render('admin/Logs', [
                'auth' => ['user' => $request->user()],
                'logFiles' => [],
                'logs' => [],
                'selectedFile' => null,
                'filters' => [
                    'search' => '',
                    'level' => '',
                ],
                'error' => 'An error occurred while loading the logs page.',
                'userLogs' => [],
                'suspiciousActivities' => [],
            ]);
        }
    }

    /**
     * Get user activity logs
     */
    private function getUserActivityLogs()
    {
        try {
            // This would typically come from a login_logs table or audit table
            // For now, we'll create sample data from available information
            $userLogs = [];

            // Get recent logins from users table if you have login_at column
            $recentUsers = User::where('updated_at', '>=', Carbon::now()->subDays(7))
                ->select('id', 'name', 'email', 'last_login_at', 'last_login_ip')
                ->orderBy('updated_at', 'desc')
                ->limit(50)
                ->get();

            foreach ($recentUsers as $user) {
                $userLogs[] = [
                    'user_name' => $user->name,
                    'email' => $user->email,
                    'timestamp' => $user->last_login_at ? Carbon::parse($user->last_login_at)->format('Y-m-d H:i:s') : 'Unknown',
                    'ip_address' => $user->last_login_ip ?? 'Unknown',
                    'device' => 'Web Browser',
                    'location' => 'Not Available',
                    'status' => 'success',
                ];
            }

            return $userLogs;
        } catch (\Exception $e) {
            Log::error('Error fetching user activity logs: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Detect suspicious activities
     */
    private function detectSuspiciousActivities()
    {
        try {
            $suspiciousActivities = [];

            // Check for multiple failed login attempts
            $users = User::all();
            $failedLoginThreshold = 5;

            foreach ($users as $user) {
                $failedAttempts = 0;
                $lastLoginAttempt = null;

                // Check logs for failed attempts (you might have a failed_logins table)
                // This is a simplified check
                if (isset($user->last_login_ip)) {
                    // Simulate checking for suspicious patterns
                    // In real implementation, query from audit/login_logs table
                }

                // Example: Detect if user has not logged in for a while
                if ($user->last_login_at && Carbon::parse($user->last_login_at)->diffInDays(now()) > 30) {
                    if ($user->role !== 'admin') { // Don't flag admin accounts
                        $suspiciousActivities[] = [
                            'user_id' => $user->id,
                            'user_name' => $user->name,
                            'email' => $user->email,
                            'reason' => 'Account inactive for more than 30 days',
                            'timestamp' => now()->format('Y-m-d H:i:s'),
                            'failed_attempts' => 0,
                            'ip_address' => $user->last_login_ip ?? 'Unknown',
                            'location' => 'Unknown',
                            'location_changes' => 0,
                            'unusual_time' => false,
                            'unusual_ip' => false,
                        ];
                    }
                }

                // Example: Detect unusual admin activity
                if ($user->role === 'admin' || $user->role === 'super_admin') {
                    if ($user->is_active === false) {
                        $suspiciousActivities[] = [
                            'user_id' => $user->id,
                            'user_name' => $user->name,
                            'email' => $user->email,
                            'reason' => 'Inactive admin account still exists',
                            'timestamp' => now()->format('Y-m-d H:i:s'),
                            'failed_attempts' => 0,
                            'ip_address' => $user->last_login_ip ?? 'Unknown',
                            'location' => 'Unknown',
                            'location_changes' => 0,
                            'unusual_time' => false,
                            'unusual_ip' => true,
                        ];
                    }
                }
            }

            return $suspiciousActivities;
        } catch (\Exception $e) {
            Log::error('Error detecting suspicious activities: ' . $e->getMessage());
            return [];
        }
    }

    public function downloadLog(Request $request, $filename)
    {
        $filename = basename($filename);
        $logDir = storage_path('logs');
        $path = $logDir . DIRECTORY_SEPARATOR . $filename;

        if (!File::exists($path) || File::extension($path) !== 'log') {
            return back()->with('error', 'Log file not found.');
        }

        return response()->download($path, $filename, [
            'Content-Type' => 'text/plain',
        ]);
    }

    public function clearLog(Request $request, $filename)
    {
        $filename = basename($filename);
        $logDir = storage_path('logs');
        $path = $logDir . DIRECTORY_SEPARATOR . $filename;

        if (!File::exists($path) || File::extension($path) !== 'log') {
            return back()->with('error', 'Log file not found.');
        }

        File::put($path, '');

        return back()->with('success', 'Log file cleared successfully.');
    }

    public function clearAllLogs(Request $request)
    {
        $logDir = storage_path('logs');

        if (File::exists($logDir)) {
            foreach (File::files($logDir) as $file) {
                if ($file->getExtension() === 'log') {
                    File::put($file->getPathname(), '');
                }
            }
        }

        return back()->with('success', 'All log files cleared successfully.');
    }

    /**
     * Assign a logistic to a product
     */
    public function assignProductLogistic(Request $request, Product $product)
    {
        try {
            $validated = $request->validate([
                'logistic_id' => 'required|exists:users,id',
            ]);

            // Verify the logistic user exists and has logistics role
            $logistic = User::where('id', $validated['logistic_id'])
                ->whereIn('role', ['logistics', 'rider'])
                ->firstOrFail();

            // Update the product with the logistic
            $product->update([
                'logistic_id' => $logistic->id,
            ]);

            return redirect()->back()->with('success', 'Logistic assigned to product successfully.');
        } catch (\Throwable $e) {
            Log::error('Error assigning logistic to product: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to assign logistic to product.');
        }
    }

    /**
     * List approved logistics riders for assignment.
     */
    public function logistics(Request $request)
    {
        try {
            $logistics = User::whereIn('role', ['logistics', 'rider'])
                ->with('riderProfile')
                ->get();

            return response()->json([
                'logistics' => $logistics,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error fetching logistics: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch logistics',
            ], 500);
        }
    }

    /**
     * Display the profile page.
     */
    public function profile(Request $request)
    {
        return Inertia::render('admin/Profile', [
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    /**
     * Approve a seller document.
     */
    public function approveSellerDocument(Request $request, $id)
    {
        try {
            $document = SellerDocument::findOrFail($id);
            $document->update([
                'verification_status' => 'verified',
                'government_id_verified' => true,
                'business_license_verified' => true,
                'tax_certificate_verified' => true,
                'selfie_verified' => true,
            ]);

            return back()->with('success', 'Seller document approved successfully');
        } catch (\Throwable $e) {
            Log::error('Approve seller document failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to approve seller document');
        }
    }

    /**
     * Reject a seller document.
     */
    public function rejectSellerDocument(Request $request, $id)
    {
        try {
            $document = SellerDocument::findOrFail($id);
            $document->update([
                'verification_status' => 'rejected',
                'rejection_reason' => $request->reason ?? 'Rejected by admin',
            ]);

            return back()->with('success', 'Seller document rejected successfully');
        } catch (\Throwable $e) {
            Log::error('Reject seller document failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to reject seller document');
        }
    }

    /**
     * Approve a rider document.
     */
    public function approveRiderDocument(Request $request, $id)
    {
        try {
            $document = RiderDocument::findOrFail($id);
            $document->update([
                'verification_status' => 'verified',
                'government_id_verified' => true,
                'live_selfie_verified' => true,
                'background_check_status' => 'passed',
            ]);

            return back()->with('success', 'Rider document approved successfully');
        } catch (\Throwable $e) {
            Log::error('Approve rider document failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to approve rider document');
        }
    }

    /**
     * Reject a rider document.
     */
    public function rejectRiderDocument(Request $request, $id)
    {
        try {
            $document = RiderDocument::findOrFail($id);
            $document->update([
                'verification_status' => 'rejected',
                'rejection_reason' => $request->reason ?? 'Rejected by admin',
            ]);

            return back()->with('success', 'Rider document rejected successfully');
        } catch (\Throwable $e) {
            Log::error('Reject rider document failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to reject rider document');
        }
    }
}
