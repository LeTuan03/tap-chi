"use client";

import { App, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import type { ReactNode } from "react";

dayjs.locale("vi");

export default function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: { colorPrimary: "#da251c", borderRadius: 6, fontFamily: "var(--font-sans), 'Noto Sans', Arial, sans-serif" },
        components: { Layout: { siderBg: "#fff", headerBg: "#fff" } },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
