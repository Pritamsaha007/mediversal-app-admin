"use client";
import React, { useState, useEffect, Fragment } from "react";
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
import { usePathname, useRouter } from "next/navigation";
import { useAdminStore } from "@/app/store/adminStore";
import { signOut } from "aws-amplify/auth";

interface HeaderProps {
  userName?: string;
  userEmail?: string;
}

const Header: React.FC<HeaderProps> = () => {
  const [currentDateTime, setCurrentDateTime] = useState({
    date: "",
    time: "",
  });
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAdminStore((state) => state.logout);
  const admin = useAdminStore((state) => state.admin);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateDateTime = () => {
    const now = new Date();
    setCurrentDateTime({
      date: format(now, "dd/MM/yy"),
      time: format(now, "HH:mm:ss").substring(0, 11),
    });
  };

  const handleLogout = async () => {
    await signOut();
    logout();
    router.push("/login");
  };

  const generateBreadcrumbs = () => {
    const pathWithoutQuery = pathname.split("?")[0];
    const pathArray = pathWithoutQuery.split("/").filter(Boolean);

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

  return (
    <div className="bg-gray-50 p-4">
      <header className="bg-white px-2 py-2 flex items-center justify-between border rounded-xl my-1">
        {/* <div className="flex items-center">
          <button onClick={() => router.back()}>
            <ArrowLeft
              size={18}
              className="mr-4 ml-2 hover:cursor-pointer"
              color="#161D1F"
            />
          </button>
          <h1 className="text-lg font-medium text-[#161D1F] text-[16px]">
            Admin Dashboard
          </h1>
        </div> */}

        <div className="flex items-center text-[#161D1F] text-[12px] ">
          <span>
            {currentDateTime.date} | {currentDateTime.time}
          </span>
        </div>

        <div className="flex items-center space-x-6">
          {/* <button className="relative">
            <Bell size={18} className="mr-2" color="#161D1F" />
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-600"></span>
            </span>
          </button> */}

          <div className="relative">
            <button
              className="flex justify-between items-center space-x-2 bg-[#0088B1] text-white px-2 py-2 rounded gap-3"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center space-x-2 mr-2 flex-row">
                <User size={16} />
                <span className="text-xs">{admin.name || "User"}</span>
              </div>

              <ChevronDown size={16} className="ml-1" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[#E8F4F7] rounded-md shadow-lg z-10">
                <ul className="py-1 text-[#161D1F]">
                  {/* <li>
                    <a
                      href="#"
                      className="px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <User size={16} />
                      Profile
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Settings size={16} />
                      Settings
                    </a>
                  </li> */}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* <div className="bg-gray-50 px-2 py-1">{generateBreadcrumbs()}</div> */}
    </div>
  );
};

export default Header;
