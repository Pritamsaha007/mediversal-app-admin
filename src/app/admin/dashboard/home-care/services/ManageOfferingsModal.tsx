"use client";
import React, { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import OfferingCard from "./OfferingCard";
import AddOfferingForm from "./AddOfferingForm";
import toast from "react-hot-toast";

interface Offering {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  staffRequirements: string[];
  equipmentIncluded: string[];
  status: "Excellent" | "Good" | "Available";
}

interface Service {
  id: string;
  name: string;
  description: string;
  offerings: Offering[];
  rating?: number;
  reviewCount?: number;
}

interface ManageOfferingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

const ManageOfferingsModal: React.FC<ManageOfferingsModalProps> = ({
  isOpen,
  onClose,
  service,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);

  // Sample data - replace with actual service data
  const sampleOfferings: Offering[] = [
    {
      id: "1",
      name: "Oxygen Concentrator",
      description: "5L capacity, continuous oxygen supply",
      price: 200,
      duration: "day",
      features: [
        "5L capacity",
        "Continuous flow",
        "Low noise operation",
        "Power backup support",
        "24/7 technical support",
      ],
      staffRequirements: ["Medical Prescription", "Medical Prescription"],
      equipmentIncluded: ["Oxygen Concentrator", "Nasal Cannula", "Tubing"],
      status: "Excellent",
    },
    {
      id: "2",
      name: "Hospital Bed",
      description: "Fully electric with adjustable height and backrest",
      price: 350,
      duration: "day",
      features: [
        "Fully electric",
        "Adjustable height",
        "Adjustable backrest",
        "Side rails included",
        "Emergency controls",
      ],
      staffRequirements: ["Medical Prescription"],
      equipmentIncluded: ["Hospital Bed", "Mattress", "Side Rails"],
      status: "Good",
    },
  ];

  // Initialize offerings when service changes
  useEffect(() => {
    if (service) {
      const serviceOfferings = service.offerings || [];
      const combinedOfferings =
        serviceOfferings.length > 0
          ? [...serviceOfferings]
          : [...sampleOfferings];
      setOfferings(combinedOfferings);
    }
  }, [service]);

  const handleAddOffering = (newOffering: Omit<Offering, "id">) => {
    if (editingOffering) {
      const updatedOffering: Offering = {
        ...newOffering,
        id: editingOffering.id,
      };
      setOfferings((prev) =>
        prev.map((offering) =>
          offering.id === editingOffering.id ? updatedOffering : offering
        )
      );
      toast.success("Offering updated successfully!");
    } else {
      const offering: Offering = {
        ...newOffering,
        id: Date.now().toString(),
      };
      setOfferings((prev) => [...prev, offering]);
      toast.success("Offering added successfully!");
    }
    setShowAddForm(false);
    setEditingOffering(null);
  };

  const handleEditOffering = (offering: Offering) => {
    setEditingOffering(offering);
    setShowAddForm(true);
  };

  const handleDeleteOffering = (offeringId: string) => {
    setOfferings((prev) => prev.filter((o) => o.id !== offeringId));
    toast.success("Offering deleted successfully!");
  };

  if (!isOpen || !service) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-[14px] font-medium text-[#161D1F]">
              Manage Offerings
            </h2>
            <button
              onClick={onClose}
              className="text-[#161D1F] hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Service Info Header */}
          <div className="bg-[#0088B1] text-white p-6 m-6 rounded-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-[12px] font-semibold text-[#F8F8F8] mb-2">
                  {service.name}
                </h3>
                <p className=" text-[10px] text-[#F8F8F8]">
                  {service.description}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px]">Rating & Review:</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-[10px]">
                    {service.rating || 4.6} ({service.reviewCount || 420})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[14px] font-semibold text-[#161D1F]">
                Service Offerings ({offerings.length})
              </h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-[#0088B1] text-white rounded-md hover:bg-[#00729A] text-[10px]"
              >
                Add Offering
              </button>
            </div>

            {/* Offerings List - Enhanced scrollable area */}
            <div className="max-h-[400px] overflow-y-auto pr-2">
              {offerings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No offerings available. Click "Add Offering" to create one.
                </div>
              ) : (
                <div className="space-y-4">
                  {offerings.map((offering) => (
                    <OfferingCard
                      key={offering.id}
                      offering={offering}
                      onEdit={handleEditOffering}
                      onDelete={handleDeleteOffering}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddOfferingForm
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setEditingOffering(null);
        }}
        onSubmit={handleAddOffering}
        serviceName={service.name}
        serviceId={service.id}
        editingOffering={editingOffering}
      />
    </>
  );
};

export default ManageOfferingsModal;
