import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ClipboardList, LogOut, Pencil, UserRound } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import ThemeToggle from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const menuItems = [
  { to: "/stock-opname", label: "Stock Opname", icon: ClipboardList },
];

export default function AppSidebar() {
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <Sidebar className="border-r border-slate-200 bg-white text-slate-700 dark:border-neutral-800 dark:bg-black dark:text-neutral-100">
      <SidebarHeader className="border-b border-slate-200 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-black">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400/90">
              RITA
            </p>
            <span className="text-lg font-semibold text-slate-900 dark:text-white">Stock Opname</span>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-600/20">
            <img
              src="/logoritapasaraya_mini.png"
              alt="Logo"
              className="h-9 w-9 object-contain"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white px-3 py-4 dark:bg-black">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-neutral-500">
            Menu
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm shadow-emerald-900/10 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/40 dark:shadow-none"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn(
                            "h-4 w-4 transition-colors",
                            isActive
                              ? "text-emerald-600 dark:text-emerald-300"
                              : "text-slate-400 group-hover:text-slate-900 dark:text-neutral-500 dark:group-hover:text-white"
                          )}
                        />
                        <span>{label}</span>
                      </>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-1 border-t border-slate-200 bg-slate-50 px-3 py-3 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 dark:text-neutral-200">
          <UserRound className="h-4 w-4 shrink-0 text-slate-400 dark:text-neutral-500" />
          <span className="truncate" title={state.operator}>
            {state.operator || "Tanpa nama"}
          </span>
        </div>

        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex-1 justify-start text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-neutral-300 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={() => navigate("/operator")}
          >
            <Pencil />
            Ganti operator
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Keluar"
            className="text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-neutral-300 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={handleLogout}
          >
            <LogOut />
          </Button>
        </div>

        <ThemeToggle />
        <p className="px-2 text-[10px] text-slate-500 dark:text-neutral-500 group-data-[collapsible=icon]:hidden">
          Rita Stock Opname v.1.0
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}