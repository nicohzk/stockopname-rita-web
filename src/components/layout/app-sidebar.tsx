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
import {
  ClipboardList,
  LayoutDashboard,
  Package,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/master", label: "Master Data", icon: Package },
  { to: "/stock-opname", label: "Stock Opname", icon: ClipboardList },
];

export default function AppSidebar() {
  return (
    <Sidebar className="border-r border-slate-800 bg-slate-950 text-slate-50">
      <SidebarHeader className="border-b border-slate-800 bg-slate-950/80 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300/80">
              RITA
            </p>
            <span className="text-lg font-semibold text-white">Stock Opname</span>
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

      <SidebarContent className="bg-slate-950 px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Menu
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <NavLink
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 shadow-sm shadow-emerald-950/40"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn(
                            "h-4 w-4 transition-colors",
                            isActive ? "text-emerald-300" : "text-slate-400 group-hover:text-white"
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

      <SidebarFooter className="border-t border-slate-800 bg-slate-950 px-3 py-3">
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-300">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-[10px] text-slate-400">Online</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
