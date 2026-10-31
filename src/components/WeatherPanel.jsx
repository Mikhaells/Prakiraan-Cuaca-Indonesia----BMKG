import WeatherCard from "./WeatherCard";
import { dayLabel, formatDateTime, getDays, getLocation } from "../lib/bmkg";

function dayRange(items) {
  const temps = items.map((i) => Number(i.t)).filter((t) => Number.isFinite(t));
  if (temps.length === 0) return null;
  return {
    min: Math.min(...temps),
    max: Math.max(...temps),
  };
}

export default function WeatherPanel({ region, weather, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="panel-state">
        <span className="spinner" />
        <p className="panel-state-title">Memuat data cuaca…</p>
        <p>{region?.name ?? "Menghubungi BMKG"}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-state">
        <div className="panel-illustration panel-illustration-error" aria-hidden="true">
          ⚠️
        </div>
        <h3>Terjadi kesalahan</h3>
        <p className="panel-error-text">{error}</p>
        <button type="button" className="retry-button" onClick={onRetry}>
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="panel-state">
        <div className="panel-illustration" aria-hidden="true">
          🌏
        </div>
        <h3>Pilih Wilayah</h3>
        <p>
          Klik kabupaten/kota pada peta di samping, atau gunakan kolom pencarian di atas untuk
          melihat prakiraan cuaca 3 hari ke depan.
        </p>
      </div>
    );
  }

  const days = getDays(weather);
  const location = getLocation(weather);
  const analysisDate = days?.[0]?.[0]?.analysis_date;

  return (
    <div className="weather-content">
      <header className="weather-header">
        <div>
          <h2 className="weather-title">{region?.name ?? location?.kotkab}</h2>
          <p className="weather-sub">
            {location?.provinsi}
            {location?.kecamatan ? ` · Kec. ${location.kecamatan}` : ""}
            {location?.desa ? ` · ${location.desa}` : ""}
          </p>
          {analysisDate ? (
            <p className="last-updated">Analisis {formatDateTime(analysisDate)} WIB</p>
          ) : null}
        </div>
        <p className="weather-coords">
          {location ? `${Number(location.lat).toFixed(3)}°S, ${Number(location.lon).toFixed(3)}°E` : ""}
        </p>
      </header>

      {days.map((day, dayIndex) => {
        const range = dayRange(day);
        return (
          <section className="day-section" key={dayIndex}>
            <div className="day-head">
              <h3 className="day-title">{dayLabel(day[0]?.local_datetime)}</h3>
              {range ? (
                <p className="day-range">
                  <span className="day-range-max">{range.max}°</span>
                  <span aria-hidden="true">/</span>
                  <span className="day-range-min">{range.min}°</span>
                </p>
              ) : null}
            </div>
            <div className="day-cards">
              {day.map((item, i) => (
                <WeatherCard key={`${dayIndex}-${i}`} item={item} />
              ))}
            </div>
          </section>
        );
      })}

      <p className="weather-source">
        Sumber data: <strong>BMKG</strong> (Badan Meteorologi, Klimatologi, dan Geofisika) ·{" "}
        <a href="https://data.bmkg.go.id" target="_blank" rel="noreferrer">
          data.bmkg.go.id
        </a>
      </p>
    </div>
  );
}
