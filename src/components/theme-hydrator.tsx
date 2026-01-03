"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";

export function ThemeHydrator() {
  const { themeMode } = useSettingsStore();

  useEffect(() => {
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeMode]);

  return null;
}
