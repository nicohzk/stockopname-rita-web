import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";

type PageHeaderProps = {
  title: string;
  status: string;
  /** Baris di bawah badge status: lokasi sesi, atau sesi · lokasi. */
  subtitle?: ReactNode;
  /** Jejak breadcrumb di antara "Stock Opname" dan judul halaman. */
  parent?: { label: string; to: string };
  /** Tombol aksi khas halaman; dirender di kolom kanan. */
  actions: ReactNode;
};

/** Header halaman sesi dan koordinator: breadcrumb, judul, status, aksi. */
export default function PageHeader({ title, status, subtitle, parent, actions }: PageHeaderProps) {
  return (
    <div className="mb-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link to="/stock-opname" />} className="text-xs">
                  Stock Opname
                </BreadcrumbLink>
              </BreadcrumbItem>
              {parent ? (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink render={<Link to={parent.to} />} className="text-xs">
                      {parent.label}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              ) : null}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs">{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold mt-2">{title}</h1>
          <StatusBadge className="my-2" status={status} />
          {subtitle}
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-5">{actions}</div>
      </div>
      <Separator className="mt-2" />
    </div>
  );
}
