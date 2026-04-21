<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
protected $fillable = [
        'buyer_id',
        'total_amount',
        'payment_method',
        'payment_status',
        'order_status',
        'shipping_address',
        'shipping_city',
        'shipping_phone',
        'tracking_number',
        'notes',
        'logistic_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the buyer that owns the order.
     */
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /**
     * Get the order items for this order.
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the products for this order.
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'order_items')
            ->withPivot('quantity', 'price')
            ->withTimestamps();
    }

    /**
     * Get the payment method options.
     */
    public static function getPaymentMethodOptions(): array
    {
        return [
            'cod' => 'Cash on Delivery',
            'bank_transfer' => 'Bank Transfer',
            'gcash' => 'GCash',
            'card' => 'Credit/Debit Card',
            'paypal' => 'PayPal',
        ];
    }

    /**
     * Get the assigned logistic rider.
     */
    public function logistic()
    {
        return $this->belongsTo(\App\Models\User::class, 'logistic_id');
    }

    /**
     * Get the payment status options.
     */
    public static function getPaymentStatusOptions(): array
    {
        return [
            'pending' => 'Pending Payment',
            'paid' => 'Paid',
            'failed' => 'Failed',
            'refunded' => 'Refunded',
        ];
    }

    /**
     * Get the order status options.
     */
    public static function getOrderStatusOptions(): array
    {
        return [
            'pending' => 'Pending',
            'confirmed' => 'Confirmed',
            'preparing' => 'Preparing Order',
            'shipped' => 'Out for Delivery',
            'delivered' => 'Delivered',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
        ];
    }
}
