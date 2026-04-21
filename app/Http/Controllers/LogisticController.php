<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LogisticController extends Controller
{
    /**
     * Display the logistic dashboard.
     */
    public function dashboard()
    {
        return Inertia::render('logistic/dashboard');
    }

    /**
     * Display the pending deliveries page.
     */
    public function pending(Request $request)
    {
        $search = $request->search ?? '';
        
$pendingOrders = \App\Models\Order::with(['buyer', 'orderItems.product'])
            ->whereIn('order_status', ['pending', 'confirmed', 'preparing'])
            ->where(function ($query) use ($request) {
                $query->where('logistic_id', $request->user()->id)
                      ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                          $itemQuery->where('logistic_id', $request->user()->id)
                                    ->orWhereHas('product', function ($productQuery) use ($request) {
                                        $productQuery->where('logistic_id', $request->user()->id);
                                    });
                      });
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                      ->orWhere('tracking_number', 'like', "%{$search}%")
                      ->orWhereHas('buyer', function ($buyerQuery) use ($search) {
                          $buyerQuery->where('name', 'like', "%{$search}%")
                                    ->orWhere('email', 'like', "%{$search}%")
                                    ->orWhere('phone', 'like', "%{$search}%");
                      });
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        
        $stats = [
'pendingCount' => \App\Models\Order::where('order_status', 'pending')
    ->where(function ($query) use ($request) {
        $query->where('logistic_id', $request->user()->id)
              ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                  $itemQuery->where('logistic_id', $request->user()->id)
                            ->orWhereHas('product', function ($productQuery) use ($request) {
                                $productQuery->where('logistic_id', $request->user()->id);
                            });
              });
    })
    ->count(),
'confirmedCount' => \App\Models\Order::where('order_status', 'confirmed')
    ->where(function ($query) use ($request) {
        $query->where('logistic_id', $request->user()->id)
              ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                  $itemQuery->where('logistic_id', $request->user()->id)
                            ->orWhereHas('product', function ($productQuery) use ($request) {
                                $productQuery->where('logistic_id', $request->user()->id);
                            });
              });
    })
    ->count(),
'preparingCount' => \App\Models\Order::where('order_status', 'preparing')
    ->where(function ($query) use ($request) {
        $query->where('logistic_id', $request->user()->id)
              ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                  $itemQuery->where('logistic_id', $request->user()->id)
                            ->orWhereHas('product', function ($productQuery) use ($request) {
                                $productQuery->where('logistic_id', $request->user()->id);
                            });
              });
    })
    ->count(),
