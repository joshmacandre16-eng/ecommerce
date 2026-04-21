<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the root template based on user role.
     */
    public function rootView(Request $request): string
    {
        // Check if accessing admin routes - return admin blade template
        if ($request->is('admin/*')) {
            return 'admin';
        }
        
        // Check if accessing buyer routes (including cart, products, and orders)
        if ($request->is('buyer/*') || $request->is('cart') || $request->is('products') || $request->is('orders')) {
            return 'buyer';
        }
        
        // Check if accessing farmer routes
        if ($request->is('farmer/*') || $request->is('dashboard/farmer')) {
            return 'farmer';
        }
        
        // Check if accessing logistic routes
        if ($request->is('logistic/*') || $request->is('dashboard/logistics')) {
            return 'logistic';
        }
        
        // Check user role for authenticated users
        $user = $request->user();
        if ($user) {
            if (in_array($user->role, ['admin', 'super_admin'])) {
                return 'admin';
            } elseif ($user->role === 'buyer') {
                return 'buyer';
            } elseif ($user->role === 'farmer') {
                return 'farmer';
            } elseif ($user->role === 'logistic' || $user->role === 'rider') {
                return 'logistic';
            }
        }
        
        return 'app';
    }

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Get unread notifications count for authenticated users
        $unreadNotifications = 0;
        if ($request->user()) {
        $unreadNotifications = 0;
        try {
            if ($request->user()) {
                $unreadNotifications = \App\Models\Notification::where('user_id', $request->user()->id)
                    ->where('is_read', false)
                    ->count();
            }
        } catch (\Exception $e) {
            // Table doesn't exist yet, default to 0
        }
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
            ],
            'unreadNotifications' => $unreadNotifications,
            'csrf_token' => $request->session()->token(),
        ]);
    }
}
