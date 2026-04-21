import { Head, Link } from "@inertiajs/react";
import FarmerSidebar from "./sidebar";
import FarmerHeader from "./header";
import {
    Package,
    ShoppingCart,
    DollarSign,
    Users,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

export default function Analytics({
    auth,
    stats = {},
    recentOrders = [],
    topProducts = [],
    revenueData = [],
    ordersData = {},
    productData = {},
}) {
    const user = auth?.user;

    // Ensure stats has default values
    const safeStats = {
        totalProducts: stats?.totalProducts ?? 0,
        totalOrders: stats?.totalOrders ?? 0,
        pendingOrders: stats?.pendingOrders ?? 0,
        processingOrders: stats?.processingOrders ?? 0,
        completedOrders: stats?.completedOrders ?? 0,
        totalRevenue: stats?.totalRevenue ?? 0,
        pendingApproval: stats?.pendingApproval ?? 0,
    };

    // Helper function to get order status color
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

    // Helper function to get order status label
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
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Calculate max revenue value for chart scaling
    const maxRevenueValue =
        revenueData.length > 0
            ? Math.max(...revenueData.map((d) => d.value), 1)
            : 1;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <FarmerSidebar />
            <div className="flex-1 flex flex-col">
                <FarmerHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Analytics - Farmer" />
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Analytics
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            View your business performance
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
                                        {safeStats.totalProducts.toLocaleString()}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Package className="w-6 h-6 text-blue-600" />
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
                                        {safeStats.totalOrders.toLocaleString()}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6 text-purple-600" />
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
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-emerald-600" />
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
                                        {safeStats.pendingApproval.toLocaleString()}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-amber-600" />
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
                                    href="/farmer/orders"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    View All →
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                {recentOrders && recentOrders.length > 0 ? (
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Order ID
                                                </th>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Customer
                                                </th>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Product
                                                </th>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {recentOrders
                                                .slice(0, 5)
                                                .map((order) => (
                                                    <tr
                                                        key={order.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                                            #{order.id}
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-gray-900">
                                                            {order.buyer
                                                                ?.name || "N/A"}
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-gray-600">
                                                            {(order.orderItems ||
                                                                order.items)?.[0]
                                                                ?.product
                                                                ?.name || "N/A"}
                                                        </td>
                                                        <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                                            {formatCurrency(
                                                                order.total_amount,
                                                            )}
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
                                                        <td className="py-4 px-6 text-sm text-gray-500">
                                                            {formatDate(
                                                                order.created_at,
                                                            )}
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

                        {/* Top Products */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Top Products
                                </h2>
                                <Link
                                    href="/farmer/products"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    View All →
                                </Link>
                            </div>
                            <div className="p-6">
                                {topProducts && topProducts.length > 0 ? (
                                    <div className="space-y-4">
                                        {topProducts.map((product, index) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-600">
                                                            #{index + 1}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {product.sales}{" "}
                                                            sales
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(
                                                        product.price,
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm">
                                            No products yet
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Revenue Chart */}
                    <div className="bg-white border border-gray-200 rounded-lg mb-8">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Revenue Overview
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Last 30 days revenue
                                </p>
                            </div>
                        </div>
                        <div className="p-6">
                            {revenueData && revenueData.length > 0 ? (
                                <div className="h-64 flex items-end justify-around gap-2">
                                    {revenueData.map((data, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col items-center flex-1"
                                        >
                                            <div className="relative w-full group">
                                                <div
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-t transition-colors cursor-pointer"
                                                    style={{
                                                        height: `${Math.max((data.value / maxRevenueValue) * 200, data.value > 0 ? 4 : 0)}px`,
                                                    }}
                                                >
                                                    {data.value > 0 && (
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                            {formatCurrency(
                                                                data.value,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="mt-3 text-xs font-medium text-gray-600">
                                                {data.day}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm">
                                            No revenue data yet
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Status & Product Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Order Status Breakdown */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Order Status Breakdown
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    {Object.entries(ordersData || {}).map(
                                        ([status, count]) => (
                                            <div
                                                key={status}
                                                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`w-3 h-3 rounded-full ${getStatusColor(status).split(" ")[0].replace("bg-", "bg-")}`}
                                                    ></span>
                                                    <span className="text-sm font-medium text-gray-900 capitalize">
                                                        {getStatusLabel(status)}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {count}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Product Status Breakdown */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Product Status
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-2xl font-semibold text-blue-900">
                                            {productData?.total ?? 0}
                                        </p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            Total Products
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                        <p className="text-2xl font-semibold text-emerald-900">
                                            {productData?.active ?? 0}
                                        </p>
                                        <p className="text-xs text-emerald-700 mt-1">
                                            Active
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="text-2xl font-semibold text-amber-900">
                                            {productData?.pending ?? 0}
                                        </p>
                                        <p className="text-xs text-amber-700 mt-1">
                                            Pending Approval
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {safeStats.pendingOrders}
                                        </p>
                                        <p className="text-xs text-gray-700 mt-1">
                                            Pending Orders
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
