import Link from "next/link";
import type { Article, WeatherItem } from "@/lib/types";
import { articlePath } from "@/lib/utils";

export default function UtilityBar({ ticker, weather }: { ticker: Article[]; weather: WeatherItem[] }) {
  return (
    <div className="utility">
      <div className="container utility__inner">
        <div className="ticker" aria-label="Tin mới">
          <div className="ticker__viewport">
            <div className="ticker__track">
              {ticker.map((a) => (
                <Link key={a.id} href={articlePath(a)} title={a.title}>
                  {a.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
        {weather.length > 0 && (
          <div className="weather" aria-label="Thời tiết">
            {weather.map((w) => (
              <span className="weather__item" key={w.city}>
                <span>
                  {w.city}: {w.temp}°C
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://openweathermap.org/img/wn/${w.icon}.png`} alt="" width={30} height={30} loading="lazy" />
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
