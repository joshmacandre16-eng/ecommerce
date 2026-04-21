import { Link, router } from "@inertiajs/react";
import {
    Bell,
    LogOut,
    Search,
    User,
    Settings,
    Menu,
    ShoppingCart,
    Heart,
} from "lucide-react";

export default function BuyerHeader({ user }) {
    return (
        <header className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-6">
                {/* Left side - Menu button and Search */}
                <div className="flex items-center gap-4 flex-1">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden">
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="relative hidden md:block max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        />
                    </div>
                </div>

                {/* Right side - Cart, Wishlist, Notifications, Profile */}
                <div className="flex items-center gap-3">
                    {/* Cart */}
                    <Link
                        href="/buyer/cart"
                        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    </Link>

                    {/* Wishlist */}
                    <Link
                        href="/buyer/wishlist"
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Heart className="w-5 h-5" />
                    </Link>

                    {/* Notifications */}
                    <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Settings */}
                    <Link
                        href="/buyer/settings"
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                    </Link>

                    {/* Divider */}
                    <div className="h-8 w-px bg-gray-200"></div>

                    {/* Profile Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.name || "Buyer"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Premium Member
                                </p>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.name || "Buyer"}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {user?.email || "buyer@example.com"}
                                </p>
                            </div>
                            <Link
                                href="/buyer/profile"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <User className="w-4 h-4 text-gray-500" />
                                My Profile
                            </Link>
                            <Link
                                href="/buyer/orders"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <ShoppingCart className="w-4 h-4 text-gray-500" />
                                My Orders
                            </Link>
                            <Link
                                href="/buyer/wishlist"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Heart className="w-4 h-4 text-gray-500" />
                                Wishlist
                            </Link>
                            <Link
                                href="/buyer/settings"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Settings className="w-4 h-4 text-gray-500" />
                                Settings
                            </Link>
                            <button
                                onClick={() => {
                                    if (
                                        confirm(
                                            "Are you sure you want to logout?",
                                        )
                                    ) {
                                        router.post("/logout");
                                    }
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors border-t border-gray-100"
                            >
                                <LogOut className="w-4 h-4 text-red-500" />
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
