"use client";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart2,
  Settings,
  User,
  HelpCircle,
  Store,
  Send,
  Group,
} from "lucide-react";
// import SidebarItem from "./item";
import Link from "next/link";
import SidebarItem from "./sub-item";
import LogoutDialog from "./LogoutDialog";
import { COMPANY_NAME } from "@/lib/config";



const adminRoutes = [
  {
    title: "DISCOVER",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "INVENTORY",
    items: [
      {
        name: "Products",
        path: "/dashboard/admin/product",
        icon: Package,
      },
      {
        name: "Category",
        path: "/dashboard/admin/product/category",
        icon: Group,
      },
      {
        name: "User",
        path: "/dashboard/admin/user",
        icon: User,
      },
      {
        name: "Orders",
        path: "/dashboard/admin/sales",
        icon: ShoppingCart,
      },
      {
        name: "Transactions",
        path: "/dashboard/admin/transaction",
        icon: Send,
      },
      {
        name: "Report",
        path: "/dashboard/admin/report",
        icon: BarChart2,
      },
      {
        name: "Store",
        path: "/dashboard/admin/store",
        icon: Store,
      },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      {
        name: "Settings",
        path: "/dashboard/admin/setting",
        icon: Settings,
      },
      {
        name: "Help",
        path: "/help",
        icon: HelpCircle,
      },
    ],
  },
];

const employeeRoutes = [
  {
    title: "DISCOVER",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "INVENTORY",
    items: [
      {
        name: "Products",
        path: "/dashboard/employee/product",
        icon: Package,
      },
      {
        name: "Orders",
        path: "/dashboard/employee/sales",
        icon: ShoppingCart,
      }, {
        name: "Transactions",
        path: "/dashboard/employee/transaction",
        icon: Send,
      },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      {
        name: "Settings",
        path: "/dashboard/employee/setting",
        icon: Settings,
      },
      {
        name: "Help",
        path: "/dashboard/employee/help",
        icon: HelpCircle,
      },
    ],
  },
];

const SidebarRoutes = ({ role }: { role: string }) => {
  const routes = role === "admin" ? adminRoutes : employeeRoutes;

  return (
    <div className="relative h-full flex flex-col bg-[#0a0a0a] text-white">
      {/* Sidebar Header */}
      <div className="p-6">
        <Link href="/" className="h-10 w-fit text-2xl font-bold text-green-500">
          {COMPANY_NAME}
        </Link>
      </div>

      {/* Sidebar Sections */}
      <div className="flex flex-col w-full overflow-y-auto pb-32 sidebar">
        {routes.map((section, index) => (
          <div key={index} className="mb-6">
            {/* Section Title */}
            <h4 className="pl-6 mb-2 text-xs font-bold text-gray-400 uppercase">
              {section.title}
            </h4>
            {/* Sidebar Items */}
            <div className="flex flex-col space-y-1">
              {section.items.map((item, idx) => (
                <SidebarItem key={idx} item={item} />
              ))}

            </div>
          </div>
        ))}
        <LogoutDialog />
      </div>
    </div>
  );
};

export default SidebarRoutes;
