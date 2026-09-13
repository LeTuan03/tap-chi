import SiteChrome from "@/components/site/SiteChrome";

// ISR: khung trang (menu, ticker) được làm mới tối đa mỗi 60 giây
export const revalidate = 60;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
