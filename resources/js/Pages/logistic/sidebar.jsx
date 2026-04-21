import { Link, router } from "@inertiajs/react";
import {
    LayoutDashboard,
    LogOut,
    Truck,
    Package,
    MapPin,
    Clock,
    CheckCircle,
    Bell,
    Settings,
    Navigation,
    User,
} from "lucide-react";

export default function LogisticsSidebar() {
    const navigation = [
        {
            name: "Dashboard",
            href: "/logistic/dashboard",
            icon: LayoutDashboard,
        },
        { name: "Pending Deliveries", href: "/logistic/pending", icon: Clock },
        { name: "Active Deliveries", href: "/logistic/active", icon: Truck },
        { name: "Delivered", href: "/logistic/delivered", icon: CheckCircle },
        { name: "All Orders", href: "/logistic/orders", icon: Package },
        { name: "Route Map", href: "/logistic/routes", icon: MapPin },
        { name: "Navigation", href: "/logistic/navigation", icon: Navigation },
        { name: "Notifications", href: "/logistic/notifications", icon: Bell },
        { name: "Settings", href: "/logistic/settings", icon: Settings },
        { name: "Profile", href: "/logistic/profile", icon: User },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900">
                    Logistics Panel
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                            <Icon className="w-5 h-5 mr-3 text-gray-500" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 space-y-3">
                <button
                    onClick={() => {
                        if (confirm("Are you sure you want to logout?")) {
                            router.post("/logout");
                        }
                    }}
                    className="flex items-center justify-center p-3 text-sm font-medium text-red-700 rounded-lg hover:bg-red-50 transition-colors w-full"
                >
                    <LogOut className="w-5 h-5 text-red-500 mr-2" />
                    Log out
                </button>
                <p className="text-xs text-gray-500 text-center">
                    © 2024 Logistics Panel. All rights reserved.
                </p>
            </div>
        </div>
    );
}
