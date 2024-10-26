"use client"; // This makes it a Client Component

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const KeyboardShortcutHandler = ({ userRole }: { userRole: string }) => {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "o") {
        event.preventDefault(); // Prevent the default behavior
        if (userRole == "admin") {
          // Only allow admins to navigate to the 'order' page
          router.push("/dashboard/admin/sales"); // Navigate to the 'order' page
        } else if (userRole !== "admin") {
          router.push("/dashboard/employee/sales"); // Navigate to the 'order' page
        }
      } else if (event.ctrlKey && event.key === "p") {
        event.preventDefault(); // Prevent the default behavior
        if (userRole == "admin") {
          // Only allow admins to navigate to the 'order' page
          router.push("/dashboard/admin/product"); // Navigate to the 'order' page
        } else if (userRole !== "admin") {
          router.push("/dashboard/employee/product"); // Navigate to the 'order' page
        }
      } else if (event.ctrlKey && event.key === "r") {
        event.preventDefault(); // Prevent the default behavior
        if (userRole == "admin") {
          // Only allow admins to navigate to the 'order' page
          router.push("/dashboard/admin/report"); // Navigate to the 'order' page
        } else if (userRole !== "admin") {
          router.push("/dashboard/employee/report"); // Navigate to the 'order' page
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  return null; // This component doesn't render anything visually
};

export default KeyboardShortcutHandler;
