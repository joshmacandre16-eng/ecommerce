import { Head } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import AdminSidebar from "./sidebar";
import AdminHeader from "./header";
import {
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    TrendingUp,
    TrendingDown,
    BarChart3,
} from "lucide-react";

export default function Reports({
    auth,
    salesReports = [],
    userGrowth = [],
    orderStats = {},
    revenueStats = {},
    topProducts = [],
    categoryStats = [],
    userStats = {},
}) {
    const { props } = usePage();
    const csrfToken = props.csrf_token || props.csrfToken;
    const user = auth?.user;

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(amount || 0);
    };

    // Calculate max values for charts
    const maxSalesValue =
        salesReports.length > 0
            ? Math.max(...salesReports.map((d) => d.sales), 1)
            : 1;
    const maxUserValue =
        userGrowth.length > 0
            ? Math.max(...userGrowth.map((d) => d.users), 1)
            : 1;

    // Get revenue change percentage
    const revenueChange =
        revenueStats.lastMonth > 0
            ? ((revenueStats.thisMonth - revenueStats.lastMonth) /
                  revenueStats.lastMonth) *
              100
            : 0;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                <AdminHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Reports - Admin" />

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Reports
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            View platform reports and analytics
                        </p>
                    </div>

                    {/* Revenue Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Revenue */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Revenue
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {formatCurrency(revenueStats.total)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        {/* This Month Revenue */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        This Month
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {formatCurrency(revenueStats.thisMonth)}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        {revenueChange >= 0 ? (
                                            <>
                                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                                <span className="text-sm text-emerald-600 ml-1">
                                                    {revenueChange.toFixed(1)}%
                                                    from last month
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <TrendingDown className="w-4 h-4 text-red-600" />
                                                <span className="text-sm text-red-600 ml-1">
                                                    {Math.abs(
                                                        revenueChange,
                                                    ).toFixed(1)}
                                                    % from last month
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
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
                                        {orderStats.total || 0}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        {/* Total Users */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Users
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {userStats.total || 0}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Sales Chart */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Sales Overview
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Daily sales for the last 30 days
                                </p>
                            </div>
                            <div className="p-6">
                                <div className="h-64 flex items-end justify-around gap-1">
                                    {salesReports
                                        .slice(-14)
                                        .map((data, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col items-center flex-1"
                                            >
                                                <div className="relative w-full group">
                                                    <div
                                                        className="w-full bg-blue-600 hover:bg-blue-700 rounded-t transition-colors cursor-pointer"
                                                        style={{
                                                            height: `${Math.max((data.sales / maxSalesValue) * 200, 4)}px`,
                                                        }}
                                                    >
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                            {formatCurrency(
                                                                data.sales,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="mt-2 text-xs font-medium text-gray-600">
                                                    {data.date}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                                {salesReports.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm">
                                            No sales data available
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User Growth Chart */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    User Growth
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    New user registrations
                                </p>
                            </div>
                            <div className="p-6">
                                <div className="h-64 flex items-end justify-around gap-1">
                                    {userGrowth
                                        .slice(-14)
                                        .map((data, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col items-center flex-1"
                                            >
                                                <div className="relative w-full group">
                                                    <div
                                                        className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-t transition-colors cursor-pointer"
                                                        style={{
                                                            height: `${Math.max((data.users / maxUserValue) * 200, 4)}px`,
                                                        }}
                                                    >
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                            {data.users} users
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="mt-2 text-xs font-medium text-gray-600">
                                                    {data.date}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                                {userGrowth.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm">
                                            No user data available
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Selling Products */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Top Selling Products
                                </h2>
                            </div>
                            <div className="p-6">
                                {topProducts.length > 0 ? (
                                    <div className="space-y-4">
                                        {topProducts.map((product, index) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <span className="text-sm font-medium text-blue-600">
                                                            #{index + 1}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {product.total_sold}{" "}
                                                            sold
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(
                                                        product.total_revenue,
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm">
                                            No product data available
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Status & User Distribution */}
                        <div className="space-y-6">
                            {/* Order Status */}
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Order Status
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-2xl font-semibold text-yellow-700">
                                                {orderStats.pending || 0}
                                            </p>
                                            <p className="text-xs text-yellow-600">
                                                Pending
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-2xl font-semibold text-blue-700">
                                                {orderStats.confirmed || 0}
                                            </p>
                                            <p className="text-xs text-blue-600">
                                                Confirmed
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                            <p className="text-2xl font-semibold text-purple-700">
                                                {orderStats.preparing || 0}
                                            </p>
                                            <p className="text-xs text-purple-600">
                                                Preparing
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                            <p className="text-2xl font-semibold text-indigo-700">
                                                {orderStats.shipped || 0}
                                            </p>
                                            <p className="text-xs text-indigo-600">
                                                Shipped
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                            <p className="text-2xl font-semibold text-emerald-700">
                                                {orderStats.delivered || 0}
                                            </p>
                                            <p className="text-xs text-emerald-600">
                                                Delivered
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-2xl font-semibold text-red-700">
                                                {orderStats.cancelled || 0}
                                            </p>
                                            <p className="text-xs text-red-600">
                                                Cancelled
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* User Distribution */}
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        User Distribution
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                <span className="text-sm text-gray-600">
                                                    Farmers
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {userStats.farmers || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                <span className="text-sm text-gray-600">
                                                    Buyers
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {userStats.buyers || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                                <span className="text-sm text-gray-600">
                                                    Logistics
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {userStats.logistics || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                <span className="text-sm text-gray-600">
                                                    Admins
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {userStats.admins || 0}
                                            </span>
                                        </div>
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
