import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Search,
    Filter,
    Grid,
    List,
    ShoppingCart,
    Heart,
    Star,
    MapPin,
    Calendar,
    Plus,
    Edit,
    Trash2,
    Eye,
} from "lucide-react";

export default function ProductsIndex({ auth, products, filters }) {
    const user = auth.user;
    const [viewMode, setViewMode] = useState("grid");
    const [searchQuery, setSearchQuery] = useState(filters?.search || "");
    const [selectedCategory, setSelectedCategory] = useState(
        filters?.category || "all",
    );
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [showFilters, setShowFilters] = useState(false);

    const categories = [
        { id: "all", name: "All Products", icon: "🌾" },
        { id: "rice", name: "Rice", icon: "🌾" },
        { id: "corn", name: "Corn", icon: "🌽" },
        { id: "vegetables", name: "Vegetables", icon: "🥬" },
        { id: "fruits", name: "Fruits", icon: "🍎" },
        { id: "root_crops", name: "Root Crops", icon: "🥔" },
        { id: "dairy", name: "Dairy Products", icon: "🥛" },
        { id: "fertilizers", name: "Farm Inputs", icon: "🌿" },
        { id: "seeds", name: "Seeds", icon: "🌱" },
    ];

    // Filter products locally
    const filteredProducts = (products?.data || []).filter((product) => {
        const matchesSearch =
            !searchQuery ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.seller?.name || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === "all" || product.category === selectedCategory;
        const matchesPrice =
            product.price >= priceRange[0] && product.price <= priceRange[1];
        return matchesSearch && matchesCategory && matchesPrice;
    });

    // Get image URL - handles various formats
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        // If it already starts with /storage, use as is
        if (imageUrl.startsWith("/storage/")) return imageUrl;
        // If it starts with storage/, add /storage prefix
        if (imageUrl.startsWith("storage/")) return `/${imageUrl}`;
        // If it starts with products/, add /storage prefix
        if (imageUrl.startsWith("products/")) return `/storage/${imageUrl}`;
        // Otherwise, assume it's just the filename and add /storage/products/
        return `/storage/products/${imageUrl}`;
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

    // Handle add to cart
    const handleAddToCart = (productId) => {
        fetch(`/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector(
                    'meta[name="csrf-token"]',
                ).content,
            },
            body: JSON.stringify({ product_id: productId, quantity: 1 }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert("Product added to cart!");
                } else {
                    alert(data.message || "Error adding to cart");
                }
            })
            .catch((error) => {
                alert("Error adding to cart");
            });
    };

    // Handle delete product
    const handleDelete = (productId) => {
        if (confirm("Are you sure you want to delete this product?")) {
            fetch(`/products/${productId}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]',
                    ).content,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        window.location.reload();
                    } else {
                        alert(data.message || "Error deleting product");
                    }
                })
                .catch((error) => {
                    alert("Error deleting product");
                });
        }
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Browse Products
                    </h2>
                    {user.role === "farmer" && (
                        <Link
                            href="/products/create"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Plus className="w-4 h-4 inline mr-1" />
                            Add Product
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Products" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Search and Filter Bar */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search products, farmers..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                <Filter className="w-5 h-5" />
                                <span>Filters</span>
                            </button>
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-lg ${
                                        viewMode === "grid"
                                            ? "bg-white text-green-600 shadow-sm"
                                            : "text-gray-500"
                                    }`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-lg ${
                                        viewMode === "list"
                                            ? "bg-white text-green-600 shadow-sm"
                                            : "text-gray-500"
                                    }`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Category Sidebar */}
                        <div className="md:w-64 flex-shrink-0">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-6">
                                <h3 className="font-semibold text-gray-800 mb-4">
                                    Categories
                                </h3>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() =>
                                                setSelectedCategory(category.id)
                                            }
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                                selectedCategory === category.id
                                                    ? "bg-green-600 text-white"
                                                    : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                        >
                                            <span className="text-xl">
                                                {category.icon}
                                            </span>
                                            <span className="font-medium">
                                                {category.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">
                                        Price Range
                                    </h3>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={priceRange[1]}
                                        onChange={(e) =>
                                            setPriceRange([
                                                priceRange[0],
                                                parseInt(e.target.value),
                                            ])
                                        }
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                                        <span>${priceRange[0]}</span>
                                        <span>${priceRange[1]}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid/List */}
                        <div className="flex-1">
                            <p className="text-gray-600 mb-4">
                                Showing {filteredProducts.length} products
                            </p>
                            {viewMode === "grid" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md"
                                        >
                                            <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center overflow-hidden">
                                                {getImageUrl(
                                                    product.image_url,
                                                ) ? (
                                                    <img
                                                        src={getImageUrl(
                                                            product.image_url,
                                                        )}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display =
                                                                "none";
                                                            e.target.nextSibling.style.display =
                                                                "flex";
                                                        }}
                                                    />
                                                ) : null}
                                                <span
                                                    className={`text-6xl ${getImageUrl(product.image_url) ? "hidden" : ""}`}
                                                >
                                                    🌾
                                                </span>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800">
                                                            {product.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {product.seller
                                                                ?.name ||
                                                                "Local Farm"}
                                                        </p>
                                                    </div>
                                                    <button className="text-gray-400 hover:text-red-500">
                                                        <Heart className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>
                                                            {product.farm_location ||
                                                                "N/A"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                        <span className="font-medium">
                                                            -
                                                        </span>
                                                    </div>
                                                    <span className="text-gray-400 text-sm">
                                                        Stock: {product.stock}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-2xl font-bold text-green-600">
                                                            {formatCurrency(
                                                                product.price,
                                                            )}
                                                        </span>
                                                        <span className="text-gray-500">
                                                            /{product.unit}
                                                        </span>
                                                    </div>
                                                    {(user.role === "farmer" &&
                                                        product.seller_id ===
                                                            user.id) ||
                                                    user.role === "admin" ? (
                                                        <div className="flex gap-2">
                                                            <Link
                                                                href={`/products/${product.id}/edit`}
                                                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        product.id,
                                                                    )
                                                                }
                                                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                handleAddToCart(
                                                                    product.id,
                                                                )
                                                            }
                                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                        >
                                                            <ShoppingCart className="w-4 h-4" />
                                                            <span>Add</span>
                                                        </button>
                                                    )}
                                                </div>
                                                {!product.is_approved && (
                                                    <p className="text-sm text-yellow-600 mt-2">
                                                        Pending Approval
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md"
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {product.image_url ? (
                                                        <img
                                                            src={`/storage/${product.image_url}`}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-4xl">
                                                            🌾
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800 text-lg">
                                                                {product.name}
                                                            </h3>
                                                            <p className="text-gray-500">
                                                                {product.seller
                                                                    ?.name ||
                                                                    "Local Farm"}
                                                            </p>
                                                        </div>
                                                        <button className="text-gray-400 hover:text-red-500">
                                                            <Heart className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>
                                                                {product.farm_location ||
                                                                    "N/A"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>
                                                                {formatDate(
                                                                    product.harvest_date,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <div>
                                                            <span className="text-2xl font-bold text-green-600">
                                                                {formatCurrency(
                                                                    product.price,
                                                                )}
                                                            </span>
                                                            <span className="text-gray-500">
                                                                /{product.unit}
                                                            </span>
                                                        </div>
                                                        {(user.role ===
                                                            "farmer" &&
                                                            product.seller_id ===
                                                                user.id) ||
                                                        user.role ===
                                                            "admin" ? (
                                                            <div className="flex gap-2">
                                                                <Link
                                                                    href={`/products/${product.id}/edit`}
                                                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Link>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            product.id,
                                                                        )
                                                                    }
                                                                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    handleAddToCart(
                                                                        product.id,
                                                                    )
                                                                }
                                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                            >
                                                                <ShoppingCart className="w-4 h-4" />
                                                                <span>
                                                                    Add to Cart
                                                                </span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {filteredProducts.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">
                                        No products found
                                    </p>
                                    {user.role === "farmer" && (
                                        <Link
                                            href="/products/create"
                                            className="mt-4 inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Add Your First Product
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
