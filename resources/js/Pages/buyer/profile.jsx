import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { useState } from "react";
import BuyerSidebar from "./sidebar";
import BuyerHeader from "./header";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import {
    User,
    Mail,
    Phone,
    MapPin,
    CheckCircle,
    XCircle,
    Edit2,
    Camera,
} from "lucide-react";

export default function BuyerProfile({ auth, flash }) {
    const user = auth?.user;

    // Edit modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [profileImagePreview, setProfileImagePreview] = useState(null);

    // Form handling
    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            address: user?.address || "",
            profile_image: null,
        });

    // Handle image preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("profile_image", file);
            setProfileImagePreview(URL.createObjectURL(file));
        }
    };

    // Submit form
    const submit = (e) => {
        e.preventDefault();

        // Trim all string fields
        const trimmedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => {
                if (typeof value === "string") {
                    return [key, value.trim()];
                }
                return [key, value];
            }),
        );

        // Frontend validation
        if (!trimmedData.name || !trimmedData.email) {
            alert("Name and Email are required fields.");
            return;
        }

        patch(route("buyer.profile.update"), {
            forceFormData: true,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowEditModal(false);
                setProfileImagePreview(null);
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <BuyerSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                <BuyerHeader user={user} />

                {/* Page Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="My Profile" />

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {flash.error}
                        </div>
                    )}
                    {recentlySuccessful && (
                        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                            Profile updated successfully!
                        </div>
                    )}

                    {/* Page Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                My Profile
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage your personal account information
                            </p>
                        </div>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            disabled={processing}
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information Card */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Basic Information
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Your personal details
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Profile Image */}
                                <div className="flex items-center gap-4 mb-6">
                                    {user?.profile_image ? (
                                        <img
                                            src={
                                                user.profile_image.startsWith(
                                                    "/storage",
                                                )
                                                    ? user.profile_image
                                                    : `/storage/${user.profile_image}`
                                            }
                                            alt={user.name}
                                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="w-10 h-10 text-gray-400" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {user?.name || "No name set"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Buyer Account
                                        </p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Email Address
                                        </p>
                                        <p className="text-gray-900">
                                            {user?.email || "-"}
                                        </p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Phone Number
                                        </p>
                                        <p className="text-gray-900">
                                            {user?.phone || "-"}
                                        </p>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Address
                                        </p>
                                        <p className="text-gray-900">
                                            {user?.address || "-"}
                                        </p>
                                    </div>
                                </div>

                                {/* Email Verification Status */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    {user?.email_verified_at ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Email Verified
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Summary Card */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                                    <User className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Account Summary
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Your account overview
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Account Type
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Buyer
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Member Since
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {user?.created_at
                                                    ? new Date(
                                                          user.created_at,
                                                      ).toLocaleDateString()
                                                    : "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center py-8">
                                    <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">
                                        Profile is up to date
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Click "Edit Profile" to make changes
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Edit Profile Modal */}
            <Modal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                maxWidth="2xl"
            >
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        Edit Profile
                    </h2>

                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            <h4 className="font-medium mb-2">
                                Validation Errors:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {Object.entries(errors).map(
                                    ([field, message]) => (
                                        <li key={field}>
                                            {field
                                                .replace(/_/g, " ")
                                                .replace(/\b\w/g, (l) =>
                                                    l.toUpperCase(),
                                                )}
                                            :{" "}
                                            {Array.isArray(message)
                                                ? message[0]
                                                : message}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    )}

                    <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
                        {/* Profile Image */}
                        <div className="flex items-center gap-4">
                            <div className="relative flex-shrink-0">
                                {profileImagePreview ? (
                                    <img
                                        src={profileImagePreview}
                                        alt="Preview"
                                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : user?.profile_image ? (
                                    <img
                                        src={`/storage/${user.profile_image.replace("/storage/", "")}`}
                                        alt={user.name}
                                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                                <label
                                    htmlFor="profile_image"
                                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                                >
                                    <Camera className="w-4 h-4" />
                                    <input
                                        type="file"
                                        id="profile_image"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Profile Photo
                                </p>
                                <p className="text-sm text-gray-500">
                                    Click camera to upload new photo
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="Name" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="phone"
                                    value="Phone Number"
                                />
                                <TextInput
                                    id="phone"
                                    className="mt-1 block w-full"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData("phone", e.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.phone}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="address" value="Address" />
                                <TextInput
                                    id="address"
                                    className="mt-1 block w-full"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData("address", e.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.address}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <SecondaryButton
                            type="button"
                            onClick={() => setShowEditModal(false)}
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? "Saving..." : "Save Changes"}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
