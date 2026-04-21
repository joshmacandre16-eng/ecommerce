import { Link } from "@inertiajs/react";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    TrendingUp,
    Warehouse,
    DollarSign,
    Bell,
    Settings,
    LogOut,
    Plus,
    Truck,
} from "lucide-react";

export default function FarmerSidebar() {
    const navigation = [
        { name: "Dashboard", href: "/farmer/dashboard", icon: LayoutDashboard },
        { name: "My Products", href: "/farmer/products", icon: Package },
        { name: "Orders", href: "/farmer/orders", icon: ShoppingCart },
        { name: "Product Track", href: "/farmer/product-track", icon: Truck },
        { name: "Analytics", href: "/farmer/analytics", icon: TrendingUp },
        { name: "Inventory", href: "/farmer/inventory", icon: Warehouse },
        { name: "Earnings", href: "/farmer/earnings", icon: DollarSign },
        { name: "Notifications", href: "/farmer/notifications", icon: Bell },
        { name: "Settings", href: "/farmer/settings", icon: Settings },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900">
                    Farmer Panel
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
            <div className="p-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                    © 2024 Farmer Panel. All rights reserved.
                </p>
            </div>
        </div>
    );
}
