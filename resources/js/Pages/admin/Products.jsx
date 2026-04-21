import { Head } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import AdminSidebar from "./sidebar";
import AdminHeader from "./header";
import Modal from "@/Components/Modal";

export default function Products({ auth, products, logistics = [] }) {
    const user = auth?.user;
    const { props } = usePage();
    const csrfToken = props.csrf_token || props.csrfToken;

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);

    // Selected product state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedLogisticId, setSelectedLogisticId] = useState(null);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [logisticsLoading, setLogisticsLoading] = useState(true);
    const [logisticsList, setLogisticsList] = useState([]);

    // Form data for create/edit
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        stock: "",
        unit: "",
        farm_location: "",
        is_organic: false,
        image: null,
        logistic_id: "",
    });

    // Image preview state
    const [imagePreview, setImagePreview] = useState(null);

    // Handle success and error messages
    const handleShowMessage = (message, type = "success") => {
        if (type === "success") {
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(""), 3000);
        } else {
            setErrorMessage(message);
            setTimeout(() => setErrorMessage(""), 3000);
        }
    };

    useEffect(() => {
        const fetchLogistics = async () => {
            try {
                setLogisticsLoading(true);
                const response = await axios.get(route("admin.logistics.list"));
                setLogisticsList(
                    response.data.props?.logistics || response.data || [],
                );
            } catch (error) {
                console.error("Failed to fetch logistics:", error);
                setLogisticsList(logistics); // fallback to prop
            } finally {
                setLogisticsLoading(false);
            }
        };
        fetchLogistics();
    }, []);

    // Filter products based on search, category, and status (client-side filtering for displayed products)
    const filteredProducts = products.data.filter((product) => {
        const matchesSearch =
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            product.seller?.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());
        const matchesCategory =
            categoryFilter === "" || product.category === categoryFilter;
        const matchesStatus =
            statusFilter === "" ||
            (statusFilter === "approved" && product.is_approved) ||
            (statusFilter === "pending" && !product.is_approved);
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getCategoryBadgeClass = (category) => {
        const categoryClasses = {
            rice: "bg-yellow-100 text-yellow-800",
            corn: "bg-orange-100 text-orange-800",
            vegetables: "bg-green-100 text-green-800",
            fruits: "bg-red-100 text-red-800",
            root_crops: "bg-brown-100 text-brown-800",
            fertilizers: "bg-blue-100 text-blue-800",
            seeds: "bg-emerald-100 text-emerald-800",
            pesticides: "bg-purple-100 text-purple-800",
            farming_tools: "bg-gray-100 text-gray-800",
            dairy: "bg-indigo-100 text-indigo-800",
            other: "bg-pink-100 text-pink-800",
        };
        return categoryClasses[category] || "bg-gray-100 text-gray-800";
    };

    const formatCategory = (category) => {
        const categoryLabels = {
            rice: "Rice",
            corn: "Corn",
            vegetables: "Vegetables",
            fruits: "Fruits",
            root_crops: "Root Crops",
            fertilizers: "Fertilizers",
            seeds: "Seeds",
            pesticides: "Pesticides",
            farming_tools: "Farming Tools",
            dairy: "Dairy Products",
            other: "Other",
        };
        return categoryLabels[category] || category;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(price);
    };

    // Action handlers
    const handleView = (product) => {
        setSelectedProduct(product);
        setViewModalOpen(true);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name || "",
            category: product.category || "",
            description: product.description || "",
            price: product.price || "",
            stock: product.stock || "",
            unit: product.unit || "",
            farm_location: product.farm_location || "",
            is_organic: product.is_organic || false,
            image: null,
            logistic_id: product.logistic_id || "",
        });
        // Set existing image as preview if available
        if (product.image) {
            setImagePreview(product.image);
        } else {
            setImagePreview(null);
        }
        setEditModalOpen(true);
    };

    const handleAssignOpen = (product) => {
        setSelectedProduct(product);
        setSelectedLogisticId(product.logistic_id || null);
        setAssignModalOpen(true);
    };

    const handleAssignCancel = () => {
        setAssignModalOpen(false);
        setSelectedProduct(null);
        setSelectedLogisticId(null);
    };

    const handleAssignSubmit = (e) => {
        e.preventDefault();
        if (!selectedProduct || !selectedLogisticId) {
            handleShowMessage("Please select a logistic provider", "error");
            return;
        }
        setLoading(true);
        router.put(
            route("admin.products.assignLogistic", selectedProduct.id),
            {
                logistic_id: selectedLogisticId,
            },
            {
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    setLoading(false);
                    setAssignModalOpen(false);
                    setSelectedProduct(null);
                    setSelectedLogisticId(null);
                    handleShowMessage("Logistic assigned successfully!");
                    router.reload(); // Reload to update the product list
                },
                onError: (error) => {
                    setLoading(false);
                    const errorMsg =
                        error.errors?.logistic_id?.[0] ||
                        error.message ||
                        "Failed to assign logistic. Please try again.";
                    handleShowMessage(errorMsg, "error");
                },
            },
        );
    };

    const handleDelete = (product) => {
        setSelectedProduct(product);
        setDeleteModalOpen(true);
    };

    const handleApprove = (product) => {
        setLoading(true);
        router.put(
            route("products.approve", product.id),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setLoading(false);
                },
                onError: () => {
                    setLoading(false);
                },
            },
        );
    };

    const handleReject = (product) => {
        setLoading(true);
        router.put(
            route("products.reject", product.id),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setLoading(false);
                },
                onError: () => {
                    setLoading(false);
                },
            },
        );
    };

    const handleDeleteConfirm = () => {
        if (!selectedProduct) return;
        setLoading(true);
        router.delete(route("products.destroy", selectedProduct.id), {
            onSuccess: () => {
                setLoading(false);
                setDeleteModalOpen(false);
                setSelectedProduct(null);
            },
            onError: () => {
                setLoading(false);
            },
        });
    };

    const handleCreate = () => {
        setFormData({
            name: "",
            category: "",
            description: "",
            price: "",
            stock: "",
            unit: "",
            farm_location: "",
            is_organic: false,
            image: null,
            logistic_id: "",
        });
        setImagePreview(null);
        setCreateModalOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const formDataToSend = new FormData();
        // Add CSRF token
        formDataToSend.append("_token", csrfToken);
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== null && formData[key] !== undefined) {
                formDataToSend.append(key, formData[key]);
            }
        });

        router.post(route("products.store"), formDataToSend, {
            onSuccess: () => {
                setLoading(false);
                setCreateModalOpen(false);
            },
            onError: () => {
                setLoading(false);
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedProduct) return;
        setLoading(true);

        const formDataToSend = new FormData();
        // Add CSRF token
        formDataToSend.append("_token", csrfToken);
        // Add the _method field to simulate PUT request
        formDataToSend.append("_method", "PUT");
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== null && formData[key] !== undefined) {
                formDataToSend.append(key, formData[key]);
            }
        });

        router.post(
            route("products.update", selectedProduct.id),
            formDataToSend,
            {
                onSuccess: () => {
                    setLoading(false);
                    setEditModalOpen(false);
                    setSelectedProduct(null);
                },
                onError: () => {
                    setLoading(false);
                },
            },
        );
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({
                ...prev,
                image: file,
            }));
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                <AdminHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Products - Admin" />

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <svg
                                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <p className="text-green-800">
                                    {successMessage}
                                </p>
                            </div>
                            <button
                                onClick={() => setSuccessMessage("")}
                                className="text-green-600 hover:text-green-700"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <svg
                                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <p className="text-red-800">{errorMessage}</p>
                            </div>
                            <button
                                onClick={() => setErrorMessage("")}
                                className="text-red-600 hover:text-red-700"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}

                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Product Management
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage platform products
                            </p>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            + Add Product
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="Search by name, description, or seller..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                            <div className="w-48">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) =>
                                        setCategoryFilter(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">All Categories</option>
                                    <option value="rice">Rice</option>
                                    <option value="corn">Corn</option>
                                    <option value="vegetables">
                                        Vegetables
                                    </option>
                                    <option value="fruits">Fruits</option>
                                    <option value="root_crops">
                                        Root Crops
                                    </option>
                                    <option value="fertilizers">
                                        Fertilizers
                                    </option>
                                    <option value="seeds">Seeds</option>
                                    <option value="pesticides">
                                        Pesticides
                                    </option>
                                    <option value="farming_tools">
                                        Farming Tools
                                    </option>
                                    <option value="dairy">
                                        Dairy Products
                                    </option>
                                    <option value="other">Other</option>
                                </select>
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
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Image
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Seller
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Logistic
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-normal break-words">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.name || "-"}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {product.description
                                                            ? product.description.substring(
                                                                  0,
                                                                  50,
                                                              ) +
                                                              (product
                                                                  .description
                                                                  .length > 50
                                                                  ? "..."
                                                                  : "")
                                                            : "-"}
                                                    </div>
                                                    {product.is_organic && (
                                                        <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                            Organic
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-normal break-words">
                                                    {product.image ? (
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <svg
                                                                className="w-8 h-8 text-gray-400"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-normal break-words">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeClass(product.category)}`}
                                                    >
                                                        {formatCategory(
                                                            product.category,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-normal break-words">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatPrice(
                                                            product.price,
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        per {product.unit}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-normal break-words">
                                                    <div className="text-sm text-gray-900">
                                                        {product.stock}{" "}
                                                        {product.unit}
                                                    </div>
                                                    {product.stock < 50 && (
                                                        <span className="text-xs text-red-600">
                                                            Low Stock
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-normal break-words">
                                                    <div className="text-sm text-gray-900">
                                                        {product.seller?.name ||
                                                            "-"}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {product.farm_location ||
                                                            "-"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {product.logistic ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {
                                                                product.logistic
                                                                    .name
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-normal break-words">
                                                    {product.is_approved ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            Approved
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-normal break-words">
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(
                                                            product.created_at,
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex gap-2 flex-wrap">
                                                        <button
                                                            onClick={() =>
                                                                handleView(
                                                                    product,
                                                                )
                                                            }
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="View"
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(
                                                                    product,
                                                                )
                                                            }
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Edit"
                                                        >
                                                            Edit
                                                        </button>
                                                        {product.logistic ? (
                                                            <span className="text-xs text-blue-600 px-2 py-1 bg-blue-50 rounded">
                                                                {
                                                                    product
                                                                        .logistic
                                                                        .name
                                                                }
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    handleAssignOpen(
                                                                        product,
                                                                    )
                                                                }
                                                                className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 bg-blue-50 rounded hover:bg-blue-100"
                                                                title="Assign Logistic"
                                                            >
                                                                Assign Logistic
                                                            </button>
                                                        )}
                                                        {!product.is_approved ? (
                                                            <button
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        product,
                                                                    )
                                                                }
                                                                className="text-green-600 hover:text-green-900"
                                                                disabled={
                                                                    loading
                                                                }
                                                            >
                                                                Approve
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    handleReject(
                                                                        product,
                                                                    )
                                                                }
                                                                className="text-yellow-600 hover:text-yellow-900"
                                                                disabled={
                                                                    loading
                                                                }
                                                            >
                                                                Reject
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    product,
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="10"
                                                className="px-6 py-12 text-center text-gray-500"
                                            >
                                                {searchTerm ||
                                                categoryFilter ||
                                                statusFilter
                                                    ? "No products found matching your criteria"
                                                    : "No products found"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Info */}
                    {products.data && products.data.length > 0 && (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {products.from || 1} to{" "}
                                {products.to || products.data.length} of{" "}
                                {products.total} products
                            </div>
                            <div className="flex gap-2">
                                {products.prev_page_url && (
                                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                                        Previous
                                    </button>
                                )}
                                {products.next_page_url && (
                                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
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
                maxWidth="2xl"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Product Details
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
                    {selectedProduct && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Product Name
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedProduct.name || "-"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Category
                                    </label>
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeClass(selectedProduct.category)}`}
                                    >
                                        {formatCategory(
                                            selectedProduct.category,
                                        )}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Price
                                    </label>
                                    <p className="text-gray-900">
                                        {formatPrice(selectedProduct.price)} per{" "}
                                        {selectedProduct.unit}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Stock
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedProduct.stock}{" "}
                                        {selectedProduct.unit}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Status
                                    </label>
                                    {selectedProduct.is_approved ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Approved
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            Pending
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Organic
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedProduct.is_organic
                                            ? "Yes"
                                            : "No"}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-500">
                                        Description
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedProduct.description || "-"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Seller
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedProduct.seller?.name || "-"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Farm Location
                                    </label>
                                    <p className="text-gray-900">
                                        {selectedProduct.farm_location || "-"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Created At
                                    </label>
                                    <p className="text-gray-900">
                                        {formatDate(selectedProduct.created_at)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Updated At
                                    </label>
                                    <p className="text-gray-900">
                                        {formatDate(selectedProduct.updated_at)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                                <button
                                    onClick={() => setViewModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setViewModalOpen(false);
                                        handleEdit(selectedProduct);
                                    }}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Create Modal */}
            <Modal
                show={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                maxWidth="2xl"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Add New Product
                        </h2>
                        <button
                            onClick={() => setCreateModalOpen(false)}
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
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter product name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Select Category</option>
                                    <option value="rice">Rice</option>
                                    <option value="corn">Corn</option>
                                    <option value="vegetables">
                                        Vegetables
                                    </option>
                                    <option value="fruits">Fruits</option>
                                    <option value="root_crops">
                                        Root Crops
                                    </option>
                                    <option value="fertilizers">
                                        Fertilizers
                                    </option>
                                    <option value="seeds">Seeds</option>
                                    <option value="pesticides">
                                        Pesticides
                                    </option>
                                    <option value="farming_tools">
                                        Farming Tools
                                    </option>
                                    <option value="dairy">
                                        Dairy Products
                                    </option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Stock *
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Unit *
                                </label>
                                <select
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Select Unit</option>
                                    <option value="kg">kg</option>
                                    <option value="lb">lb</option>
                                    <option value="ton">ton</option>
                                    <option value="piece">piece</option>
                                    <option value="bag">bag</option>
                                    <option value="box">box</option>
                                    <option value="liter">liter</option>
                                    <option value="gallon">gallon</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Farm Location
                                </label>
                                <input
                                    type="text"
                                    name="farm_location"
                                    value={formData.farm_location}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter farm location"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter product description"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Image
                                </label>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-32 h-32 object-cover rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_organic"
                                        checked={formData.is_organic}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        Organic Product
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setCreateModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Create Product"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                show={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                maxWidth="sm"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Delete Product
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
                        Are you sure you want to delete this product? This
                        action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteConfirm}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {loading ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                show={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                maxWidth="2xl"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Edit Product
                        </h2>
                        <button
                            onClick={() => setEditModalOpen(false)}
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
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Category</option>
                                    <option value="rice">Rice</option>
                                    <option value="corn">Corn</option>
                                    <option value="vegetables">
                                        Vegetables
                                    </option>
                                    <option value="fruits">Fruits</option>
                                    <option value="root_crops">
                                        Root Crops
                                    </option>
                                    <option value="fertilizers">
                                        Fertilizers
                                    </option>
                                    <option value="seeds">Seeds</option>
                                    <option value="pesticides">
                                        Pesticides
                                    </option>
                                    <option value="farming_tools">
                                        Farming Tools
                                    </option>
                                    <option value="dairy">
                                        Dairy Products
                                    </option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Unit
                                </label>
                                <select
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Unit</option>
                                    <option value="kg">kg</option>
                                    <option value="lb">lb</option>
                                    <option value="ton">ton</option>
                                    <option value="piece">piece</option>
                                    <option value="bag">bag</option>
                                    <option value="box">box</option>
                                    <option value="liter">liter</option>
                                    <option value="gallon">gallon</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Default Logistic
                                </label>
                                <select
                                    name="logistic_id"
                                    value={formData.logistic_id}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">No default</option>
                                    {(logisticsList.length > 0
                                        ? logisticsList
                                        : logistics
                                    ).map((logistic) => (
                                        <option
                                            key={logistic.id}
                                            value={logistic.id}
                                        >
                                            {logistic.name} ({logistic.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Farm Location
                                </label>
                                <input
                                    type="text"
                                    name="farm_location"
                                    value={formData.farm_location}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Image
                                </label>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-32 h-32 object-cover rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_organic"
                                        checked={formData.is_organic}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        Organic Product
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setEditModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Assign Logistic Modal */}
            <Modal
                show={assignModalOpen}
                onClose={handleAssignCancel}
                maxWidth="2xl"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Assign Logistic to {selectedProduct?.name}
                        </h2>
                        <button
                            onClick={handleAssignCancel}
                            disabled={loading}
                            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
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
                    <form onSubmit={handleAssignSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Logistic Provider *
                            </label>
                            {logisticsLoading ? (
                                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center gap-2">
                                    <svg
                                        className="animate-spin h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Loading logistics...
                                </div>
                            ) : (
                                <select
                                    value={selectedLogisticId || ""}
                                    onChange={(e) =>
                                        setSelectedLogisticId(
                                            e.target.value
                                                ? parseInt(e.target.value)
                                                : null,
                                        )
                                    }
                                    disabled={loading}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    required
                                >
                                    <option value="">
                                        Select a logistic provider...
                                    </option>
                                    {(logisticsList.length > 0
                                        ? logisticsList
                                        : logistics
                                    ).map((logistic) => (
                                        <option
                                            key={logistic.id}
                                            value={logistic.id}
                                        >
                                            {logistic.name} ({logistic.email})
                                            {logistic.riderProfile?.vehicle_type
                                                ? ` | ${logistic.riderProfile.vehicle_type}`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {logisticsList.length === 0 &&
                                !logisticsLoading &&
                                logistics.length === 0 && (
                                    <p className="mt-2 text-sm text-yellow-600">
                                        No logistics available. Please add
                                        logistics providers first.
                                    </p>
                                )}
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button
                                type="button"
                                onClick={handleAssignCancel}
                                disabled={loading}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={
                                    !selectedLogisticId ||
                                    loading ||
                                    logisticsLoading
                                }
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            className="animate-spin h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Assigning...
                                    </>
                                ) : (
                                    "Assign Logistic"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
