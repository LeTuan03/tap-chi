import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import AdminProviders from "@/components/admin/AdminProviders";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s | Quản trị" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <AdminProviders>{children}</AdminProviders>
    </AntdRegistry>
  );
}
