import { Link, router, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    LogOut,
    ShoppingCart,
    Package,
    Heart,
    MapPin,
    CreditCard,
    Bell,
    Settings,
    User,
    Star,
} from "lucide-react";

export default function BuyerSidebar() {
    const { props } = usePage();
    const cartCount = props.cartCount || props.stats?.cartItems || 0;
    const navigation = [
        { name: "Dashboard", href: "/buyer/dashboard", icon: LayoutDashboard },
        { name: "Browse Products", href: "/buyer/products", icon: Package },
        { name: "Wishlist", href: "/buyer/wishlist", icon: Heart },
        { name: "Addresses", href: "/buyer/addresses", icon: MapPin },
        {
            name: "Payment Methods",
            href: "/buyer/payment-methods",
            icon: CreditCard,
        },
        { name: "Notifications", href: "/buyer/notifications", icon: Bell },
        { name: "My Orders", href: "/buyer/orders", icon: ShoppingCart },
        { name: "Cart", href: "/buyer/cart", icon: ShoppingCart },
        { name: "Rating", href: "/buyer/ratings", icon: Star },
        { name: "Settings", href: "/buyer/settings", icon: Settings },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900">
                    Buyer Panel
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
                            <span className="flex items-center">
                                {item.name}
                                {item.name === "Cart" && cartCount > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-[1.25rem] flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Profile & Logout Section */}
            <div className="p-4 border-t border-gray-200 space-y-3">
                <Link
                    href="/buyer/profile"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <User className="w-5 h-5 mr-3 text-gray-500" />
                    <div>
                        <p className="font-medium text-sm text-gray-900">
                            My Profile
                        </p>
                    </div>
                </Link>
                <button
                    onClick={() => {
                        if (confirm("Are you sure you want to logout?")) {
                            router.post("/logout");
                        }
                    }}
                    className="flex items-center p-3 rounded-lg hover:bg-red-50 transition-colors w-full text-red-700"
                >
                    <LogOut className="w-5 h-5 mr-3 text-red-500" />
                    <div>
                        <p className="font-medium text-sm text-red-900">
                            Log out
                        </p>
                    </div>
                </button>

                <p className="text-xs text-gray-500 text-center mt-2">
                    © 2026 Buyer Panel. All rights reserved.
                </p>
            </div>
        </div>
    );
}
