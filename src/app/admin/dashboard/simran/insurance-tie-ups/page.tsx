"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";

import {
  TabType,
  ModalMode,
  InsurancePartner,
  CorporateTieUp,
  InsuranceFormData,
  CorporateFormData,
} from "./types/types";

import {
  searchInsurancePartners,
  saveInsurancePartner,
  toggleInsuranceActive,
  deleteInsurancePartner,
  searchCorporateTieUps,
  saveCorporateTieUp,
  toggleCorporateActive,
  deleteCorporateTieUp,
  fetchEnums,
  EnumCodes,
  EnumItem,
  InsurancePartnerAPI,
  CorporateTieUpAPI,
} from "./services/insuranceCorporateService";

import { useAdminStore } from "@/app/store/adminStore";
import InsuranceTable from "./components/InsuranceTable";
import CorporateTable from "./components/CorporateTable";
import InsuranceModal from "./modal/InsuranceModal";
import CorporateModal from "./modal/CorporateModal";
import Pagination from "@/app/components/common/pagination";

const ITEMS_PER_PAGE = 10;

const mapInsurance = (d: InsurancePartnerAPI): InsurancePartner => ({
  id: d.id,
  name: d.name,
  logo: d.image_url,
  active: d.is_active,
  dateModified: new Date(d.updated_date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
});

const mapCorporate = (d: CorporateTieUpAPI): CorporateTieUp => ({
  id: d.id,
  companyName: d.name,
  sector: d.sector_name,
  logo: d.image_url,
  active: d.is_active,
  dateModified: new Date(d.updated_date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
});

const InsurancePage: React.FC = () => {
  const { token } = useAdminStore();

  const [activeTab, setActiveTab] = useState<TabType>("Insurance Partners");

  const [insurancePartners, setInsurancePartners] = useState<
    InsurancePartner[]
  >([]);
  const [insuranceRaw, setInsuranceRaw] = useState<InsurancePartnerAPI[]>([]);
  const [insuranceTotal, setInsuranceTotal] = useState(0);
  const [selectedInsurance, setSelectedInsurance] = useState<string[]>([]);
  const [insurancePage, setInsurancePage] = useState(0);
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  const [insuranceModalMode, setInsuranceModalMode] =
    useState<ModalMode>("add");
  const [editingInsurance, setEditingInsurance] = useState<
    InsurancePartner | undefined
  >(undefined);

  const [corporateTieUps, setCorporateTieUps] = useState<CorporateTieUp[]>([]);
  const [corporateRaw, setCorporateRaw] = useState<CorporateTieUpAPI[]>([]);
  const [corporateTotal, setCorporateTotal] = useState(0);
  const [selectedCorporate, setSelectedCorporate] = useState<string[]>([]);
  const [corporatePage, setCorporatePage] = useState(0);
  const [corporateLoading, setCorporateLoading] = useState(false);
  const [corporateModalOpen, setCorporateModalOpen] = useState(false);
  const [corporateModalMode, setCorporateModalMode] =
    useState<ModalMode>("add");
  const [editingCorporate, setEditingCorporate] = useState<
    CorporateTieUp | undefined
  >(undefined);

  const [sectorEnums, setSectorEnums] = useState<EnumItem[]>([]);

  useEffect(() => {
    if (!token) return;
    fetchEnums(EnumCodes.COMPANY_SECTOR, token)
      .then((res) => setSectorEnums(res.roles || []))
      .catch(console.error);
  }, [token]);

  const fetchInsurance = useCallback(
    async (page: number) => {
      if (!token) return;
      setInsuranceLoading(true);
      try {
        const res = await searchInsurancePartners(
          {
            search: null,
            filter_active: null,
            start: page * ITEMS_PER_PAGE,
            max: ITEMS_PER_PAGE,
            sort_by: "created_date",
            sort_order: "DESC",
          },
          token,
        );
        setInsuranceRaw(res.insuranceData || []);
        setInsurancePartners((res.insuranceData || []).map(mapInsurance));
        setInsuranceTotal(res.statics?.total_partners ?? 0);
      } catch (e) {
        console.error(e);
      } finally {
        setInsuranceLoading(false);
      }
    },
    [token],
  );

  const fetchCorporate = useCallback(
    async (page: number) => {
      if (!token) return;
      setCorporateLoading(true);
      try {
        const res = await searchCorporateTieUps(
          {
            search: null,
            filter_active: null,
            start: page * ITEMS_PER_PAGE,
            max: ITEMS_PER_PAGE,
            sort_by: "created_date",
            sort_order: "DESC",
          },
          token,
        );
        setCorporateRaw(res.corporates || []);
        setCorporateTieUps((res.corporates || []).map(mapCorporate));
        setCorporateTotal(res.statics?.total_corporates ?? 0);
      } catch (e) {
        console.error(e);
      } finally {
        setCorporateLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchInsurance(insurancePage);
  }, [insurancePage, fetchInsurance]);
  useEffect(() => {
    fetchCorporate(corporatePage);
  }, [corporatePage, fetchCorporate]);

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

  const handleInsuranceSubmit = async (data: InsuranceFormData) => {
    if (!token) return;
    try {
      const isEdit = insuranceModalMode === "edit" && editingInsurance;
      await saveInsurancePartner(
        {
          id: isEdit ? editingInsurance!.id : null,
          name: data.name,
          is_active: data.active,
          is_deleted: false,
          image_url: data.logo || "",
        },
        token,
      );
      fetchInsurance(insurancePage);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleInsuranceActive = async (id: string) => {
    if (!token) return;
    const raw = insuranceRaw.find((p) => p.id === id);
    if (!raw) return;
    try {
      await toggleInsuranceActive(raw, token);
      fetchInsurance(insurancePage);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteInsurance = async (id: string) => {
    if (!token) return;
    const raw = insuranceRaw.find((p) => p.id === id);
    if (!raw) return;
    try {
      await deleteInsurancePartner(raw, token);
      setSelectedInsurance((prev) => prev.filter((sid) => sid !== id));
      fetchInsurance(insurancePage);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectAllInsurance = (checked: boolean) => {
    setSelectedInsurance(checked ? insurancePartners.map((p) => p.id) : []);
  };

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

  const handleCorporateSubmit = async (data: CorporateFormData) => {
    if (!token) return;
    try {
      const isEdit = corporateModalMode === "edit" && editingCorporate;
      const sectorEnum = sectorEnums.find(
        (e) => e.value === data.sector || e.id === data.sector,
      );
      const sectorId = sectorEnum?.id || data.sector;
      await saveCorporateTieUp(
        {
          id: isEdit ? editingCorporate!.id : null,
          name: data.companyName,
          sector_id: sectorId,
          is_active: data.active,
          is_deleted: false,
          image_url: data.logo || "",
        },
        token,
      );
      fetchCorporate(corporatePage);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleCorporateActive = async (id: string) => {
    if (!token) return;
    const raw = corporateRaw.find((c) => c.id === id);
    if (!raw) return;
    const sectorEnum = sectorEnums.find((e) => e.value === raw.sector_name);
    const sectorId = sectorEnum?.id || "";
    try {
      await toggleCorporateActive(raw, sectorId, token);
      fetchCorporate(corporatePage);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCorporate = async (id: string) => {
    if (!token) return;
    const raw = corporateRaw.find((c) => c.id === id);
    if (!raw) return;
    const sectorEnum = sectorEnums.find((e) => e.value === raw.sector_name);
    const sectorId = sectorEnum?.id || "";
    try {
      await deleteCorporateTieUp(raw, sectorId, token);
      setSelectedCorporate((prev) => prev.filter((sid) => sid !== id));
      fetchCorporate(corporatePage);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectAllCorporate = (checked: boolean) => {
    setSelectedCorporate(checked ? corporateTieUps.map((c) => c.id) : []);
  };

  const isInsuranceTab = activeTab === "Insurance Partners";
  const insuranceHasMore =
    (insurancePage + 1) * ITEMS_PER_PAGE < insuranceTotal;
  const corporateHasMore =
    (corporatePage + 1) * ITEMS_PER_PAGE < corporateTotal;

  return (
    <div className="min-h-screen bg-gray-50">
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

        <div className="flex mb-4 border py-0.2 border-gray-200 rounded-lg overflow-hidden w-fit">
          {(["Insurance Partners", "Corporate Tie-Ups"] as TabType[]).map(
            (tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-[12px] font-medium transition-colors ${
                  index !== 0 ? "border-l border-gray-200" : ""
                } ${
                  activeTab === tab
                    ? "bg-[#0088B1] text-[#F8F8F8]"
                    : "text-[#161D1F] hover:bg-[#E8F4F7] hover:text-[#0088B1]"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        <div className="bg- rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              {isInsuranceTab
                ? "All Insurance Partners"
                : "All Corporate Tie-Ups"}
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                Showing{" "}
                {isInsuranceTab
                  ? `${insurancePartners.length} of ${insuranceTotal}`
                  : `${corporateTieUps.length} of ${corporateTotal}`}{" "}
                records
              </span>
            </h3>
          </div>

          {isInsuranceTab ? (
            <InsuranceTable
              partners={insurancePartners}
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
              loading={insuranceLoading}
            />
          ) : (
            <CorporateTable
              tieUps={corporateTieUps}
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
              loading={corporateLoading}
            />
          )}

          {isInsuranceTab && insuranceTotal > 0 && (
            <Pagination
              currentPage={insurancePage}
              hasMore={insuranceHasMore}
              loading={insuranceLoading}
              onPrevious={() => setInsurancePage((p) => Math.max(0, p - 1))}
              onNext={() => setInsurancePage((p) => p + 1)}
              totalItems={insuranceTotal}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
          {!isInsuranceTab && corporateTotal > 0 && (
            <Pagination
              currentPage={corporatePage}
              hasMore={corporateHasMore}
              loading={corporateLoading}
              onPrevious={() => setCorporatePage((p) => Math.max(0, p - 1))}
              onNext={() => setCorporatePage((p) => p + 1)}
              totalItems={corporateTotal}
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
        sectorEnums={sectorEnums}
      />
    </div>
  );
};

export default InsurancePage;
