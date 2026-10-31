const BMKG_API = "https://api.bmkg.go.id/publik/prakiraan-cuaca";

export async function fetchWeather(adm4) {
  const url = `${BMKG_API}?adm4=${encodeURIComponent(adm4)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Gagal mengambil data cuaca (HTTP ${res.status})`);
  }
  const json = await res.json();
  if (
    !json ||
    !Array.isArray(json.data) ||
    json.data.length === 0 ||
    !Array.isArray(json.data[0].cuaca)
  ) {
    throw new Error("Data cuaca tidak tersedia untuk wilayah ini.");
  }
  return json;
}

export function getDays(weather) {
  return weather?.data?.[0]?.cuaca ?? [];
}

export function getLocation(weather) {
  return weather?.lokasi ?? null;
}

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseLocal(dateStr) {
  return new Date(dateStr.replace(" ", "T"));
}

export function formatTime(localDatetime) {
  if (!localDatetime) return "";
  return parseLocal(localDatetime).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "";
  return parseLocal(dateStr).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dayLabel(localDatetime) {
  if (!localDatetime) return "";
  const date = parseLocal(localDatetime);
  const diff = Math.round((startOfDay(date) - startOfDay(new Date())) / 86400000);
  if (diff === 0) return "Hari Ini";
  if (diff === 1) return "Besok";
  if (diff === 2) return "Lusa";
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
