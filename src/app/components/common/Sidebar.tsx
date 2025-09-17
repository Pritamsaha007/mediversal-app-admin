"use client";
import { useEffect, useState } from "react";
import {
  LucideComputer,
  ChevronRight,
  ChevronDown,
  CornerDownRight,
} from "lucide-react";
import MainMediversalLogo from "../../../../public/Mediversal FLogo - Color 1.svg";
import Image from "next/image";
import Link from "next/link";

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  subItems?: {
    name: string;
    link: string;
  }[];
}

import { usePathname } from "next/navigation";

const Sidebar = () => {
  const [selectedMenu, setSelectedMenu] = useState<string>("Dashboard");
  const [openMenu, setOpenMenu] = useState<string | null>("Front Desk");
  const [selectedSubMenu, setSelectedSubMenu] = useState<string | null>(
    "Patient Search"
  );
  const pathname = usePathname();
  useEffect(() => {
    menuItems.forEach((menu) => {
      menu.subItems?.forEach((sub) => {
        if (pathname.startsWith(sub.link)) {
          setSelectedMenu(menu.name);
          setOpenMenu(menu.name);
          setSelectedSubMenu(sub.name);
        }
      });
    });
  }, [pathname]);

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      icon: <LucideComputer size={18} />,
      // subItems: [
      //   {
      //     name: "Order Management",
      //     link: "/admin/dashboard/order-management",
      //   },
      // ],
    },
    {
      name: "Pharmacy",
      icon: <LucideComputer size={18} />,
      subItems: [
        {
          name: "Products",
          link: "/admin/dashboard/pharmacy/product",
        },
        { name: "Order", link: "/admin/dashboard/pharmacy/order" },
        // {
        //   name: "Inventory",
        //   link: "/admin/dashboard/pharmacy/inventory",
        // },
        // {
        //   name: "Prescription",
        //   link: "/admin/dashboard/pharmacy/prescription",
        // },
      ],
    },

    // {
    //   name: "Patient",
    //   icon: <LucideComputer size={18} />,
    //   // subItems: [
    //   //   {
    //   //     name: "Create Permission",
    //   //     link: "/dashboard/user-management/create-permission",
    //   //   },
    //   //   { name: "Create Role", link: "/dashboard/user-management/create-role" },
    //   //   { name: "Role List", link: "/dashboard/user-management/role-list" },
    //   //   {
    //   //     name: "List Access Permission",
    //   //     link: "/dashboard/user-management/list-access-role",
    //   //   },
    //   // ],
    // },
    {
      name: "Coupons",
      icon: <LucideComputer size={18} />,
      subItems: [
        {
          name: "Coupons",
          link: "/admin/dashboard/coupons/coupons",
        },
        // { name: "Create Role", link: "/dashboard/user-management/create-role" },
        // { name: "Role List", link: "/dashboard/user-management/role-list" },
        // {
        //   name: "List Access Permission",
        //   link: "/dashboard/user-management/list-access-role",
        // },
      ],
    },
    {
      name: "Home Care",
      icon: <LucideComputer size={18} />,
      subItems: [
        {
          name: "Services",
          link: "/admin/dashboard/home-care/services",
        },
        {
          name: "Booking",
          link: "/admin/dashboard/home-care/booking",
        },
        {
          name: "Staff",
          link: "/admin/dashboard/home-care/staff",
        },
        // {
        //   name: "Care Plan",
        //   link: "/admin/dashboard/home-care/care-plan",
        // },
      ],
    },
    {
      name: "Consultations",
      icon: <LucideComputer size={18} />,
      subItems: [
        {
          name: "Doctors",
          link: "/admin/dashboard/consultations/doctors",
        },
        {
          name: "Hospitals",
          link: "/admin/dashboard/consultations/hospitals",
        },
        {
          name: "Consultations",
          link: "/admin/dashboard/consultations/consultation",
        },
        // {
        //   name: "Orders",
        //   link: "/admin/dashboard/consultations/orders",
        // },
      ],
    },
  ];

  const toggleMenu = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
    setSelectedMenu(menuName);
  };
  const handleSubMenuClick = (subMenuName: string) => {
    setSelectedSubMenu(subMenuName);
  };

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
          <div key={menu.name} className="mb-2 w-full">
            {/* Main Menu Item */}
            <div
              className={`flex items-center justify-between px-4 py-2 cursor-pointer rounded-lg w-[254px] h-[40px] mx-auto
                ${
                  selectedMenu === menu.name
                    ? "bg-[#0088B1] text-[#F8F8F8] shadow-sm"
                    : "bg-white text-[#161D1F] hover:bg-gray-100"
                }
                transition-all duration-300 ease-in-out`}
              onClick={() => toggleMenu(menu.name)}
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
              {menu.subItems && (
                <span
                  className={
                    selectedMenu === menu.name
                      ? "text-[#F8F8F8]"
                      : "text-[#161D1F]"
                  }
                >
                  {openMenu === menu.name ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </span>
              )}
            </div>

            {/* Sub Menu Items */}
            {openMenu === menu.name && menu.subItems && (
              <div className="mt-2 rounded-lg space-y-2 py-1 pl-2">
                {menu.subItems.map((subItem) => (
                  <Link href={subItem.link} key={subItem.name}>
                    <div
                      className={`flex items-center px-4 py-2 cursor-pointer rounded-md mx-auto w-[234px] h-[36px]
                        ${
                          selectedSubMenu === subItem.name
                            ? "bg-[#D0E8F0] text-[#161D1F] font-medium"
                            : "text-[#161D1F] hover:bg-[#E6F4F8] hover:my-0.5"
                        }
                        transition-all duration-200 ease-in-out`}
                      onClick={() => handleSubMenuClick(subItem.name)}
                    >
                      <CornerDownRight
                        size={14}
                        className="mr-3 text-[#161D1F]"
                      />
                      <span className="text-sm">{subItem.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
