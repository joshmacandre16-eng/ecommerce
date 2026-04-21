import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    User,
    Menu,
    X,
    Bell,
    Search,
    Truck,
    Plus,
    Box,
    Sprout,
} from "lucide-react";
import { useState } from "react";

// Default navigation items that can be customized
const defaultNavigation = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        emoji: "🏠",
    },
];

export default function DashboardLayout({
    children,
    title = "Dashboard",
    role = "admin",
    roleLabel = "Admin",
    roleEmoji = "👤",
    brandName = "BSAB",
    brandEmoji = "🌾",
    primaryColor = "#2d5016",
    secondaryColor = "#1a2f0f",
    navigation = defaultNavigation,
    stats = null,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Helper function to check if a route is active
    const isActiveRoute = (href) => {
        const path = window.location.pathname;

        // Handle the dashboard case - exact match
        if (href === "/dashboard") {
            return path === "/dashboard";
        }

        // For other routes, check if the path starts with the href
        return path.startsWith(href);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(amount || 0);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Mobile menu toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden bg-white p-3 rounded-lg shadow-lg"
            >
                <span
                    className="block w-6 h-0.5 mb-1.5"
                    style={{ backgroundColor: primaryColor }}
                ></span>
                <span
                    className="block w-6 h-0.5 mb-1.5"
                    style={{ backgroundColor: primaryColor }}
                ></span>
                <span
                    className="block w-6 h-0.5"
                    style={{ backgroundColor: primaryColor }}
                ></span>
            </button>

            {/* Sidebar */}
            <aside
                className={`w-60 bg-white h-full flex flex-col border-r border-gray-200 sticky top-0 transition-transform duration-300 z-40 overflow-y-auto ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0`}
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-200 mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{brandEmoji}</span>
                        <span className="text-xl font-bold text-black">
                            {brandName}
                        </span>
                    </div>
                </div>

                {/* User Info */}
                <div className="mx-4 mb-4 p-4 bg-gray-100 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                            style={{
                                background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}20)`,
                            }}
                        >
                            {roleEmoji}
                        </div>
                        <div>
                            <h4 className="font-semibold text-black">
                                {user?.name || roleLabel}
                            </h4>
                            <p className="text-sm text-gray-600">{roleLabel}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                    <ul className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = isActiveRoute(item.href);
                            const Icon = item.icon;

                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors ${
                                            isActive
                                                ? "bg-gray-100 text-black border-l-4 border-black"
                                                : "text-gray-700 hover:text-black"
                                        }`}
                                    >
                                        {item.emoji ? (
                                            <span className="text-xl w-6">
                                                {item.emoji}
                                            </span>
                                        ) : (
                                            <Icon className="w-5 h-5 mr-3" />
                                        )}
                                        <span>{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Profile Link */}
                <div className="px-2 py-2">
                    <Link
                        href="/profile"
                        className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <Users className="w-5 h-5 mr-3" />
                        My Profile
                    </Link>
                </div>

                <p className="text-xs text-gray-500 text-center p-4 border-t border-gray-200">
                    © 2024 Admin Panel
                </p>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="lg:ml-60 p-8 transition-all duration-300">
                {/* Top Bar */}
                <div className="bg-white rounded-[15px] shadow-sm p-6 mb-8 flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h1 className="text-[1.8rem] font-bold mb-1 text-black">
                            {title}
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Welcome back, {user?.name}! Here's your{" "}
                            {roleLabel.toLowerCase()} overview.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="flex items-center bg-gray-100 px-4 py-3 rounded-full gap-2">
                            <span>🔍</span>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none w-[200px] text-sm text-black"
                            />
                        </div>
                        {/* Notifications */}
                        <button className="relative bg-gray-100 w-11 h-11 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors text-xl">
                            🔔
                            <span className="absolute top-1 right-1 w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                5
                            </span>
                        </button>
                    </div>
                </div>

                {/* Page Content */}
                <div className="">{children}</div>
            </div>
        </div>
    );
}
