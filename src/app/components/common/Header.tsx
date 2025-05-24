"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Bell,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
// import { useAuthStore } from "../store/user_details";

interface HeaderProps {
  userName?: string;
}

const Header: React.FC<HeaderProps> = () => {
  const [currentDateTime, setCurrentDateTime] = useState({
    date: "",
    time: "",
  });
  const router = useRouter(); // <-- inside your component
  const pathname = usePathname();
  //   const user = useAuthStore((state) => state.user);
  //   const logout = useAuthStore((state) => state.logout);
  //   const userName = user?.name.toUpperCase() || "User"; // Default to "User" if name is not available
  const generateBreadcrumbs = () => {
    const pathWithoutQuery = pathname.split("?")[0];
    const pathArray = pathWithoutQuery.split("/").filter((p) => p);

    return pathArray.map((path, index) => {
      const href = "/" + pathArray.slice(0, index + 1).join("/");

      const label = path
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      return (
        <Fragment key={href}>
          {index !== 0 && (
            <span className="mx-2 text-[#B0B6B8] text-[12px] font-medium">
              &gt;
            </span>
          )}
          <Link href={href} className="text-[#B0B6B8] text-[10px] font-medium">
            {label}
          </Link>
        </Fragment>
      );
    });
  };

  useEffect(() => {
    // Initialize date/time
    updateDateTime();

    // Update time every second
    const interval = setInterval(() => {
      updateDateTime();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateDateTime = () => {
    const now = new Date();

    // Format date as DD/MM/YY
    const dateStr = format(now, "dd/MM/yy");

    // Format time as HH:MM:SS:SS
    const timeStr = format(now, "HH:mm:ss").substring(0, 11);

    setCurrentDateTime({
      date: dateStr,
      time: timeStr,
    });
  };
  //   const handlelogout = () => {
  //     logout();
  //     router.push("/login");
  //   };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="bg-gray-50  p-4">
      {/* Main header */}
      <header className="bg-white px-2 py-2 flex items-center justify-between border rounded-xl my-1">
        {/* Left section with back button and title */}
        <div className="flex items-center">
          <button onClick={() => router.back()}>
            <ArrowLeft
              size={18}
              className="mr-4 ml-2 hove hover:cursor-pointer"
              color="#161D1F"
            />
          </button>
          <h1 className="text-lg font-medium text-[#161D1F] text-[16px]">
            Admin Dashboard
          </h1>
        </div>

        {/* Center section with date and time */}
        <div className="flex items-center text-[#161D1F] text-[12px] ">
          <span>
            {currentDateTime.date} | {currentDateTime.time}
          </span>
        </div>

        {/* Right section with notification and user profile */}
        <div className="flex items-center space-x-6">
          {/* Notification icon */}
          <button className="relative">
            <Bell size={18} className="mr-2" color="#161D1F" />
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              className="flex justify-between items-center space-x-2 bg-[#0088B1] text-white px-2 py-2 rounded gap-3"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center space-x-2 mr-2 flex-row">
                <User size={16} />
                {/* <span className="text-xs">{userName}</span> */}
                <span className="text-xs">Vivek</span>
              </div>

              <ChevronDown size={16} className="ml-1" />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[#E8F4F7] rounded-md shadow-lg z-10">
                <ul className="py-1 text-[#161D1F]">
                  <li>
                    <a
                      href="#"
                      className="px-4 py-2 text-sm hover:bg-gray-100  flex items-center gap-2"
                    >
                      <User size={16} />
                      Profile
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="px-4 py-2 text-sm hover:bg-gray-100  flex items-center gap-2"
                    >
                      <Settings size={16} />
                      Settings
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="px-4 py-2 text-sm hover:bg-gray-100 text-red-500 flex items-center gap-2"
                      //   onClick={() => handlelogout()}
                    >
                      <LogOut size={16} />
                      Logout
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-50 px-2 py-1">{generateBreadcrumbs()}</div>
    </div>
  );
};

export default Header;
