import { Head, useForm } from "@inertiajs/react";
import FarmerSidebar from "./sidebar";
import FarmerHeader from "./header";
import { useState } from "react";

export default function ProductsCreate({ auth, categories = {}, units = {} }) {
    const user = auth?.user;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        category: "",
        description: "",
        price: "",
        stock: "",
        unit: "",
        harvest_date: "",
        farm_location: "",
        image: null,
        is_organic: false,
    });

    const [imagePreview, setImagePreview] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/farmer/products", {
            forceFormData: true,
            onSuccess: () => {
                // Form reset handled by redirect and flash message
            },
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData("image", null);
        setImagePreview(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <FarmerSidebar />
            <div className="flex-1 flex flex-col">
                <FarmerHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Add Product - Farmer" />
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Add New Product
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Create a new product listing for your farm
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Form */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Information */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Basic Information
                                    </h2>
                                    <div className="space-y-4">
                                        {/* Product Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Product Name{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        "name",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="Enter product name"
                                                required
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                required
                                            >
                                                <option value="">
                                                    Select a category
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

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                rows={4}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="Describe your product"
                                            />
                                            {errors.description && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing & Inventory */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Pricing & Inventory
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Price */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Price{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
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
                                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                            {errors.price && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.price}
                                                </p>
                                            )}
                                        </div>

                                        {/* Unit */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Unit{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <select
                                                value={data.unit}
                                                onChange={(e) =>
                                                    setData(
                                                        "unit",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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

                                        {/* Stock */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Stock Quantity{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.stock}
                                                onChange={(e) =>
                                                    setData(
                                                        "stock",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="0"
                                                required
                                            />
                                            {errors.stock && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.stock}
                                                </p>
                                            )}
                                        </div>

                                        {/* Harvest Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                            {errors.harvest_date && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.harvest_date}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Farm Location */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Farm Location
                                    </h2>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            placeholder="Enter farm location"
                                        />
                                        {errors.farm_location && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.farm_location}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Product Image */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Product Image
                                    </h2>
                                    <div className="space-y-4">
                                        {imagePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-10 w-10 mx-auto text-gray-400 mb-2"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <p className="text-sm text-gray-500 mb-2">
                                                    Upload product image
                                                </p>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    id="image-upload"
                                                />
                                                <label
                                                    htmlFor="image-upload"
                                                    className="inline-block px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 cursor-pointer"
                                                >
                                                    Choose File
                                                </label>
                                            </div>
                                        )}
                                        {errors.image && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.image}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Product Type */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Product Type
                                    </h2>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_organic}
                                            onChange={(e) =>
                                                setData(
                                                    "is_organic",
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Organic Product
                                        </span>
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Check this if your product is certified
                                        organic
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing
                                        ? "Creating..."
                                        : "Create Product"}
                                </button>

                                <a
                                    href="/farmer/products"
                                    className="block w-full px-6 py-3 text-center border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </a>
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}
