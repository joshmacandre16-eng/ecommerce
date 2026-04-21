import { Head } from "@inertiajs/react";
import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import LogisticSidebar from "./sidebar";
import LogisticHeader from "./header";
import Modal from "@/Components/Modal";

export default function Active({ auth, deliveries, stats, filters }) {
    const user = auth?.user;
    const { props } = usePage();
    const csrfToken = props.csrf_token || props.csrfToken;

    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);

    // Client-side filtering on server-filtered data - clears show all instantly
    const filteredDeliveries = deliveries.data.filter((delivery) => {
        const matchesSearch =
            !searchTerm ||
            delivery.id?.toString().includes(searchTerm.toLowerCase()) ||
            delivery.tracking_number
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            delivery.buyer?.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            delivery.buyer?.email
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
            completed: "bg-emerald-100 text-emerald-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return statusClasses[status] || "bg-gray-100 text-gray-800";
    };

    const getPaymentBadgeClass = (status) => {
        const paymentClasses = {
            pending: "bg-yellow-100 text-yellow-800",
            paid: "bg-green-100 text-green-800",
            failed: "bg-red-100 text-red-800",
            refunded: "bg-purple-100 text-purple-800",
        };
        return paymentClasses[status] || "bg-gray-100 text-gray-800";
    };

    const formatStatus = (status) => {
        const statusLabels = {
            pending: "Pending",
            confirmed: "Confirmed",
            preparing: "Preparing",
            shipped: "Out for Delivery",
            delivered: "Delivered",
            completed: "Completed",
            cancelled: "Cancelled",
        };
        return statusLabels[status] || status;
    };

    const formatPayment = (status) => {
        const paymentLabels = {
            pending: "Pending",
            paid: "Paid",
            failed: "Failed",
            refunded: "Refunded",
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
        }).format(price);
    };

    const handleView = (delivery) => {
        setSelectedDelivery(delivery);
        setViewModalOpen(true);
    };

    // Apply filters
    const applyFilters = () => {
        router.get(
            route("logistic.active"),
            {
                search: searchTerm || undefined,
            },
            { preserveState: true },
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        router.get(route("logistic.active"), {}, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <LogisticSidebar />
            <div className="flex-1 flex flex-col">
                <LogisticHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Active Deliveries - Logistic" />
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Active Deliveries
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            View and manage active deliveries in transit
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">
                                Active Deliveries
                            </p>
                            <p className="text-2xl font-semibold text-purple-600 mt-1">
                                {stats?.activeDeliveries || 0}
                            </p>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">
                                Pending Orders
                            </p>
                            <p className="text-2xl font-semibold text-yellow-600 mt-1">
                                {stats?.pendingDeliveries || 0}
                            </p>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">
                                Delivered Today
                            </p>
                            <p className="text-2xl font-semibold text-green-600 mt-1">
                                {stats?.deliveredToday || 0}
                            </p>
                        </div>
                    </div>

                    {/* Search Filter */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="Search by order ID, tracking number, buyer..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            applyFilters();
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                Search
                            </button>
                            {searchTerm && (
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Deliveries Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-gray-100">
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
                                            Tracking #
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
                                    {filteredDeliveries.length > 0 ? (
                                        filteredDeliveries.map((delivery) => (
                                            <tr
                                                key={delivery.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        #{delivery.id}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-normal break-words">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {delivery.buyer?.name ||
                                                            "-"}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {delivery.buyer
                                                            ?.email || "-"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatPrice(
                                                            delivery.total_amount,
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {
                                                            delivery.payment_method
                                                        }
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(delivery.order_status)}`}
                                                    >
                                                        {formatStatus(
                                                            delivery.order_status,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadgeClass(delivery.payment_status)}`}
                                                    >
                                                        {formatPayment(
                                                            delivery.payment_status,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {delivery.tracking_number ||
                                                            "-"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(
                                                            delivery.created_at,
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() =>
                                                            handleView(delivery)
                                                        }
                                                        className="text-purple-600 hover:text-purple-900"
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
                                                    ? "No deliveries found matching your search"
                                                    : "No active deliveries found"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Logistic Notification Banner */}
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-lg shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-blue-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-blue-800">
                                    <strong>
                                        You are the assigned logistic for these
                                        active deliveries.
                                    </strong>
                                    Farmers and buyers know you handle tracking
                                    and updates for their products.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pagination Info */}
                    {deliveries.data && deliveries.data.length > 0 && (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {deliveries.from || 1} to{" "}
                                {deliveries.to || deliveries.data.length} of{" "}
                                {deliveries.total} deliveries
                                {searchTerm && ` (filtered)`}
                            </div>
                            <div className="flex gap-2">
                                {deliveries.prev_page_url && (
                                    <button
                                        onClick={() =>
                                            router.get(deliveries.prev_page_url)
                                        }
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                )}
                                {deliveries.next_page_url && (
                                    <button
                                        onClick={() =>
                                            router.get(deliveries.next_page_url)
                                        }
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* View Modal */}
            <Modal
                show={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                maxWidth="3xl"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Delivery Details - #{selectedDelivery?.id}
                        </h2>
                        <button
                            onClick={() => setViewModalOpen(false)}
                            className="text-gray-400 hover:text-gray-500"
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
                    {selectedDelivery && (
                        <div className="space-y-6">
                            {/* Delivery Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Delivery Status
                                    </label>
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedDelivery.order_status)}`}
                                    >
                                        {formatStatus(
                                            selectedDelivery.order_status,
                                        )}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Payment Status
                                    </label>
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadgeClass(selectedDelivery.payment_status)}`}
                                    >
                                        {formatPayment(
                                            selectedDelivery.payment_status,
                                        )}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Total Amount
                                    </label>
                                    <p className="text-gray-900 font-semibold">
                                        {formatPrice(
                                            selectedDelivery.total_amount,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Payment Method
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedDelivery.payment_method}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Tracking Number
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedDelivery.tracking_number ||
                                            "-"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Order Date
                                    </label>
                                    <p className="text-gray-900">
                                        {formatDate(
                                            selectedDelivery.created_at,
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Buyer Info */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">
                                    Buyer Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">
                                            Name
                                        </label>
                                        <p className="text-gray-900">
                                            {selectedDelivery.buyer?.name ||
                                                "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">
                                            Email
                                        </label>
                                        <p className="text-gray-900">
                                            {selectedDelivery.buyer?.email ||
                                                "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">
                                            Shipping Address
                                        </label>
                                        <p className="text-gray-900">
                                            {selectedDelivery.shipping_address ||
                                                "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">
                                            Shipping City
                                        </label>
                                        <p className="text-gray-900">
                                            {selectedDelivery.shipping_city ||
                                                "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">
                                            Shipping Phone
                                        </label>
                                        <p className="text-gray-900">
                                            {selectedDelivery.shipping_phone ||
                                                "-"}
                                        </p>
                                    </div>
                                    {selectedDelivery.notes && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">
                                                Notes
                                            </label>
                                            <p className="text-gray-900">
                                                {selectedDelivery.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">
                                    Order Items
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Product
                                                </th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Price
                                                </th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Quantity
                                                </th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Subtotal
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {selectedDelivery.order_items?.map(
                                                (item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-3 py-2">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {item.product
                                                                    ?.name ||
                                                                    "Unknown Product"}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <div className="text-sm text-gray-900">
                                                                {formatPrice(
                                                                    item.price,
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <div className="text-sm text-gray-900">
                                                                {item.quantity}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {formatPrice(
                                                                    item.price *
                                                                        item.quantity,
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                                <button
                                    onClick={() => setViewModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
