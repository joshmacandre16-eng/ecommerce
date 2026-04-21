import { Head } from "@inertiajs/react";
import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import AdminSidebar from "./sidebar";
import AdminHeader from "./header";

export default function Notifications({
    auth,
    notifications,
    stats,
    types,
    filters,
}) {
    const user = auth?.user;
    const { props } = usePage();
    const csrfToken = props.csrf_token || props.csrfToken;

    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [typeFilter, setTypeFilter] = useState(filters?.type || "");
    const [statusFilter, setStatusFilter] = useState(filters?.status || "");
    const [loading, setLoading] = useState(false);

    // Filter notifications based on search and filters (client-side for displayed items)
    const filteredNotifications =
        notifications?.data?.filter((notification) => {
            const matchesSearch =
                !searchTerm ||
                notification.title
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                notification.message
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());
            const matchesType = !typeFilter || notification.type === typeFilter;
            const matchesStatus =
                !statusFilter ||
                (statusFilter === "read" && notification.is_read) ||
                (statusFilter === "unread" && !notification.is_read);
            return matchesSearch && matchesType && matchesStatus;
        }) || [];

    const getTypeIcon = (type) => {
        switch (type) {
            case "order":
                return "📦";
            case "product":
                return "🌱";
            case "user":
                return "👤";
            case "document":
                return "📄";
            case "payment":
                return "💳";
            case "system":
                return "⚙️";
            default:
                return "🔔";
        }
    };

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case "order":
                return "bg-blue-100 text-blue-800";
            case "product":
                return "bg-green-100 text-green-800";
            case "user":
                return "bg-purple-100 text-purple-800";
            case "document":
                return "bg-yellow-100 text-yellow-800";
            case "payment":
                return "bg-emerald-100 text-emerald-800";
            case "system":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatType = (type) => {
        const typeLabels = {
            order: "Order",
            product: "Product",
            user: "User",
            document: "Document",
            payment: "Payment",
            system: "System",
        };
        return typeLabels[type] || type || "Notification";
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        router.get(
            route("admin.notifications"),
            {
                search: searchTerm,
                type: typeFilter,
                status: statusFilter,
            },
            {
                preserveState: true,
                onFinish: () => setLoading(false),
            },
        );
    };

    const handleMarkAsRead = (notificationId) => {
        setLoading(true);
        router.post(
            route("admin.notifications.markRead", notificationId),
            {},
            {
                onFinish: () => setLoading(false),
            },
        );
    };

    const handleMarkAllAsRead = () => {
        setLoading(true);
        router.post(
            route("admin.notifications.markAllRead"),
            {},
            {
                onFinish: () => setLoading(false),
            },
        );
    };

    const handleDelete = (notificationId) => {
        if (!confirm("Are you sure you want to delete this notification?"))
            return;
        setLoading(true);
        router.delete(route("admin.notifications.delete", notificationId), {
            onFinish: () => setLoading(false),
        });
    };

    const handleFilterChange = (key, value) => {
        if (key === "type") setTypeFilter(value);
        if (key === "status") setStatusFilter(value);
        setLoading(true);
        router.get(
            route("admin.notifications"),
            {
                search: searchTerm,
                type: key === "type" ? value : typeFilter,
                status: key === "status" ? value : statusFilter,
            },
            {
                preserveState: true,
                onFinish: () => setLoading(false),
            },
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                <AdminHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Notifications - Admin" />
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Notifications
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                View and manage your notifications
                            </p>
                        </div>
                        {stats?.unread > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                            >
                                Mark All as Read
                            </button>
                        )}
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="text-sm text-gray-500">Total</div>
                            <div className="text-2xl font-semibold text-gray-900">
                                {stats?.total || 0}
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="text-sm text-gray-500">Unread</div>
                            <div className="text-2xl font-semibold text-blue-600">
                                {stats?.unread || 0}
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="text-sm text-gray-500">Read</div>
                            <div className="text-2xl font-semibold text-green-600">
                                {stats?.read || 0}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <form
                        onSubmit={handleSearch}
                        className="bg-white border border-gray-200 rounded-lg p-4 mb-6"
                    >
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="Search notifications..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                            <div className="w-40">
                                <select
                                    value={typeFilter}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "type",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">All Types</option>
                                    {types?.map((type) => (
                                        <option key={type} value={type}>
                                            {formatType(type)}
                                        </option>
                                    ))}
                                    <option value="order">Order</option>
                                    <option value="product">Product</option>
                                    <option value="user">User</option>
                                    <option value="document">Document</option>
                                    <option value="payment">Payment</option>
                                    <option value="system">System</option>
                                </select>
                            </div>
                            <div className="w-40">
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "status",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="unread">Unread</option>
                                    <option value="read">Read</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Notifications List */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {filteredNotifications.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {filteredNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors ${
                                            !notification.is_read
                                                ? "bg-blue-50"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-2xl">
                                                {getTypeIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3
                                                        className={`text-sm font-medium ${
                                                            !notification.is_read
                                                                ? "text-gray-900"
                                                                : "text-gray-700"
                                                        }`}
                                                    >
                                                        {notification.title}
                                                    </h3>
                                                    <span
                                                        className={`px-2 py-0.5 text-xs rounded-full ${getTypeBadgeClass(notification.type)}`}
                                                    >
                                                        {formatType(
                                                            notification.type,
                                                        )}
                                                    </span>
                                                    {!notification.is_read && (
                                                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span>
                                                        {formatDate(
                                                            notification.created_at,
                                                        )}
                                                    </span>
                                                    {notification.read_at && (
                                                        <span>
                                                            Read:{" "}
                                                            {formatDate(
                                                                notification.read_at,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!notification.is_read && (
                                                    <button
                                                        onClick={() =>
                                                            handleMarkAsRead(
                                                                notification.id,
                                                            )
                                                        }
                                                        disabled={loading}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                                                        title="Mark as read"
                                                    >
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                                {notification.link && (
                                                    <a
                                                        href={notification.link}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                        title="View details"
                                                    >
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                            />
                                                        </svg>
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            notification.id,
                                                        )
                                                    }
                                                    disabled={loading}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                {searchTerm || typeFilter || statusFilter
                                    ? "No notifications found matching your criteria"
                                    : "No notifications yet"}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {notifications?.data && notifications.data.length > 0 && (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {notifications.from || 1} to{" "}
                                {notifications.to || notifications.data.length}{" "}
                                of {notifications.total} notifications
                            </div>
                            <div className="flex gap-2">
                                {notifications.prev_page_url && (
                                    <button
                                        onClick={() => {
                                            setLoading(true);
                                            router.get(
                                                notifications.prev_page_url,
                                                {},
                                                {
                                                    onFinish: () =>
                                                        setLoading(false),
                                                },
                                            );
                                        }}
                                        disabled={loading}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                )}
                                {notifications.next_page_url && (
                                    <button
                                        onClick={() => {
                                            setLoading(true);
                                            router.get(
                                                notifications.next_page_url,
                                                {},
                                                {
                                                    onFinish: () =>
                                                        setLoading(false),
                                                },
                                            );
                                        }}
                                        disabled={loading}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
