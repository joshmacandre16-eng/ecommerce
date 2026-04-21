import { Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import AdminSidebar from "./sidebar";
import AdminHeader from "./header";
import Modal from "@/Components/Modal";

export default function Orders({ auth, orders, stats, filters }) {
    const user = auth?.user;
    const { props } = usePage();
    const csrfToken = props.csrf_token || props.csrfToken;

    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [statusFilter, setStatusFilter] = useState(filters?.status || "");
    const [paymentFilter, setPaymentFilter] = useState(
        filters?.payment_status || "",
    );

    // Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);

    // Selected order state
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [assignLoading, setAssignLoading] = useState(false);

    // Logistics
    const [logistics, setLogistics] = useState([]);
    const [selectedLogisticId, setSelectedLogisticId] = useState("");
    const [itemLogistics, setItemLogistics] = useState({});

    // Form data for status update
    const [formData, setFormData] = useState({
        status: "",
    });

    // Fetch logistics on mount
    const [logisticsLoading, setLogisticsLoading] = useState(false);

    useEffect(() => {
        const fetchLogistics = async () => {
            setLogisticsLoading(true);
            try {
                const response = await axios.get(route("admin.logistics.list"));
                setLogistics(response.data.props.logistics || []);
            } catch (error) {
                console.error("Failed to fetch logistics:", error);
                setLogistics([]);
            } finally {
                setLogisticsLoading(false);
            }
        };

        fetchLogistics();
    }, []);

    // Filter orders based on search and filters (client-side filtering for displayed orders)
    const filteredOrders = orders.data.filter((order) => {
        const matchesSearch =
            order.id?.toString().includes(searchTerm.toLowerCase()) ||
            order.tracking_number
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            order.buyer?.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            order.buyer?.email
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "" || order.order_status === statusFilter;
        const matchesPayment =
            paymentFilter === "" || order.payment_status === paymentFilter;
        return matchesSearch && matchesStatus && matchesPayment;
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

    const getLogisticBadgeClass = (logistic) => {
        if (!logistic) return "bg-gray-100 text-gray-800";
        return "bg-indigo-100 text-indigo-800";
    };

    const formatLogistic = (logistic) => {
        return logistic ? `${logistic.name} (${logistic.email})` : "Unassigned";
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

    // Action handlers
    const handleView = (order) => {
        setSelectedOrder(order);
        setViewModalOpen(true);
    };

    const handleStatusUpdate = (order) => {
        setSelectedOrder(order);
        setFormData({
            status: order.order_status || "",
        });
        setStatusModalOpen(true);
    };

    const handleDelete = (order) => {
        setSelectedOrder(order);
        setDeleteModalOpen(true);
    };

    const handleAssignLogistic = (order) => {
        setSelectedOrder(order);
        setSelectedLogisticId(order.logistic_id || "");
        setAssignModalOpen(true);
    };

    const handleStatusSubmit = (e) => {
        e.preventDefault();
        if (!selectedOrder) return;
        setLoading(true);

        router.put(
            route("orders.updateStatus", selectedOrder.id),
            {
                status: formData.status,
                _token: csrfToken,
            },
            {
                onSuccess: () => {
                    setLoading(false);
                    setStatusModalOpen(false);
                    setSelectedOrder(null);
                },
                onError: () => {
                    setLoading(false);
                },
            },
        );
    };

    const handleDeleteConfirm = () => {
        if (!selectedOrder) return;
        setLoading(true);

        // Cancel the order instead of deleting
        router.put(
            route("orders.updateStatus", selectedOrder.id),
            {
                status: "cancelled",
                _token: csrfToken,
            },
            {
                onSuccess: () => {
                    setLoading(false);
                    setDeleteModalOpen(false);
                    setSelectedOrder(null);
                },
                onError: () => {
                    setLoading(false);
                },
            },
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLogisticChange = (e) => {
        setSelectedLogisticId(e.target.value);
    };

    const handleAssignSubmit = (e) => {
        e.preventDefault();
        if (!selectedOrder || !selectedLogisticId) return;
        setAssignLoading(true);

        router.put(
            route("orders.assignLogistic", selectedOrder.id),
            {
                logistic_id: selectedLogisticId,
                _token: csrfToken,
            },
            {
                onSuccess: () => {
                    setAssignLoading(false);
                    setAssignModalOpen(false);
                    setSelectedOrder(null);
                    setSelectedLogisticId("");
                    router.reload({ only: ["orders"] });
                },
                onError: () => {
                    setAssignLoading(false);
                },
            },
        );
    };

    // Apply filters
    const applyFilters = () => {
        router.get(
            route("admin.orders.index"),
            {
                search: searchTerm,
                status: statusFilter,
                payment_status: paymentFilter,
            },
            { preserveState: true },
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                <AdminHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Orders - Admin" />
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Order Management
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage platform orders
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
                                Processing
                            </p>
                            <p className="text-2xl font-semibold text-blue-600 mt-1">
                                {stats?.processingOrders || 0}
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
                                Revenue
                            </p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {formatPrice(stats?.totalRevenue || 0)}
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="Search by order ID, tracking, buyer..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            applyFilters();
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                            <div className="w-48">
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                            <div className="w-48">
                                <select
                                    value={paymentFilter}
                                    onChange={(e) =>
                                        setPaymentFilter(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">All Payments</option>
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
                                            Logistic
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
                                                <td className="px-6 py-4 whitespace-normal break-words">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order.buyer?.name ||
                                                            "-"}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {order.buyer?.email ||
                                                            "-"}
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
                                                        {order.tracking_number ||
                                                            "-"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLogisticBadgeClass(order.logistic)}`}
                                                    >
                                                        {formatLogistic(
                                                            order.logistic,
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleView(
                                                                    order,
                                                                )
                                                            }
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            View
                                                        </button>
                                                        {order.order_status !==
                                                            "cancelled" &&
                                                            order.order_status !==
                                                                "completed" &&
                                                            order.order_status !==
                                                                "delivered" && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleStatusUpdate(
                                                                            order,
                                                                        )
                                                                    }
                                                                    className="text-yellow-600 hover:text-yellow-900"
                                                                >
                                                                    Status
                                                                </button>
                                                            )}
                                                        {order.order_status ===
                                                            "pending" && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        order,
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                        {(order.order_status ===
                                                            "confirmed" ||
                                                            order.order_status ===
                                                                "preparing") &&
                                                            !order.logistic_id && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleAssignLogistic(
                                                                            order,
                                                                        )
                                                                    }
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    Assign
                                                                    Logistic
                                                                </button>
                                                            )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="9"
                                                className="px-6 py-12 text-center text-gray-500"
                                            >
                                                {searchTerm ||
                                                statusFilter ||
                                                paymentFilter
                                                    ? "No orders found matching your criteria"
                                                    : "No orders found"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Info */}
                    {orders.data && orders.data.length > 0 && (
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

            {/* View Modal */}
            <Modal
                show={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                maxWidth="3xl"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Order Details - #{selectedOrder?.id}
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
                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Order Status
                                    </label>
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedOrder.order_status)}`}
                                    >
                                        {formatStatus(
                                            selectedOrder.order_status,
                                        )}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Payment Status
                                    </label>
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadgeClass(selectedOrder.payment_status)}`}
                                    >
                                        {formatPayment(
                                            selectedOrder.payment_status,
                                        )}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Total Amount
                                    </label>
                                    <p className="text-gray-900 font-semibold">
                                        {formatPrice(
                                            selectedOrder.total_amount,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Payment Method
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedOrder.payment_method}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Tracking Number
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedOrder.tracking_number || "-"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Order Date
                                    </label>
                                    <p className="text-gray-900">
                                        {formatDate(selectedOrder.created_at)}
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
                                            {selectedOrder.buyer?.name || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">
                                            Email
                                        </label>
                                        <p className="text-gray-900">
                                            {selectedOrder.buyer?.email || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">
                                            Shipping Address
                                        </label>
                                        <p className="text-gray-900">
                                            {selectedOrder.shipping_address ||
                                                "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">
                                            Shipping City
                                        </label>
                                        <p className="text-gray-900">
                                            {selectedOrder.shipping_city || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">
                                            Shipping Phone
                                        </label>
                                        <p className="text-gray-900">
                                            {selectedOrder.shipping_phone ||
                                                "-"}
                                        </p>
                                    </div>
                                    {selectedOrder.notes && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">
                                                Notes
                                            </label>
                                            <p className="text-gray-900">
                                                {selectedOrder.notes}
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
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Logistic
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {selectedOrder.order_items?.map(
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
                                                        <td className="px-3 py-2">
                                                            <select
                                                                value={
                                                                    itemLogistics[
                                                                        item.id
                                                                    ] || ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleItemLogisticChange(
                                                                        item.id,
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                                                            >
                                                                <option value="">
                                                                    Unassigned
                                                                </option>
                                                                {logistics.map(
                                                                    (
                                                                        logistic,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                logistic.id
                                                                            }
                                                                            value={
                                                                                logistic.id
                                                                            }
                                                                        >
                                                                            {
                                                                                logistic.name
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                            {item.logistic && (
                                                                <span
                                                                    className={`inline-flex px-1 text-xs rounded-full mt-1 block ${getLogisticBadgeClass(item.logistic)}`}
                                                                >
                                                                    {formatLogistic(
                                                                        item.logistic,
                                                                    )}
                                                                </span>
                                                            )}
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
                                    onClick={handleAssignItemLogistics}
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading
                                        ? "Assigning..."
                                        : "Assign Item Logistics"}
                                </button>
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

            {/* Status Update Modal */}
            <Modal
                show={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                maxWidth="sm"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Update Order Status
                        </h2>
                        <button
                            onClick={() => setStatusModalOpen(false)}
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
                    <form onSubmit={handleStatusSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Order Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="preparing">Preparing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setStatusModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                            >
                                {loading ? "Updating..." : "Update Status"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Cancel Order Modal */}
            <Modal
                show={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                maxWidth="sm"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Cancel Order
                        </h2>
                        <button
                            onClick={() => setDeleteModalOpen(false)}
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
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to cancel this order? This action
                        cannot be undone.
                    </p>
                    {selectedOrder && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-6">
                            <p className="text-sm font-medium text-gray-900">
                                Order #{selectedOrder.id}
                            </p>
                            <p className="text-sm text-gray-500">
                                {selectedOrder.buyer?.name}
                            </p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                                {formatPrice(selectedOrder.total_amount)}
                            </p>
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            No, Keep Order
                        </button>
                        <button
                            onClick={handleDeleteConfirm}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {loading ? "Cancelling..." : "Yes, Cancel Order"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Assign Logistic Modal */}
            <Modal
                show={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                maxWidth="md"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Assign Logistic Rider - #{selectedOrder?.id}
                        </h2>
                        <button
                            onClick={() => setAssignModalOpen(false)}
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
                    {selectedOrder && (
                        <form
                            onSubmit={handleAssignSubmit}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Logistic Rider
                                </label>
                                <select
                                    value={selectedLogisticId}
                                    onChange={handleLogisticChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                >
                                    <option value="">
                                        Select Logistic Rider
                                    </option>
                                    {logistics.map((logistic) => (
                                        <option
                                            key={logistic.id}
                                            value={logistic.id}
                                        >
                                            {logistic.name} -{" "}
                                            {logistic.phone || logistic.email} (
                                            {logistic.riderProfile
                                                ?.vehicle_type || "No vehicle"}
                                            )
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedOrder.logistic && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        Currently assigned:{" "}
                                        {formatLogistic(selectedOrder.logistic)}
                                    </p>
                                </div>
                            )}
                            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setAssignModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        assignLoading || !selectedLogisticId
                                    }
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {assignLoading
                                        ? "Assigning..."
                                        : "Assign Rider"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>
        </div>
    );
}
