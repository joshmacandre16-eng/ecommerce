import { Head } from "@inertiajs/react";
import LogisticsSidebar from "./sidebar";
import LogisticsHeader from "./header";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

// Custom marker icons for different location types
const sellerIcon = new L.Icon({
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const buyerIcon = new L.Icon({
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const deliveryIcon = new L.Icon({
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function Routes({
    auth,
    deliveries = [],
    routes = [],
    sellers = [],
}) {
    const user = auth?.user;
    const [mapCenter, setMapCenter] = useState([14.5995, 120.9842]); // Manila coordinates
    const [locationFilter, setLocationFilter] = useState("all"); // all, seller, buyer, delivery
    const [searchQuery, setSearchQuery] = useState("");
    const [mapZoom, setMapZoom] = useState(12);

    // Filter locations based on search query
    const filteredSellers = sellers.filter((seller) =>
        seller.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const filteredDeliveries = deliveries.filter(
        (delivery) =>
            delivery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            delivery.tracking_number
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    // Handle location click - zoom to that location
    const handleLocationClick = (lat, lng) => {
        setMapCenter([parseFloat(lat), parseFloat(lng)]);
        setMapZoom(16);
    };

    // Calculate center based on all locations
    useEffect(() => {
        const allLocations = [...deliveries, ...sellers].filter(
            (l) => l.lat && l.lng,
        );

        if (allLocations.length > 0) {
            const avgLat =
                allLocations.reduce((sum, l) => sum + parseFloat(l.lat), 0) /
                allLocations.length;
            const avgLng =
                allLocations.reduce((sum, l) => sum + parseFloat(l.lng), 0) /
                allLocations.length;
            setMapCenter([avgLat, avgLng]);
            setMapZoom(12);
        }
    }, [deliveries, sellers]);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <LogisticsSidebar />
            <div className="flex-1 flex flex-col">
                <LogisticsHeader user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Head title="Route Map - Logistic" />
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Route Map
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            View delivery routes, sellers, and buyer locations
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Find Location
                        </h3>
                        <div className="flex gap-2 mb-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Search by seller name, buyer name, or tracking number..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setMapZoom(12);
                                    const allLocations = [
                                        ...deliveries,
                                        ...sellers,
                                    ].filter((l) => l.lat && l.lng);
                                    if (allLocations.length > 0) {
                                        const avgLat =
                                            allLocations.reduce(
                                                (sum, l) =>
                                                    sum + parseFloat(l.lat),
                                                0,
                                            ) / allLocations.length;
                                        const avgLng =
                                            allLocations.reduce(
                                                (sum, l) =>
                                                    sum + parseFloat(l.lng),
                                                0,
                                            ) / allLocations.length;
                                        setMapCenter([avgLat, avgLng]);
                                    }
                                }}
                                title="Reset map zoom to show all locations"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                🔄 Reset Zoom
                            </button>
                        </div>

                        {/* Search Results Dropdown */}
                        {searchQuery && (
                            <div className="mt-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
                                {filteredSellers.length === 0 &&
                                filteredDeliveries.length === 0 ? (
                                    <div className="p-3 text-sm text-gray-500">
                                        No locations found
                                    </div>
                                ) : (
                                    <>
                                        {filteredSellers.map((seller) => (
                                            <button
                                                key={`search-seller-${seller.id}`}
                                                onClick={() => {
                                                    handleLocationClick(
                                                        seller.lat,
                                                        seller.lng,
                                                    );
                                                    setSearchQuery("");
                                                }}
                                                className="w-full text-left px-3 py-2 hover:bg-red-100 border-b border-gray-200 last:border-b-0 transition-colors"
                                            >
                                                <p className="text-sm font-medium text-gray-900">
                                                    📍 {seller.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Seller Location
                                                </p>
                                            </button>
                                        ))}
                                        {filteredDeliveries.map((delivery) => (
                                            <button
                                                key={`search-delivery-${delivery.id}`}
                                                onClick={() => {
                                                    handleLocationClick(
                                                        delivery.lat,
                                                        delivery.lng,
                                                    );
                                                    setSearchQuery("");
                                                }}
                                                className="w-full text-left px-3 py-2 hover:bg-blue-100 border-b border-gray-200 last:border-b-0 transition-colors"
                                            >
                                                <p className="text-sm font-medium text-gray-900">
                                                    📦 #
                                                    {delivery.tracking_number}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {delivery.name}
                                                </p>
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Location Filter Controls */}
                    <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Location Filter
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setLocationFilter("all")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    locationFilter === "all"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                Show All
                            </button>
                            <button
                                onClick={() => setLocationFilter("seller")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    locationFilter === "seller"
                                        ? "bg-red-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                Sellers Only
                            </button>
                            <button
                                onClick={() => setLocationFilter("buyer")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    locationFilter === "buyer"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                Buyers Only
                            </button>
                            <button
                                onClick={() => setLocationFilter("delivery")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    locationFilter === "delivery"
                                        ? "bg-green-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                Delivery Routes
                            </button>
                        </div>
                        {/* Legend */}
                        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-4 h-6 rounded"
                                    style={{ backgroundColor: "#ff4444" }}
                                ></div>
                                <span className="text-xs text-gray-600">
                                    Seller Location
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-4 h-6 rounded"
                                    style={{ backgroundColor: "#4444ff" }}
                                ></div>
                                <span className="text-xs text-gray-600">
                                    Buyer Location
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-4 h-6 rounded"
                                    style={{ backgroundColor: "#44ff44" }}
                                ></div>
                                <span className="text-xs text-gray-600">
                                    Delivery Point
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-0.5 w-6"
                                    style={{
                                        backgroundColor: "#22c55e",
                                        backgroundImage:
                                            "linear-gradient(90deg, #22c55e 50%, transparent 50%)",
                                        backgroundSize: "5px 100%",
                                    }}
                                ></div>
                                <span className="text-xs text-gray-600">
                                    Seller→Buyer Route
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Map Container */}
                        <div className="lg:col-span-3">
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="p-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Location Map
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {(locationFilter === "all" ||
                                            locationFilter === "seller") &&
                                            sellers.length > 0 &&
                                            `${sellers.length} sellers • `}
                                        {(locationFilter === "all" ||
                                            locationFilter === "buyer") &&
                                            deliveries.length > 0 &&
                                            `${deliveries.length} buyers • `}
                                        {(locationFilter === "all" ||
                                            locationFilter === "delivery") &&
                                            deliveries.length > 0 &&
                                            `${deliveries.length} active deliveries`}
                                    </p>
                                </div>
                                <div className="h-96">
                                    <MapContainer
                                        center={mapCenter}
                                        zoom={mapZoom}
                                        style={{
                                            height: "100%",
                                            width: "100%",
                                        }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />

                                        {/* Route Line */}
                                        {routes.length > 1 &&
                                            (locationFilter === "all" ||
                                                locationFilter ===
                                                    "delivery") && (
                                                <Polyline
                                                    positions={routes.map(
                                                        (route) => [
                                                            route.lat,
                                                            route.lng,
                                                        ],
                                                    )}
                                                    color="blue"
                                                    weight={3}
                                                    opacity={0.7}
                                                />
                                            )}

                                        {/* Seller to Buyer Connection Lines */}
                                        {(locationFilter === "all" ||
                                            locationFilter === "delivery" ||
                                            locationFilter === "buyer") &&
                                            deliveries.map((delivery) => {
                                                if (
                                                    !delivery.seller_lat ||
                                                    !delivery.seller_lng
                                                )
                                                    return null;
                                                return (
                                                    <Polyline
                                                        key={`route-${delivery.id}`}
                                                        positions={[
                                                            [
                                                                parseFloat(
                                                                    delivery.seller_lat,
                                                                ),
                                                                parseFloat(
                                                                    delivery.seller_lng,
                                                                ),
                                                            ],
                                                            [
                                                                parseFloat(
                                                                    delivery.lat,
                                                                ),
                                                                parseFloat(
                                                                    delivery.lng,
                                                                ),
                                                            ],
                                                        ]}
                                                        color="#22c55e"
                                                        weight={2}
                                                        opacity={0.6}
                                                        dashArray="5, 5"
                                                    />
                                                );
                                            })}

                                        {/* Seller Markers */}
                                        {(locationFilter === "all" ||
                                            locationFilter === "seller") &&
                                            sellers.map((seller) => (
                                                <Marker
                                                    key={`seller-${seller.id}`}
                                                    position={[
                                                        parseFloat(seller.lat),
                                                        parseFloat(seller.lng),
                                                    ]}
                                                    icon={sellerIcon}
                                                >
                                                    <Popup>
                                                        <div className="p-2">
                                                            <h3 className="font-semibold text-sm text-red-600">
                                                                Seller Location
                                                            </h3>
                                                            <p className="text-xs font-medium text-gray-900 mt-1">
                                                                {seller.name}
                                                            </p>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                {seller.address}
                                                            </p>
                                                            {seller.contact && (
                                                                <p className="text-xs text-gray-600">
                                                                    Contact:{" "}
                                                                    {
                                                                        seller.contact
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            ))}

                                        {/* Buyer/Delivery Markers */}
                                        {(locationFilter === "all" ||
                                            locationFilter === "buyer" ||
                                            locationFilter === "delivery") &&
                                            deliveries.map((delivery) => (
                                                <Marker
                                                    key={`delivery-${delivery.id}`}
                                                    position={[
                                                        parseFloat(
                                                            delivery.lat,
                                                        ),
                                                        parseFloat(
                                                            delivery.lng,
                                                        ),
                                                    ]}
                                                    icon={buyerIcon}
                                                >
                                                    <Popup>
                                                        <div className="p-2">
                                                            <h3 className="font-semibold text-sm">
                                                                Order #
                                                                {
                                                                    delivery.tracking_number
                                                                }
                                                            </h3>
                                                            <p className="text-xs text-gray-900 font-medium mt-1">
                                                                Buyer:{" "}
                                                                {delivery.name}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                Address:{" "}
                                                                {
                                                                    delivery.address
                                                                }
                                                            </p>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                Status:{" "}
                                                                <span className="font-medium">
                                                                    {
                                                                        delivery.status
                                                                    }
                                                                </span>
                                                            </p>
                                                            {delivery.seller_name && (
                                                                <p className="text-xs text-gray-600">
                                                                    Seller:{" "}
                                                                    {
                                                                        delivery.seller_name
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            ))}
                                    </MapContainer>
                                </div>
                            </div>
                        </div>

                        {/* Locations List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {locationFilter === "seller"
                                        ? "Sellers"
                                        : locationFilter === "buyer"
                                          ? "Buyers"
                                          : locationFilter === "delivery"
                                            ? "Deliveries"
                                            : "All Locations"}
                                </h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {/* Sellers List */}
                                    {(locationFilter === "all" ||
                                        locationFilter === "seller") &&
                                    sellers.length === 0 &&
                                    locationFilter !== "all" ? (
                                        <p className="text-sm text-gray-500">
                                            No sellers available
                                        </p>
                                    ) : (
                                        (locationFilter === "all" ||
                                            locationFilter === "seller") &&
                                        sellers.map((seller) => (
                                            <div
                                                key={`list-seller-${seller.id}`}
                                                onClick={() =>
                                                    handleLocationClick(
                                                        seller.lat,
                                                        seller.lng,
                                                    )
                                                }
                                                className="p-3 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer bg-red-50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {seller.name}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            Seller Location
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {seller.address?.substring(
                                                                0,
                                                                40,
                                                            )}
                                                            ...
                                                        </p>
                                                    </div>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Seller
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    {/* Buyers/Deliveries List */}
                                    {(locationFilter === "all" ||
                                        locationFilter === "buyer" ||
                                        locationFilter === "delivery") &&
                                        (deliveries.length === 0 &&
                                        locationFilter !== "all" ? (
                                            <p className="text-sm text-gray-500">
                                                No deliveries available
                                            </p>
                                        ) : (
                                            deliveries.map((delivery) => (
                                                <div
                                                    key={`list-delivery-${delivery.id}`}
                                                    onClick={() =>
                                                        handleLocationClick(
                                                            delivery.lat,
                                                            delivery.lng,
                                                        )
                                                    }
                                                    className="p-3 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer bg-blue-50 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                #
                                                                {
                                                                    delivery.tracking_number
                                                                }
                                                            </p>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                {delivery.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {delivery.address?.substring(
                                                                    0,
                                                                    40,
                                                                )}
                                                                ...
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                delivery.status ===
                                                                "shipped"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : delivery.status ===
                                                                        "confirmed"
                                                                      ? "bg-yellow-100 text-yellow-800"
                                                                      : "bg-green-100 text-green-800"
                                                            }`}
                                                        >
                                                            {delivery.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
