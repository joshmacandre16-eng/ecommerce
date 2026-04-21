<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\Notification;
use App\Models\Address;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    /**
     * Free shipping threshold
     */
    const FREE_SHIPPING_THRESHOLD = 100;
    
    /**
     * Standard shipping cost
     */
    const SHIPPING_COST = 15;

    /**
     * Display the shopping cart page.
     */
    /**
     * Get cart data for rendering.
     */
    private function getCartData($user)
    {
        // Fetch cart items with product and seller data
        $cartItems = CartItem::with(['product', 'product.seller'])
            ->where('buyer_id', $user->id)
            ->get();

        // Calculate subtotal
        $subtotal = $cartItems->reduce(function ($sum, $item) {
            return $sum + (($item->product->price ?? 0) * $item->quantity);
        }, 0);

        // Calculate shipping (free if subtotal > 100)
        $shipping = $subtotal > self::FREE_SHIPPING_THRESHOLD ? 0 : self::SHIPPING_COST;

        // Calculate total
        $total = $subtotal + $shipping;

        // Get user's saved addresses for checkout
        $addresses = Address::where('buyer_id', $user->id)
            ->where('is_default', true)
            ->first();

        return [
            'auth' => ['user' => $user],
            'cartItems' => $cartItems,
            'cartCount' => $cartItems->count(),
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'total' => $total,
            'freeShippingThreshold' => self::FREE_SHIPPING_THRESHOLD,
            'savedAddress' => $addresses,
        ];
    }

    /**
     * Display the shopping cart page.
     */
    public function index()
    {
        $user = Auth::user();
        return Inertia::render('buyer/Cart', $this->getCartData($user));
    }
    
    /**
     * Display buyer cart for /buyer/cart route.
     */
    public function buyerIndex()
    {
        return $this->index();
    }

    /**
     * Add a product to the cart.
     */
    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = Auth::user();

        // Check if product exists and is available
        $product = Product::find($request->product_id);
        
        if (!$product) {
            return back()->with('error', 'Product not found');
        }

        // Check if product is approved and active
        if (!$product->is_approved || !$product->is_active) {
            return back()->with('error', 'Product is not available');
        }

        // Check if product has enough stock
        if ($product->stock < $request->quantity) {
            return back()->with('error', 'Not enough stock available. Available: ' . $product->stock);
        }

        // Check if item already exists in cart
        $existingCartItem = CartItem::where('buyer_id', $user->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existingCartItem) {
            // Update quantity
            $newQuantity = $existingCartItem->quantity + $request->quantity;
            
            // Check stock
            if ($product->stock < $newQuantity) {
                return back()->with('error', 'Not enough stock available. Available: ' . $product->stock);
            }
            
            $existingCartItem->update(['quantity' => $newQuantity]);
        } else {
            // Create new cart item
            CartItem::create([
                'buyer_id' => $user->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        return Inertia::render('buyer/Cart', $this->getCartData($user));
    }

    /**
     * Update cart item quantity.
     */
    public function updateCartItem(Request $request, CartItem $cartItem)
    {
        $user = Auth::user();
        
        if ($cartItem->buyer_id !== $user->id) {
            return back()->with('error', 'Unauthorized');
        }

        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        // Check stock availability
        $product = Product::find($cartItem->product_id);
        if (!$product) {
            return back()->with('error', 'Product not found');
        }

        if ($product->stock < $request->quantity) {
            return back()->with('error', 'Not enough stock available. Available: ' . $product->stock);
        }

        $cartItem->update(['quantity' => $request->quantity]);

        return Inertia::render('buyer/Cart', $this->getCartData($user));
    }

    /**
     * Remove item from cart.
     */
    public function removeCartItem(CartItem $cartItem)
    {
        $user = Auth::user();
        
        if ($cartItem->buyer_id !== $user->id) {
            return back()->with('error', 'Unauthorized');
        }

        $cartItem->delete();

        return Inertia::render('buyer/Cart', $this->getCartData($user));
    }

    /**
     * Clear all items from cart.
     */
    public function clearCart()
    {
        $user = Auth::user();
        
        CartItem::where('buyer_id', $user->id)->delete();

        return response()->json([
            'success' => true, 
            'message' => 'Cart cleared successfully'
        ]);
    }

    /**
     * Get cart item count (API endpoint).
     */
    public function getCartCount()
    {
        $user = Auth::user();
        
        $count = CartItem::where('buyer_id', $user->id)->sum('quantity');

        return response()->json([
            'success' => true, 
            'count' => $count
        ]);
    }

    /**
     * Get cart summary (API endpoint).
     */
    public function getCartSummary()
    {
        $user = Auth::user();

        $cartItems = CartItem::with(['product', 'product.seller'])
            ->where('buyer_id', $user->id)
            ->get();

        $subtotal = $cartItems->reduce(function ($sum, $item) {
            return $sum + (($item->product->price ?? 0) * $item->quantity);
        }, 0);

        $shipping = $subtotal > self::FREE_SHIPPING_THRESHOLD ? 0 : self::SHIPPING_COST;
        $total = $subtotal + $shipping;
        $itemCount = $cartItems->count();

        return response()->json([
            'success' => true,
            'summary' => [
                'item_count' => $itemCount,
                'total_quantity' => $cartItems->sum('quantity'),
                'subtotal' => $subtotal,
                'shipping' => $shipping,
                'total' => $total,
                'free_shipping_threshold' => self::FREE_SHIPPING_THRESHOLD,
                'qualifies_for_free_shipping' => $subtotal >= self::FREE_SHIPPING_THRESHOLD,
                'amount_until_free_shipping' => max(0, self::FREE_SHIPPING_THRESHOLD - $subtotal)
            ]
        ]);
    }

    /**
     * Process checkout and create order.
     */
    public function checkout(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'shipping_address' => 'required|string',
            'shipping_city' => 'required|string',
            'shipping_phone' => 'required|string',
            'payment_method' => 'required|in:cod,bank_transfer,gcash',
        ]);

        $cartItems = CartItem::with('product')
            ->where('buyer_id', $user->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'success' => false, 
                'message' => 'Your cart is empty'
            ], 400);
        }

        // Verify stock for all items
        foreach ($cartItems as $item) {
            if (!$item->product) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Product no longer available: ' . ($item->product_id ?? 'Unknown')
                ], 400);
            }
            
            if ($item->product->stock < $item->quantity) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Not enough stock for: ' . $item->product->name,
                    'available_stock' => $item->product->stock
                ], 400);
            }
        }

        // Calculate totals
        $subtotal = $cartItems->reduce(function ($sum, $item) {
            return $sum + (($item->product->price ?? 0) * $item->quantity);
        }, 0);

        $shipping = $subtotal > self::FREE_SHIPPING_THRESHOLD ? 0 : self::SHIPPING_COST;
        $total = $subtotal + $shipping;

        // Use transaction for atomic operations
        try {
            DB::beginTransaction();

            // Create order
            $order = Order::create([
                'buyer_id' => $user->id,
                'order_status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $request->payment_method,
                'shipping_address' => $request->shipping_address,
                'shipping_city' => $request->shipping_city,
                'shipping_phone' => $request->shipping_phone,
                'notes' => $request->notes ?? '',
                'subtotal' => $subtotal,
                'shipping_cost' => $shipping,
                'total_amount' => $total,
            ]);

            // Create order items and reduce stock
            foreach ($cartItems as $cartItem) {
                // Create order item
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->product->price ?? 0,
                ]);

                // Reduce product stock
                $product = Product::find($cartItem->product_id);
                $product->decrement('stock', $cartItem->quantity);

                // Create notification for seller
                Notification::create([
                    'user_id' => $cartItem->product->seller_id,
                    'type' => 'new_order',
                    'title' => 'New Order Received',
                    'message' => 'You have received a new order for ' . $cartItem->product->name . ' (Qty: ' . $cartItem->quantity . ')',
                    'is_read' => false,
                ]);
            }

            // Clear cart after successful order
            CartItem::where('buyer_id', $user->id)->delete();

            // Create notification for buyer
            Notification::create([
                'user_id' => $user->id,
                'type' => 'order_placed',
'title' => 'Order Placed Successfully',
                'message' => 'Your order #' . $order->id . ' has been placed successfully. Total: ₱' . number_format($total, 2),
                'is_read' => false,
            ]);

            DB::commit();

            return redirect('/buyer/orders')->with([
                'success' => 'Order placed successfully',
                'order_id' => $order->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false, 
                'message' => 'Error processing order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Apply coupon code (future feature).
     */
    public function applyCoupon(Request $request)
    {
        // Placeholder for future coupon functionality
        return response()->json([
            'success' => false, 
            'message' => 'Coupon functionality coming soon'
        ], 501);
    }
}
