"use client";
import { useState } from "react";
import {
  LucideComputer,
  LayoutDashboard,
  BadgeIndianRupee,
} from "lucide-react";
import MainMediversalLogo from "../../../../public/Mediversal FLogo - Color 1.svg";
import Image from "next/image";
import Link from "next/link";

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  link: string;
}

const Sidebar = () => {
  const [selectedMenu, setSelectedMenu] = useState<string>("Dashboard");

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      link: "/dashboard",
    },
    {
      name: "Order Management",
      icon: <BadgeIndianRupee size={18} />,
      link: "/dashboard/order-management",
    },
    {
      name: "User Management",
      icon: <LucideComputer size={18} />,
      link: "/dashboard", // You mentioned this twice — confirm if correct
    },
  ];

  return (
    <div className="flex flex-col h-screen w-[302px] bg-white shadow-md">
      {/* Logo */}
      <div className="flex items-center justify-center h-[80px] p-4">
        <Image
          src={MainMediversalLogo}
          alt="Doctor Illustration"
          width={400}
          height={200}
          className="w-full max-w-sm mx-auto"
        />
      </div>

      {/* Border */}
      <div className="border-t border-[#D3D7D8]"></div>

      {/* Menu Items */}
      <div className="flex flex-col overflow-y-auto py-6 px-2 space-y-1 justify-center items-center">
        {menuItems.map((menu) => (
          <Link href={menu.link} key={menu.name} className="w-full">
            <div
              className={`flex items-center justify-between px-4 py-2 cursor-pointer rounded-lg w-[254px] h-[40px] mx-auto
                ${
                  selectedMenu === menu.name
                    ? "bg-[#0088B1] text-[#F8F8F8] shadow-sm"
                    : "bg-white text-[#161D1F] hover:bg-gray-100"
                }
                transition-all duration-300 ease-in-out`}
              onClick={() => setSelectedMenu(menu.name)}
            >
              <div className="flex items-center">
                <span
                  className={`mr-3 ${
                    selectedMenu === menu.name
                      ? "text-[#F8F8F8]"
                      : "text-[#161D1F]"
                  }`}
                >
                  {menu.icon}
                </span>
                <span className="text-sm font-medium">{menu.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
