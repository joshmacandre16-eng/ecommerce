import { Head, Link, useForm, usePage } from "@inertiajs/react";
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
    MapPin,
    Home,
    Edit2,
    Trash2,
    Star,
    CheckCircle,
    XCircle,
    Plus,
    Phone,
    Mail,
    User,
} from "lucide-react";

export default function BuyerAddresses({
    auth,
    addresses = [],
    flash,
    cartCount,
}) {
    const user = auth?.user;
    const { props } = usePage();

    // State for modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [deletingAddress, setDeletingAddress] = useState(null);

    // Add address form
    const {
        data: addData,
        setData: setAddData,
        post: postAddress,
        processing: addProcessing,
        errors: addErrors,
        reset: resetAddForm,
        recentlySuccessful: addSuccess,
    } = useForm({
        name: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        country: "Philippines",
        phone: "",
    });

    // Edit address form
    const {
        data: editData,
        setData: setEditData,
        patch: patchAddress,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEditForm,
        recentlySuccessful: editSuccess,
    } = useForm({});

    // Submit add form
    const submitAdd = (e) => {
        e.preventDefault();
        postAddress(route("buyer.addresses.store"), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                resetAddForm();
                setShowAddModal(false);
            },
        });
    };

    // Submit edit form
    const submitEdit = (e) => {
        e.preventDefault();
        patchAddress(route("buyer.addresses.update", editingAddress.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                resetEditForm();
                setShowEditModal(false);
                setEditingAddress(null);
            },
        });
    };

    // Handle edit
    const handleEdit = (address) => {
        setEditingAddress(address);
        setEditData({
            name: address.name,
            address: address.address,
            city: address.city,
            state: address.state || "",
            zip_code: address.zip_code || "",
            country: address.country,
            phone: address.phone || "",
        });
        setShowEditModal(true);
    };

    // Handle delete confirm
    const handleDelete = () => {
        if (deletingAddress) {
            router.delete(
                route("buyer.addresses.destroy", deletingAddress.id),
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
            setDeletingAddress(null);
        }
    };

    // Address type colors
    const getAddressTypeColor = (isDefault) =>
        isDefault
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-blue-50 text-blue-700 border-blue-200";

    // Format phone
    const formatPhone = (phone) => phone || "No phone number";

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <BuyerSidebar cartCount={cartCount} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <BuyerHeader user={user} />

                <main className="flex-1 overflow-y-auto p-8">
                    <Head title="My Addresses" />

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                    )}

                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                My Addresses
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Manage your delivery and billing addresses
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                            disabled={addProcessing}
                        >
                            <Plus className="w-5 h-5" />
                            Add New Address
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <Home className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg">
                                        Total Addresses
                                    </h3>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        {addresses.length}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500">
                                {addresses.filter((a) => a.is_default).length >
                                0
                                    ? "Default address set"
                                    : "Set a default address for faster checkout"}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <Star className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            Default Address
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Used for checkout
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        addresses.filter((a) => a.is_default)
                                            .length > 0
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {addresses.filter((a) => a.is_default)
                                        .length > 0
                                        ? "Set"
                                        : "None"}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            Quick Actions
                                        </h3>
                                    </div>
                                </div>
                                <Link
                                    href="/buyer/orders"
                                    className="text-sm font-medium text-purple-600 hover:text-purple-700"
                                >
                                    View Orders →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Addresses List */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Saved Addresses ({addresses.length})
                            </h2>
                        </div>

                        {addresses.length === 0 ? (
                            <div className="text-center py-16">
                                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No addresses saved
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Add your first address to start shopping
                                </p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Address
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {addresses.map((address) => (
                                    <div
                                        key={address.id}
                                        className="p-6 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                            {/* Address Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div
                                                        className={`flex-shrink-0 p-2 rounded-lg border ${getAddressTypeColor(
                                                            address.is_default,
                                                        )}`}
                                                    >
                                                        <Home className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-lg">
                                                            {address.name}
                                                        </h4>
                                                        {address.is_default && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mt-1">
                                                                <Star className="w-3 h-3 fill-current" />
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-1 text-sm mb-4">
                                                    <p className="font-medium text-gray-900">
                                                        {address.address}
                                                    </p>
                                                    <p className="text-gray-700">
                                                        {address.city},{" "}
                                                        {address.state}{" "}
                                                        {address.zip_code}
                                                    </p>
                                                    <p className="text-gray-700">
                                                        {address.country}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                                                        {formatPhone(
                                                            address.phone,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col sm:flex-row gap-2 ml-auto">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(address)
                                                    }
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all whitespace-nowrap"
                                                    disabled={editProcessing}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setDeletingAddress(
                                                            address,
                                                        )
                                                    }
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all whitespace-nowrap"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                                {!address.is_default && (
                                                    <Link
                                                        href={route(
                                                            "buyer.addresses.setDefault",
                                                            address.id,
                                                        )}
                                                        method="patch"
                                                        as="button"
                                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all whitespace-nowrap"
                                                    >
                                                        <Star className="w-4 h-4" />
                                                        Set Default
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Add Address Modal */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)}>
                <form onSubmit={submitAdd} className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Add New Address
                    </h2>

                    <div className="space-y-4 mb-6">
                        <div>
                            <InputLabel htmlFor="name" value="Label *" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={addData.name}
                                onChange={(e) =>
                                    setAddData("name", e.target.value)
                                }
                                required
                            />
                            <InputError
                                className="mt-2"
                                message={addErrors.name}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel
                                    htmlFor="address"
                                    value="Address *"
                                />
                                <TextInput
                                    id="address"
                                    className="mt-1 block w-full"
                                    value={addData.address}
                                    onChange={(e) =>
                                        setAddData("address", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    className="mt-2"
                                    message={addErrors.address}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="city" value="City *" />
                                <TextInput
                                    id="city"
                                    className="mt-1 block w-full"
                                    value={addData.city}
                                    onChange={(e) =>
                                        setAddData("city", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    className="mt-2"
                                    message={addErrors.city}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel
                                    htmlFor="state"
                                    value="State/Province"
                                />
                                <TextInput
                                    id="state"
                                    className="mt-1 block w-full"
                                    value={addData.state}
                                    onChange={(e) =>
                                        setAddData("state", e.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={addErrors.state}
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="zip_code"
                                    value="ZIP Code"
                                />
                                <TextInput
                                    id="zip_code"
                                    className="mt-1 block w-full"
                                    value={addData.zip_code}
                                    onChange={(e) =>
                                        setAddData("zip_code", e.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={addErrors.zip_code}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel
                                    htmlFor="country"
                                    value="Country *"
                                />
                                <TextInput
                                    id="country"
                                    className="mt-1 block w-full"
                                    value={addData.country}
                                    onChange={(e) =>
                                        setAddData("country", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    className="mt-2"
                                    message={addErrors.country}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone" value="Phone" />
                                <TextInput
                                    id="phone"
                                    type="tel"
                                    className="mt-1 block w-full"
                                    value={addData.phone}
                                    onChange={(e) =>
                                        setAddData("phone", e.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={addErrors.phone}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <SecondaryButton
                            type="button"
                            onClick={() => {
                                setShowAddModal(false);
                                resetAddForm();
                            }}
                            disabled={addProcessing}
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={addProcessing}>
                            {addProcessing ? "Saving..." : "Save Address"}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Address Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                <form onSubmit={submitEdit} className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Edit Address
                    </h2>

                    <div className="space-y-4 mb-6">
                        <div>
                            <InputLabel htmlFor="edit_name" value="Label *" />
                            <TextInput
                                id="edit_name"
                                className="mt-1 block w-full"
                                value={editData.name}
                                onChange={(e) =>
                                    setEditData("name", e.target.value)
                                }
                                required
                            />
                            <InputError
                                className="mt-2"
                                message={editErrors.name}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel
                                    htmlFor="edit_address"
                                    value="Address *"
                                />
                                <TextInput
                                    id="edit_address"
                                    className="mt-1 block w-full"
                                    value={editData.address}
                                    onChange={(e) =>
                                        setEditData("address", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    className="mt-2"
                                    message={editErrors.address}
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="edit_city"
                                    value="City *"
                                />
                                <TextInput
                                    id="edit_city"
                                    className="mt-1 block w-full"
                                    value={editData.city}
                                    onChange={(e) =>
                                        setEditData("city", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    className="mt-2"
                                    message={editErrors.city}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel
                                    htmlFor="edit_state"
                                    value="State/Province"
                                />
                                <TextInput
                                    id="edit_state"
                                    className="mt-1 block w-full"
                                    value={editData.state}
                                    onChange={(e) =>
                                        setEditData("state", e.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={editErrors.state}
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="edit_zip_code"
                                    value="ZIP Code"
                                />
                                <TextInput
                                    id="edit_zip_code"
                                    className="mt-1 block w-full"
                                    value={editData.zip_code}
                                    onChange={(e) =>
                                        setEditData("zip_code", e.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={editErrors.zip_code}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel
                                    htmlFor="edit_country"
                                    value="Country *"
                                />
                                <TextInput
                                    id="edit_country"
                                    className="mt-1 block w-full"
                                    value={editData.country}
                                    onChange={(e) =>
                                        setEditData("country", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    className="mt-2"
                                    message={editErrors.country}
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="edit_phone"
                                    value="Phone"
                                />
                                <TextInput
                                    id="edit_phone"
                                    type="tel"
                                    className="mt-1 block w-full"
                                    value={editData.phone}
                                    onChange={(e) =>
                                        setEditData("phone", e.target.value)
                                    }
                                />
                                <InputError
                                    className="mt-2"
                                    message={editErrors.phone}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <SecondaryButton
                            type="button"
                            onClick={() => {
                                setShowEditModal(false);
                                setEditingAddress(null);
                                resetEditForm();
                            }}
                            disabled={editProcessing}
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={editProcessing}>
                            {editProcessing ? "Updating..." : "Update Address"}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            {deletingAddress && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Delete Address
                            </h3>
                            <p className="text-gray-600">
                                Are you sure you want to delete "
                                {deletingAddress.name}"? This action cannot be
                                undone.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <SecondaryButton
                                type="button"
                                onClick={() => setDeletingAddress(null)}
                            >
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton
                                type="button"
                                className="bg-red-600 hover:bg-red-700"
                                onClick={handleDelete}
                            >
                                Delete Address
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
