import { Head } from "@inertiajs/react";
import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import LogisticsSidebar from "./sidebar";
import LogisticsHeader from "./header";
import Modal from "@/Components/Modal";
import {
    Truck,
    Clock,
    Package,
    User,
    Phone,
    MapPin,
    DollarSign,
    CreditCard,
} from "lucide-react";

export default function LogisticsPending({
    auth,
    pendingOrders,
    stats,
    filters,
}) {
    const user = auth?.user;
    const { props } = usePage();

    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Client-side filtering on server-filtered data
    const filteredOrders = pendingOrders.data.filter((order) => {
        const matchesSearch =
            !searchTerm ||
            order.id?.toString().includes(searchTerm) ||
            order.tracking_number
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            order.buyer?.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            order.buyer?.email
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            pending: "bg-yellow-100 text-yellow-800",
            confirmed: "bg-blue-100 text-blue-800",
            preparing: "bg-indigo-100 text-indigo-800",
            shipped: "bg-purple-100 text-purple-800",
            delivered: "bg-green-100 text-green-800",
        };
        return statusClasses[status] || "bg-gray-100 text-gray-800";
    };

    const getPaymentBadgeClass = (status) => {
        const paymentClasses = {
            pending: "bg-yellow-100 text-yellow-800",
            paid: "bg-green-100 text-green-800",
            failed: "bg-red-100 text-red-800",
        };
        return paymentClasses[status] || "bg-gray-100 text-gray-800";
    };

    const formatStatus = (status) => {
        const statusLabels = {
            pending: "Pending",
            confirmed: "Confirmed",
            preparing: "Preparing",
            shipped: "Out for Delivery",
        };
        return statusLabels[status] || status;
    };

    const formatPayment = (status) => {
        const paymentLabels = {
            pending: "Pending",
            paid: "Paid",
            failed: "Failed",
        };
        return paymentLabels[status] || status;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(price || 0);
    };

    const handleView = (order) => {
        setSelectedOrder(order);
        setViewModalOpen(true);
    };

    const applyFilters = () => {
        router.get(
            route("logistic.pending"),
            { search: searchTerm || undefined },
            { preserveState: true },
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        router.get(route("logistic.pending"), {}, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <LogisticsSidebar />
            <div className="flex-1 flex flex-col">
                <LogisticsHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Pending Deliveries - Logistic" />
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Pending Deliveries
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            View and manage pending delivery requests
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white border border-gray-200 p-6 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">
                                Total Pending
                            </p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {stats?.totalPending || 0}
                            </p>
                        </div>
                        <div className="bg-white border border-gray-200 p-6 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">
                                Pending Orders
                            </p>
                            <p className="text-3xl font-bold text-yellow-600 mt-1">
                                {stats?.pendingCount || 0}
                            </p>
                        </div>
                        <div className="bg-white border border-gray-200 p-6 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">
                                Confirmed
                            </p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">
                                {stats?.confirmedCount || 0}
                            </p>
                        </div>
                    </div>

                    {/* Search Filter */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="Search by order ID, tracking, buyer name..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && applyFilters()
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <button
                                onClick={applyFilters}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Search
                            </button>
                            {searchTerm && (
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Pending Orders Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Buyer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        #{order.id}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order.buyer?.name ||
                                                            "N/A"}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {order.buyer?.phone ||
                                                            order.customer_phone ||
                                                            "-"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatPrice(
                                                            order.total_amount,
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.order_status)}`}
                                                    >
                                                        {formatStatus(
                                                            order.order_status,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadgeClass(order.payment_status)}`}
                                                    >
                                                        {formatPayment(
                                                            order.payment_status,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {order.orderItems?.length ||
                                                        0}{" "}
                                                    items
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(
                                                        order.created_at,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() =>
                                                            handleView(order)
                                                        }
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="8"
                                                className="px-6 py-12 text-center text-gray-500"
                                            >
                                                {searchTerm
                                                    ? "No matching pending orders found"
                                                    : "No pending deliveries found"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pendingOrders.data.length > 0 && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing {pendingOrders.from} to{" "}
                                        {pendingOrders.to} of{" "}
                                        {pendingOrders.total} orders
                                    </div>
                                    <div className="flex space-x-2">
                                        {pendingOrders.prev_page_url && (
                                            <button
                                                onClick={() =>
                                                    router.get(
                                                        pendingOrders.prev_page_url,
                                                    )
                                                }
                                                className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                        )}
                                        {pendingOrders.next_page_url && (
                                            <button
                                                onClick={() =>
                                                    router.get(
                                                        pendingOrders.next_page_url,
                                                    )
                                                }
                                                className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* View Modal */}
                    <Modal
                        show={viewModalOpen}
                        onClose={() => setViewModalOpen(false)}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Order Details - #{selectedOrder?.id}
                                </h2>
                                <button
                                    onClick={() => setViewModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                            {selectedOrder && (
                                <div className="space-y-6">
                                    {/* Order Summary */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                                Status
                                            </label>
                                            <span
                                                className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(selectedOrder.order_status)}`}
                                            >
                                                {formatStatus(
                                                    selectedOrder.order_status,
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                                Payment Status
                                            </label>
                                            <span
                                                className={`px-3 py-1 text-sm font-semibold rounded-full ${getPaymentBadgeClass(selectedOrder.payment_status)}`}
                                            >
                                                {formatPayment(
                                                    selectedOrder.payment_status,
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                                Total Amount
                                            </label>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatPrice(
                                                    selectedOrder.total_amount,
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                                Items
                                            </label>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {selectedOrder.orderItems
                                                    ?.length || 0}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Buyer Info */}
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Buyer Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Name
                                                </label>
                                                <p className="text-gray-900 font-medium">
                                                    {selectedOrder.buyer
                                                        ?.name || "N/A"}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Phone
                                                </label>
                                                <p className="text-gray-900">
                                                    {selectedOrder.buyer
                                                        ?.phone ||
                                                        selectedOrder.customer_phone ||
                                                        "N/A"}
                                                </p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Shipping Address
                                                </label>
                                                <p className="text-gray-900">
                                                    {selectedOrder.shipping_address ||
                                                        "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items Table */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Order Items (
                                            {selectedOrder.orderItems?.length ||
                                                0}
                                            )
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full bg-white border border-gray-200 rounded-lg">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Product
                                                        </th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                            Price
                                                        </th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                            Qty
                                                        </th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                            Subtotal
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {selectedOrder.orderItems?.map(
                                                        (item) => (
                                                            <tr key={item.id}>
                                                                <td className="px-4 py-3">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {item
                                                                            .product
                                                                            ?.name ||
                                                                            "N/A"}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-sm text-gray-900">
                                                                    {formatPrice(
                                                                        item.price,
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-sm text-gray-900">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                                                    {formatPrice(
                                                                        item.price *
                                                                            item.quantity,
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    ) || (
                                                        <tr>
                                                            <td
                                                                colSpan="4"
                                                                className="px-4 py-8 text-center text-gray-500"
                                                            >
                                                                No items
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t">
                                        <button
                                            onClick={() =>
                                                setViewModalOpen(false)
                                            }
                                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Modal>
                </main>
            </div>
        </div>
    );
}
