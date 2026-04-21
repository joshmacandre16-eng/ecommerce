import { Head, Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import BuyerSidebar from "./sidebar";
import BuyerHeader from "./header";
import {
    ShoppingCart,
    Package,
    DollarSign,
    Heart,
    TrendingUp,
    ArrowUpRight,
    Clock,
    Star,
    MapPin,
    Check,
} from "lucide-react";

export default function BuyerDashboard({
    auth,
    stats = {},
    orders = [],
    featuredProducts = [],
    allProducts,
}) {
    const safeAllProducts = allProducts?.data || [];
    const user = auth?.user;
    const { props } = usePage();
    const csrfToken = props.csrf_token || props.csrfToken;

    // State for cart operations
    const [addingToCart, setAddingToCart] = useState(null);
    const [addedToCart, setAddedToCart] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // Ensure stats has default values
    const safeStats = {
        totalOrders: stats?.totalOrders ?? 0,
        cartItems: stats?.cartItems ?? 0,
        totalSpent: stats?.totalSpent ?? 0,
        wishlistItems: stats?.wishlistItems ?? 12,
    };

    // Helper function to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "delivered":
            case "completed":
                return "bg-emerald-50 text-emerald-700 border border-emerald-200";
            case "shipped":
            case "in_transit":
                return "bg-blue-50 text-blue-700 border border-blue-200";
            case "preparing":
                return "bg-purple-50 text-purple-700 border border-purple-200";
            case "confirmed":
                return "bg-amber-50 text-amber-700 border border-amber-200";
            case "pending":
                return "bg-yellow-50 text-yellow-700 border border-yellow-200";
            case "cancelled":
                return "bg-red-50 text-red-700 border border-red-200";
            default:
                return "bg-gray-50 text-gray-700 border border-gray-200";
        }
    };

    // Helper function to get status label
    const getStatusLabel = (status) => {
        switch (status) {
            case "delivered":
                return "Delivered";
            case "completed":
                return "Completed";
            case "shipped":
                return "Shipped";
            case "in_transit":
                return "In Transit";
            case "preparing":
                return "Preparing";
            case "confirmed":
                return "Confirmed";
            case "pending":
                return "Pending";
            case "cancelled":
                return "Cancelled";
            default:
                return status;
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Sample featured products if none provided
    const sampleProducts = [
        {
            id: 1,
            name: "Organic Corn",
            price: 4.99,
            unit: "kg",
            seller: { name: "Green Farm" },
            image_url:
                "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=400&fit=crop",
            average_rating: 4.5,
            total_reviews: 28,
        },
        {
            id: 2,
            name: "Farm Tomatoes",
            price: 3.49,
            unit: "kg",
            seller: { name: "Fresh Fields" },
            image_url:
                "https://images.unsplash.com/photo-1546470427-227c7a715614?w=400&h=400&fit=crop",
            average_rating: 4.8,
            total_reviews: 42,
        },
        {
            id: 3,
            name: "Premium Rice",
            price: 12.99,
            unit: "kg",
            seller: { name: "Rice Valley" },
            image_url:
                "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
            average_rating: 4.2,
            total_reviews: 15,
        },
    ];

    // Sample recommended products (top rated)
    const recommendedProducts = [
        {
            id: 4,
            name: "Fresh Strawberries",
            price: 6.99,
            unit: "kg",
            seller: { name: "Berry Farm" },
            image_url:
                "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop",
            average_rating: 4.9,
            total_reviews: 67,
        },
        {
            id: 5,
            name: "Organic Potatoes",
            price: 2.99,
            unit: "kg",
            seller: { name: "Organic Growers" },
            image_url:
                "https://images.unsplash.com/photo-1518977676601-b53f82ber21?w=400&h=400&fit=crop",
            average_rating: 4.7,
            total_reviews: 53,
        },
        {
            id: 6,
            name: "Fresh Carrots",
            price: 3.29,
            unit: "kg",
            seller: { name: "Veggie Paradise" },
            image_url:
                "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop",
            average_rating: 4.6,
            total_reviews: 38,
        },
    ];

    const displayProducts =
        featuredProducts.length > 0 ? featuredProducts : sampleProducts;

    // Get recommended products (either from props or sample)
    const getRecommendedProducts = () => {
        if (featuredProducts.length > 0) {
            // Sort by rating (highest first) and take top 3
            return [...featuredProducts]
                .sort(
                    (a, b) => (b.average_rating || 0) - (a.average_rating || 0),
                )
                .slice(0, 3);
        }
        return recommendedProducts;
    };

    // Add to cart handler
    const handleAddToCart = async (productId) => {
        setAddingToCart(productId);
        setErrorMessage(null);
        try {
            const response = await fetch("/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: 1,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setAddedToCart(productId);
                setTimeout(() => setAddedToCart(null), 2000);
            } else {
                setErrorMessage(data.message || "Failed to add to cart");
                setTimeout(() => setErrorMessage(null), 3000);
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            setErrorMessage("An error occurred. Please try again.");
            setTimeout(() => setErrorMessage(null), 3000);
        }
        setAddingToCart(null);
    };

    // Render star rating
    const renderStarRating = (rating, showCount = true, reviewCount = 0) => {
        const fullStars = Math.floor(rating || 0);
        const hasHalfStar = (rating || 0) % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="flex items-center gap-1">
                {[...Array(fullStars)].map((_, i) => (
                    <Star
                        key={`full-${i}`}
                        className="w-4 h-4 text-amber-500 fill-current"
                    />
                ))}
                {hasHalfStar && (
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star
                        key={`empty-${i}`}
                        className="w-4 h-4 text-gray-300"
                    />
                ))}
                {showCount && (
                    <span className="text-xs text-gray-500 ml-1">
                        {rating?.toFixed(1) || "0.0"}
                        {reviewCount > 0 && ` (${reviewCount})`}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <BuyerSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                <BuyerHeader user={user} />

                {/* Page Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Buyer Dashboard" />

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Dashboard Overview
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Welcome back, manage your orders and purchases
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Orders */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Orders
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {safeStats.totalOrders}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm text-emerald-600 ml-1">
                                            12% from last month
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Cart Items
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {safeStats.cartItems}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <Clock className="w-4 h-4 text-amber-600" />
                                        <span className="text-sm text-gray-500 ml-1">
                                            Ready to checkout
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <Package className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        {/* Total Spent */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Spent
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {formatCurrency(safeStats.totalSpent)}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm text-emerald-600 ml-1">
                                            Lifetime purchases
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        {/* Wishlist */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Wishlist Items
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {safeStats.wishlistItems}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <Heart className="w-4 h-4 text-red-600" />
                                        <span className="text-sm text-gray-500 ml-1">
                                            Saved items
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                                    <Heart className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Recent Orders */}
                        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Recent Orders
                                </h2>
                                <Link
                                    href="/buyer/orders"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    View All →
                                </Link>
                            </div>
                            <div className="p-6">
                                {orders && orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {orders.slice(0, 5).map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            Order #{order.id}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {order
                                                                .orderItems?.[0]
                                                                ?.product
                                                                ?.name ||
                                                                "No items"}{" "}
                                                            ×{" "}
                                                            {order
                                                                .orderItems?.[0]
                                                                ?.quantity || 0}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(order.order_status)}`}
                                                    >
                                                        {getStatusLabel(
                                                            order.order_status,
                                                        )}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatDate(
                                                            order.created_at,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm">No orders yet</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Start shopping to see your orders
                                            here
                                        </p>
                                        <Link
                                            href="/products"
                                            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Browse Products
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Quick Actions
                                </h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <Link
                                    href="/products"
                                    className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <Package className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            Browse Products
                                        </span>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/buyer/cart"
                                    className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                            <ShoppingCart className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            View Cart
                                        </span>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/buyer/wishlist"
                                    className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                                            <Heart className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            My Wishlist
                                        </span>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-red-600 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Featured Products */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Featured Products
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Fresh picks from local farms
                                </p>
                            </div>
                            <Link
                                href="/products"
                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {displayProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
                                    >
                                        <div className="h-48 bg-gray-100 relative">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                                    <Package className="w-20 h-20 text-white/80" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                {product.name}
                                            </h4>
                                            <p className="text-xs text-gray-600 mb-3 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {product.seller?.name ||
                                                    "Local Farm"}
                                            </p>
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="text-xl font-bold text-emerald-600">
                                                        {formatCurrency(
                                                            product.price,
                                                        )}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        /{product.unit || "kg"}
                                                    </span>
                                                </div>
                                                {renderStarRating(
                                                    product.average_rating,
                                                    true,
                                                    product.total_reviews,
                                                )}
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleAddToCart(product.id)
                                                }
                                                disabled={
                                                    addingToCart ===
                                                        product.id ||
                                                    addedToCart === product.id
                                                }
                                                className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                                                    addedToCart === product.id
                                                        ? "bg-green-600 text-white"
                                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                                }`}
                                            >
                                                {addingToCart === product.id ? (
                                                    "Adding..."
                                                ) : addedToCart ===
                                                  product.id ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Added!
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="w-4 h-4" />
                                                        Add to Cart
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recommended Products */}
                    <div className="bg-white border border-gray-200 rounded-lg mt-6">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Recommended For You
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Top rated products based on customer reviews
                                </p>
                            </div>
                            <Link
                                href="/products"
                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {getRecommendedProducts().map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
                                    >
                                        <div className="h-48 bg-gray-100 relative">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                                    <Package className="w-20 h-20 text-white/80" />
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-current" />
                                                Top Rated
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                {product.name}
                                            </h4>
                                            <p className="text-xs text-gray-600 mb-3 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {product.seller?.name ||
                                                    "Local Farm"}
                                            </p>
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="text-xl font-bold text-emerald-600">
                                                        {formatCurrency(
                                                            product.price,
                                                        )}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        /{product.unit || "kg"}
                                                    </span>
                                                </div>
                                                {renderStarRating(
                                                    product.average_rating,
                                                    true,
                                                    product.total_reviews,
                                                )}
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleAddToCart(product.id)
                                                }
                                                disabled={
                                                    addingToCart ===
                                                        product.id ||
                                                    addedToCart === product.id
                                                }
                                                className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                                                    addedToCart === product.id
                                                        ? "bg-green-600 text-white"
                                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                                }`}
                                            >
                                                {addingToCart === product.id ? (
                                                    "Adding..."
                                                ) : addedToCart ===
                                                  product.id ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Added!
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="w-4 h-4" />
                                                        Add to Cart
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* All Products from Database */}
                    {safeAllProducts.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg mt-8">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        All Available Products
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Complete list of products in database
                                        (Page {allProducts?.current_page} of{" "}
                                        {allProducts?.last_page})
                                    </p>
                                </div>
                                <Link
                                    href="/products"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    Full Catalog →
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Image
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Seller
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stock
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rating
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {safeAllProducts.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {product.image_url ? (
                                                        <img
                                                            src={
                                                                product.image_url
                                                            }
                                                            alt={product.name}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {product.category}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.seller?.name ||
                                                        "N/A"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-semibold text-emerald-600">
                                                        {formatCurrency(
                                                            product.price,
                                                        )}{" "}
                                                        /
                                                        {product.unit || "unit"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.stock || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {renderStarRating(
                                                        product.reviews_avg_rating,
                                                        false,
                                                        product.reviews_count,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(
                                                        product.created_at,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {allProducts?.next_page_url && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <Link
                                        href={allProducts.next_page_url.replace(
                                            "/buyer/dashboard?",
                                            "/products?",
                                        )}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Load More Products →
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error Toast */}
                    {errorMessage && (
                        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
                            <span>{errorMessage}</span>
                            <button
                                onClick={() => setErrorMessage(null)}
                                className="ml-2 text-red-500 hover:text-red-700 font-bold"
                            >
                                ×
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
