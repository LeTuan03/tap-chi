import Image from "next/image";
import type { AdItem, Article, Category } from "@/lib/types";
import LatestPopularTabs from "./LatestPopularTabs";

export function AdBanner({ ad }: { ad: AdItem }) {
  const img = <Image src={ad.image} alt={ad.alt || "Quảng cáo"} width={300} height={250} sizes="300px" style={{ height: "auto" }} />;
  return ad.link ? (
    <a className="ad" href={ad.link} target="_blank" rel="noopener nofollow sponsored">
      {img}
    </a>
  ) : (
    <div className="ad">{img}</div>
  );
}

export default function Sidebar({ latest, popular, ads, categories }: { latest: Article[]; popular: Article[]; ads: AdItem[]; categories: Category[] }) {
  return (
    <aside className="sidebar" aria-label="Cột phải">
      <LatestPopularTabs latest={latest} popular={popular} categories={categories} />
      {ads.map((ad, i) => (
        <AdBanner key={`${ad.image}-${i}`} ad={ad} />
      ))}
    </aside>
  );
}
