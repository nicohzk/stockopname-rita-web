import AppSidebar from "./app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom"

export default function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="flex-1 p-4">
        <SidebarTrigger />
        <Outlet />
      </main>
    </SidebarProvider>
  )
}