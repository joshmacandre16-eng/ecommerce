import { Head } from "@inertiajs/react";
import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import BuyerSidebar from "./sidebar";
import BuyerHeader from "./header";
import { Star, X } from "lucide-react";

export default function Orders({ auth, orders, stats, filters }) {
    const user = auth?.user;
    const { props } = usePage();
    const csrfToken = props.csrf_token || props.csrfToken;

    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [statusFilter, setStatusFilter] = useState(filters?.status || "");

    // Rating state
    const [ratingModal, setRatingModal] = useState({
        open: false,
        product: null,
        orderId: null,
    });
    const [hoverRating, setHoverRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState("");
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [ratingError, setRatingError] = useState(null);
    const [ratingSuccess, setRatingSuccess] = useState(null);

    // Filter orders based on search and filters (client-side filtering for displayed orders)
    const filteredOrders =
        orders?.data?.filter((order) => {
            const matchesSearch =
                order.id?.toString().includes(searchTerm.toLowerCase()) ||
                order.tracking_number
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());
            const matchesStatus =
                statusFilter === "" || order.order_status === statusFilter;
            return matchesSearch && matchesStatus;
        }) || [];

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
            shipped: "Shipped",
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
        }).format(price || 0);
    };

    // Apply filters
    const applyFilters = () => {
        router.get(
            route("buyer.orders"),
            {
                search: searchTerm,
                status: statusFilter,
            },
            { preserveState: true },
        );
    };

    // Rating functions
    const openRatingModal = (product, orderId) => {
        setRatingModal({ open: true, product, orderId });
        setUserRating(0);
        setUserReview("");
        setRatingError(null);
        setRatingSuccess(null);
    };

    const closeRatingModal = () => {
        setRatingModal({ open: false, product: null, orderId: null });
        setUserRating(0);
        setUserReview("");
        setRatingError(null);
        setRatingSuccess(null);
    };

    const handleSubmitRating = async () => {
        if (userRating === 0) {
            setRatingError("Please select a rating");
            return;
        }

        setIsSubmittingRating(true);
        setRatingError(null);

        try {
            const response = await fetch(
                route("buyer.products.rate", {
                    product: ratingModal.product.id,
                }),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify({
                        rating: userRating,
                        review: userReview,
                    }),
                },
            );

            const data = await response.json();

            if (response.ok) {
                setRatingSuccess("Rating submitted successfully!");
                setTimeout(() => {
                    closeRatingModal();
                }, 2000);
            } else {
                setRatingError(data.message || "Failed to submit rating");
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            setRatingError("An error occurred. Please try again.");
        }

        setIsSubmittingRating(false);
    };

    const canRateOrder = (order) => {
        return (
            order.order_status === "delivered" ||
            order.order_status === "completed"
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <BuyerSidebar />
            <div className="flex-1 flex flex-col">
                <BuyerHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="My Orders - Buyer" />
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            My Orders
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            View your order history
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">
                                Total Orders
                            </p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {stats?.totalOrders || 0}
                            </p>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">
                                Pending
                            </p>
                            <p className="text-2xl font-semibold text-yellow-600 mt-1">
                                {stats?.pendingOrders || 0}
                            </p>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">
                                Completed
                            </p>
                            <p className="text-2xl font-semibold text-green-600 mt-1">
                                {stats?.completedOrders || 0}
                            </p>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">
                                Total Spent
                            </p>
                            <p className="text-2xl font-semibold text-blue-600 mt-1">
                                {formatPrice(stats?.totalSpent)}
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="Search by order ID or tracking number..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            applyFilters();
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="w-48">
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="preparing">Preparing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Apply
                            </button>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Products
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
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tracking #
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
                                                <td className="px-6 py-4 whitespace-normal break-words">
                                                    <div className="text-sm text-gray-900">
                                                        {order.order_items?.map(
                                                            (item) => (
                                                                <div
                                                                    key={
                                                                        item.id
                                                                    }
                                                                >
                                                                    {item
                                                                        .product
                                                                        ?.name ||
                                                                        "Unknown Product"}{" "}
                                                                    x{" "}
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </div>
                                                            ),
                                                        ) || "-"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatPrice(
                                                            order.total_amount,
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {order.payment_method}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.order_status)}`}
                                                    >
                                                        {formatStatus(
                                                            order.order_status,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadgeClass(order.payment_status)}`}
                                                    >
                                                        {formatPayment(
                                                            order.payment_status,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(
                                                            order.created_at,
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {order.tracking_number ||
                                                            "-"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {canRateOrder(order) &&
                                                        order.order_items?.map(
                                                            (item) => (
                                                                <button
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    onClick={() =>
                                                                        openRatingModal(
                                                                            item.product,
                                                                            order.id,
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200 mr-1"
                                                                >
                                                                    <Star className="w-3 h-3" />
                                                                    Rate
                                                                </button>
                                                            ),
                                                        )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-6 py-12 text-center text-gray-500"
                                            >
                                                {searchTerm || statusFilter
                                                    ? "No orders found matching your criteria"
                                                    : "No orders found. Start shopping to see your orders here!"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Info */}
                    {orders?.data && orders.data.length > 0 && (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {orders.from || 1} to{" "}
                                {orders.to || orders.data.length} of{" "}
                                {orders.total} orders
                            </div>
                            <div className="flex gap-2">
                                {orders.prev_page_url && (
                                    <button
                                        onClick={() =>
                                            router.get(orders.prev_page_url)
                                        }
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                )}
                                {orders.next_page_url && (
                                    <button
                                        onClick={() =>
                                            router.get(orders.next_page_url)
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

            {/* Rating Modal */}
            {ratingModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Rate Product
                            </h3>
                            <button
                                onClick={closeRatingModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4">
                            <p className="text-sm text-gray-600 mb-4">
                                How would you rate{" "}
                                <span className="font-medium text-gray-900">
                                    {ratingModal.product?.name ||
                                        "this product"}
                                </span>
                                ?
                            </p>

                            {/* Star Rating */}
                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() =>
                                            setHoverRating(star)
                                        }
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setUserRating(star)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`w-10 h-10 ${
                                                star <=
                                                (hoverRating || userRating)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Review Text */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Write a review (optional)
                                </label>
                                <textarea
                                    value={userReview}
                                    onChange={(e) =>
                                        setUserReview(e.target.value)
                                    }
                                    rows={4}
                                    placeholder="Share your experience with this product..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                            </div>

                            {/* Error/Success Messages */}
                            {ratingError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">
                                        {ratingError}
                                    </p>
                                </div>
                            )}

                            {ratingSuccess && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-600">
                                        {ratingSuccess}
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmitRating}
                                disabled={
                                    isSubmittingRating || userRating === 0
                                }
                                className={`w-full py-2 px-4 rounded-lg font-medium ${
                                    isSubmittingRating || userRating === 0
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            >
                                {isSubmittingRating
                                    ? "Submitting..."
                                    : "Submit Rating"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
