import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";

const INDONESIA_BOUNDS = [
  [-11, 95],
  [6, 141],
];
// CARTO Basemaps sekarang wajib API key (tanpa key, tile diberi watermark
// "API key required"). Kalau key tidak diisi, pakai tile OSM standar yang
// keyless dan tanpa watermark.
const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY?.trim();

const TILE_PROVIDER = CARTO_KEY
  ? {
      url: `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }
  : {
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    };

const BASE_STYLE = {
  color: "#94a3b8",
  weight: 1,
  fillColor: "#7dd3fc",
  fillOpacity: 0.28,
};
const HOVER_STYLE = {
  color: "#0284c7",
  weight: 2,
  fillColor: "#38bdf8",
  fillOpacity: 0.55,
};
const SELECTED_STYLE = {
  color: "#0f172a",
  weight: 2.5,
  fillColor: "#0284c7",
  fillOpacity: 0.8,
};

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
    } else {
      map.fitBounds(INDONESIA_BOUNDS);
    }
  }, [bounds, map]);
  return null;
}

function AttributionPrefix() {
  const map = useMap();
  useEffect(() => {
    // "Leaflet" hanyalah kredit library, bukan atribusi data — boleh disembunyikan.
    map.attributionControl?.setPrefix(false);
  }, [map]);
  return null;
}

function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const invalidate = () => map.invalidateSize();
    window.addEventListener("resize", invalidate);
    window.addEventListener("orientationchange", invalidate);
    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(invalidate);
      observer.observe(container);
    }
    return () => {
      window.removeEventListener("resize", invalidate);
      window.removeEventListener("orientationchange", invalidate);
      observer?.disconnect();
    };
  }, [map]);
  return null;
}

export default function WeatherMap({ onSelect, selected, focusCode }) {
  const geoRef = useRef(null);
  const selectedRef = useRef(selected);
  const [geoJson, setGeoJson] = useState(null);
  const [error, setError] = useState(false);
  const [focus, setFocus] = useState(null);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}geojson/kabupaten-simple.geojson`)
      .then((res) => res.json())
      .then((data) => setGeoJson(data))
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    const layer = geoRef.current;
    if (!layer) return;
    layer.getLayers().forEach((l) => {
      l.setStyle(
        l.feature?.properties?.code === selectedRef.current ? SELECTED_STYLE : BASE_STYLE
      );
    });
  }, [selected, geoJson]);

  useEffect(() => {
    if (!focusCode || !geoRef.current) return;
    const layer = geoRef.current.getLayers().find((l) => l.feature?.properties?.code === focusCode);
    if (layer) {
      setFocus(layer.getBounds());
    }
  }, [focusCode, geoJson]);

  return (
    <div className="map-wrap">
      {error ? (
        <div className="map-overlay">
          <p>Gagal memuat peta. Periksa koneksi internet lalu muat ulang.</p>
        </div>
      ) : null}
      {!geoJson && !error ? (
        <div className="map-overlay">
          <span className="spinner" />
          <p>Memuat peta…</p>
        </div>
      ) : null}
      <MapContainer
        bounds={INDONESIA_BOUNDS}
        boundsOptions={{ padding: [20, 20] }}
        scrollWheelZoom
        className="leaflet-map"
      >
        <TileLayer url={TILE_PROVIDER.url} attribution={TILE_PROVIDER.attribution} />
        <AttributionPrefix />
        <MapResizeHandler />
        <FitBounds bounds={focus} />
        {geoJson ? (
          <GeoJSON
            ref={geoRef}
            data={geoJson}
            style={BASE_STYLE}
            onEachFeature={(feature, layer) => {
              layer.setStyle({
                ...BASE_STYLE,
                className: "region-layer",
              });
              layer.bindTooltip(feature.properties.name, { sticky: true, direction: "top" });
              layer.on({
                click: () => {
                  const code = feature.properties.code;
                  onSelect(code);
                },
                mouseover: (e) => {
                  if (e.target.feature?.properties?.code !== selectedRef.current) {
                    e.target.setStyle(HOVER_STYLE);
                  }
                },
                mouseout: (e) => {
                  if (e.target.feature?.properties?.code !== selectedRef.current) {
                    e.target.setStyle(BASE_STYLE);
                  }
                },
              });
            }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
