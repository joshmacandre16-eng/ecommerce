import { Head, Link, useForm } from "@inertiajs/react";
import AdminSidebar from "./sidebar";
import AdminHeader from "./header";
import {
    Users,
    Package,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

export default function AdminDashboard({
    auth,
    stats = {},
    pendingProducts = [],
    recentOrders = [],
    topProducts = [],
    salesData = [],
    inventoryAlerts = [],
}) {
    const user = auth?.user;

    // Create forms for approving/rejecting products
    const approveForm = useForm({});
    const rejectForm = useForm({});

    // Handle product approval
    const handleApprove = (productId) => {
        approveForm.put(route("products.approve", productId), {
            preserveScroll: true,
        });
    };

    // Handle product rejection
    const handleReject = (productId) => {
        rejectForm.put(route("products.reject", productId), {
            preserveScroll: true,
        });
    };

    // Ensure stats has default values
    const safeStats = {
        totalUsers: stats?.totalUsers ?? 0,
        totalFarmers: stats?.totalFarmers ?? 0,
        totalBuyers: stats?.totalBuyers ?? 0,
        totalLogistics: stats?.totalLogistics ?? 0,
        totalProducts: stats?.totalProducts ?? 0,
        pendingProductApprovals: stats?.pendingProductApprovals ?? 0,
        totalOrders: stats?.totalOrders ?? 0,
        pendingOrders: stats?.pendingOrders ?? 0,
        completedOrders: stats?.completedOrders ?? 0,
        totalRevenue: stats?.totalRevenue ?? 0,
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

    // Calculate max sales value for chart scaling
    const maxSalesValue =
        salesData.length > 0 ? Math.max(...salesData.map((d) => d.value)) : 1;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                <AdminHeader user={user} />

                {/* Page Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Admin Dashboard" />

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Dashboard Overview
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Welcome back, monitor your platform performance
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
                                    <div className="flex items-center mt-2">
                                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm text-emerald-600 ml-1">
                                            12% from last month
                                        </span>
                                    </div>
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
                                    <div className="flex items-center mt-2">
                                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm text-emerald-600 ml-1">
                                            8% from last month
                                        </span>
                                    </div>
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
                                    <div className="flex items-center mt-2">
                                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm text-emerald-600 ml-1">
                                            23% from last month
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        {/* Active Users */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Active Users
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {safeStats.totalUsers.toLocaleString()}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm text-emerald-600 ml-1">
                                            5% from last month
                                        </span>
                                    </div>
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
                                    href="/orders"
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
                                                            {(order.items ||
                                                                order.orderItems)?.[0]
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
                                    href="/products"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    View All →
                                </Link>
                            </div>
                            <div className="p-6">
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
                                                        {product.sales} sales
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(product.price)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sales Chart */}
                    <div className="bg-white border border-gray-200 rounded-lg mb-8">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Sales Overview
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Weekly sales performance
                                </p>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                Download Report
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="h-64 flex items-end justify-around gap-4">
                                {salesData.map((data, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center flex-1"
                                    >
                                        <div className="relative w-full group">
                                            <div
                                                className="w-full bg-blue-600 hover:bg-blue-700 rounded-t transition-colors cursor-pointer"
                                                style={{
                                                    height: `${(data.value / maxSalesValue) * 200}px`,
                                                }}
                                            >
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-medium text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    $
                                                    {(
                                                        data.value / 1000
                                                    ).toFixed(0)}
                                                    K
                                                </span>
                                            </div>
                                        </div>
                                        <span className="mt-3 text-xs font-medium text-gray-600">
                                            {data.day}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Two Column Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pending Product Approvals */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Pending Approvals
                                </h2>
                                <Link
                                    href="/products?status=pending"
                                    className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
                                >
                                    View All
                                    <AlertCircle className="w-4 h-4" />
                                </Link>
                            </div>
                            {pendingProducts && pendingProducts.length > 0 ? (
                                <div className="p-6 space-y-4">
                                    {pendingProducts
                                        .slice(0, 3)
                                        .map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {product.seller
                                                                ?.name ||
                                                                "N/A"}{" "}
                                                            •{" "}
                                                            {formatCurrency(
                                                                product.price,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleApprove(
                                                                    product.id,
                                                                )
                                                            }
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleReject(
                                                                    product.id,
                                                                )
                                                            }
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-gray-500">
                                    <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm">
                                        No pending products to approve
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* User Statistics & Inventory */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    User Statistics
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {safeStats.totalFarmers}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Farmers
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {safeStats.totalBuyers}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Buyers
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {safeStats.totalLogistics}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Logistics
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                        Inventory Alerts
                                    </h3>
                                    {inventoryAlerts.length > 0 ? (
                                        <div className="space-y-3">
                                            {inventoryAlerts.map((alert) => (
                                                <div
                                                    key={alert.id}
                                                    className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg"
                                                >
                                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            Low Stock Alert
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {alert.name ||
                                                                alert.product ||
                                                                `#${alert.id}`}{" "}
                                                            - Only{" "}
                                                            {alert.quantity}{" "}
                                                            remaining
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-500">
                                            <p className="text-sm">
                                                No inventory alerts
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
