import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_DIR = path.join(__dirname, "tmp");
const REGENCY_CSV = path.join(CSV_DIR, "regencies.csv");
const VILLAGE_CSV = path.join(CSV_DIR, "villages.csv");
const OUT_DIR = path.join(__dirname, "..", "src", "data");
const OUT_FILE = path.join(OUT_DIR, "kabupatenAdm4.json");

const DATA_VERSION = "idn-area-data@4.0.1";
const REGENCY_URL = `https://cdn.jsdelivr.net/npm/${DATA_VERSION}/data/regencies.csv`;
const VILLAGE_URL = `https://cdn.jsdelivr.net/npm/${DATA_VERSION}/data/villages.csv`;

const API = (adm4) =>
  `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${encodeURIComponent(adm4)}`;

const MAX_TRIES_PER_REGENCY = 6;
const REQUEST_DELAY_MS = 1100;
const REQUEST_TIMEOUT_MS = 20000;

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = [];
    let cur = "";
    let quoted = false;
    const chars = lines[i];
    for (let j = 0; j < chars.length; j++) {
      const ch = chars[j];
      if (ch === '"') {
        if (quoted && chars[j + 1] === '"') {
          cur += '"';
          j++;
        } else {
          quoted = !quoted;
        }
      } else if (ch === "," && !quoted) {
        cells.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    const row = {};
    headers.forEach((h, idx) => (row[h] = (cells[idx] ?? "").trim()));
    rows.push(row);
  }
  return rows;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (res.status === 200) {
      const json = await res.json();
      const hasData =
        json &&
        Array.isArray(json.data) &&
        json.data.length > 0 &&
        Array.isArray(json.data[0].cuaca) &&
        json.data[0].cuaca.length > 0;
      return { ok: true, hasData, json };
    }
    return { ok: false, hasData: false, status: res.status };
  } catch (err) {
    return { ok: false, hasData: false, error: String(err) };
  } finally {
    clearTimeout(timer);
  }
}

async function verifyAdm4(adm4, attempts = 0) {
  const result = await fetchJson(API(adm4));
  if (!result.ok && attempts < 2) {
    await sleep(3000);
    return verifyAdm4(adm4, attempts + 1);
  }
  return result;
}

async function ensureCsvs() {
  await fs.mkdir(CSV_DIR, { recursive: true });
  const entries = [
    [REGENCY_CSV, REGENCY_URL],
    [VILLAGE_CSV, VILLAGE_URL],
  ];
  for (const [file, url] of entries) {
    try {
      await fs.access(file);
      console.log(`Pakai ${path.basename(file)} (sudah ada)`);
    } catch {
      console.log(`Mengunduh ${path.basename(file)} dari jsDelivr…`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Gagal mengunduh ${url} (HTTP ${res.status})`);
      await fs.writeFile(file, await res.text());
    }
  }
}

const KNOWN_OVERRIDES = {
  "96.02": { adm4: "92.04.01.2004", note: "kode lama (provinsi 92) sesuai database BMKG" },
  "96.03": { adm4: "92.05.01.2001", note: "kode lama (provinsi 92) sesuai database BMKG" },
};

async function main() {
  await ensureCsvs();

  const [regenciesText, villagesText] = await Promise.all([
    fs.readFile(REGENCY_CSV, "utf8"),
    fs.readFile(VILLAGE_CSV, "utf8"),
  ]);

  const regencies = parseCsv(regenciesText);
  const villages = parseCsv(villagesText);

  const villagesByRegency = new Map();
  for (const v of villages) {
    const key = v.code.slice(0, 5);
    if (!villagesByRegency.has(key)) villagesByRegency.set(key, []);
    villagesByRegency.get(key).push(v.code);
  }

  const results = [];
  let totalRequests = 0;
  let failed = 0;

  const usedOverride = new Set();

  console.log(`Total kabupaten/kota: ${regencies.length}`);

  for (let i = 0; i < regencies.length; i++) {
    const regency = regencies[i];
    const regencyName = regency.name.replace(/^Kabupaten |^Kota /, "");
    const override = KNOWN_OVERRIDES[regency.code];

    let found = override ? override.adm4 : null;
    if (override) {
      usedOverride.add(regency.code);
    } else {
      const candidates = villagesByRegency.get(regency.code) ?? [];
      for (let t = 0; t < Math.min(MAX_TRIES_PER_REGENCY, candidates.length); t++) {
        const adm4 = candidates[t];
        totalRequests++;
        const result = await verifyAdm4(adm4);
        if (result.ok && result.hasData) {
          found = adm4;
          break;
        }
        if (result.ok && !result.hasData) {
          break;
        }
        await sleep(REQUEST_DELAY_MS);
      }
    }

    if (found) {
      results.push({
        adm2: regency.code,
        name: regency.name,
        regency: regencyName,
        provinceCode: regency.province_code,
        adm4: found,
        ...(override ? { note: override.note } : {}),
      });
    } else {
      failed++;
      results.push({
        adm2: regency.code,
        name: regency.name,
        regency: regencyName,
        provinceCode: regency.province_code,
        adm4: null,
      });
    }

    if ((i + 1) % 20 === 0 || i === regencies.length - 1) {
      console.log(
        `[${i + 1}/${regencies.length}] total request=${totalRequests} failed=${failed}`
      );
    }

    await fs.mkdir(OUT_DIR, { recursive: true });
    await fs.writeFile(
      path.join(CSV_DIR, "adm4-progress.json"),
      JSON.stringify(results, null, 2)
    );

    await sleep(REQUEST_DELAY_MS);
  }

  await fs.writeFile(OUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\nSelesai. ${results.length} kabupaten, failed=${failed}`);
  console.log(`Output: ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
