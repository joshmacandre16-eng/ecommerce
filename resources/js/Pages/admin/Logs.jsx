import { Head, Link } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import AdminSidebar from "./sidebar";
import AdminHeader from "./header";
import {
    Search,
    Filter,
    Download,
    Trash2,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    AlertTriangle,
    Info,
    Lightbulb,
    Shield,
    Eye,
    EyeOff,
} from "lucide-react";

export default function Logs({
    auth,
    logFiles = [],
    logs = [],
    selectedFile = null,
    filters = {},
    error = null,
    userLogs = [],
    suspiciousActivities = [],
}) {
    const user = auth?.user;
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [levelFilter, setLevelFilter] = useState(filters?.level || "");
    const [selectedFileLocal, setSelectedFileLocal] = useState(selectedFile);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("system"); // system, users, suspicious
    const [expandedSuspicious, setExpandedSuspicious] = useState(null);

    // Handle file selection
    const handleSelectFile = (fileName) => {
        setSelectedFileLocal(fileName);
        router.get(
            route("admin.logs.index"),
            {
                file: fileName,
                search: searchTerm,
                level: levelFilter,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Handle search
    const handleSearch = (value) => {
        setSearchTerm(value);
        if (selectedFileLocal) {
            router.get(
                route("admin.logs.index"),
                {
                    file: selectedFileLocal,
                    search: value,
                    level: levelFilter,
                },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }
    };

    // Handle level filter
    const handleLevelFilter = (value) => {
        setLevelFilter(value);
        if (selectedFileLocal) {
            router.get(
                route("admin.logs.index"),
                {
                    file: selectedFileLocal,
                    search: searchTerm,
                    level: value,
                },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }
    };

    // Handle log download
    const handleDownload = (fileName) => {
        setIsLoading(true);
        window.location.href = route("admin.logs.download", fileName);
        setTimeout(() => setIsLoading(false), 1000);
    };

    // Handle log clear
    const handleClear = (fileName) => {
        if (confirm(`Are you sure you want to clear ${fileName}?`)) {
            setIsLoading(true);
            router.delete(route("admin.logs.clear", fileName), {
                onSuccess: () => {
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                },
            });
        }
    };

    // Handle clear all
    const handleClearAll = () => {
        if (
            confirm(
                "Are you sure you want to clear all log files? This action cannot be undone.",
            )
        ) {
            setIsLoading(true);
            router.delete(route("admin.logs.clearAll"), {
                onSuccess: () => {
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                },
            });
        }
    };

    // Get icon based on log level
    const getLevelIcon = (level) => {
        const upperLevel = level?.toUpperCase() || "";
        switch (upperLevel) {
            case "ERROR":
                return <AlertCircle className="w-4 h-4 text-red-600" />;
            case "WARNING":
                return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case "INFO":
                return <Info className="w-4 h-4 text-blue-600" />;
            case "DEBUG":
                return <Info className="w-4 h-4 text-gray-600" />;
            case "SUCCESS":
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            default:
                return <Info className="w-4 h-4 text-gray-600" />;
        }
    };

    // Get level badge class
    const getLevelBadgeClass = (level) => {
        const upperLevel = level?.toUpperCase() || "";
        switch (upperLevel) {
            case "ERROR":
                return "bg-red-100 text-red-800";
            case "WARNING":
                return "bg-yellow-100 text-yellow-800";
            case "INFO":
                return "bg-blue-100 text-blue-800";
            case "DEBUG":
                return "bg-gray-100 text-gray-800";
            case "SUCCESS":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
        );
    };

    // Get risk level based on suspicious activity
    const getRiskLevel = (activity) => {
        const riskFactors = [];

        // Check failed attempts
        if (activity?.failed_attempts > 5) riskFactors.push("high");
        else if (activity?.failed_attempts > 2) riskFactors.push("medium");

        // Check location changes
        if (activity?.location_changes > 2) riskFactors.push("high");

        // Check unusual time
        if (activity?.unusual_time) riskFactors.push("medium");

        // Check unusual IP
        if (activity?.unusual_ip) riskFactors.push("medium");

        if (riskFactors.includes("high"))
            return {
                level: "critical",
                color: "bg-red-100 text-red-800 border-red-300",
            };
        if (riskFactors.includes("medium"))
            return {
                level: "warning",
                color: "bg-yellow-100 text-yellow-800 border-yellow-300",
            };
        return {
            level: "safe",
            color: "bg-green-100 text-green-800 border-green-300",
        };
    };

    // Get suggested solutions
    const getSuggestedSolutions = (activity) => {
        const solutions = [];

        if (activity?.failed_attempts > 5) {
            solutions.push({
                icon: Shield,
                title: "Multiple Failed Login Attempts Detected",
                actions: [
                    "Temporarily lock the account for 30 minutes",
                    "Send security alert email to user",
                    "Enable CAPTCHA for next login attempt",
                    "Request password reset",
                ],
            });
        }

        if (activity?.unusual_ip) {
            solutions.push({
                icon: AlertTriangle,
                title: "Login from Unusual IP Address",
                actions: [
                    "Verify IP location and authenticity",
                    "Send 'new login' verification email",
                    "Require two-factor authentication",
                    "Review user's recent activities",
                ],
            });
        }

        if (activity?.location_changes > 2) {
            solutions.push({
                icon: AlertCircle,
                title: "Suspicious Location Changes",
                actions: [
                    "Require additional verification",
                    "Lock account and request verification",
                    "Check for account compromise",
                    "Enable geolocation restrictions",
                ],
            });
        }

        if (activity?.unusual_time) {
            solutions.push({
                icon: Info,
                title: "Login at Unusual Time",
                actions: [
                    "Mark for monitoring",
                    "Request verification if repeated",
                    "Monitor for unusual activity patterns",
                    "Set up time-based access rules",
                ],
            });
        }

        if (solutions.length === 0) {
            solutions.push({
                icon: CheckCircle,
                title: "No Immediate Threats Detected",
                actions: [
                    "Continue monitoring user activity",
                    "Regular security audits recommended",
                    "Maintain automated threat detection",
                ],
            });
        }

        return solutions;
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Head title="System Logs - Admin" />

            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <AdminHeader user={user} />

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto p-6">
                        {/* Page Title */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Logs & Monitoring
                            </h1>
                            <p className="text-gray-600 mt-2">
                                View system logs and user activity
                            </p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-red-900">
                                        Error
                                    </h3>
                                    <p className="text-red-700 text-sm mt-1">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="mb-6 border-b border-gray-200">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setActiveTab("system")}
                                    className={`px-6 py-3 font-medium border-b-2 transition ${
                                        activeTab === "system"
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    System Logs
                                </button>
                                <button
                                    onClick={() => setActiveTab("users")}
                                    className={`px-6 py-3 font-medium border-b-2 transition ${
                                        activeTab === "users"
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    User Activity
                                </button>
                                <button
                                    onClick={() => setActiveTab("suspicious")}
                                    className={`px-6 py-3 font-medium border-b-2 transition relative ${
                                        activeTab === "suspicious"
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    Suspicious Activity
                                    {suspiciousActivities?.length > 0 && (
                                        <span className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            {suspiciousActivities.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* System Logs Tab */}
                        {activeTab === "system" && (
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {/* Sidebar - Log Files List */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-lg shadow">
                                        <div className="p-6 border-b border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-lg font-semibold text-gray-900">
                                                    Log Files
                                                </h2>
                                                <button
                                                    onClick={handleClearAll}
                                                    disabled={
                                                        isLoading ||
                                                        logFiles.length === 0
                                                    }
                                                    className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Clear all logs"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {logFiles.length} file
                                                {logFiles.length !== 1
                                                    ? "s"
                                                    : ""}
                                            </p>
                                        </div>

                                        <div className="overflow-y-auto max-h-96">
                                            {logFiles.length === 0 ? (
                                                <div className="p-6 text-center text-gray-500">
                                                    <p className="text-sm">
                                                        No log files found
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-200">
                                                    {logFiles.map((file) => (
                                                        <button
                                                            key={file.name}
                                                            onClick={() =>
                                                                handleSelectFile(
                                                                    file.name,
                                                                )
                                                            }
                                                            className={`w-full text-left px-6 py-3 hover:bg-gray-50 transition ${
                                                                selectedFileLocal ===
                                                                file.name
                                                                    ? "bg-blue-50 border-l-4 border-blue-600"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <div className="font-medium text-gray-900 text-sm truncate">
                                                                {file.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {formatFileSize(
                                                                    file.size,
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                {file.modified}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {selectedFileLocal && (
                                            <div className="p-4 border-t border-gray-200 space-y-2">
                                                <button
                                                    onClick={() =>
                                                        handleDownload(
                                                            selectedFileLocal,
                                                        )
                                                    }
                                                    disabled={isLoading}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition text-sm"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleClear(
                                                            selectedFileLocal,
                                                        )
                                                    }
                                                    disabled={isLoading}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition text-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Clear
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Main Content - Logs Display */}
                                <div className="lg:col-span-3">
                                    <div className="bg-white rounded-lg shadow">
                                        {/* Filters */}
                                        <div className="p-6 border-b border-gray-200">
                                            <div className="space-y-4">
                                                {/* Search */}
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search logs..."
                                                        value={searchTerm}
                                                        onChange={(e) =>
                                                            handleSearch(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                {/* Level Filter */}
                                                <div className="flex items-center gap-2">
                                                    <Filter className="text-gray-400 w-5 h-5" />
                                                    <select
                                                        value={levelFilter}
                                                        onChange={(e) =>
                                                            handleLevelFilter(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="">
                                                            All Levels
                                                        </option>
                                                        <option value="DEBUG">
                                                            Debug
                                                        </option>
                                                        <option value="INFO">
                                                            Info
                                                        </option>
                                                        <option value="WARNING">
                                                            Warning
                                                        </option>
                                                        <option value="ERROR">
                                                            Error
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Logs List */}
                                        <div className="overflow-y-auto max-h-96">
                                            {!selectedFileLocal ? (
                                                <div className="p-6 text-center text-gray-500">
                                                    <p>
                                                        Select a log file to
                                                        view logs
                                                    </p>
                                                </div>
                                            ) : logs.length === 0 ? (
                                                <div className="p-6 text-center text-gray-500">
                                                    <p>No logs found</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-200">
                                                    {logs.map((log, index) => (
                                                        <div
                                                            key={index}
                                                            className="p-4 hover:bg-gray-50 transition"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex-shrink-0">
                                                                    {getLevelIcon(
                                                                        log.level,
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        {log.level && (
                                                                            <span
                                                                                className={`px-2 py-1 rounded text-xs font-semibold ${getLevelBadgeClass(
                                                                                    log.level,
                                                                                )}`}
                                                                            >
                                                                                {
                                                                                    log.level
                                                                                }
                                                                            </span>
                                                                        )}
                                                                        {log.date && (
                                                                            <span className="text-xs text-gray-500">
                                                                                {
                                                                                    log.date
                                                                                }
                                                                            </span>
                                                                        )}
                                                                        {log.environment && (
                                                                            <span className="text-xs text-gray-500">
                                                                                {
                                                                                    log.environment
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm text-gray-700 font-mono break-all bg-gray-50 p-2 rounded border border-gray-200">
                                                                        {log.message ||
                                                                            log.raw}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Activity Tab */}
                        {activeTab === "users" && (
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        User Login Activity
                                    </h2>
                                </div>

                                <div className="overflow-y-auto max-h-screen">
                                    {userLogs && userLogs.length > 0 ? (
                                        <div className="divide-y divide-gray-200">
                                            {userLogs.map((userLog, index) => (
                                                <div
                                                    key={index}
                                                    className="p-6 hover:bg-gray-50 transition"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">
                                                                {
                                                                    userLog.user_name
                                                                }
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {userLog.email}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                                userLog.status ===
                                                                "success"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-red-100 text-red-800"
                                                            }`}
                                                        >
                                                            {userLog.status ===
                                                            "success"
                                                                ? "Success"
                                                                : "Failed"}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-600">
                                                                Time
                                                            </p>
                                                            <p className="font-medium text-gray-900">
                                                                {
                                                                    userLog.timestamp
                                                                }
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">
                                                                IP Address
                                                            </p>
                                                            <p className="font-medium text-gray-900 font-mono">
                                                                {
                                                                    userLog.ip_address
                                                                }
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">
                                                                Device
                                                            </p>
                                                            <p className="font-medium text-gray-900">
                                                                {userLog.device ||
                                                                    "Unknown"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">
                                                                Location
                                                            </p>
                                                            <p className="font-medium text-gray-900">
                                                                {userLog.location ||
                                                                    "Unknown"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center text-gray-500">
                                            <p>No user activity logs found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Suspicious Activity Tab */}
                        {activeTab === "suspicious" && (
                            <div className="space-y-6">
                                {suspiciousActivities &&
                                suspiciousActivities.length > 0 ? (
                                    suspiciousActivities.map(
                                        (activity, index) => {
                                            const riskLevel =
                                                getRiskLevel(activity);
                                            const solutions =
                                                getSuggestedSolutions(activity);
                                            const isExpanded =
                                                expandedSuspicious === index;

                                            return (
                                                <div
                                                    key={index}
                                                    className={`border rounded-lg overflow-hidden ${riskLevel.color}`}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            setExpandedSuspicious(
                                                                isExpanded
                                                                    ? null
                                                                    : index,
                                                            )
                                                        }
                                                        className="w-full p-6 text-left hover:opacity-90 transition flex items-start justify-between"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                                                <div>
                                                                    <h3 className="font-bold text-lg">
                                                                        {
                                                                            activity.user_name
                                                                        }
                                                                    </h3>
                                                                    <p className="text-sm opacity-90">
                                                                        {
                                                                            activity.reason
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-sm opacity-75 ml-9">
                                                                <p>
                                                                    Risk Level:{" "}
                                                                    <span className="font-bold">
                                                                        {
                                                                            riskLevel.level
                                                                        }
                                                                    </span>
                                                                </p>
                                                                <p>
                                                                    Detected:{" "}
                                                                    {
                                                                        activity.timestamp
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {isExpanded ? (
                                                            <EyeOff className="w-5 h-5 flex-shrink-0 ml-4" />
                                                        ) : (
                                                            <Eye className="w-5 h-5 flex-shrink-0 ml-4" />
                                                        )}
                                                    </button>

                                                    {/* Expanded Details */}
                                                    {isExpanded && (
                                                        <div className="bg-white bg-opacity-50 p-6 border-t">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                                <div>
                                                                    <p className="text-sm font-semibold opacity-75 mb-2">
                                                                        Activity
                                                                        Details
                                                                    </p>
                                                                    <div className="space-y-2 text-sm">
                                                                        {activity.failed_attempts && (
                                                                            <p>
                                                                                Failed
                                                                                Attempts:{" "}
                                                                                <span className="font-bold">
                                                                                    {
                                                                                        activity.failed_attempts
                                                                                    }
                                                                                </span>
                                                                            </p>
                                                                        )}
                                                                        {activity.ip_address && (
                                                                            <p>
                                                                                IP
                                                                                Address:{" "}
                                                                                <span className="font-mono">
                                                                                    {
                                                                                        activity.ip_address
                                                                                    }
                                                                                </span>
                                                                            </p>
                                                                        )}
                                                                        {activity.location && (
                                                                            <p>
                                                                                Location:{" "}
                                                                                <span className="font-bold">
                                                                                    {
                                                                                        activity.location
                                                                                    }
                                                                                </span>
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Suggested Solutions */}
                                                            <div className="space-y-4 border-t border-current border-opacity-20 pt-4">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <Lightbulb className="w-5 h-5" />
                                                                    <p className="font-bold">
                                                                        Suggested
                                                                        Solutions
                                                                    </p>
                                                                </div>

                                                                {solutions.map(
                                                                    (
                                                                        solution,
                                                                        sIndex,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                sIndex
                                                                            }
                                                                            className="bg-white bg-opacity-50 p-4 rounded border-l-4 border-current"
                                                                        >
                                                                            <div className="flex items-start gap-3">
                                                                                <solution.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                                                <div className="flex-1">
                                                                                    <h4 className="font-semibold mb-2">
                                                                                        {
                                                                                            solution.title
                                                                                        }
                                                                                    </h4>
                                                                                    <ul className="space-y-1 text-sm">
                                                                                        {solution.actions.map(
                                                                                            (
                                                                                                action,
                                                                                                aIndex,
                                                                                            ) => (
                                                                                                <li
                                                                                                    key={
                                                                                                        aIndex
                                                                                                    }
                                                                                                    className="flex items-start gap-2"
                                                                                                >
                                                                                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-current mt-2"></span>
                                                                                                    <span>
                                                                                                        {
                                                                                                            action
                                                                                                        }
                                                                                                    </span>
                                                                                                </li>
                                                                                            ),
                                                                                        )}
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>

                                                            {/* Quick Actions */}
                                                            <div className="mt-4 flex gap-2">
                                                                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition text-sm font-medium">
                                                                    Lock Account
                                                                </button>
                                                                <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded transition text-sm font-medium">
                                                                    Send Alert
                                                                </button>
                                                                <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition text-sm font-medium">
                                                                    Dismiss
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        },
                                    )
                                ) : (
                                    <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                                        <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            No Suspicious Activity Detected
                                        </h3>
                                        <p>
                                            Your system is secure. Keep
                                            monitoring for best practices.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
