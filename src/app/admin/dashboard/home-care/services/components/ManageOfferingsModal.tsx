"use client";
import React, { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import OfferingCard from "./OfferingCard";
import AddOfferingForm from "./AddOfferingForm";
import toast from "react-hot-toast";
import { getHomecareOfferings, deleteHomecareOffering } from "../service";
import { useAdminStore } from "@/app/store/adminStore";
import { OfferingResponse } from "../types";

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
  const { token } = useAdminStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);
  const [loadingOfferings, setLoadingOfferings] = useState(false);

  useEffect(() => {
    const fetchOfferings = async () => {
      if (!service || !token) return;

      setLoadingOfferings(true);
      console.log("Fetching offerings for service:", service.id);

      try {
        const response = await getHomecareOfferings(
          { service_id: service.id },
          token
        );

        if (response.success) {
          console.log("Fetched offerings:", response.offerings);

          const transformedOfferings: Offering[] = response.offerings.map(
            (offering: OfferingResponse) => ({
              id: offering.id,
              name: offering.name,
              description: offering.description,
              price: parseFloat(offering.price),
              duration: `${offering.duration_in_hrs} ${offering.duration_type}`,
              features: offering.features,
              staffRequirements: offering.staff_requirements,
              equipmentIncluded: offering.equipment_requirements,
              status:
                offering.status === "Active" ? "Available" : ("Good" as const),
            })
          );

          setOfferings(transformedOfferings);
        }
      } catch (error) {
        console.error("Error fetching offerings:", error);
        toast.error("Failed to load offerings");
        setOfferings([]);
      } finally {
        setLoadingOfferings(false);
      }
    };

    if (isOpen && service) {
      fetchOfferings();
    }
  }, [isOpen, service, token]);

  const handleAddOffering = async (newOffering: Omit<Offering, "id">) => {
    try {
      const response = await getHomecareOfferings(
        { service_id: service!.id },
        token!
      );

      if (response.success) {
        const transformedOfferings: Offering[] = response.offerings.map(
          (offering: OfferingResponse) => ({
            id: offering.id,
            name: offering.name,
            description: offering.description,
            price: parseFloat(offering.price),
            duration: `${offering.duration_in_hrs} ${offering.duration_type}`,
            features: offering.features,
            staffRequirements: offering.staff_requirements,
            equipmentIncluded: offering.equipment_requirements,
            status:
              offering.status === "Active" ? "Available" : ("Good" as const),
          })
        );

        setOfferings(transformedOfferings);
        toast.success(
          editingOffering
            ? "Offering updated successfully!"
            : "Offering added successfully!"
        );
      }
    } catch (error) {
      console.error("Error refreshing offerings:", error);
    }

    setShowAddForm(false);
    setEditingOffering(null);
  };

  const handleEditOffering = (offering: Offering) => {
    setEditingOffering(offering);
    setShowAddForm(true);
  };

  const handleDeleteOffering = async (offeringId: string) => {
    console.log("Delete offering requested for ID:", offeringId);

    const confirmed = await new Promise<boolean>((resolve) => {
      const toastId = toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <span>Are you sure you want to delete this offering?</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.dismiss(toastId);
                  resolve(true);
                }}
                className="px-3 py-1 bg-red-400 text-white rounded text-sm"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  toast.dismiss(toastId);
                  resolve(false);
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
        }
      );
    });

    if (confirmed) {
      try {
        setLoadingOfferings(true);
        console.log("Proceeding with delete for offering:", offeringId);

        await deleteHomecareOffering(offeringId, token!);

        console.log("Offering deleted successfully, refreshing list...");
        toast.success("Offering deleted successfully!");

        const response = await getHomecareOfferings(
          { service_id: service!.id },
          token!
        );

        if (response.success) {
          const transformedOfferings: Offering[] = response.offerings.map(
            (offering: OfferingResponse) => ({
              id: offering.id,
              name: offering.name,
              description: offering.description,
              price: parseFloat(offering.price),
              duration: `${offering.duration_in_hrs} ${offering.duration_type}`,
              features: offering.features,
              staffRequirements: offering.staff_requirements,
              equipmentIncluded: offering.equipment_requirements,
              status:
                offering.status === "Active" ? "Available" : ("Good" as const),
            })
          );

          setOfferings(transformedOfferings);
        }
      } catch (error: any) {
        console.error("Error deleting offering:", error);
        toast.error(error.message || "Failed to delete offering");
      } finally {
        setLoadingOfferings(false);
      }
    }
  };

  if (!isOpen || !service) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
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

            <div className="max-h-[400px] overflow-y-auto pr-2">
              {loadingOfferings ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-sm">Loading offerings...</div>
                </div>
              ) : offerings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No offerings available for this service. Click "Add Offering"
                  to create one.
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
