import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import FarmerSidebar from "./sidebar";
import FarmerHeader from "./header";
import { Truck, MapPin, PackageCheck, AlertCircle } from "lucide-react";

export default function ProductTrack({ auth, orders = [], stats = {} }) {
    const { user } = auth;

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const filteredOrders =
        orders.data?.filter((order) => {
            const matchesSearch =
                order.id?.toString().includes(searchTerm) ||
                order.tracking_number
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());
            const matchesStatus =
                statusFilter === "" || order.order_status === statusFilter;
            return matchesSearch && matchesStatus;
        }) || [];

    const formatStatus = (status) => {
        const labels = {
            pending: "Pending",
            confirmed: "Confirmed",
            preparing: "Preparing",
            shipped: "Shipped",
            delivered: "Delivered",
            completed: "Completed",
            cancelled: "Cancelled",
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            confirmed: "bg-blue-100 text-blue-800",
            preparing: "bg-indigo-100 text-indigo-800",
            shipped: "bg-purple-100 text-purple-800",
            delivered: "bg-green-100 text-green-800",
            completed: "bg-emerald-100 text-emerald-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(price);

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <FarmerSidebar />
            <div className="flex-1 flex flex-col">
                <FarmerHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Product Track - Farmer" />
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Product Tracking
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Track logistics status and customer claims for your
                            orders
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl border shadow-sm">
                            <div className="flex items-center">
                                <Truck className="w-8 h-8 text-blue-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        In Transit
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.inTransit || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border shadow-sm">
                            <div className="flex items-center">
                                <PackageCheck className="w-8 h-8 text-green-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Delivered
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.delivered || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border shadow-sm">
                            <div className="flex items-center">
                                <AlertCircle className="w-8 h-8 text-orange-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Claims
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.claims || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Search by Order ID or Tracking #"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Tracking #
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Claimed
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900">
                                                        #{order.id}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {order.order_items?.[0]
                                                            ?.product?.name ||
                                                            "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}
                                                    >
                                                        {formatStatus(
                                                            order.order_status,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-mono text-sm text-gray-900">
                                                        {order.tracking_number ||
                                                            "-"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            order.is_claimed
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        {order.is_claimed
                                                            ? "Yes"
                                                            : "No"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {formatDate(
                                                        order.updated_at,
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-6 py-12 text-center text-gray-500"
                                            >
                                                No tracked orders found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
