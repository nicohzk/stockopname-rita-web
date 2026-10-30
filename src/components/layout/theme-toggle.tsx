import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStoredTheme, resolveTheme, setTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    () => resolveTheme(getStoredTheme()) === "dark",
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setIsDark(resolveTheme(getStoredTheme()) === "dark");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    setIsDark(next === "dark");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="w-full justify-start gap-2 px-2 text-slate-300 hover:bg-slate-800 hover:text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span className="group-data-[collapsible=icon]:hidden">
        {isDark ? "Mode terang" : "Mode gelap"}
      </span>
    </Button>
  );
}
