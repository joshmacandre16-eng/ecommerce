import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Package,
    CheckCircle,
    Clock,
    Search,
    Eye,
    Truck,
    XCircle,
} from "lucide-react";

export default function OrdersIndex({ auth, orders, filters }) {
    const user = auth.user;
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState(filters?.search || "");
    const [statusFilter, setStatusFilter] = useState(filters?.status || "all");

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "delivered":
            case "completed":
                return "bg-green-100 text-green-800";
            case "shipped":
                return "bg-blue-100 text-blue-800";
            case "preparing":
                return "bg-purple-100 text-purple-800";
            case "confirmed":
                return "bg-yellow-100 text-yellow-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Get status label
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

    // Filter orders locally
    const filteredOrders = (orders?.data || []).filter((order) => {
        const matchesSearch =
            !searchQuery ||
            String(order.id).toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || order.order_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Handle status update
    const handleStatusUpdate = (orderId, newStatus) => {
        fetch(`/orders/${orderId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector(
                    'meta[name="csrf-token"]',
                ).content,
            },
            body: JSON.stringify({ status: newStatus }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert(data.message || "Error updating order status");
                }
            })
            .catch((error) => {
                alert("Error updating order status");
            });
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    My Orders
                </h2>
            }
        >
            <Head title="Orders" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by order ID..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="px-4 py-3 border border-gray-200 rounded-lg"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="preparing">Preparing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-4">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <button
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className={`w-full text-left bg-white rounded-xl shadow-sm border p-4 hover:shadow-md ${
                                            selectedOrder?.id === order.id
                                                ? "border-green-500 ring-2 ring-green-500"
                                                : "border-gray-100"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">
                                                    #{order.id}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(
                                                        order.created_at,
                                                    )}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}
                                            >
                                                {getStatusLabel(
                                                    order.order_status,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-sm text-gray-500">
                                                {order.order_items?.length || 0}{" "}
                                                item(s)
                                            </span>
                                            <span className="font-semibold text-gray-800">
                                                {formatCurrency(
                                                    order.total_amount,
                                                )}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                        No orders found
                                    </h3>
                                    <p className="text-gray-500">
                                        You don't have any orders yet.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-2">
                            {selectedOrder ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-800">
                                                    Order #{selectedOrder.id}
                                                </h2>
                                                <p className="text-gray-500">
                                                    {formatDate(
                                                        selectedOrder.created_at,
                                                    )}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.order_status)}`}
                                            >
                                                {getStatusLabel(
                                                    selectedOrder.order_status,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-800 mb-4">
                                            Order Items
                                        </h3>
                                        {selectedOrder.order_items?.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between p-3 bg-gray-50 rounded-lg mb-2"
                                                >
                                                    <div>
                                                        <span className="font-medium">
                                                            {item.product
                                                                ?.name ||
                                                                "Product"}
                                                        </span>
                                                        <span className="text-gray-500">
                                                            {" "}
                                                            x {
                                                                item.quantity
                                                            }{" "}
                                                            {item.product
                                                                ?.unit ||
                                                                "units"}
                                                        </span>
                                                    </div>
                                                    <span className="font-semibold">
                                                        {formatCurrency(
                                                            item.price *
                                                                item.quantity,
                                                        )}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    {/* Shipping Info */}
                                    {selectedOrder.shipping_address && (
                                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                            <h3 className="font-semibold text-gray-800 mb-2">
                                                Shipping Address
                                            </h3>
                                            <p className="text-gray-600">
                                                {selectedOrder.shipping_address}
                                            </p>
                                            <p className="text-gray-600">
                                                {selectedOrder.shipping_city}
                                            </p>
                                            <p className="text-gray-600">
                                                {selectedOrder.shipping_phone}
                                            </p>
                                        </div>
                                    )}

                                    {/* Payment Info */}
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                        <h3 className="font-semibold text-gray-800 mb-2">
                                            Payment
                                        </h3>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Method:
                                            </span>
                                            <span className="font-medium">
                                                {selectedOrder.payment_method?.toUpperCase() ||
                                                    "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Status:
                                            </span>
                                            <span
                                                className={`font-medium ${selectedOrder.payment_status === "paid" ? "text-green-600" : "text-yellow-600"}`}
                                            >
                                                {selectedOrder.payment_status
                                                    ?.charAt(0)
                                                    .toUpperCase() +
                                                    selectedOrder.payment_status?.slice(
                                                        1,
                                                    ) || "Pending"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="border-t pt-4 flex justify-between">
                                        <span className="font-semibold">
                                            Total
                                        </span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {formatCurrency(
                                                selectedOrder.total_amount,
                                            )}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h3 className="font-semibold text-gray-800 mb-4">
                                            Actions
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {/* For farmers - confirm/prepare orders */}
                                            {user.role === "farmer" &&
                                                selectedOrder.order_status ===
                                                    "pending" && (
                                                    <button
                                                        onClick={() =>
                                                            handleStatusUpdate(
                                                                selectedOrder.id,
                                                                "confirmed",
                                                            )
                                                        }
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Confirm Order
                                                    </button>
                                                )}
                                            {user.role === "farmer" &&
                                                selectedOrder.order_status ===
                                                    "confirmed" && (
                                                    <button
                                                        onClick={() =>
                                                            handleStatusUpdate(
                                                                selectedOrder.id,
                                                                "preparing",
                                                            )
                                                        }
                                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                                    >
                                                        <Package className="w-4 h-4" />
                                                        Start Preparing
                                                    </button>
                                                )}

                                            {/* For logistics - ship/deliver */}
                                            {user.role === "logistics" &&
                                                selectedOrder.order_status ===
                                                    "preparing" && (
                                                    <button
                                                        onClick={() =>
                                                            handleStatusUpdate(
                                                                selectedOrder.id,
                                                                "shipped",
                                                            )
                                                        }
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                    >
                                                        <Truck className="w-4 h-4" />
                                                        Mark as Shipped
                                                    </button>
                                                )}
                                            {user.role === "logistics" &&
                                                selectedOrder.order_status ===
                                                    "shipped" && (
                                                    <button
                                                        onClick={() =>
                                                            handleStatusUpdate(
                                                                selectedOrder.id,
                                                                "delivered",
                                                            )
                                                        }
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Mark as Delivered
                                                    </button>
                                                )}

                                            {/* For buyers - cancel/complete */}
                                            {user.role === "buyer" &&
                                                selectedOrder.order_status ===
                                                    "pending" && (
                                                    <button
                                                        onClick={() =>
                                                            handleStatusUpdate(
                                                                selectedOrder.id,
                                                                "cancelled",
                                                            )
                                                        }
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Cancel Order
                                                    </button>
                                                )}
                                            {user.role === "buyer" &&
                                                selectedOrder.order_status ===
                                                    "delivered" && (
                                                    <button
                                                        onClick={() =>
                                                            handleStatusUpdate(
                                                                selectedOrder.id,
                                                                "completed",
                                                            )
                                                        }
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Confirm Delivery
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-600">
                                        Select an order
                                    </h3>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
