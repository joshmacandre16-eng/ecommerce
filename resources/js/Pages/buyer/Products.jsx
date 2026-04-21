import { Head } from "@inertiajs/react";
import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import BuyerSidebar from "./sidebar";
import BuyerHeader from "./header";
import {
    Package,
    Search,
    ShoppingCart,
    Heart,
    Star,
    Filter,
    Grid,
    List,
    ThumbsUp,
    Award,
} from "lucide-react";

export default function Products({
    auth,
    products,
    filters,
    wishlistProductIds = [],
    productRatings = {},
    recommendedProducts = [],
}) {
    const user = auth?.user;
    const { props } = usePage();
    const csrfToken = props.csrf_token || props.csrfToken;

    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [categoryFilter, setCategoryFilter] = useState(
        filters?.category || "all",
    );
    const [viewMode, setViewMode] = useState("grid");
    const [isAddingToCart, setIsAddingToCart] = useState(null);
    const [isAddingToWishlist, setIsAddingToWishlist] = useState(null);
    const [addedToCart, setAddedToCart] = useState(null);
    const [addedToWishlist, setAddedToWishlist] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [wishlistIds, setWishlistIds] = useState(wishlistProductIds);

    const [ratingProduct, setRatingProduct] = useState(null);
    const [hoverRating, setHoverRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState("");
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [ratingSuccess, setRatingSuccess] = useState(null);
    const [ratings, setRatings] = useState(productRatings || {});

    const categories = [
        { value: "all", label: "All Categories" },
        { value: "rice", label: "Rice" },
        { value: "corn", label: "Corn" },
        { value: "vegetables", label: "Vegetables" },
        { value: "fruits", label: "Fruits" },
        { value: "root_crops", label: "Root Crops" },
        { value: "fertilizers", label: "Fertilizers" },
        { value: "seeds", label: "Seeds" },
        { value: "pesticides", label: "Pesticides" },
        { value: "farming_tools", label: "Farming Tools" },
        { value: "dairy", label: "Dairy Products" },
        { value: "other", label: "Other" },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(amount || 0);
    };

    const formatCategory = (category) => {
        if (!category) return "-";
        return (
            category.charAt(0).toUpperCase() +
            category.slice(1).replace(/_/g, " ")
        );
    };

    const applyFilters = () => {
        router.get(
            route("buyer.products"),
            {
                search: searchTerm,
                category: categoryFilter,
            },
            { preserveState: true },
        );
    };

    const handleAddToCart = async (productId) => {
        setIsAddingToCart(productId);
        setErrorMessage(null);
        try {
            const response = await fetch(route("cart.add"), {
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
        setIsAddingToCart(null);
    };

    const handleAddToWishlist = async (productId) => {
        setIsAddingToWishlist(productId);
        setErrorMessage(null);
        try {
            const response = await fetch(route("buyer.wishlist.add"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    product_id: productId,
                }),
            });

            const data = await response.json();

            if (
                response.ok &&
                data.message &&
                !data.message.includes("already")
            ) {
                setAddedToWishlist(productId);
                setWishlistIds([...wishlistIds, productId]);
                setTimeout(() => setAddedToWishlist(null), 2000);
            } else if (data.message && data.message.includes("already")) {
                setErrorMessage("Product is already in your wishlist");
                setTimeout(() => setErrorMessage(null), 3000);
            } else {
                setErrorMessage(data.message || "Failed to add to wishlist");
                setTimeout(() => setErrorMessage(null), 3000);
            }
        } catch (error) {
            console.error("Error adding to wishlist:", error);
            setErrorMessage("An error occurred. Please try again.");
            setTimeout(() => setErrorMessage(null), 3000);
        }
        setIsAddingToWishlist(null);
    };

    const isInWishlist = (productId) => {
        return wishlistProductIds.includes(productId);
    };

    const handleRateProduct = async (productId) => {
        if (userRating === 0) {
            setErrorMessage("Please select a rating");
            setTimeout(() => setErrorMessage(null), 3000);
            return;
        }

        setIsSubmittingRating(true);
        setErrorMessage(null);

        try {
            const response = await fetch(
                route("buyer.products.rate", { product: productId }),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify({
                        rating: userRating,
                        review: userReview,
                    }),
                },
            );

            const data = await response.json();

            if (response.ok) {
                setRatingSuccess(productId);
                setRatings((prev) => ({
                    ...prev,
                    [productId]: {
                        average_rating: data.review?.rating || userRating,
                        review_count:
                            (ratings[productId]?.review_count || 0) + 1,
                    },
                }));
                setTimeout(() => {
                    setRatingSuccess(null);
                    setRatingProduct(null);
                    setUserRating(0);
                    setUserReview("");
                }, 2000);
            } else {
                setErrorMessage(data.message || "Failed to submit rating");
                setTimeout(() => setErrorMessage(null), 3000);
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            setErrorMessage("An error occurred. Please try again.");
            setTimeout(() => setErrorMessage(null), 3000);
        }

        setIsSubmittingRating(false);
    };

    const getProductRating = (productId) => {
        return ratings[productId] || { average_rating: 0, review_count: 0 };
    };

    const StarRating = ({ rating, size = "w-4 h-4" }) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${size} ${
                            star <= rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                        }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <BuyerSidebar />
            <div className="flex-1 flex flex-col">
                <BuyerHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Browse Products - Buyer" />

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

                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Browse Products
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Discover fresh products from local farmers
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex-1 min-w-[250px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                applyFilters();
                                            }
                                        }}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="w-48">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) =>
                                        setCategoryFilter(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {categories.map((cat) => (
                                        <option
                                            key={cat.value}
                                            value={cat.value}
                                        >
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                Apply
                            </button>

                            <div className="flex border border-gray-300 rounded-lg overflow-hidden ml-auto">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 ${
                                        viewMode === "grid"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 ${
                                        viewMode === "list"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {recommendedProducts && recommendedProducts.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="w-6 h-6 text-yellow-500" />
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Recommended For You
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                {recommendedProducts
                                    .slice(0, 5)
                                    .map((product) => (
                                        <div
                                            key={`rec-${product.id}`}
                                            className="bg-white border border-yellow-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                        >
                                            <div className="aspect-square bg-gray-100 relative">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-12 h-12 text-gray-300" />
                                                    </div>
                                                )}
                                                <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded flex items-center gap-1">
                                                    <ThumbsUp className="w-3 h-3" />{" "}
                                                    Top Rated
                                                </span>
                                            </div>
                                            <div className="p-3">
                                                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                    <span className="text-xs text-gray-600">
                                                        {product.average_rating?.toFixed(
                                                            1,
                                                        ) || "0.0"}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        (
                                                        {product.review_count ||
                                                            0}
                                                        )
                                                    </span>
                                                </div>
                                                <div className="mt-2">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {formatCurrency(
                                                            product.price,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {products?.data && products.data.length > 0 ? (
                        viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.data.map((product) => {
                                    const productRating = getProductRating(
                                        product.id,
                                    );
                                    return (
                                        <div
                                            key={product.id}
                                            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                        >
                                            <div className="aspect-square bg-gray-100 relative">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-16 h-16 text-gray-300" />
                                                    </div>
                                                )}
                                                {product.is_organic && (
                                                    <span className="absolute top-2 left-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                                        Organic
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        handleAddToWishlist(
                                                            product.id,
                                                        )
                                                    }
                                                    disabled={
                                                        isAddingToWishlist ===
                                                            product.id ||
                                                        isInWishlist(product.id)
                                                    }
                                                    className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                                                        isInWishlist(product.id)
                                                            ? "bg-red-100 text-red-600"
                                                            : "bg-white text-gray-600 hover:text-red-600 hover:bg-red-50"
                                                    }`}
                                                >
                                                    <Heart
                                                        className={`w-5 h-5 ${
                                                            isInWishlist(
                                                                product.id,
                                                            )
                                                                ? "fill-current"
                                                                : ""
                                                        }`}
                                                    />
                                                </button>
                                            </div>

                                            <div className="p-4">
                                                <div className="text-xs text-gray-500 mb-1">
                                                    {formatCategory(
                                                        product.category,
                                                    )}
                                                </div>
                                                <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mb-2">
                                                    by{" "}
                                                    {product.seller?.name ||
                                                        "Unknown Seller"}
                                                </p>

                                                <div className="flex items-center gap-1 mb-3">
                                                    <StarRating
                                                        rating={
                                                            productRating.average_rating
                                                        }
                                                    />
                                                    <span className="text-xs text-gray-600 ml-1">
                                                        {productRating.average_rating?.toFixed(
                                                            1,
                                                        ) || "0.0"}
                                                    </span>
                                                    {productRating.review_count >
                                                        0 && (
                                                        <span className="text-xs text-gray-400">
                                                            (
                                                            {
                                                                productRating.review_count
                                                            }
                                                            )
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-lg font-semibold text-gray-900">
                                                            {formatCurrency(
                                                                product.price,
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            / {product.unit}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleAddToCart(
                                                                product.id,
                                                            )
                                                        }
                                                        disabled={
                                                            isAddingToCart ===
                                                                product.id ||
                                                            product.stock === 0
                                                        }
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${
                                                            addedToCart ===
                                                            product.id
                                                                ? "bg-green-600 text-white"
                                                                : product.stock ===
                                                                    0
                                                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                  : "bg-blue-600 text-white hover:bg-blue-700"
                                                        }`}
                                                    >
                                                        {addedToCart ===
                                                        product.id ? (
                                                            "Added!"
                                                        ) : isAddingToCart ===
                                                          product.id ? (
                                                            "Adding..."
                                                        ) : (
                                                            <>
                                                                <ShoppingCart className="w-4 h-4" />
                                                                Add
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                {product.stock > 0 &&
                                                    product.stock <= 5 && (
                                                        <p className="text-xs text-orange-600 mt-2">
                                                            Only {product.stock}{" "}
                                                            left in stock
                                                        </p>
                                                    )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="divide-y divide-gray-200">
                                    {products.data.map((product) => {
                                        const productRating = getProductRating(
                                            product.id,
                                        );
                                        return (
                                            <div
                                                key={product.id}
                                                className="p-4 hover:bg-gray-50 flex gap-4"
                                            >
                                                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    {product.image_url ? (
                                                        <img
                                                            src={
                                                                product.image_url
                                                            }
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-8 h-8 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="text-xs text-gray-500 mb-1">
                                                                {formatCategory(
                                                                    product.category,
                                                                )}
                                                            </div>
                                                            <h3 className="text-sm font-medium text-gray-900">
                                                                {product.name}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                by{" "}
                                                                {product.seller
                                                                    ?.name ||
                                                                    "Unknown Seller"}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-semibold text-gray-900">
                                                                {formatCurrency(
                                                                    product.price,
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-gray-500">
                                                                / {product.unit}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs text-gray-600">
                                                            Stock:{" "}
                                                            {product.stock}{" "}
                                                            {product.unit}
                                                        </span>
                                                        {product.is_organic && (
                                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                                                Organic
                                                            </span>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                            <span className="text-xs text-gray-600">
                                                                {productRating.average_rating?.toFixed(
                                                                    1,
                                                                ) || "0.0"}
                                                            </span>
                                                            {productRating.review_count >
                                                                0 && (
                                                                <span className="text-xs text-gray-400">
                                                                    (
                                                                    {
                                                                        productRating.review_count
                                                                    }
                                                                    )
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-3">
                                                        <button
                                                            onClick={() =>
                                                                handleAddToCart(
                                                                    product.id,
                                                                )
                                                            }
                                                            disabled={
                                                                isAddingToCart ===
                                                                    product.id ||
                                                                product.stock ===
                                                                    0
                                                            }
                                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${
                                                                addedToCart ===
                                                                product.id
                                                                    ? "bg-green-600 text-white"
                                                                    : product.stock ===
                                                                        0
                                                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                      : "bg-blue-600 text-white hover:bg-blue-700"
                                                            }`}
                                                        >
                                                            {addedToCart ===
                                                            product.id ? (
                                                                "Added!"
                                                            ) : (
                                                                <>
                                                                    <ShoppingCart className="w-4 h-4" />
                                                                    Add to Cart
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleAddToWishlist(
                                                                    product.id,
                                                                )
                                                            }
                                                            disabled={
                                                                isAddingToWishlist ===
                                                                    product.id ||
                                                                isInWishlist(
                                                                    product.id,
                                                                )
                                                            }
                                                            className={`p-2 rounded-lg transition-colors ${
                                                                isInWishlist(
                                                                    product.id,
                                                                )
                                                                    ? "bg-red-100 text-red-600"
                                                                    : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                                                            }`}
                                                        >
                                                            <Heart
                                                                className={`w-4 h-4 ${
                                                                    isInWishlist(
                                                                        product.id,
                                                                    )
                                                                        ? "fill-current"
                                                                        : ""
                                                                }`}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg p-12">
                            <div className="text-center">
                                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No Products Found
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {searchTerm || categoryFilter !== "all"
                                        ? "No products match your search criteria. Try adjusting your filters."
                                        : "No products available at the moment. Check back later!"}
                                </p>
                            </div>
                        </div>
                    )}

                    {products?.data && products.data.length > 0 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {products.from || 1} to{" "}
                                {products.to || products.data.length} of{" "}
                                {products.total} products
                            </div>
                            <div className="flex gap-2">
                                {products.prev_page_url && (
                                    <button
                                        onClick={() =>
                                            router.get(products.prev_page_url)
                                        }
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                )}
                                {products.next_page_url && (
                                    <button
                                        onClick={() =>
                                            router.get(products.next_page_url)
                                        }
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
