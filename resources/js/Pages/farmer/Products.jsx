import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import FarmerSidebar from "./sidebar";
import FarmerHeader from "./header";
import {
    Plus,
    Edit,
    Trash2,
    Package,
    Eye,
    ArrowLeft,
    X,
    Camera,
    Calendar,
    MapPin,
    Award,
    Upload,
} from "lucide-react";

export default function Products({ auth, products = [] }) {
    const user = auth?.user;
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("view"); // 'view' or 'edit'
    const [imagePreview, setImagePreview] = useState(null);

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

    // Approval status
    const getApprovalStatusColor = (isApproved) =>
        isApproved
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-amber-50 text-amber-700 border border-amber-200";
    const getApprovalStatusLabel = (isApproved) =>
        isApproved ? "Approved" : "Pending";

    // Edit form
    const { data, setData, put, processing, errors, setError, reset } = useForm(
        {
            name: "",
            category: "",
            description: "",
            price: "",
            stock: "",
            unit: "",
            harvest_date: "",
            farm_location: "",
            image: null,
            remove_image: false,
            is_organic: false,
        },
    );

    const categories = {
        vegetables: "Vegetables",
        fruits: "Fruits",
        grains: "Grains",
        herbs: "Herbs",
        dairy: "Dairy",
        meat: "Meat",
        fish: "Fish",
        eggs: "Eggs",
        organic: "Organic Produce",
        other: "Other",
    };

    const units = {
        kg: "Kilogram (kg)",
        g: "Gram (g)",
        lb: "Pound (lb)",
        oz: "Ounce (oz)",
        ton: "Ton",
        piece: "Piece",
        bunch: "Bunch",
        dozen: "Dozen",
        liter: "Liter (L)",
        ml: "Milliliter (ml)",
        pack: "Pack",
        box: "Box",
    };

    const openModal = (product, mode) => {
        setSelectedProduct(product);
        setModalMode(mode);
        setIsModalOpen(true);
        if (mode === "edit") {
            reset({
                name: product.name || "",
                category: product.category || "",
                description: product.description || "",
                price: product.price || "",
                stock: product.stock || "",
                unit: product.unit || "",
                harvest_date: product.harvest_date
                    ? new Date(product.harvest_date).toISOString().split("T")[0]
                    : "",
                farm_location: product.farm_location || "",
                image: null,
                remove_image: false,
                is_organic: product.is_organic || false,
            });
            setImagePreview(product.image_url || null);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        setModalMode("view");
        setImagePreview(null);
        reset();
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();

        // Ensure proper data types for backend validation
        const submitData = {
            ...data,
            price: parseFloat(data.price) || 0,
            stock: parseInt(data.stock) || 0,
            is_organic: Boolean(data.is_organic),
        };

        put(`/farmer/products/${selectedProduct.id}`, {
            data: submitData,
            forceFormData: true,
            onSuccess: () => closeModal(),
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            setData("remove_image", false);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const toggleRemoveImage = () => {
        const newValue = !data.remove_image;
        setData("remove_image", newValue);
        if (newValue) {
            setData("image", null);
            setImagePreview(null);
        } else {
            setImagePreview(selectedProduct.image_url || null);
        }
    };

    if (isModalOpen && selectedProduct) {
        return (
            <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[95vh] overflow-y-auto max-w-6xl md:max-w-4xl sm:max-w-2xl border border-gray-200">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {modalMode === "view"
                                        ? selectedProduct.name
                                        : "Edit Product"}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {modalMode === "view"
                                        ? "Product Details"
                                        : "Update product information"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={closeModal}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8">
                        {modalMode === "view" ? (
                            // View Modal Content
                            <div className="space-y-6">
                                {/* Image & Basic Info */}
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-48 h-48 md:w-64 md:h-64 bg-emerald-100 rounded-2xl overflow-hidden flex items-center justify-center">
                                            {selectedProduct.image_url ? (
                                                <img
                                                    src={
                                                        selectedProduct.image_url
                                                    }
                                                    alt={selectedProduct.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Package className="w-20 h-20 text-emerald-600" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
                                                {selectedProduct.category
                                                    ?.charAt(0)
                                                    .toUpperCase() +
                                                    selectedProduct.category?.slice(
                                                        1,
                                                    ) || "Uncategorized"}
                                            </span>
                                            {selectedProduct.is_organic && (
                                                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-1">
                                                    <Award className="w-4 h-4" />
                                                    Organic
                                                </span>
                                            )}
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getApprovalStatusColor(selectedProduct.is_approved)}`}
                                        >
                                            {getApprovalStatusLabel(
                                                selectedProduct.is_approved,
                                            )}
                                        </span>
                                        <p className="text-lg text-gray-600 leading-relaxed">
                                            {selectedProduct.description ||
                                                "No description available."}
                                        </p>
                                    </div>
                                </div>

                                {/* Pricing & Inventory */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">
                                            Price
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {formatCurrency(
                                                selectedProduct.price,
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            per {selectedProduct.unit}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">
                                            Stock
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-gray-900">
                                                {selectedProduct.stock}
                                            </span>
                                            <span className="text-lg text-gray-600">
                                                {selectedProduct.unit}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Farm Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-gray-200 rounded-xl p-6">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Harvest Date
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {formatDate(
                                                selectedProduct.harvest_date,
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Farm Location
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {selectedProduct.farm_location ||
                                                "Not specified"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Edit Modal Content
                            <form
                                onSubmit={handleEditSubmit}
                                className="space-y-6"
                            >
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            value={data.category}
                                            onChange={(e) =>
                                                setData(
                                                    "category",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required
                                        >
                                            <option value="">
                                                Select category
                                            </option>
                                            {Object.entries(categories).map(
                                                ([key, label]) => (
                                                    <option
                                                        key={key}
                                                        value={key}
                                                    >
                                                        {label}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        {errors.category && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.category}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        rows="3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                {/* Pricing & Inventory */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-xl">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                                                ₱
                                            </span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.price}
                                                onChange={(e) =>
                                                    setData(
                                                        "price",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                required
                                            />
                                        </div>
                                        {errors.price && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.price}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Unit{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            value={data.unit}
                                            onChange={(e) =>
                                                setData("unit", e.target.value)
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required
                                        >
                                            <option value="">
                                                Select unit
                                            </option>
                                            {Object.entries(units).map(
                                                ([key, label]) => (
                                                    <option
                                                        key={key}
                                                        value={key}
                                                    >
                                                        {label}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        {errors.unit && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.unit}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Stock{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.stock}
                                            onChange={(e) =>
                                                setData("stock", e.target.value)
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required
                                        />
                                        {errors.stock && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.stock}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Advanced */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Harvest Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.harvest_date}
                                            onChange={(e) =>
                                                setData(
                                                    "harvest_date",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Farm Location
                                        </label>
                                        <input
                                            type="text"
                                            value={data.farm_location}
                                            onChange={(e) =>
                                                setData(
                                                    "farm_location",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                {/* Image & Organic */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Product Image
                                        </label>
                                        {imagePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-48 md:h-64 object-cover rounded-xl shadow-md"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={toggleRemoveImage}
                                                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
                                                <Camera className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                                <input
                                                    type="file"
                                                    onChange={handleImageChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                    id="image-upload"
                                                />
                                                <label
                                                    htmlFor="image-upload"
                                                    className="cursor-pointer text-emerald-600 font-medium hover:text-emerald-700"
                                                >
                                                    Click to upload image
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={data.is_organic}
                                                onChange={(e) =>
                                                    setData(
                                                        "is_organic",
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    Organic Product
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Certified organic
                                                    certification
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 bg-gray-100 text-gray-900 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <FarmerSidebar />
            <div className="flex-1 flex flex-col">
                <FarmerHeader user={user} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <Head title="My Products - Farmer" />
                    <div className="mb-6 lg:mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                My Products
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage your farm products
                            </p>
                        </div>
                        <Link
                            href="/farmer/products/create"
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium shadow-sm w-full lg:w-auto justify-center sm:justify-start"
                        >
                            <Plus className="w-5 h-5" />
                            Add Product
                        </Link>
                    </div>

                    {products && products.length > 0 ? (
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th className="text-left py-3 px-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                                Category
                                            </th>
                                            <th className="text-left py-3 px-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                                Price
                                            </th>
                                            <th className="text-left py-3 px-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                                Stock
                                            </th>
                                            <th className="text-left py-3 px-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                                Status
                                            </th>
                                            <th className="text-left py-3 px-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                                                Harvest Date
                                            </th>
                                            <th className="text-left py-3 px-4 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {products.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-4 px-4 sm:px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            {product.image_url ? (
                                                                <img
                                                                    src={
                                                                        product.image_url
                                                                    }
                                                                    alt={
                                                                        product.name
                                                                    }
                                                                    className="w-12 h-12 rounded-lg object-cover"
                                                                />
                                                            ) : (
                                                                <Package className="w-6 h-6 text-emerald-600" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                                {product.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {product.is_organic
                                                                    ? "Organic"
                                                                    : "Conventional"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 sm:px-6 text-sm text-gray-600 hidden sm:table-cell">
                                                    {product.category
                                                        ? product.category
                                                              .charAt(0)
                                                              .toUpperCase() +
                                                          product.category.slice(
                                                              1,
                                                          )
                                                        : "-"}
                                                </td>
                                                <td className="py-4 px-4 sm:px-6 text-sm font-semibold text-gray-900 hidden md:table-cell">
                                                    {formatCurrency(
                                                        product.price,
                                                    )}{" "}
                                                    / {product.unit}
                                                </td>
                                                <td className="py-4 px-4 sm:px-6 text-sm text-gray-600 hidden md:table-cell">
                                                    {product.stock}{" "}
                                                    {product.unit}
                                                </td>
                                                <td className="py-4 px-4 sm:px-6 hidden lg:table-cell">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getApprovalStatusColor(product.is_approved)}`}
                                                    >
                                                        {getApprovalStatusLabel(
                                                            product.is_approved,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 sm:px-6 text-sm text-gray-600 hidden xl:table-cell">
                                                    {formatDate(
                                                        product.harvest_date,
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 sm:px-6">
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() =>
                                                                openModal(
                                                                    product,
                                                                    "view",
                                                                )
                                                            }
                                                            className="p-2.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                openModal(
                                                                    product,
                                                                    "edit",
                                                                )
                                                            }
                                                            className="p-2.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all group"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                        </button>
                                                        <Link
                                                            href={`/farmer/products/${product.id}`}
                                                            method="delete"
                                                            as="button"
                                                            onClick={(e) => {
                                                                if (
                                                                    !confirm(
                                                                        "Are you sure? This cannot be undone.",
                                                                    )
                                                                ) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            className="p-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-2xl p-12 sm:p-16 text-center shadow-sm">
                            <Package className="w-20 h-20 mx-auto text-gray-300 mb-6" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                No Products Yet
                            </h3>
                            <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
                                Start by adding your first farm product to
                                inventory.
                            </p>
                            <Link
                                href="/farmer/products/create"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg"
                            >
                                <Plus className="w-5 h-5" />
                                Add Your First Product
                            </Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
