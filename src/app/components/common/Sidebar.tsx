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
  Building,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import MainMediversalLogo from "../../../../public/Mediversal 247 Logo.svg";
import MainMediversalGroupLogo from "../../../../public/Mediversal Simran-cropped.svg";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  subItems?: {
    name: string;
    link: string;
  }[];
}

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
      subItems: [{ name: "Overview", link: "/admin/dashboard/overview" }],
    },
    {
      name: "User Analytics",
      icon: <BookUser size={18} />,
      subItems: [{ name: "All Customers", link: "/admin/dashboard/customer" }],
    },
    {
      name: "Pharmacy",
      icon: <PillIcon size={18} />,
      subItems: [
        { name: "Products", link: "/admin/dashboard/pharmacy/product" },
        { name: "Order", link: "/admin/dashboard/pharmacy/order" },
      ],
    },
    {
      name: "Coupons",
      icon: <BadgePercent size={18} />,
      subItems: [{ name: "Coupons", link: "/admin/dashboard/coupons" }],
    },
    {
      name: "Home Care",
      icon: <Ambulance size={18} />,
      subItems: [
        { name: "Services", link: "/admin/dashboard/home-care/services" },
        { name: "Booking", link: "/admin/dashboard/home-care/booking" },
        { name: "Staff", link: "/admin/dashboard/home-care/staff" },
      ],
    },
    {
      name: "Consultations",
      icon: <Laptop size={18} />,
      subItems: [
        { name: "Doctors", link: "/admin/dashboard/consultations/doctors" },
        { name: "Hospitals", link: "/admin/dashboard/consultations/hospitals" },
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
        { name: "Bookings", link: "/admin/dashboard/lab_tests/bookings" },
        {
          name: "Phlebotomists",
          link: "/admin/dashboard/lab_tests/phlebotomists",
        },
        { name: "Reports", link: "/admin/dashboard/lab_tests/reports" },
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
        { name: "Bookings", link: "/admin/dashboard/rider/bookings" },
      ],
    },
    {
      name: "Push Notification",
      icon: <BellRing size={18} />,
      subItems: [
        { name: "Notifications", link: "/admin/dashboard/push-notification" },
      ],
    },
    {
      name: "Simran",
      icon: <Building size={18} />,
      subItems: [
        { name: "Home", link: "/admin/dashboard/simran" },
        { name: "Services", link: "/admin/dashboard/simran/services" },
        {
          name: "Insurance & Tie-Ups",
          link: "/admin/dashboard/simran/insurance-tie-ups",
        },
        { name: "Blogs", link: "/admin/dashboard/simran/blogs" },
        {
          name: "Booking Leads",
          link: "/admin/dashboard/simran/booking-leads",
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
  }, [pathname]);

  const toggleMenu = (menuName: string) => {
    const menu = menuItems.find((m) => m.name === menuName);
    const firstSubItem = menu?.subItems?.[0];

    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenMenu(menuName);
      setSelectedMenu(menuName);

      if (firstSubItem) {
        setSelectedSubMenu(firstSubItem.name);
        router.push(firstSubItem.link);
      }
      return;
    }

    if (openMenu === menuName) {
      setOpenMenu(null);
    } else {
      setOpenMenu(menuName);
      setSelectedMenu(menuName);

      if (firstSubItem) {
        setSelectedSubMenu(firstSubItem.name);
        router.push(firstSubItem.link);
      }
    }
  };

  const handleSubMenuClick = (subMenuName: string) => {
    setSelectedSubMenu(subMenuName);
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 302 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col h-screen bg-white shadow-xl relative"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`ml-5 absolute -right-3 top-3 z-50 bg-white border border-gray-200 text-gray-700 px-0.5 hover:scale-110 transition-transform py-5
    ${isCollapsed ? "rounded-l-lg rounded-r-2xl" : "rounded-l-2xl rounded-r-lg"}
  `}
      >
        {isCollapsed ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
      </button>

      <div className="flex items-center justify-center h-[80px] px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full px-6"
            >
              <Image
                src={MainMediversalLogo}
                alt="Logo"
                width={200}
                height={100}
                priority
              />
            </motion.div>
          ) : (
            <motion.div
              key="mini"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#0088B1] font-bold text-2xl"
            >
              <Image
                src={MainMediversalGroupLogo}
                alt="Logo"
                width={150}
                height={100}
                priority
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-[#D3D7D8]"></div>

      <div className="flex flex-col overflow-y-auto overflow-x-hidden py-6 px-2 space-y-1 items-center">
        {menuItems.map((menu) => (
          <div
            key={menu.name}
            className="mb-2 w-full flex flex-col items-center"
          >
            <motion.div
              className={`flex items-center cursor-pointer rounded-lg h-[40px] relative transition-all duration-200
                ${isCollapsed ? "w-[50px] justify-center px-0" : "w-[254px] justify-between px-4"}
                ${selectedMenu === menu.name ? "bg-[#0088B1] text-[#F8F8F8] shadow-lg" : "bg-white text-[#161D1F] hover:bg-gray-100"}`}
              onClick={() => toggleMenu(menu.name)}
              onHoverStart={() => setHoveredMenu(menu.name)}
              onHoverEnd={() => setHoveredMenu(null)}
            >
              <div className="flex items-center relative z-10 overflow-hidden">
                <span className={`${!isCollapsed && "mr-3"}`}>{menu.icon}</span>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {menu.name}
                  </motion.span>
                )}
              </div>

              {!isCollapsed && menu.subItems && (
                <motion.span
                  animate={{ rotate: openMenu === menu.name ? 180 : 0 }}
                >
                  <ChevronDown size={16} />
                </motion.span>
              )}
            </motion.div>

            <AnimatePresence>
              {!isCollapsed && openMenu === menu.name && menu.subItems && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 space-y-1 w-full flex flex-col items-center overflow-hidden"
                >
                  {menu.subItems.map((subItem) => (
                    <Link
                      href={subItem.link}
                      key={subItem.name}
                      className="w-full flex justify-center"
                    >
                      <motion.div
                        className={`flex items-center px-4 py-2 cursor-pointer rounded-md w-[234px] h-[36px] relative
                          ${selectedSubMenu === subItem.name ? "bg-[#D0E8F0] text-[#161D1F] font-medium" : "text-[#161D1F] hover:bg-[#E6F4F8]"}`}
                        onClick={() => handleSubMenuClick(subItem.name)}
                      >
                        <CornerDownRight size={14} className="mr-3" />
                        <span className="text-sm whitespace-nowrap">
                          {subItem.name}
                        </span>
                      </motion.div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Sidebar;
