# Prakiraan Cuaca Indonesia — Peta Interaktif

Aplikasi web untuk melihat prakiraan cuaca **3 hari ke depan** untuk **seluruh kabupaten/kota di Indonesia**, dipilih langsung lewat **peta interaktif** (Leaflet). Data bersumber dari [API data terbuka BMKG](https://data.bmkg.go.id/prakiraan-cuaca).

## Fitur

- Peta Indonesia dengan polygon 514 kabupaten/kota — klik untuk memilih wilayah.
- Pencarian kabupaten/kota berdasarkan nama (dengan navigasi keyboard).
- Panel detail cuaca per periode 3 jam untuk 3 hari (suhu, kelembapan, angin, tutupan awan, jarak pandang, presipitasi).
- Ikon cuaca resmi BMKG, penanda "Hari Ini / Besok / Lusa".
- Atribusi BMKG sesuai ketentuan penggunaan data.

## Teknologi

- React 19 + Vite
- react-leaflet + Leaflet (peta)
- API resmi BMKG: `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode}`

## Basemap & API Key (opsional)

Secara default peta memakai tile **OpenStreetMap** yang keyless dan tanpa watermark. Jika ingin tampilan **CARTO Voyager** seperti sebelumnya, isi API key CARTO di `.env.local`:

```bash
VITE_CARTO_API_KEY=isi_key_anda
```

Key gratis untuk non-komersial bisa diminta di https://carto.com/basemaps/apikey. Tanpa key, tile CARTO akan menampilkan watermark **"API key required"** — karena itu aplikasi otomatis memakai OSM saat key kosong.

> Catatan: variabel `VITE_*` ikut ter-bundle ke sisi client, jadi key bersifat publik. Batasi key per domain di dashboard CARTO.

## Struktur Data

| Aset | Lokasi | Keterangan |
| --- | --- | --- |
| Polygon kabupaten/kota | `public/geojson/kabupaten-simple.geojson` | GeoJSON disederhanakan (515 → 514 wilayah) |
| Pemetaan kode wilayah | `src/data/kabupatenAdm4.json` | `adm2` (kab/kota) → `adm4` (contoh desa) yang divalidasi ke API BMKG |

> Catatan: API BMKG hanya menerima kode level desa/kelurahan (`adm4`). Setiap kabupaten/kota dipetakan ke satu kelurahan/desa sebagai titik referensi prakiraan (data yang sama dipakai BMKG untuk seluruh desa dalam wilayah tersebut). Dua wilayah di provinsi baru Papua Barat Daya memakai kode lama (92.x) karena database BMKG belum memuat kode baru (96.x).

## Cara Menjalankan

```bash
npm install
npm run dev
```

Build produksi: `npm run build` lalu `npm run preview`.

## Deploy ke GitHub Pages (branch `gh-pages`)

Tanpa GitHub Actions — hasil build dikirim langsung ke branch `gh-pages`.

1. Push kode ke GitHub (sekali saja):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<username>/<nama-repo>.git
   git push -u origin main
   ```
2. Build & publish (pakai paket `gh-pages`):
   ```bash
   npm run deploy
   ```
   Perintah ini menjalankan `vite build` lalu mendorong isi `dist` ke branch `gh-pages`.
3. Di GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch** → pilih branch **`gh-pages`** dan folder **`/ (root)`**.
4. Situs live di `https://<username>.github.io/<nama-repo>/`.

> Base path aplikasi memakai nilai relatif (`./`), jadi tidak perlu menyesuaikan nama repo.

## Regenerasi Data

1. **GeoJSON:** unduh dari https://github.com/AlfianAliM/Indonesia-GeoJSON (file `kab_kota.geojson`), lalu simplifikasi:
   ```bash
   npx mapshaper kab_kota.geojson -simplify 2% keep-shapes -o format=geojson public/geojson/kabupaten-simple.geojson
   ```
2. **Pemetaan `adm4`** (validasi langsung ke API BMKG, ±10 menit, hormati batas 60 req/menit):
   ```bash
   npm run data:adm4
   ```
   Skrip `scripts/generate-adm4.js` membaca `scripts/tmp/regencies.csv` & `villages.csv` (sumber: `idn-area-data@4.0.1` via jsDelivr) dan menguji kandidat kode desa tiap kabupaten ke API BMKG.

## Sumber Data & Atribusi

Data prakiraan cuaca © **BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)** — https://data.bmkg.go.id — wajib dicantumkan pada aplikasi. Batas wilayah administrasi dari data terbuka (Kepmendagri) yang dimuat ulang ke GeoJSON oleh komunitas.
