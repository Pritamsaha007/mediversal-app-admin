"use client";
import React from "react";
import { useServiceStore } from "./store/serviceStore";
import ServicesListPage from "./components/ServicesListPage";
import DepartmentsPage from "./components/DepartmentsPage";
import ProceduresPage from "./components/ProceduresPage";

const OurServicesPage: React.FC = () => {
  const { viewLevel, selectedService, selectedDepartment } = useServiceStore();

  if (viewLevel === "procedures" && selectedService && selectedDepartment) {
    return <ProceduresPage />;
  }
  if (viewLevel === "departments" && selectedService) {
    return <DepartmentsPage />;
  }
  return <ServicesListPage />;
};

export default OurServicesPage;