'totalPending' => \App\Models\Order::whereIn('order_status', ['pending', 'confirmed', 'preparing'])
    ->where(function ($query) use ($request) {
        $query->where('logistic_id', $request->user()->id)
              ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                  $itemQuery->where('logistic_id', $request->user()->id)
                            ->orWhereHas('product', function ($productQuery) use ($request) {
                                $productQuery->where('logistic_id', $request->user()->id);
                            });
              });
    })
    ->count(),
        ];
        
        return Inertia::render('logistic/Pending', [
            'auth' => ['user' => $request->user()],
            'pendingOrders' => $pendingOrders,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Display the active deliveries page.
     */
    public function active(Request $request)
    {
        $search = $request->search ?? '';
        
        $deliveries = \App\Models\Order::with(['buyer', 'orderItems.product'])
            ->whereIn('order_status', ['confirmed', 'preparing', 'shipped'])
            ->where(function ($query) use ($request) {
                $query->where('logistic_id', $request->user()->id)
                      ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                          $itemQuery->where('logistic_id', $request->user()->id)
                                    ->orWhereHas('product', function ($productQuery) use ($request) {
                                        $productQuery->where('logistic_id', $request->user()->id);
                                    });
                      });
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                      ->orWhere('tracking_number', 'like', "%{$search}%")
                      ->orWhereHas('buyer', function ($buyerQuery) use ($search) {
                          $buyerQuery->where('name', 'like', "%{$search}%")
                                    ->orWhere('email', 'like', "%{$search}%")
                                    ->orWhere('phone', 'like', "%{$search}%");
                      });
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        $stats = [
            'activeDeliveries' => \App\Models\Order::whereIn('order_status', ['confirmed', 'preparing', 'shipped'])
                ->where(function ($query) use ($request) {
                    $query->where('logistic_id', $request->user()->id)
                          ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                              $itemQuery->where('logistic_id', $request->user()->id)
                                        ->orWhereHas('product', function ($productQuery) use ($request) {
                                            $productQuery->where('logistic_id', $request->user()->id);
                                        });
                          });
                })
                ->count(),
            'pendingDeliveries' => \App\Models\Order::where('order_status', 'pending')
                ->where(function ($query) use ($request) {
                    $query->where('logistic_id', $request->user()->id)
                          ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                              $itemQuery->where('logistic_id', $request->user()->id)
                                        ->orWhereHas('product', function ($productQuery) use ($request) {
                                            $productQuery->where('logistic_id', $request->user()->id);
                                        });
                          });
                })
                ->count(),
            'deliveredToday' => \App\Models\Order::where('order_status', 'delivered')
                ->where(function ($query) use ($request) {
                    $query->where('logistic_id', $request->user()->id)
                          ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                              $itemQuery->where('logistic_id', $request->user()->id)
                                        ->orWhereHas('product', function ($productQuery) use ($request) {
                                            $productQuery->where('logistic_id', $request->user()->id);
                                        });
                          });
                })
                ->whereDate('updated_at', today())->count(),
        ];
        
        return Inertia::render('logistic/Active', [
            'auth' => ['user' => $request->user()],
            'deliveries' => $deliveries,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Display the delivered page.
     */
    public function delivered(Request $request)
    {
        $search = $request->search ?? '';
        
        $deliveries = \App\Models\Order::with(['buyer', 'orderItems.product'])
            ->where('order_status', 'delivered')
            ->where(function ($query) use ($request) {
                $query->where('logistic_id', $request->user()->id)
                      ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                          $itemQuery->where('logistic_id', $request->user()->id)
                                    ->orWhereHas('product', function ($productQuery) use ($request) {
                                        $productQuery->where('logistic_id', $request->user()->id);
                                    });
                      });
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                      ->orWhere('tracking_number', 'like', "%{$search}%")
                      ->orWhereHas('buyer', function ($buyerQuery) use ($search) {
                          $buyerQuery->where('name', 'like', "%{$search}%")
                                    ->orWhere('email', 'like', "%{$search}%")
                                    ->orWhere('phone', 'like', "%{$search}%");
                      });
                });
            })
            ->orderBy('updated_at', 'desc')
            ->paginate(10);
        
        $stats = [
            'totalDelivered' => \App\Models\Order::where('order_status', 'delivered')
                ->where(function ($query) use ($request) {
                    $query->where('logistic_id', $request->user()->id)
                          ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                              $itemQuery->where('logistic_id', $request->user()->id)
                                        ->orWhereHas('product', function ($productQuery) use ($request) {
                                            $productQuery->where('logistic_id', $request->user()->id);
                                        });
                          });
                })
                ->count(),
            'deliveredToday' => \App\Models\Order::where('order_status', 'delivered')
                ->where(function ($query) use ($request) {
                    $query->where('logistic_id', $request->user()->id)
                          ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                              $itemQuery->where('logistic_id', $request->user()->id)
                                        ->orWhereHas('product', function ($productQuery) use ($request) {
                                            $productQuery->where('logistic_id', $request->user()->id);
                                        });
                          });
                })
                ->whereDate('updated_at', today())->count(),
            'activeDeliveries' => \App\Models\Order::where('order_status', 'shipped')
                ->where(function ($query) use ($request) {
                    $query->where('logistic_id', $request->user()->id)
                          ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                              $itemQuery->where('logistic_id', $request->user()->id)
                                        ->orWhereHas('product', function ($productQuery) use ($request) {
                                            $productQuery->where('logistic_id', $request->user()->id);
                                        });
                          });
                })
                ->count(),
        ];
        
        return Inertia::render('logistic/Delivered', [
            'auth' => ['user' => $request->user()],
            'deliveries' => $deliveries,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Display the orders page.
     */
    public function orders(Request $request)
    {
        $search = $request->search ?? '';
        $statusFilter = $request->status ?? '';
        
        $orders = \App\Models\Order::with(['buyer', 'orderItems.product'])
            ->where(function ($query) use ($request) {
                $query->where('logistic_id', $request->user()->id)
                      ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                          $itemQuery->where('logistic_id', $request->user()->id)
                                    ->orWhereHas('product', function ($productQuery) use ($request) {
                                        $productQuery->where('logistic_id', $request->user()->id);
                                    });
                      });
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                      ->orWhere('tracking_number', 'like', "%{$search}%")
                      ->orWhereHas('buyer', function ($buyerQuery) use ($search) {
                          $buyerQuery->where('name', 'like', "%{$search}%")
                                    ->orWhere('email', 'like', "%{$search}%")
                                    ->orWhere('phone', 'like', "%{$search}%");
                      });
                });
            })
            ->when($statusFilter, function ($query, $statusFilter) {
                $query->where('order_status', $statusFilter);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        $stats = [
            'totalOrders' => \App\Models\Order::where(function ($query) use ($request) {
                $query->where('logistic_id', $request->user()->id)
                      ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                          $itemQuery->where('logistic_id', $request->user()->id)
                                    ->orWhereHas('product', function ($productQuery) use ($request) {
                                        $productQuery->where('logistic_id', $request->user()->id);
                                    });
                      });
            })->count(),
            'pendingOrders' => \App\Models\Order::where('order_status', 'pending')
                ->where(function ($query) use ($request) {
                    $query->where('logistic_id', $request->user()->id)
                          ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                              $itemQuery->where('logistic_id', $request->user()->id)
                                        ->orWhereHas('product', function ($productQuery) use ($request) {
                                            $productQuery->where('logistic_id', $request->user()->id);
                                        });
                          });
                })->count(),
            'shippedOrders' => \App\Models\Order::where('order_status', 'shipped')
                ->where(function ($query) use ($request) {
                    $query->where('logistic_id', $request->user()->id)
                          ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                              $itemQuery->where('logistic_id', $request->user()->id)
                                        ->orWhereHas('product', function ($productQuery) use ($request) {
                                            $productQuery->where('logistic_id', $request->user()->id);
                                        });
                          });
                })->count(),
            'deliveredOrders' => \App\Models\Order::where('order_status', 'delivered')
                ->where(function ($query) use ($request) {
                    $query->where('logistic_id', $request->user()->id)
                          ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                              $itemQuery->where('logistic_id', $request->user()->id)
                                        ->orWhereHas('product', function ($productQuery) use ($request) {
                                            $productQuery->where('logistic_id', $request->user()->id);
                                        });
                          });
                })->count(),
        ];
        
        return Inertia::render('logistic/Orders', [
            'auth' => ['user' => $request->user()],
            'orders' => $orders,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Display the routes page.
     */
    public function routes(Request $request)
    {
        // Get active deliveries with location data (confirmed, preparing, shipped orders)
        $activeDeliveries = \App\Models\Order::with(['buyer'])
            ->whereIn('order_status', ['confirmed', 'preparing', 'shipped'])
            ->where(function ($query) use ($request) {
                $query->where('logistic_id', $request->user()->id)
                      ->orWhereHas('orderItems', function ($itemQuery) use ($request) {
                          $itemQuery->where('logistic_id', $request->user()->id)
                                    ->orWhereHas('product', function ($productQuery) use ($request) {
                                        $productQuery->where('logistic_id', $request->user()->id);
                                    });
                      });
            })
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'orderId' => $order->id,
                    'tracking_number' => $order->tracking_number,
                    'status' => $order->order_status,
                    'name' => $order->buyer->name ?? 'Unknown',
                    'address' => $order->shipping_address ?? '',
                    // Sample coordinates around Manila area - in production, geocode from address
                    'lat' => 14.5995 + (rand(-50, 50) / 1000),
                    'lng' => 120.9842 + (rand(-50, 50) / 1000),
                ];
            });

        // Sample route waypoints for demonstration
        $sampleRoutes = [
            ['lat' => 14.5995, 'lng' => 120.9842],
            ['lat' => 14.5547, 'lng' => 121.0244],
            ['lat' => 14.6760, 'lng' => 121.0437],
            ['lat' => 14.4792, 'lng' => 121.0196],
            ['lat' => 14.4081, 'lng' => 121.0415],
        ];

        return Inertia::render('logistic/Routes', [
            'auth' => ['user' => $request->user()],
            'deliveries' => $activeDeliveries,
            'routes' => $sampleRoutes,
            'stats' => [
                'totalActiveRoutes' => $activeDeliveries->count(),
                'deliveriesInProgress' => $activeDeliveries->count(),
            ],
        ]);
    }

    /**
     * Display the navigation page.
     */
    public function navigation(Request $request)
    {
        // Get active deliveries with location data (shipped orders)
        $deliveries = \App\Models\Order::with(['buyer'])
            ->whereIn('order_status', ['shipped', 'pending'])
            ->where('logistic_id', $request->user()->id)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'orderId' => $order->id,
                    'tracking_number' => $order->tracking_number,
                    'status' => $order->order_status,
                    'name' => $order->buyer->name ?? 'Unknown',
                    'email' => $order->buyer->email ?? '',
                    'phone' => $order->buyer->phone ?? '',
                    'address' => $order->shipping_address ?? '',
                    'city' => $order->shipping_city ?? '',
                    // Sample coordinates around Manila area - in production, geocode from address
                    'lat' => 14.5995 + (rand(-50, 50) / 1000),
                    'lng' => 120.9842 + (rand(-50, 50) / 1000),
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                ];
            });

        $stats = [
            'totalDeliveries' => $deliveries->count(),
            'shippedDeliveries' => $deliveries->where('status', 'shipped')->count(),
            'pendingDeliveries' => $deliveries->where('status', 'pending')->count(),
        ];

        return Inertia::render('logistic/Navigation', [
            'auth' => ['user' => $request->user()],
            'deliveries' => $deliveries,
            'stats' => $stats,
        ]);
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

            // Fetch notifications for the current logistic user
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

            return Inertia::render('logistic/Notifications', [
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
            Log::error('Logistic notifications rendering failed: ' . $e->getMessage());
            return Inertia::render('logistic/Notifications', [
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
    public function settings()
    {
        return Inertia::render('logistic/Settings');
    }

    /**
     * Display the logistic profile page.
     */
    public function profile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        
        // Load the related data
        $user->load(['riderProfile', 'riderDocuments', 'riderBankAccount']);
        
        return Inertia::render('logistic/profile', [
            'auth' => ['user' => $user],
            'riderProfile' => $user->riderProfile,
            'riderDocuments' => $user->riderDocuments,
            'riderBankAccount' => $user->riderBankAccount,
        ]);
    }

    /**
     * Update the logistic profile.
     */
    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        
        // Validate the request
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'profile_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            // Rider profile fields
            'vehicle_type' => ['nullable', 'string', 'max:100'],
            'vehicle_plate_number' => ['nullable', 'string', 'max:50'],
            'vehicle_model' => ['nullable', 'string', 'max:100'],
            'vehicle_color' => ['nullable', 'string', 'max:50'],
            'driving_license_number' => ['nullable', 'string', 'max:50'],
        ]);
        
        // Handle image upload
        if ($request->hasFile('profile_image')) {
            $image = $request->file('profile_image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('profile_images', $imageName, 'public');
            // Store only the path relative to storage, frontend will handle /storage prefix
            $validated['profile_image'] = $imagePath;
        }
        
        // Update user fields
        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);
        
        // Update profile image if uploaded
        if (isset($validated['profile_image'])) {
            $user->profile_image = $validated['profile_image'];
        }
        
        // Check if email changed
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        
        $user->save();
        
        // Update or create rider profile
        $riderProfileData = [
            'vehicle_type' => $validated['vehicle_type'] ?? null,
            'vehicle_plate_number' => $validated['vehicle_plate_number'] ?? null,
            'vehicle_model' => $validated['vehicle_model'] ?? null,
            'vehicle_color' => $validated['vehicle_color'] ?? null,
            'driving_license_number' => $validated['driving_license_number'] ?? null,
            'status' => 'pending', // Reset to pending when profile is updated
        ];
        
        // Only update status if it's not already set
        if ($user->riderProfile) {
            $user->riderProfile->update($riderProfileData);
        } else {
            $user->riderProfile()->create($riderProfileData);
        }
        
return back()->with('success', 'Profile updated successfully!');
    }
}
