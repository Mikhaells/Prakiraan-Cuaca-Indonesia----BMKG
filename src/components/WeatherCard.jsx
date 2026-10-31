import { formatTime, parseLocal } from "../lib/bmkg";

function isCurrentPeriod(localDatetime) {
  if (!localDatetime) return false;
  const date = parseLocal(localDatetime);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate() &&
    date.getHours() === now.getHours()
  );
}

export default function WeatherCard({ item }) {
  const current = isCurrentPeriod(item.local_datetime);
  return (
    <div className={`weather-card${current ? " card-now" : ""}`}>
      <div className="card-top">
        <div className="card-time">{formatTime(item.local_datetime)}</div>
        {current ? <span className="card-now-badge">Sekarang</span> : null}
      </div>
      {item.image ? (
        <img className="card-icon" src={item.image} alt={item.weather_desc ?? "ikon cuaca"} loading="lazy" />
      ) : (
        <div className="card-icon card-icon-fallback">{item.weather_desc ?? "—"}</div>
      )}
      <div className="card-temp">{item.t}°</div>
      <div className="card-desc">{item.weather_desc}</div>
      <dl className="card-metrics">
        <div>
          <dt>Kelembapan</dt>
          <dd>{item.hu}%</dd>
        </div>
        <div>
          <dt>Angin</dt>
          <dd>
            {item.ws} km/jam <span className="card-wind">{item.wd}</span>
          </dd>
        </div>
        <div>
          <dt>Awan</dt>
          <dd>{item.tcc}%</dd>
        </div>
        <div>
          <dt>Jarak pandang</dt>
          <dd>{item.vs_text}</dd>
        </div>
        <div>
          <dt>Presipitasi</dt>
          <dd>{item.tp ?? 0} mm</dd>
        </div>
      </dl>
    </div>
  );
}
