"use client";
import React, { useRef, useState } from "react";
import { Search, ArrowUpDown, ClipboardList } from "lucide-react";

import { Lead, LEAD_FILTER_OPTIONS, ALL_LEADS_FILTER } from "./type/type";
import { dummyLeads } from "./data/leadDummyData";
import { StatsCard } from "@/app/components/common/StatsCard";
import Pagination from "@/app/components/common/pagination";
import DropdownSelector from "@/app/components/ui/DropdownSelector";
import LeadTable from "./components/LeadTable";
import LeadDetailModal from "./modal/LeadDetailModal";

const ITEMS_PER_PAGE = 20;

const BookingLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(dummyLeads);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_LEADS_FILTER);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  const total = leads.length;
  const newLeads = leads.filter((l) => l.leadStatus === "New").length;
  const inProgress = leads.filter((l) => l.leadStatus === "In-Progress").length;
  const converted = leads.filter((l) => l.leadStatus === "Converted").length;

  const filtered = leads.filter((l) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      l.patientName.toLowerCase().includes(term) ||
      l.phone.toLowerCase().includes(term) ||
      l.emailId.toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === ALL_LEADS_FILTER || l.leadStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filtered.length;
  const hasMore = (currentPage + 1) * ITEMS_PER_PAGE < totalItems;
  const paged = filtered.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE,
  );

  const handleMarkInProgress = (id: string) =>
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, leadStatus: "In-Progress" } : l)),
    );

  const handleMarkConverted = (id: string) =>
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, leadStatus: "Converted" } : l)),
    );

  const handleDelete = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setSelectedIds((prev) => prev.filter((s) => s !== id));
  };

  const handleSelectAll = (checked: boolean) =>
    setSelectedIds(checked ? paged.map((l) => l.id) : []);

  const handleView = (lead: Lead) => {
    setViewingLead(lead);
    setViewModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-[20px] font-semibold text-[#161D1F]">
            Booking Leads
          </h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatsCard
            title="Total Leads"
            stats={total}
            icon={<ClipboardList className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
          <StatsCard
            title="New Leads"
            stats={newLeads}
            subtitle={`${((newLeads / total) * 100).toFixed(1)}% of total leads`}
            icon={<ClipboardList className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
          <StatsCard
            title="In-Progress"
            stats={inProgress}
            subtitle={`${((inProgress / total) * 100).toFixed(1)}% of total leads`}
            icon={<ClipboardList className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
          <StatsCard
            title="Converted"
            stats={converted}
            subtitle={`${((converted / total) * 100).toFixed(1)}% of total leads`}
            icon={<ClipboardList className="h-5 w-5" />}
            color="text-[#0088B1] bg-[#E8F4F7] p-2 rounded-lg"
          />
        </div>

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
            options={LEAD_FILTER_OPTIONS}
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

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[16px] font-medium text-[#161D1F]">
              All Booking Leads
              <span className="text-[8px] text-[#899193] font-normal ml-2">
                Showing {paged.length} of {totalItems} leads
              </span>
            </h3>
          </div>

          <LeadTable
            leads={paged}
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
              loading={false}
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
