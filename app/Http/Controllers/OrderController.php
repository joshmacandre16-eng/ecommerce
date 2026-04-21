<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders.
     */
    public function index(Request $request)
    {
        $query = Order::with(['buyer', 'orderItems.product']);
        
        // Filter by user role
        switch (Auth::user()->role) {
            case 'buyer':
                $query->where('buyer_id', Auth::id());
                break;
            case 'farmer':
                $query->whereHas('orderItems.product', function ($q) {
                    $q->where('seller_id', Auth::id());
                });
                break;
            case 'logistics':
                // Logistics can see orders that are being shipped
                $query->whereIn('order_status', ['confirmed', 'preparing', 'shipped', 'delivered']);
                break;
        }
        
        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('order_status', $request->status);
        }
        
        // Filter by search
        if ($request->has('search') && $request->search) {
            $query->where('id', 'like', '%' . $request->search . '%');
        }
        
        $orders = $query->latest()->paginate(10);
        
        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        // Ensure user has access to this order
        if (!$this->canViewOrder($order)) {
            abort(403, 'Unauthorized');
        }
        
        $order->load(['buyer', 'orderItems.product', 'orderItems.product.seller']);
        
        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }
    
    /**
     * Check if user can view the order.
     */
    private function canViewOrder(Order $order): bool
    {
        $user = Auth::user();
        
        if ($user->role === 'logistics') {
            return true;
        }
        
        if ($user->role === 'buyer' && $order->buyer_id === $user->id) {
            return true;
        }
        
        if ($user->role === 'farmer') {
            return $order->orderItems()->whereHas('product', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            })->exists();
        }
        
        return false;
    }

    /**
     * Update the specified order status.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|string|in:pending,confirmed,preparing,shipped,delivered,completed,cancelled',
        ]);
        
        // Check permissions based on role and current status
        if (!$this->canUpdateOrder($order, $request->status)) {
            abort(403, 'Unauthorized');
        }
        
        $order->update(['order_status' => $request->status]);
        
        return back()->with('success', 'Order status updated successfully.');
    }
    
    /**
     * Check if user can update the order.
     */
    private function canUpdateOrder(Order $order, string $newStatus): bool
    {
        $user = Auth::user();
        $currentStatus = $order->order_status;
        
        // Farmer can confirm or prepare orders
        if ($user->role === 'farmer') {
            $isFarmerProduct = $order->orderItems()->whereHas('product', function ($q) use ($user) {
                $q->where('seller_id', $user->id);
            })->exists();
            
            if (!$isFarmerProduct) {
                return false;
            }
            
            // Farmer can confirm pending orders
            if ($currentStatus === 'pending' && $newStatus === 'confirmed') {
                return true;
            }
            
            // Farmer can mark as preparing
            if ($currentStatus === 'confirmed' && $newStatus === 'preparing') {
                return true;
            }
        }
        
        // Logistics can update shipping status
        if ($user->role === 'logistics') {
            if (in_array($currentStatus, ['preparing', 'shipped']) && 
                in_array($newStatus, ['shipped', 'delivered'])) {
                return true;
            }
        }
        
        // Buyer can cancel pending orders
        if ($user->role === 'buyer' && $order->buyer_id === $user->id) {
            if ($currentStatus === 'pending' && $newStatus === 'cancelled') {
                return true;
            }
            
            // Buyer can mark as delivered if they received it
            if ($newStatus === 'completed' && $currentStatus === 'delivered') {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Update payment status.
     */
    public function updatePaymentStatus(Request $request, Order $order)
    {
        $request->validate([
            'payment_status' => 'required|string|in:pending,paid,failed,refunded',
        ]);
        
        // Only the buyer can update payment status
        if ($order->buyer_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }
        
        $order->update(['payment_status' => $request->payment_status]);
        
        return back()->with('success', 'Payment status updated successfully.');
    }
    
    /**
     * Add tracking number to order.
     */
    public function updateTracking(Request $request, Order $order)
    {
        $request->validate([
            'tracking_number' => 'required|string|max:255',
        ]);
        
        // Only logistics can add tracking
        if (Auth::user()->role !== 'logistics') {
            abort(403, 'Unauthorized');
        }
        
        $order->update(['tracking_number' => $request->tracking_number]);
        
        return back()->with('success', 'Tracking number updated successfully.');
    }

    /**
     * Assign logistic rider to order.
     */
    public function assignLogistic(Request $request, Order $order)
    {
        $request->validate([
            'logistic_id' => 'required|exists:users,id',
        ]);

        $logistic = \App\Models\User::findOrFail($request->logistic_id);
        if ($logistic->role !== 'logistics') {
            abort(422, 'Selected user is not a logistics rider.');
        }

        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'super_admin') {
            abort(403, 'Unauthorized');
        }

        $order->update(['logistic_id' => $request->logistic_id]);

        return back()->with('success', 'Logistic rider assigned successfully.');
    }

    /**
     * Assign logistic to specific order item.
     */
    public function assignLogisticToItem(Request $request, Order $order, OrderItem $orderItem)
    {
        $request->validate([
            'logistic_id' => 'required|exists:users,id',
        ]);

        $logistic = \App\Models\User::findOrFail($request->logistic_id);
        if ($logistic->role !== 'logistics') {
            abort(422, 'Selected user is not a logistics rider.');
        }

        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'super_admin') {
            abort(403, 'Unauthorized');
        }

        $orderItem->update(['logistic_id' => $request->logistic_id]);
        $order->load('orderItems.logistic'); // Reload for frontend

        return back()->with('success', 'Logistic assigned to item successfully.');
    }

}
