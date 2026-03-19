"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Search, ArrowUpDown, ClipboardList } from "lucide-react";

import { useAdminStore } from "@/app/store/adminStore";
import { Lead, ALL_LEADS_FILTER, mapApiItemToLead } from "./type/type";
import { LeadStatics, LeadStatusEnumItem } from "./services/leadService";
import { StatsCard } from "@/app/components/common/StatsCard";
import Pagination from "@/app/components/common/pagination";
import DropdownSelector from "@/app/components/ui/DropdownSelector";
import LeadTable from "./components/LeadTable";
import LeadDetailModal from "./modal/LeadDetailModal";
import {
  searchLeads,
  fetchLeadStatusEnums,
  updateLeadStatus,
} from "./services/leadService";

const ITEMS_PER_PAGE = 20;

const DEFAULT_STATICS: LeadStatics = {
  total_leads: 0,
  total_new_leads: 0,
  total_FollowUp_leads: 0,
  total_InProgress_leads: 0,
  total_Closed_leads: 0,
  total_Completed_leads: 0,
};

const BookingLeadsPage: React.FC = () => {
  // ── Auth token from admin store ───────────────────────────────────────────
  const { token } = useAdminStore();

  // ── Data state ────────────────────────────────────────────────────────────
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statics, setStatics] = useState<LeadStatics>(DEFAULT_STATICS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Status enum state ─────────────────────────────────────────────────────
  const [statusEnums, setStatusEnums] = useState<LeadStatusEnumItem[]>([]);
  const [filterOptions, setFilterOptions] = useState<string[]>([
    ALL_LEADS_FILTER,
  ]);

  // ── Filter / search / pagination ──────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_LEADS_FILTER);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  // ── Debounce ref ──────────────────────────────────────────────────────────
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch status enums once on mount ─────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetchLeadStatusEnums(token)
      .then((res) => {
        if (res.success && res.roles.length > 0) {
          setStatusEnums(res.roles);
          setFilterOptions([
            ALL_LEADS_FILTER,
            ...res.roles.map((r) => r.value),
          ]);
        }
      })
      .catch(console.error);
  }, [token]);

  // ── Core fetch ────────────────────────────────────────────────────────────
  const fetchLeads = useCallback(
    async (page: number, search: string, status: string) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await searchLeads(
          {
            start: page * ITEMS_PER_PAGE,
            max: ITEMS_PER_PAGE,
            search: search.trim() || null,
            filter_lead_status: status === ALL_LEADS_FILTER ? null : status,
            sort_by: "created_date",
            sort_order: "DESC",
          },
          token,
        );
        setLeads((res.leads || []).map(mapApiItemToLead));
        setStatics(res.statics ?? DEFAULT_STATICS);
      } catch (err: any) {
        setError(err?.message || "Failed to load leads.");
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  // ── Debounced trigger on filter / page change ────────────────────────────
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      fetchLeads(currentPage, searchTerm, statusFilter);
    }, 300);
    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [currentPage, searchTerm, statusFilter, fetchLeads]);

  // ── Status helpers ────────────────────────────────────────────────────────
  const getStatusId = (value: string): string | undefined =>
    statusEnums.find((e) => e.value.toLowerCase() === value.toLowerCase())?.id;

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    if (!token) return;
    const statusId = getStatusId(newStatus);
    if (!statusId) {
      console.warn(`No enum id found for status: ${newStatus}`);
      return;
    }
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, leadStatus: newStatus } : l)),
    );
    try {
      await updateLeadStatus({ id: leadId, lead_status_id: statusId }, token);
      // Refresh statics after status change
      fetchLeads(currentPage, searchTerm, statusFilter);
    } catch (err: any) {
      console.error("Failed to update lead status:", err?.message);
      // Revert on failure
      fetchLeads(currentPage, searchTerm, statusFilter);
    }
  };

  const handleMarkInProgress = (id: string) =>
    handleStatusChange(id, "In-Progress");

  const handleMarkConverted = (id: string) =>
    handleStatusChange(id, "Completed");

  const handleDelete = (id: string) => handleStatusChange(id, "Closed");

  // ── Selection ─────────────────────────────────────────────────────────────
  const handleSelectAll = (checked: boolean) =>
    setSelectedIds(checked ? leads.map((l) => l.id) : []);

  const handleView = (lead: Lead) => {
    setViewingLead(lead);
    setViewModalOpen(true);
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalItems = statics.total_leads;
  const hasMore = (currentPage + 1) * ITEMS_PER_PAGE < totalItems;

  const safePercent = (n: number) =>
    totalItems > 0
      ? `${((n / totalItems) * 100).toFixed(1)}% of total leads`
      : "0% of total leads";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Booking Leads
          </h1>
        </div>

        {/* Stats Cards — sourced from API statics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatsCard
            title="Total Leads"
            stats={statics.total_leads}
            icon={<ClipboardList className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
          <StatsCard
            title="New Leads"
            stats={statics.total_new_leads}
            subtitle={safePercent(statics.total_new_leads)}
            icon={<ClipboardList className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
          <StatsCard
            title="In-Progress"
            stats={statics.total_InProgress_leads}
            subtitle={safePercent(statics.total_InProgress_leads)}
            icon={<ClipboardList className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
          <StatsCard
            title="Completed"
            stats={statics.total_Completed_leads}
            subtitle={safePercent(statics.total_Completed_leads)}
            icon={<ClipboardList className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
        </div>

        {/* Search / Filter / Sort bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name, phone, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] placeholder-[#B0B6B8] focus:outline-none focus:border-[#0088B1] focus:ring-1 focus:ring-[#0088B1]"
            />
          </div>

          <DropdownSelector
            label=""
            options={filterOptions}
            selected={statusFilter}
            placeholder="All Leads"
            open={filterDropdownOpen}
            toggleOpen={() => setFilterDropdownOpen((o) => !o)}
            onSelect={(val) => {
              setStatusFilter(val);
              setCurrentPage(0);
            }}
          />

          <button className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E8E9] rounded-xl text-[12px] text-[#161D1F] hover:bg-gray-50 transition-colors">
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-[12px] text-red-600">
            {error}
          </div>
        )}

        {/* Table card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Booking Leads
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                Showing {leads.length} of {totalItems} leads
              </span>
            </h3>
          </div>

          <LeadTable
            leads={leads}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelect={(id, checked) =>
              setSelectedIds((prev) =>
                checked ? [...prev, id] : prev.filter((s) => s !== id),
              )
            }
            onView={handleView}
            onMarkInProgress={handleMarkInProgress}
            onMarkConverted={handleMarkConverted}
            onDelete={handleDelete}
            loading={loading}
          />

          <LeadDetailModal
            isOpen={viewModalOpen}
            lead={viewingLead}
            onClose={() => setViewModalOpen(false)}
          />

          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              hasMore={hasMore}
              loading={loading}
              onPrevious={() => setCurrentPage((p) => Math.max(0, p - 1))}
              onNext={() => setCurrentPage((p) => p + 1)}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingLeadsPage;
