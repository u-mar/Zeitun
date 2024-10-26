"use client";
import { useMemo, useState } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import SubMenuItem from "./sub-item";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ISidebarItem {
  name: string;
  path: string;
  icon: LucideIcon;
  items?: ISubItem[];
}

interface ISubItem {
  name: string;
  path: string;
}

const SidebarItem = ({ item }: { item: ISidebarItem }) => {
  const { name, icon: Icon, items, path } = item;
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  const onClick = () => {
    if (items && items.length > 0) {
      return setExpanded(!expanded);
    }
  };

  const isActive = useMemo(() => {
    if (items && items.length > 0) {
      if (items.find((item) => item.path === pathname)) {
        setExpanded(true);
        return true;
      }
    }
    return path === pathname;
  }, [items, path, pathname]);

  const pathName = usePathname();

  const normalizedPathName = `/${pathName}`.replace("//", "/");
  const normalizedHref = `/${path}`.replace("//", "/");

  const pathSegments = pathName.split("/").filter(Boolean);
  const hrefSegments = normalizedHref.split("/").filter(Boolean);

  const isActiveBase = normalizedPathName.startsWith(normalizedHref);

  const isExactOrParent =
    isActiveBase && pathSegments.length <= hrefSegments.length;

  const isActiveNow = isActiveBase && isExactOrParent;

  return (
    <>
      {items && items.length > 0 ? (
        <div
          className={cn(
            "flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer",
            isActiveNow
              ? "bg-pink-100 text-pink-600"
              : "bg-white text-gray-500 hover:bg-pink-50 hover:text-pink-500"
          )}
          onClick={onClick}
        >
          <div className="flex items-center gap-x-2">
            <Icon size={22} />
            <span className="text-md font-semibold">{name}</span>
          </div>
          {items && items.length > 0 && <ChevronDown size={18} />}
        </div>
      ) : (
        <Link href={path} passHref>
          <div
            className={cn(
              "relative flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer",
              isActiveNow
                ? "bg-pink-100 text-pink-600"
                : "bg-white text-gray-500 hover:bg-pink-50 hover:text-pink-500"
            )}
          >
            <div className="flex items-center gap-x-2">
              <Icon size={22} />
              <span className="text-md font-semibold">{name}</span>
            </div>
            {isActiveNow && (
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-pink-600 rounded-r-lg"></div>
            )}
          </div>
        </Link>
      )}
      {expanded && items && items.length > 0 && (
        <div className="flex flex-col space-y-1 ml-6">
          {items.map((item) => (
            <SubMenuItem key={item.path} item={item} />
          ))}
        </div>
      )}
    </>
  );
};

export default SidebarItem;
