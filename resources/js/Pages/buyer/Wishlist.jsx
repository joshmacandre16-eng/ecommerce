import { Head } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import BuyerSidebar from "./sidebar";
import BuyerHeader from "./header";

export default function Wishlist({ auth, wishlists }) {
    const user = auth?.user;

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(price || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const removeFromWishlist = (wishlistId) => {
        if (
            confirm(
                "Are you sure you want to remove this item from your wishlist?",
            )
        ) {
            router.delete(`/wishlist/${wishlistId}`, {
                preserveState: true,
            });
        }
    };

    const addToCart = (productId) => {
        router.post(
            "/cart/add",
            {
                product_id: productId,
                quantity: 1,
            },
            {
                preserveState: true,
            },
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <BuyerSidebar />
            <div className="flex-1 flex flex-col">
                <BuyerHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Wishlist - Buyer" />
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            My Wishlist
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            View your wishlist items
                        </p>
                    </div>

                    {/* Wishlist Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">
                                Total Items
                            </p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {wishlists?.length || 0}
                            </p>
                        </div>
                    </div>

                    {/* Wishlist Items */}
                    {wishlists && wishlists.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wishlists.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    {/* Product Image */}
                                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                                        {item.product?.image_url ? (
                                            <img
                                                src={item.product.image_url}
                                                alt={
                                                    item.product?.name ||
                                                    "Product"
                                                }
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-gray-400">
                                                <svg
                                                    className="w-16 h-16"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                            {item.product?.name ||
                                                "Unknown Product"}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {item.product?.description?.substring(
                                                0,
                                                100,
                                            ) || "No description available"}
                                            {item.product?.description?.length >
                                            100
                                                ? "..."
                                                : ""}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Seller:{" "}
                                            {item.product?.seller?.name ||
                                                "Unknown Seller"}
                                        </p>
                                        <p className="text-lg font-bold text-blue-600 mt-2">
                                            {formatPrice(item.product?.price)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Added on:{" "}
                                            {formatDate(item.created_at)}
                                        </p>

                                        {/* Actions */}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() =>
                                                    addToCart(item.product_id)
                                                }
                                                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={() =>
                                                    removeFromWishlist(item.id)
                                                }
                                                className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                No items in your wishlist
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Start adding items to your wishlist by clicking
                                the heart icon on products.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
