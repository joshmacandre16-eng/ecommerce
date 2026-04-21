import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link, usePage } from "@inertiajs/react";
import { useEffect } from "react";

export default function GuestLayout({ children }) {
    const csrfToken = usePage().props.csrf_token;

    useEffect(() => {
        if (csrfToken && window.axios) {
            window.axios.defaults.headers.common["X-CSRF-TOKEN"] = csrfToken;
            const token = document.head.querySelector(
                'meta[name="csrf-token"]',
            );
            if (token) {
                token.content = csrfToken;
            }
        }
    }, [csrfToken]);

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
