"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setCookie } from "@/lib/cookies";

// Writes a cookie with the last visited pathname
export default function LastPageCookie() {
  const pathname = usePathname();

  useEffect(() => {
    setCookie("lastMenu", pathname, 30);
  }, [pathname]);

  return null;
}
