"use client";
import React from "react";
import { useServiceStore } from "./store/serviceStore";
import SpecialtiesPage from "./components/SpecialtiesPage";
import SubDepartmentsPage from "./components/SubDepartmentsPage";
import ProceduresPage from "./components/ProceduresPage";

const OurServicesPage: React.FC = () => {
  const { viewLevel, selectedService, selectedDepartment } = useServiceStore();

  if (viewLevel === "procedures" && selectedService && selectedDepartment) {
    return <ProceduresPage />;
  }
  if (viewLevel === "departments" && selectedService) {
    return <SubDepartmentsPage />;
  }
  return <SpecialtiesPage />;
};

export default OurServicesPage;
