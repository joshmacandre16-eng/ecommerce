import { Head, Link } from "@inertiajs/react";
import FarmerSidebar from "./sidebar";
import FarmerHeader from "./header";
import { Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function Inventory({ auth, products = [], stats = {} }) {
    const user = auth?.user;

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

    // Get stock status color and label
    const getStockStatus = (stock) => {
        if (stock === 0) {
            return {
                color: "bg-red-50 text-red-700 border border-red-200",
                label: "Out of Stock",
                icon: XCircle,
            };
        } else if (stock <= 10) {
            return {
                color: "bg-amber-50 text-amber-700 border border-amber-200",
                label: "Low Stock",
                icon: AlertTriangle,
            };
        } else {
            return {
                color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
                label: "In Stock",
                icon: CheckCircle,
            };
        }
    };

    // Get active status color
    const getActiveStatusColor = (isActive) => {
        return isActive
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-gray-50 text-gray-700 border border-gray-200";
    };

    // Get approval status color
    const getApprovalStatusColor = (isApproved) => {
        return isApproved
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-amber-50 text-amber-700 border border-amber-200";
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <FarmerSidebar />
            <div className="flex-1 flex flex-col">
                <FarmerHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Inventory - Farmer" />
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Inventory
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage your inventory and stock levels
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 rounded-lg">
                                    <Package className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Total Products
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {stats.totalProducts || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Package className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Total Stock
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {stats.totalStock || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 rounded-lg">
                                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Low Stock Items
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {stats.lowStockCount || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Out of Stock
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {stats.outOfStockCount || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {products && products.length > 0 ? (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stock
                                            </th>
                                            <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Approval
                                            </th>
                                            <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Harvest Date
                                            </th>
                                            <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Farm Location
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {products.map((product) => {
                                            const stockStatus = getStockStatus(
                                                product.stock,
                                            );
                                            const StockIcon = stockStatus.icon;

                                            return (
                                                <tr
                                                    key={product.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="py-4 px-6">
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
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {product.is_organic
                                                                        ? "Organic"
                                                                        : "Conventional"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-600">
                                                        {product.category
                                                            ? product.category
                                                                  .charAt(0)
                                                                  .toUpperCase() +
                                                              product.category.slice(
                                                                  1,
                                                              )
                                                            : "-"}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                                        {formatCurrency(
                                                            product.price,
                                                        )}{" "}
                                                        <span className="text-gray-500 font-normal">
                                                            / {product.unit}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {product.stock}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {product.unit}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span
                                                            className={`px-2.5 py-1 rounded-md text-xs font-medium ${stockStatus.color} flex items-center gap-1 w-fit`}
                                                        >
                                                            <StockIcon className="w-3 h-3" />
                                                            {stockStatus.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span
                                                            className={`px-2.5 py-1 rounded-md text-xs font-medium ${getApprovalStatusColor(
                                                                product.is_approved,
                                                            )}`}
                                                        >
                                                            {product.is_approved
                                                                ? "Approved"
                                                                : "Pending"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-600">
                                                        {formatDate(
                                                            product.harvest_date,
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-600">
                                                        {product.farm_location ||
                                                            "-"}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg p-12">
                            <div className="text-center">
                                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No Inventory Yet
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    You haven't added any products to your
                                    inventory yet.
                                </p>
                                <Link
                                    href="/farmer/products/create"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    Add Your First Product
                                </Link>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
