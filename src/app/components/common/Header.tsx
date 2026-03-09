"use client";
import React, { useState, useEffect, Fragment, useRef } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronUp,
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
        <div className="flex items-center text-[#161D1F] text-[12px] ">
          <span>
            {currentDateTime.date} | {currentDateTime.time}
          </span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex justify-between items-center space-x-2 bg-[#0088B1] text-white px-2 py-2 rounded gap-3 hover:bg-[#006c8f] transition-colors duration-200"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center space-x-2 mr-2 flex-row">
                <User size={16} />
                <span className="text-xs">{admin.name || "User"}</span>
              </div>
              {isDropdownOpen ? (
                <ChevronUp
                  size={16}
                  className="ml-1 transition-transform duration-200"
                />
              ) : (
                <ChevronDown
                  size={16}
                  className="ml-1 transition-transform duration-200"
                />
              )}
            </button>

            <div
              className={`absolute right-0 mt-2 w-40 bg-[#E8F4F7] rounded-md shadow-lg z-10 overflow-hidden transition-all duration-200 ease-in-out ${
                isDropdownOpen
                  ? "opacity-100 transform translate-y-0 pointer-events-auto"
                  : "opacity-0 transform -translate-y-2 pointer-events-none"
              }`}
            >
              <ul className="py-1 text-[#161D1F]">
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500 flex items-center gap-2 transition-colors duration-150"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
