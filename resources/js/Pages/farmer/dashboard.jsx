import { Head, Link } from "@inertiajs/react";
import FarmerSidebar from "./sidebar";
import FarmerHeader from "./header";
import {
    Package,
    ShoppingCart,
    DollarSign,
    Clock,
    TrendingUp,
    ArrowUpRight,
    Plus,
    Eye,
    Edit,
    Trash2,
    AlertCircle,
} from "lucide-react";

export default function FarmerDashboard({
    auth,
    stats = {},
    orders = [],
    products = [],
}) {
    const user = auth?.user;

    // Ensure stats has default values
    const safeStats = {
        totalProducts: stats?.totalProducts ?? 0,
        totalOrders: stats?.totalOrders ?? 0,
        totalRevenue: stats?.totalRevenue ?? 0,
        pendingApproval: stats?.pendingApproval ?? 0,
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

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <FarmerSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                <FarmerHeader user={user} />

                {/* Page Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Farmer Dashboard" />

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Dashboard Overview
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Welcome back, manage your farm and products
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Products */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Products
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {safeStats.totalProducts}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm text-emerald-600 ml-1">
                                            12% from last month
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                                    <Package className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </div>

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
                                            8% from last month
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        {/* Total Revenue */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Revenue
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {formatCurrency(safeStats.totalRevenue)}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm text-emerald-600 ml-1">
                                            23% from last month
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </div>

                        {/* Pending Approval */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Pending Approval
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {safeStats.pendingApproval}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <Clock className="w-4 h-4 text-amber-600" />
                                        <span className="text-sm text-gray-500 ml-1">
                                            Awaiting review
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Link
                                href="/farmer/products/create"
                                className="flex items-center justify-center gap-2 p-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="font-medium">Add Product</span>
                            </Link>
                            <Link
                                href="/farmer/orders"
                                className="flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Eye className="w-5 h-5" />
                                <span className="font-medium">View Orders</span>
                            </Link>
                            <Link
                                href="/farmer/products"
                                className="flex items-center justify-center gap-2 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <Package className="w-5 h-5" />
                                <span className="font-medium">
                                    Manage Inventory
                                </span>
                            </Link>
                            <Link
                                href="/farmer/analytics"
                                className="flex items-center justify-center gap-2 p-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                            >
                                <TrendingUp className="w-5 h-5" />
                                <span className="font-medium">
                                    View Analytics
                                </span>
                            </Link>
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
                                    href="/farmer/orders"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    View All →
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                {orders && orders.length > 0 ? (
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Order ID
                                                </th>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Product
                                                </th>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Quantity
                                                </th>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.slice(0, 5).map((order) => (
                                                <tr
                                                    key={order.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                                        #{order.id}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-900">
                                                        {order.orderItems?.[0]
                                                            ?.product?.name ||
                                                            "N/A"}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-600">
                                                        {order.orderItems?.[0]
                                                            ?.quantity ||
                                                            0}{" "}
                                                        {order.orderItems?.[0]
                                                            ?.product?.unit ||
                                                            "units"}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span
                                                            className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(order.order_status)}`}
                                                        >
                                                            {getStatusLabel(
                                                                order.order_status,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <Link
                                                            href={`/farmer/orders/${order.id}`}
                                                            className="text-blue-600 hover:text-blue-700"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm">No orders yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Products Summary */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    My Products
                                </h2>
                                <Link
                                    href="/farmer/products"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    View All →
                                </Link>
                            </div>
                            <div className="p-6">
                                {products && products.length > 0 ? (
                                    <div className="space-y-4">
                                        {products.slice(0, 5).map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatCurrency(
                                                                product.price,
                                                            )}{" "}
                                                            / {product.unit}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/farmer/products/${product.id}/edit`}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm text-gray-500 mb-4">
                                            No products yet
                                        </p>
                                        <Link
                                            href="/farmer/products/create"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Your First Product
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pending Approvals Section */}
                    {safeStats.pendingApproval > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-6 h-6 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-amber-900 mb-1">
                                        Products Pending Approval
                                    </h3>
                                    <p className="text-sm text-amber-700 mb-4">
                                        You have {safeStats.pendingApproval}{" "}
                                        product
                                        {safeStats.pendingApproval !== 1
                                            ? "s"
                                            : ""}{" "}
                                        waiting for admin approval.
                                    </p>
                                    <Link
                                        href="/farmer/products?status=pending"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                                    >
                                        View Pending Products
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
