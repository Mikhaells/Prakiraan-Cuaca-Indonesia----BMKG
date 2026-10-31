import { useCallback, useEffect, useMemo, useState } from "react";
import WeatherMap from "./components/WeatherMap";
import WeatherPanel from "./components/WeatherPanel";
import SearchBox from "./components/SearchBox";
import { fetchWeather } from "./lib/bmkg";
import regions from "./data/kabupatenAdm4.json";

export default function App() {
  const [selected, setSelected] = useState(null);
  const [focusCode, setFocusCode] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  const regionByCode = useMemo(() => {
    const map = new Map();
    for (const region of regions) map.set(region.adm2, region);
    return map;
  }, []);

  const selectRegion = useCallback((region) => {
    setSelected(region);
    setWeather(null);
    setError(null);
  }, []);

  const handleMapClick = useCallback(
    (code) => {
      const region = regionByCode.get(code);
      if (region) selectRegion(region);
    },
    [regionByCode, selectRegion]
  );

  const handleSearchPick = useCallback(
    (region) => {
      selectRegion(region);
      setFocusCode(region.adm2);
    },
    [selectRegion]
  );

  useEffect(() => {
    if (!selected?.adm4) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchWeather(selected.adm4)
      .then((data) => {
        if (!cancelled) setWeather(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected, retry]);

  const handleRetry = useCallback(() => setRetry((r) => r + 1), []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-logo" aria-hidden="true">🌦️</span>
          <div>
            <h1>Prakiraan Cuaca Indonesia</h1>
            <p>Klik peta atau cari kabupaten/kota · data 3 hari dari BMKG</p>
          </div>
        </div>
        <div className="app-search">
          <SearchBox regions={regions} onPick={handleSearchPick} disabled={false} />
        </div>
      </header>

      <main className="app-body">
        <div className="map-area">
          <WeatherMap
            onSelect={handleMapClick}
            selected={selected?.adm2 ?? null}
            focusCode={focusCode}
          />
        </div>
        <aside className="panel">
          <WeatherPanel
            region={selected}
            weather={weather}
            loading={loading}
            error={error}
            onRetry={handleRetry}
          />
        </aside>
      </main>
    </div>
  );
}
