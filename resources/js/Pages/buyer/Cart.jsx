import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import BuyerSidebar from "./sidebar";
import BuyerHeader from "./header";
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    ArrowRight,
    CreditCard,
    Truck,
    MapPin,
    CheckCircle,
    ArrowLeft,
} from "lucide-react";

export default function CartIndex({
    auth,
    cartItems,
    subtotal,
    shipping,
    total,
    freeShippingThreshold,
    savedAddress,
}) {
    const user = auth?.user;
    const [showCheckout, setShowCheckout] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutData, setCheckoutData] = useState({
        shipping_address: savedAddress?.address || "",
        shipping_city: savedAddress?.city || "",
        shipping_phone: savedAddress?.phone || "",
        payment_method: "cod",
        notes: "",
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(amount || 0);
    };

    const updateQuantity = async (cartItemId, delta) => {
        const currentItem = cartItems?.find((item) => item.id === cartItemId);
        if (!currentItem) return;

        const newQuantity = Math.max(1, currentItem.quantity + delta);

        router.put(
            `/api/cart/${cartItemId}`,
            { quantity: newQuantity },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Page will auto-refresh with updated cart data from Inertia response
                },
                onError: (errors) => {
                    console.error("Update error:", errors);
                    alert(Object.values(errors)[0] || "Update failed");
                },
            },
        );
    };

    const removeItem = async (cartItemId) => {
        if (!confirm("Remove this item from cart?")) return;

        router.delete(`/api/cart/${cartItemId}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Page will auto-refresh with updated cart data
            },
            onError: (errors) => {
                console.error("Remove error:", errors);
                alert(Object.values(errors)[0] || "Remove failed");
            },
        });
    };

    const handleCheckoutChange = (e) => {
        const { name, value } = e.target;
        setCheckoutData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            await router.post(`/api/cart/checkout`, checkoutData, {
                preserveState: false,
                onSuccess: () => {
                    router.visit("/buyer/orders");
                },
                onError: (errors) => {
                    console.error("Checkout error:", errors);
                    const errorMsg = Object.values(errors)[0];
                    alert("Checkout failed: " + (errorMsg || "Unknown error"));
                    setIsProcessing(false);
                },
            });
        } catch (error) {
            console.error("Checkout error:", error);
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <BuyerSidebar />
            <div className="flex-1 flex flex-col">
                <BuyerHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Shopping Cart - Buyer" />

                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Shopping Cart
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage your cart items
                        </p>
                    </div>

                    <div className="max-w-7xl mx-auto">
                        {!showCheckout ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Cart Items */}
                                <div className="lg:col-span-2 space-y-4">
                                    {!cartItems || cartItems.length === 0 ? (
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                                Your cart is empty
                                            </h3>
                                            <p className="text-gray-500 mb-6">
                                                Browse products and add items to
                                                your cart
                                            </p>
                                            <Link
                                                href="/buyer/products"
                                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                            >
                                                Browse Products
                                            </Link>
                                        </div>
                                    ) : (
                                        cartItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                                            >
                                                <div className="flex gap-4">
                                                    {/* Product Image */}
                                                    <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <span className="text-3xl">
                                                            🌾
                                                        </span>
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="font-semibold text-gray-800 text-lg">
                                                                    {item
                                                                        .product
                                                                        ?.name ||
                                                                        "Product"}
                                                                </h3>
                                                                <p className="text-gray-500 text-sm">
                                                                    {item
                                                                        .product
                                                                        ?.seller
                                                                        ?.name ||
                                                                        "Farm"}
                                                                </p>
                                                                <p className="text-gray-500 text-sm">
                                                                    {formatCurrency(
                                                                        item
                                                                            .product
                                                                            ?.price,
                                                                    )}{" "}
                                                                    /{" "}
                                                                    {
                                                                        item
                                                                            .product
                                                                            ?.unit
                                                                    }
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() =>
                                                                    removeItem(
                                                                        item.id,
                                                                    )
                                                                }
                                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between mt-4">
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-gray-600">
                                                                    {formatCurrency(
                                                                        item
                                                                            .product
                                                                            ?.price,
                                                                    )}{" "}
                                                                    /{" "}
                                                                    {
                                                                        item
                                                                            .product
                                                                            ?.unit
                                                                    }
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            updateQuantity(
                                                                                item.id,
                                                                                -1,
                                                                            )
                                                                        }
                                                                        className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                                                                    >
                                                                        <Minus className="w-4 h-4" />
                                                                    </button>
                                                                    <span className="w-12 text-center font-semibold text-lg">
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </span>
                                                                    <button
                                                                        onClick={() =>
                                                                            updateQuantity(
                                                                                item.id,
                                                                                1,
                                                                            )
                                                                        }
                                                                        className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-xl font-bold text-gray-800">
                                                                    {formatCurrency(
                                                                        (item
                                                                            .product
                                                                            ?.price ||
                                                                            0) *
                                                                            item.quantity,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Order Summary */}
                                {cartItems && cartItems.length > 0 && (
                                    <div className="lg:col-span-1">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                                Order Summary
                                            </h3>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex justify-between text-gray-600">
                                                    <span>Subtotal</span>
                                                    <span>
                                                        {formatCurrency(
                                                            subtotal,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-gray-600">
                                                    <span>Shipping</span>
                                                    <span>
                                                        {shipping === 0 ? (
                                                            <span className="text-green-600 font-medium">
                                                                Free
                                                            </span>
                                                        ) : (
                                                            formatCurrency(
                                                                shipping,
                                                            )
                                                        )}
                                                    </span>
                                                </div>
                                                {subtotal <
                                                    freeShippingThreshold && (
                                                    <p className="text-sm text-gray-500">
                                                        Add{" "}
                                                        {formatCurrency(
                                                            freeShippingThreshold -
                                                                subtotal,
                                                        )}{" "}
                                                        more for free shipping
                                                    </p>
                                                )}
                                                <div className="border-t pt-3 flex justify-between text-lg">
                                                    <span className="font-bold text-gray-900">
                                                        Total
                                                    </span>
                                                    <span className="text-xl font-bold text-green-600">
                                                        {formatCurrency(total)}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    setShowCheckout(true)
                                                }
                                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-200"
                                            >
                                                Proceed to Checkout{" "}
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                                    <button
                                        onClick={() => setShowCheckout(false)}
                                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 font-medium"
                                    >
                                        <ArrowLeft className="w-5 h-5 mr-2" />
                                        Back to Cart
                                    </button>

                                    <h2 className="text-2xl font-bold text-gray-900 mb-8">
                                        Checkout
                                    </h2>

                                    <form
                                        onSubmit={handleCheckout}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Shipping Address *
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-4 text-gray-400 w-5 h-5 pointer-events-none" />
                                                <textarea
                                                    name="shipping_address"
                                                    value={
                                                        checkoutData.shipping_address
                                                    }
                                                    onChange={
                                                        handleCheckoutChange
                                                    }
                                                    required
                                                    rows="3"
                                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                    placeholder="Enter your complete shipping address"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    City *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="shipping_city"
                                                    value={
                                                        checkoutData.shipping_city
                                                    }
                                                    onChange={
                                                        handleCheckoutChange
                                                    }
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                    placeholder="City"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Phone Number *
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="shipping_phone"
                                                    value={
                                                        checkoutData.shipping_phone
                                                    }
                                                    onChange={
                                                        handleCheckoutChange
                                                    }
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                    placeholder="Phone number"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Payment Method *
                                            </label>
                                            <div className="space-y-3">
                                                <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all">
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value="cod"
                                                        checked={
                                                            checkoutData.payment_method ===
                                                            "cod"
                                                        }
                                                        onChange={
                                                            handleCheckoutChange
                                                        }
                                                        className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
                                                    />
                                                    <div className="ml-3 flex-1">
                                                        <div className="font-semibold text-gray-900">
                                                            Cash on Delivery
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Pay cash upon
                                                            delivery
                                                        </div>
                                                    </div>
                                                    <Truck className="w-6 h-6 text-gray-400 ml-auto" />
                                                </label>

                                                <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all">
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value="bank_transfer"
                                                        checked={
                                                            checkoutData.payment_method ===
                                                            "bank_transfer"
                                                        }
                                                        onChange={
                                                            handleCheckoutChange
                                                        }
                                                        className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
                                                    />
                                                    <div className="ml-3 flex-1">
                                                        <div className="font-semibold text-gray-900">
                                                            Bank Transfer
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Transfer to our bank
                                                            account
                                                        </div>
                                                    </div>
                                                    <CreditCard className="w-6 h-6 text-gray-400 ml-auto" />
                                                </label>

                                                <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all">
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value="gcash"
                                                        checked={
                                                            checkoutData.payment_method ===
                                                            "gcash"
                                                        }
                                                        onChange={
                                                            handleCheckoutChange
                                                        }
                                                        className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
                                                    />
                                                    <div className="ml-3 flex-1">
                                                        <div className="font-semibold text-gray-900">
                                                            GCash
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Pay via GCash
                                                        </div>
                                                    </div>
                                                    <span className="text-2xl ml-auto">
                                                        📱
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Order Notes (Optional)
                                            </label>
                                            <textarea
                                                name="notes"
                                                value={checkoutData.notes}
                                                onChange={handleCheckoutChange}
                                                rows="3"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                placeholder="Special instructions for delivery..."
                                            />
                                        </div>

                                        {/* Order Summary in checkout */}
                                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                Order Summary
                                            </h4>
                                            <div className="space-y-2 mb-4">
                                                {cartItems?.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex justify-between text-sm"
                                                    >
                                                        <span className="text-gray-700">
                                                            {item.product?.name}{" "}
                                                            × {item.quantity}
                                                        </span>
                                                        <span className="font-semibold">
                                                            {formatCurrency(
                                                                (item.product
                                                                    ?.price ||
                                                                    0) *
                                                                    item.quantity,
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="border-t pt-3 space-y-2">
                                                <div className="flex justify-between text-lg">
                                                    <span>Total</span>
                                                    <span className="font-bold text-2xl text-green-600">
                                                        {formatCurrency(total)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowCheckout(false)
                                                }
                                                className="flex-1 px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all"
                                            >
                                                Back to Cart
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isProcessing}
                                                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-6 h-6" />
                                                        Place Order
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
