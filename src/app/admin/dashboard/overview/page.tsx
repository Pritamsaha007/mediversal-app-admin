"use client";
import React, { useState, useEffect } from "react";
import {
  Heart,
  Pill,
  TestTube,
  Video,
  Shield,
  Package,
  CheckCircle,
  AlertTriangle,
  Star,
  BarChart3,
  RefreshCw,
  LogOut,
  User,
} from "lucide-react";
import { useAdminStore } from "@/app/store/adminStore";
import { getProductsWithPaginationAPI } from "../pharmacy/product/services/ProductService";
import { Statistics } from "../pharmacy/product/types/product";

interface StatCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  value?: number;
  color?: string;
  isLoading?: boolean;
}
interface ServiceCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  color = "#0088B1",
  isLoading = false,
}) => (
  <div className="bg-white rounded-lg border border-[#0088B1] p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center">
      <div
        className="p-3 rounded-lg mr-4"
        style={{ backgroundColor: `${color}15` }}
      >
        {isLoading ? (
          <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
        ) : (
          <Icon className="w-5 h-5" style={{ color }} />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {isLoading
            ? "..."
            : value !== undefined
            ? value.toLocaleString()
            : "N/A"}
        </p>
      </div>
    </div>
  </div>
);

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon: Icon,
  title,
  description,
  color,
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:border-gray-200">
    <div className="flex items-start">
      <div
        className="p-3 rounded-lg mr-4 flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

export default function HealthcareDashboard() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { admin, logout, isLoggedIn } = useAdminStore();
  const [aqiLoading, setAqiLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState<string | null>(
    null
  );

  const fetchData = async () => {
    if (!isLoggedIn) {
      setError("Please log in to view dashboard data");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getProductsWithPaginationAPI(0, 5, {});

      if (!response.success) {
        throw new Error("Failed to fetch statistics");
      }

      if (!response.statistics || response.statistics.length === 0) {
        throw new Error("No statistics data received");
      }

      const stats = response.statistics[0];

      const productStatistics: Statistics = {
        activeproducts: stats.activeproducts,
        inactiveproducts: stats.inactiveproducts,
        instockproducts: stats.instockproducts,
        outofstockproducts: stats.outofstockproducts,
        featuredproducts: stats.featuredproducts,
        nonfeaturedproducts: stats.nonfeaturedproducts,
        totalcategories: stats.totalcategories,
      };

      setStatistics(productStatistics);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
      setAqiLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    } else {
      setError("Authentication required");
      setLoading(false);
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const services = [
    {
      icon: Heart,
      title: "Homecare Services",
      description:
        "Professional healthcare at your doorstep with qualified medical professionals and personalized care plans.",
      color: "#DC2626",
    },
    {
      icon: Pill,
      title: "Pharmacy",
      description:
        "Complete online pharmacy with prescription medicines, health products, and doorstep delivery.",
      color: "#0088B1",
    },
    {
      icon: TestTube,
      title: "Lab Tests",
      description:
        "Comprehensive diagnostic services with home sample collection and accurate results.",
      color: "#7C3AED",
    },
    {
      icon: Video,
      title: "Online Consultation",
      description:
        "Connect with certified doctors through secure video calls for medical advice and prescriptions.",
      color: "#059669",
    },
  ];

  // Show login required message if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to access the healthcare dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {admin.name || admin.email || "Admin"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {!loading && !error && (
                <button
                  onClick={fetchData}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border border-gray-200 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              )}
              <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {admin.name || "Admin"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Unable to load statistics
                </h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
              <button
                onClick={fetchData}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!error && (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Product Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={Package}
                  title="Active Products"
                  value={
                    statistics?.activeproducts
                      ? Number(statistics.activeproducts)
                      : undefined
                  }
                  color="#0088B1"
                  isLoading={loading}
                />
                <StatCard
                  icon={CheckCircle}
                  title="In Stock"
                  value={
                    statistics?.instockproducts
                      ? Number(statistics.instockproducts)
                      : undefined
                  }
                  color="#22C55E"
                  isLoading={loading}
                />
                <StatCard
                  icon={Star}
                  title="Featured"
                  value={
                    statistics?.featuredproducts
                      ? Number(statistics.featuredproducts)
                      : undefined
                  }
                  color="#F59E0B"
                  isLoading={loading}
                />
                <StatCard
                  icon={BarChart3}
                  title="Categories"
                  value={
                    statistics?.totalcategories
                      ? Number(statistics.totalcategories)
                      : undefined
                  }
                  color="#8B5CF6"
                  isLoading={loading}
                />
              </div>
              {/* Air Quality Index */}
              {/* {!error && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Air Quality - {aqiData?.city || "Loading..."}
                  {locationPermission && (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      ({locationPermission})
                    </span>
                  )}
                </h2>
                {aqiLoading ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        Loading air quality data...
                      </span>
                    </div>
                  </div>
                ) : aqiData ? (
                  <div className="bg-white rounded-lg border border-[#0088B1] p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div
                          className="p-3 rounded-lg mr-4"
                          style={{
                            backgroundColor: `${
                              aqiService.getAQILabel(aqiData.aqi).color
                            }15`,
                          }}
                        >
                          <Wind
                            className="w-6 h-6"
                            style={{
                              color: aqiService.getAQILabel(aqiData.aqi).color,
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-xl font-bold text-gray-900">
                              AQI {aqiData.aqi}
                            </h3>
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${
                                  aqiService.getAQILabel(aqiData.aqi).color
                                }15`,
                                color: aqiService.getAQILabel(aqiData.aqi)
                                  .color,
                              }}
                            >
                              {aqiService.getAQILabel(aqiData.aqi).label}
                            </span>
                            <span className="flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                              <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-1.5 animate-pulse"></span>
                              LIVE
                            </span>
                            <div className="relative group">
                              <Info className="w-4 h-4 text-gray-400 cursor-help" />
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                                <p className="font-semibold mb-1">
                                  Current AQI: {aqiData.aqi}/5
                                </p>
                                <p className="text-gray-300">
                                  Based on World Air Quality Index (WAQI)
                                  standard scale (0-500). Real-time data from
                                  air quality monitoring stations.
                                </p>
                                <div className="absolute left-4 top-full w-2 h-2 bg-gray-900 transform rotate-45 -mt-1"></div>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {aqiService.getAQILabel(aqiData.aqi).message}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 ml-6">
                        {aqiData.weather && (
                          <>
                            <div className="text-center">
                              <div className="flex items-center justify-center mb-1">
                                <Thermometer className="w-3.5 h-3.5 text-gray-500 mr-1" />
                                <p className="text-xs text-gray-500">Temp</p>
                              </div>
                              <p className="text-lg font-bold text-gray-900">
                                {aqiData.weather.temp}°C
                              </p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center mb-1">
                                <Droplets className="w-3.5 h-3.5 text-gray-500 mr-1" />
                                <p className="text-xs text-gray-500">
                                  Humidity
                                </p>
                              </div>
                              <p className="text-lg font-bold text-gray-900">
                                {aqiData.weather.humidity}%
                              </p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center mb-1">
                                <Wind className="w-3.5 h-3.5 text-gray-500 mr-1" />
                                <p className="text-xs text-gray-500">Wind</p>
                              </div>
                              <p className="text-lg font-bold text-gray-900">
                                {aqiData.weather.windSpeed} m/s
                              </p>
                            </div>
                          </>
                        )}
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">PM2.5</p>
                          <p className="text-lg font-bold text-gray-900">
                            {aqiData.components.pm2_5.toFixed(1)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">PM10</p>
                          <p className="text-lg font-bold text-gray-900">
                            {aqiData.components.pm10.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-gray-600 text-center">
                      Unable to load air quality data
                    </p>
                  </div>
                )}
              </div>
            )} */}
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Our Services
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service, index) => (
                  <ServiceCard
                    key={index}
                    icon={service.icon}
                    title={service.title}
                    description={service.description}
                    color={service.color}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {!error && statistics && (
          <div className="text-center text-sm text-gray-500">
            <div className="inline-flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>
                System operational • Last updated:{" "}
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
