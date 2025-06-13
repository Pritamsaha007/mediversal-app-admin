"use client";

import React, { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { PrescriptionData, MedicationTab } from "../types/prescription";

interface MedicationsTabProps {
  formData: PrescriptionData;
  onInputChange: (
    section: keyof PrescriptionData,
    field: string,
    value: any
  ) => void;
  onAddMedication: (medication: MedicationTab) => void;
  onUpdateMedication: (index: number, field: string, value: number) => void;
  onRemoveMedication: (index: number) => void;
}

const MedicationsTab: React.FC<MedicationsTabProps> = ({
  formData,
  onAddMedication,
  onUpdateMedication,
  onRemoveMedication,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock available medications
  const availableMedications: MedicationTab[] = [
    {
      id: "med-001",
      productName: "Ibuprofen 400mg",
      price: 30.75,
      medCode: "MED-003",
      provider: "MedCare",
      category: "Anti-inflammatory",
      generic: "N/A",
    },
    {
      id: "med-002",
      productName: "Paracetamol 500mg",
      price: 25.5,
      medCode: "MED-004",
      provider: "MedCare",
      category: "Pain Relief",
      generic: "Available",
    },
    {
      id: "med-003",
      productName: "Amoxicillin 250mg",
      price: 45.0,
      medCode: "MED-005",
      provider: "PharmaCorp",
      category: "Antibiotic",
      generic: "Available",
    },
  ];

  const filteredMedications = availableMedications.filter((med) =>
    med.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Medications */}
      <div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#899193]"
            size={20}
          />
          <input
            type="text"
            placeholder="Search medications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#E8F6FB] text-[10px] text-[#B0B6B8] border border-[#0088B1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088B1] focus:border-transparent"
          />
        </div>
      </div>

      {/* Available Medications Table */}
      <div>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#899193] uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#899193] uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#899193] uppercase tracking-wider">
                  Generic
                </th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#899193] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedications.map((medication) => (
                <tr key={medication.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-[10px] font-medium text-[#161D1F]">
                        {medication.productName}
                      </div>
                      <div className="text-[10px] text-[#899193]">
                        {medication.medCode} | {medication.provider}
                      </div>
                      <div className="text-[10px] text-[#899193]">
                        {medication.category}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-[#161D1F]">
                    ₹{medication.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-[10px] text-[#161D1F]">
                    {medication.generic}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onAddMedication(medication)}
                      className="text-[#0088B1] hover:text-[#006b8f] font-medium text-[10px]"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Items */}
      {formData.medications.length > 0 && (
        <div>
          <h3 className="text-[#161D1F] mb-4 text-sm text-[10px] font-medium">
            Order Items
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#899193] uppercase tracking-wider">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#899193] uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#899193] uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#899193] uppercase tracking-wider">
                    Dosage
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#899193] uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#899193] uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-[#899193] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.medications.map((medication, index) => (
                  <tr key={`${medication.id}-${index}`}>
                    <td className="px-4 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-[10px] font-medium text-[#161D1F]">
                          {medication.productName}
                        </div>
                        <div className="text-[10px] text-[#899193]">
                          {medication.medCode} | {medication.provider}
                        </div>
                        <div className="text-[10px] text-[#899193]">
                          Price: ₹{medication.price.toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        value={medication.quantity}
                        onChange={(e) =>
                          onUpdateMedication(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-16 px-2 py-1 border text-[#161D1F] text-[10px] border-gray-200 rounded text-center focus:outline-none focus:ring-2 focus:ring-[#0088B1]"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        value={medication.dosage}
                        onChange={(e) =>
                          onUpdateMedication(
                            index,
                            "dosage",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-16 px-2 py-1 border text-[#161D1F] text-[10px] border-gray-200 rounded text-center focus:outline-none focus:ring-2 focus:ring-[#0088B1]"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        value={medication.frequency}
                        onChange={(e) =>
                          onUpdateMedication(
                            index,
                            "frequency",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-16 px-2 py-1 text-[#161D1F] text-[10px] border border-gray-200 rounded text-center focus:outline-none focus:ring-2 focus:ring-[#0088B1]"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        value={medication.duration}
                        onChange={(e) =>
                          onUpdateMedication(
                            index,
                            "duration",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-16 px-2 py-1 border text-[#161D1F] text-[10px] border-gray-200 rounded text-center focus:outline-none focus:ring-2 focus:ring-[#0088B1]"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => onRemoveMedication(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default MedicationsTab;
