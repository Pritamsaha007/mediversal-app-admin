"use client";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  CornerDownRight,
  LayoutDashboard,
  PillIcon,
  BadgePercent,
  Ambulance,
  Funnel,
  Laptop,
  Bike,
  BookUser,
  BellRing,
} from "lucide-react";
import MainMediversalLogo from "../../../../public/Mediversal 247 Logo.svg";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  subItems?: {
    name: string;
    link: string;
  }[];
}

import { usePathname, useRouter } from "next/navigation";

const Sidebar = () => {
  const [selectedMenu, setSelectedMenu] = useState<string>("Dashboard");
  const [openMenu, setOpenMenu] = useState<string | null>("Dashboard");
  const [selectedSubMenu, setSelectedSubMenu] = useState<string | null>(
    "Overview",
  );
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [hoveredSubMenu, setHoveredSubMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      subItems: [
        {
          name: "Overview",
          link: "/admin/dashboard/overview",
        },
      ],
    },
    {
      name: "User Analytics",
      icon: <BookUser size={18} />,
      subItems: [
        {
          name: "All Customers",
          link: "/admin/dashboard/customer",
        },
      ],
    },
    {
      name: "Pharmacy",
      icon: <PillIcon size={18} />,
      subItems: [
        {
          name: "Products",
          link: "/admin/dashboard/pharmacy/product",
        },
        { name: "Order", link: "/admin/dashboard/pharmacy/order" },
      ],
    },
    {
      name: "Coupons",
      icon: <BadgePercent size={18} />,
      subItems: [
        {
          name: "Coupons",
          link: "/admin/dashboard/coupons",
        },
      ],
    },
    {
      name: "Home Care",
      icon: <Ambulance size={18} />,
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
      ],
    },
    {
      name: "Consultations",
      icon: <Laptop size={18} />,
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
      ],
    },
    {
      name: "Lab Tests",
      icon: <Funnel size={18} />,
      subItems: [
        {
          name: "Pathology Tests",
          link: "/admin/dashboard/lab_tests/pathology_tests",
        },
        {
          name: "Radiology Tests",
          link: "/admin/dashboard/lab_tests/radiology_tests",
        },
        {
          name: "Health Packages",
          link: "/admin/dashboard/lab_tests/health_package",
        },
        {
          name: "Bookings",
          link: "/admin/dashboard/lab_tests/bookings",
        },
        {
          name: "Phlebotomists",
          link: "/admin/dashboard/lab_tests/phlebotomists",
        },
        {
          name: "Reports",
          link: "/admin/dashboard/lab_tests/reports",
        },
      ],
    },
    {
      name: "Riders",
      icon: <Bike size={18} />,
      subItems: [
        {
          name: "Delivery Riders",
          link: "/admin/dashboard/rider/deliveryRiders",
        },
        {
          name: "Bookings",
          link: "/admin/dashboard/rider/bookings",
        },
      ],
    },
    {
      name: "Push Notification",
      icon: <BellRing size={18} />,
      subItems: [
        {
          name: "Notifications",
          link: "/admin/dashboard/push-notification",
        },
      ],
    },
  ];

  useEffect(() => {
    let foundMatch = false;

    menuItems.forEach((menu) => {
      if (menu.subItems && menu.subItems.length > 0) {
        const matchingSubItem = menu.subItems.find((sub) =>
          pathname.startsWith(sub.link),
        );

        if (matchingSubItem) {
          setSelectedMenu(menu.name);
          setOpenMenu(menu.name);
          setSelectedSubMenu(matchingSubItem.name);
          foundMatch = true;
        }
      }
    });

    if (!foundMatch) {
      setSelectedMenu("Dashboard");
      setOpenMenu("Dashboard");
      setSelectedSubMenu("Overview");
    }
  }, [pathname]);

  const toggleMenu = (menuName: string) => {
    if (openMenu === menuName) {
      setOpenMenu(null);
    } else {
      setOpenMenu(menuName);
      setSelectedMenu(menuName);

      const menu = menuItems.find((m) => m.name === menuName);
      if (menu?.subItems && menu.subItems.length > 0) {
        const firstSubItem = menu.subItems[0];
        setSelectedSubMenu(firstSubItem.name);

        router.push(firstSubItem.link);
      }
    }
  };

  const handleSubMenuClick = (subMenuName: string) => {
    setSelectedSubMenu(subMenuName);
  };

  return (
    <div className="flex flex-col h-screen w-[302px] bg-white shadow-xl">
      <motion.div
        className="flex items-center justify-center h-[80px] p-10"
        whileHover="hover"
      >
        <Image
          src={MainMediversalLogo}
          alt="Mediversal 247 Logo"
          width={400}
          height={200}
          className="w-full max-w-sm mx-auto"
          priority
        />
      </motion.div>

      <div className="border-t border-[#D3D7D8]"></div>

      <div className="flex flex-col overflow-y-auto py-6 px-2 space-y-1 justify-center items-center">
        {menuItems.map((menu) => (
          <div key={menu.name} className="mb-2 w-full">
            <motion.div
              className={`flex items-center justify-between px-4 py-2 cursor-pointer rounded-lg w-[254px] h-[40px] mx-auto
                ${
                  selectedMenu === menu.name
                    ? "bg-[#0088B1] text-[#F8F8F8] shadow-lg"
                    : "bg-white text-[#161D1F] hover:bg-gray-100"
                }
                transition-colors duration-150 ease-in-out relative overflow-hidden`}
              onClick={() => toggleMenu(menu.name)}
              onHoverStart={() => setHoveredMenu(menu.name)}
              onHoverEnd={() => setHoveredMenu(null)}
              whileHover="hover"
              whileTap="tap"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={
                  hoveredMenu === menu.name ? { x: "100%" } : { x: "-100%" }
                }
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />

              <div className="flex items-center relative z-10">
                <motion.span
                  className={`mr-3 ${selectedMenu === menu.name ? "text-[#F8F8F8]" : "text-[#161D1F]"}`}
                  whileHover="hover"
                >
                  {menu.icon}
                </motion.span>
                <span className="text-sm font-medium">{menu.name}</span>
              </div>

              {menu.subItems && (
                <motion.span
                  className={`relative z-10 transition-transform duration-150 ${
                    selectedMenu === menu.name
                      ? "text-[#F8F8F8]"
                      : "text-[#161D1F]"
                  }`}
                  animate={{
                    rotate: openMenu === menu.name ? 180 : 0,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  <ChevronDown size={16} />
                </motion.span>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {openMenu === menu.name && menu.subItems && (
                <motion.div
                  className="mt-2 rounded-lg space-y-2 py-1 pl-2 overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {menu.subItems.map((subItem, index) => (
                    <Link href={subItem.link} key={subItem.name}>
                      <motion.div
                        className={`flex items-center px-4 py-2 cursor-pointer rounded-md mx-auto w-[234px] h-[36px]
                          ${
                            selectedSubMenu === subItem.name
                              ? "bg-[#D0E8F0] text-[#161D1F] font-medium shadow-md"
                              : "text-[#161D1F] hover:bg-[#E6F4F8]"
                          }
                          transition-colors duration-150 ease-in-out relative overflow-hidden`}
                        onClick={() => handleSubMenuClick(subItem.name)}
                        onHoverStart={() => setHoveredSubMenu(subItem.name)}
                        onHoverEnd={() => setHoveredSubMenu(null)}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          initial={{ x: "-100%" }}
                          animate={
                            hoveredSubMenu === subItem.name
                              ? { x: "100%" }
                              : { x: "-100%" }
                          }
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        />

                        <div className="relative z-10 flex items-center">
                          <CornerDownRight
                            size={14}
                            className="mr-3 text-[#161D1F]"
                          />
                          <span className="text-sm">{subItem.name}</span>
                        </div>

                        {selectedSubMenu === subItem.name && (
                          <motion.div
                            className="absolute left-0 w-1 h-6 bg-[#0088B1] rounded-r-full"
                            layoutId="activeSubMenuIndicator"
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
