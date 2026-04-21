import { Head, Link } from "@inertiajs/react";
import FarmerSidebar from "./sidebar";
import FarmerHeader from "./header";
import {
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    ShoppingCart,
} from "lucide-react";

export default function Earnings({
    auth,
    stats = {},
    monthlyEarnings = [],
    recentTransactions = [],
}) {
    const user = auth?.user;

    // Ensure stats has default values
    const safeStats = {
        totalEarnings: stats?.totalEarnings ?? 0,
        pendingEarnings: stats?.pendingEarnings ?? 0,
        completedOrders: stats?.completedOrders ?? 0,
        pendingOrders: stats?.pendingOrders ?? 0,
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

    // Helper function to get order status color
    const getStatusColor = (status) => {
        switch (status) {
            case "delivered":
            case "completed":
                return "bg-emerald-50 text-emerald-700 border border-emerald-200";
            case "shipped":
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

    // Calculate max earnings value for chart scaling
    const maxEarningsValue =
        monthlyEarnings.length > 0
            ? Math.max(...monthlyEarnings.map((d) => d.value), 1)
            : 1;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <FarmerSidebar />
            <div className="flex-1 flex flex-col">
                <FarmerHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Earnings - Farmer" />
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Earnings
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            View your earnings and transactions
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Earnings */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Earnings
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {formatCurrency(
                                            safeStats.totalEarnings,
                                        )}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        {/* Pending Earnings */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Pending Earnings
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {formatCurrency(
                                            safeStats.pendingEarnings,
                                        )}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </div>

                        {/* Completed Orders */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Completed Orders
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {safeStats.completedOrders.toLocaleString()}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        {/* Pending Orders */}
                        <div className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Pending Orders
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {safeStats.pendingOrders.toLocaleString()}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Earnings Chart */}
                    <div className="bg-white border border-gray-200 rounded-lg mb-8">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Earnings Overview
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Last 12 months earnings
                                </p>
                            </div>
                            <TrendingUp className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="p-6">
                            {monthlyEarnings && monthlyEarnings.length > 0 ? (
                                <div className="h-64 flex items-end justify-around gap-2">
                                    {monthlyEarnings.map((data, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col items-center flex-1"
                                        >
                                            <div className="relative w-full group">
                                                <div
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-t transition-colors cursor-pointer"
                                                    style={{
                                                        height: `${Math.max((data.value / maxEarningsValue) * 200, data.value > 0 ? 4 : 0)}px`,
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
                                                {data.monthShort}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm">
                                            No earnings data yet
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Recent Transactions
                            </h2>
                            <Link
                                href="/farmer/orders"
                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            {recentTransactions &&
                            recentTransactions.length > 0 ? (
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
                                                Your Earnings
                                            </th>
                                            <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Payment
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
                                        {recentTransactions.map(
                                            (transaction) => (
                                                <tr
                                                    key={transaction.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                                        #{transaction.id}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-900">
                                                        {transaction.buyer
                                                            ?.name || "N/A"}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm font-semibold text-emerald-600">
                                                        {formatCurrency(
                                                            transaction.seller_amount,
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm">
                                                        <span
                                                            className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                                                                transaction.payment_status ===
                                                                "paid"
                                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                    : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                                            }`}
                                                        >
                                                            {transaction.payment_status ===
                                                            "paid"
                                                                ? "Paid"
                                                                : "Pending"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span
                                                            className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(transaction.order_status)}`}
                                                        >
                                                            {getStatusLabel(
                                                                transaction.order_status,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-500">
                                                        {formatDate(
                                                            transaction.created_at,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm">
                                        No transactions yet
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
