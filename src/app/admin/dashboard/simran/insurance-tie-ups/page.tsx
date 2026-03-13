"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import {
  TabType,
  ModalMode,
  InsurancePartner,
  CorporateTieUp,
  InsuranceFormData,
  CorporateFormData,
} from "./types/types";
import { dummyInsurancePartners, dummyCorporateTieUps } from "./data/dummyData";

import InsuranceTable from "./components/InsuranceTable";
import CorporateTable from "./components/CorporateTable";
import InsuranceModal from "./modal/InsuranceModal";
import CorporateModal from "./modal/CorporateModal";
import Pagination from "@/app/components/common/pagination";

const ITEMS_PER_PAGE = 10;

const InsurancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("Insurance Partners");

  const [insurancePartners, setInsurancePartners] = useState<
    InsurancePartner[]
  >(dummyInsurancePartners);
  const [selectedInsurance, setSelectedInsurance] = useState<string[]>([]);
  const [insurancePage, setInsurancePage] = useState(0);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  const [insuranceModalMode, setInsuranceModalMode] =
    useState<ModalMode>("add");
  const [editingInsurance, setEditingInsurance] = useState<
    InsurancePartner | undefined
  >(undefined);

  const [corporateTieUps, setCorporateTieUps] =
    useState<CorporateTieUp[]>(dummyCorporateTieUps);
  const [selectedCorporate, setSelectedCorporate] = useState<string[]>([]);
  const [corporatePage, setCorporatePage] = useState(0);
  const [corporateModalOpen, setCorporateModalOpen] = useState(false);
  const [corporateModalMode, setCorporateModalMode] =
    useState<ModalMode>("add");
  const [editingCorporate, setEditingCorporate] = useState<
    CorporateTieUp | undefined
  >(undefined);

  const insurancePaged = insurancePartners.slice(
    insurancePage * ITEMS_PER_PAGE,
    (insurancePage + 1) * ITEMS_PER_PAGE,
  );
  const insuranceHasMore =
    (insurancePage + 1) * ITEMS_PER_PAGE < insurancePartners.length;

  const handleAddInsurance = () => {
    setInsuranceModalMode("add");
    setEditingInsurance(undefined);
    setInsuranceModalOpen(true);
  };

  const handleEditInsurance = (partner: InsurancePartner) => {
    setInsuranceModalMode("edit");
    setEditingInsurance(partner);
    setInsuranceModalOpen(true);
  };

  const handleInsuranceSubmit = (data: InsuranceFormData) => {
    if (insuranceModalMode === "add") {
      const newPartner: InsurancePartner = {
        id: uuidv4(),
        name: data.name,
        logo: data.logo,
        active: data.active,
        dateModified: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };
      setInsurancePartners((prev) => [newPartner, ...prev]);
    } else if (editingInsurance) {
      setInsurancePartners((prev) =>
        prev.map((p) =>
          p.id === editingInsurance.id
            ? {
                ...p,
                name: data.name,
                logo: data.logo,
                active: data.active,
                dateModified: new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              }
            : p,
        ),
      );
    }
  };

  const handleToggleInsuranceActive = (id: string) => {
    setInsurancePartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    );
  };

  const handleDeleteInsurance = (id: string) => {
    setInsurancePartners((prev) => prev.filter((p) => p.id !== id));
    setSelectedInsurance((prev) => prev.filter((sid) => sid !== id));
  };

  const handleSelectAllInsurance = (checked: boolean) => {
    setSelectedInsurance(checked ? insurancePaged.map((p) => p.id) : []);
  };

  const corporatePaged = corporateTieUps.slice(
    corporatePage * ITEMS_PER_PAGE,
    (corporatePage + 1) * ITEMS_PER_PAGE,
  );
  const corporateHasMore =
    (corporatePage + 1) * ITEMS_PER_PAGE < corporateTieUps.length;

  const handleAddCorporate = () => {
    setCorporateModalMode("add");
    setEditingCorporate(undefined);
    setCorporateModalOpen(true);
  };

  const handleEditCorporate = (tieUp: CorporateTieUp) => {
    setCorporateModalMode("edit");
    setEditingCorporate(tieUp);
    setCorporateModalOpen(true);
  };

  const handleCorporateSubmit = (data: CorporateFormData) => {
    if (corporateModalMode === "add") {
      const newTieUp: CorporateTieUp = {
        id: uuidv4(),
        companyName: data.companyName,
        sector: data.sector,
        logo: data.logo,
        active: data.active,
        dateModified: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };
      setCorporateTieUps((prev) => [newTieUp, ...prev]);
    } else if (editingCorporate) {
      setCorporateTieUps((prev) =>
        prev.map((c) =>
          c.id === editingCorporate.id
            ? {
                ...c,
                companyName: data.companyName,
                sector: data.sector,
                logo: data.logo,
                active: data.active,
                dateModified: new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              }
            : c,
        ),
      );
    }
  };

  const handleToggleCorporateActive = (id: string) => {
    setCorporateTieUps((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    );
  };

  const handleDeleteCorporate = (id: string) => {
    setCorporateTieUps((prev) => prev.filter((c) => c.id !== id));
    setSelectedCorporate((prev) => prev.filter((sid) => sid !== id));
  };

  const handleSelectAllCorporate = (checked: boolean) => {
    setSelectedCorporate(checked ? corporatePaged.map((c) => c.id) : []);
  };

  const isInsuranceTab = activeTab === "Insurance Partners";

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            {isInsuranceTab
              ? "Our Insurance Partners"
              : "Our Corporate Tie-Ups"}
          </h1>
          <button
            onClick={isInsuranceTab ? handleAddInsurance : handleAddCorporate}
            className="flex items-center gap-2 text-[12px] px-4 py-2 bg-[#0088B1] text-[#F8F8F8] rounded-lg hover:bg-[#00729A] cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
            {isInsuranceTab ? "Add Insurance Partner" : "Add Corporate Tie-Up"}
          </button>
        </div>

        <div className="flex mb-4">
          {(["Insurance Partners", "Corporate Tie-Ups"] as TabType[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-[#0088B1] text-[#F8F8F8]"
                    : "text-[#161D1F] hover:bg-[#E8F4F7] hover:text-[#0088B1] border border-gray-200"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              {isInsuranceTab
                ? `All Insurance Partners`
                : `All Corporate Tie-Ups`}
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                Showing{" "}
                {isInsuranceTab
                  ? `${insurancePaged.length} of ${insurancePartners.length}`
                  : `${corporatePaged.length} of ${corporateTieUps.length}`}{" "}
                records
              </span>
            </h3>
          </div>

          {isInsuranceTab ? (
            <InsuranceTable
              partners={insurancePaged}
              selectedIds={selectedInsurance}
              onSelectAll={handleSelectAllInsurance}
              onSelect={(id, checked) =>
                setSelectedInsurance((prev) =>
                  checked ? [...prev, id] : prev.filter((s) => s !== id),
                )
              }
              onEdit={handleEditInsurance}
              onToggleActive={handleToggleInsuranceActive}
              onDelete={handleDeleteInsurance}
            />
          ) : (
            <CorporateTable
              tieUps={corporatePaged}
              selectedIds={selectedCorporate}
              onSelectAll={handleSelectAllCorporate}
              onSelect={(id, checked) =>
                setSelectedCorporate((prev) =>
                  checked ? [...prev, id] : prev.filter((s) => s !== id),
                )
              }
              onEdit={handleEditCorporate}
              onToggleActive={handleToggleCorporateActive}
              onDelete={handleDeleteCorporate}
            />
          )}

          {isInsuranceTab && insurancePartners.length > 0 && (
            <Pagination
              currentPage={insurancePage}
              hasMore={insuranceHasMore}
              loading={false}
              onPrevious={() => setInsurancePage((p) => Math.max(0, p - 1))}
              onNext={() => setInsurancePage((p) => p + 1)}
              totalItems={insurancePartners.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
          {!isInsuranceTab && corporateTieUps.length > 0 && (
            <Pagination
              currentPage={corporatePage}
              hasMore={corporateHasMore}
              loading={false}
              onPrevious={() => setCorporatePage((p) => Math.max(0, p - 1))}
              onNext={() => setCorporatePage((p) => p + 1)}
              totalItems={corporateTieUps.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </div>
      </div>

      <InsuranceModal
        isOpen={insuranceModalOpen}
        onClose={() => setInsuranceModalOpen(false)}
        mode={insuranceModalMode}
        initialData={editingInsurance}
        onSubmit={handleInsuranceSubmit}
      />
      <CorporateModal
        isOpen={corporateModalOpen}
        onClose={() => setCorporateModalOpen(false)}
        mode={corporateModalMode}
        initialData={editingCorporate}
        onSubmit={handleCorporateSubmit}
      />
    </div>
  );
};

export default InsurancePage;
