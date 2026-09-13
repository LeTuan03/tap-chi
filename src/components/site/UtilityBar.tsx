import Link from "next/link";
import type { Article, WeatherItem } from "@/lib/types";
import { articlePath } from "@/lib/utils";
import { CloudIcon, SunIcon } from "./Icons";

export default function UtilityBar({ ticker, weather }: { ticker: Article[]; weather: WeatherItem[] }) {
  return (
    <div className="utility">
      <div className="container utility__inner">
        <div className="ticker" aria-label="Tin mới nhất">
          <div className="ticker__badge">
            <span className="ticker__dot" />
            <span className="ticker__label">Tin mới</span>
          </div>
          <div className="ticker__viewport">
            <div className="ticker__track">
              {ticker.map((a) => (
                <Link key={a.id} href={articlePath(a)} title={a.title} className="ticker__item">
                  <span className="ticker__sep">✦</span>
                  <span>{a.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        {weather.length > 0 && (
          <div className="weather" aria-label="Thời tiết các vùng miền">
            {weather.map((w) => (
              <span className="weather__item" key={w.city} title={`Thời tiết ${w.city}`}>
                {w.temp > 28 ? <SunIcon className="weather__icon weather__icon--sun" /> : <CloudIcon className="weather__icon weather__icon--cloud" />}
                <span className="weather__city">{w.city}</span>
                <span className="weather__temp">{w.temp}°C</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
