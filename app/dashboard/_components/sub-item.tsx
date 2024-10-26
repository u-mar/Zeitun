'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const SidebarItem = ({ item }: { item: any }) => {
  const { name, path, icon: Icon } = item;
  const pathname = usePathname();

  const isActive = useMemo(() => path === pathname, [path, pathname]);

  return (
    <Link href={path} className="relative">
      <div
        className={`text-sm py-2 px-4 flex items-center rounded-lg cursor-pointer transition-all ${
          isActive
            ? "bg-[#1A1A1A] text-green-500"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`}
      >
        <Icon size={18} className="mr-4" />
        {name}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 "></div>
        )}
      </div>
    </Link>
  );
};

export default SidebarItem;
