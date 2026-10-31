---
name: uiux-promax
description: Gunakan saat mengubah, menambah, atau mengevaluasi tampilan antarmuka (UI), pengalaman pengguna (UX), desain visual, CSS, responsivitas, aksesibilitas, atau animasi pada project Prakiraan Cuaca Indonesia BMKG. Picu pada kata kunci seperti "desain", "tampilan", "UI", "UX", "styling", "rafactor tampilan", "perbaiki tampilan", "make it pretty", "responsive", "animasi", atau saat mengedit src/*.css / komponen React.
---

# UI/UX PRO MAX — Prakiraan Cuaca Indonesia

Panduan desain tingkat lanjut khusus project ini. Terapkan aturan ini sebelum dan setelah setiap perubahan UI/UX. Tujuan: aplikasi terasa **modern, cepat, mudah dipahami, dan menyenangkan dipakai** pada peta interaktif cuaca.

## 1. Prinsip inti

1. **Map first, detail second.** Peta adalah kanvas utama. Panel detail tidak boleh menutupi/mengurangi kegunaan peta. Interaksi peta (klik, hover, pan, zoom) harus selalu terasa responsif.
2. **Skimmable 3 detik.** Pengguna harus bisa membaca "wilayah mana, cuaca apa, berapa derajat" dalam 3 detik pertama. Informasi penting di atas, yang kurang penting di bawah.
3. **Hierarki satu fokus.** Satu halaman = satu aksi utama (memilih wilayah). Tidak ada elemen yang berebut perhatian dengan peta.
4. **Konsisten & niat.** Setiap ukuran, warna, radius, dan animasi memakai nilai yang sudah didefinisikan (design tokens), bukan angka acak.
5. **Sedikit tapi kuat.** Kurangi jumlah warna dan efek; gunakan lebih banyak kontras, spacing, dan tipografi untuk memisahkan elemen.

## 2. Design tokens (WAJIB dipakai, jangan hardcode)

Semua sudah ada di `src/index.css` pada `:root`. JANGAN menambah nilai duplikat; definisikan token baru hanya bila benar-benar perlu dan taruh di `:root`.

| Token | Nilai | Penggunaan |
| --- | --- | --- |
| `--bg` | `#eef2f7` | latar aplikasi / kartu |
| `--surface` | `#ffffff` | panel, header, dropdown |
| `--text` | `#1e293b` | teks utama |
| `--text-muted` | `#64748b` | label, keterangan, secondary |
| `--border` | `#e2e8f0` | garis pemisah, border kartu |
| `--accent` | `#0284c7` | aksi, fokus, seleksi aktif |
| `--accent-soft` | `#e0f2fe` | hover, background aktif, ring fokus |
| `--accent-deep` | `#0c4a6e` | heading seksi, tautan kuat |
| `--shadow` | `0 10px 30px -12px rgba(2,44,92,.35)` | dropdown, kartu melayang |
| `--sans` | `system-ui, "Segoe UI", Roboto, ...` | font seluruh aplikasi |

Aturan nilai:
- Radius: `8px` (kecil), `10px` (default), `12px` (kartu), `16px` (modal/kartu besar). Selalu bulat penuh (`50%`) hanya untuk elemen melingkar (logo, spinner, avatar).
- Bayangan: pakai `--shadow` untuk elemen mengambang, `0 1px 3px rgba(2,44,92,.08)` untuk kartu menempel.
- Transisi: `150ms` ease untuk warna/ikon, `200ms` ease-out untuk transform/posisi, `300ms` ease untuk panel besar.
- Spacing: kelipatan `4px` (4, 8, 12, 16, 20, 24, 32). Jangan pakai nilai seperti 13px atau 17px.
- Ukuran font: `11.5–12.5px` (label/meta), `13.5–14px` (body), `16–19px` (judul), `21–24px` (suhu utama).

## 3. Struktur tata letak

- Desktop: header atas (`app-header`) + dua kolom — peta (`map-area`) kiri mengembang, panel detail (`panel`) kanan lebar `430px` (maks `42vw`).
- Tablet/mobile (≤900px): satu kolom — peta di atas `50svh`, panel di bawah. JANGAN hilangkan salah satu tanpa alasan kuat.
- Landscape pendek (≤900px & tinggi ≤520px): kembali ke dua kolom untuk menghemat ruang vertikal.
- Gunakan `100svh` (bukan `100vh`) di `.app` untuk kompatibilitas address-bar mobile. Pertahankan `env(safe-area-inset-*)` pada header dan panel.

## 4. Komponen & panduan visual

### Peta (`WeatherMap.jsx`)
- Warna polygon: netral saat idle, `--accent` saat hover, lebih pekat saat terpilih. Berikan stroke tipis (`--border`/putih) agar batas wilayah terbaca.
- Selalu tampilkan tooltip nama kabupaten saat hover/klik.
- Overlay "memuat data wilayah" (`map-overlay`) wajib tampil sampai polygon siap — jangan pernah render peta kosong tanpa penjelasan.
- Kontrol zoom/atribusi Leaflet jangan ditutupi panel atau header (perhatikan `z-index`).

### Pencarian (`SearchBox.jsx`)
- Input memakai padding `10px 14px`, radius `10px`, background `--bg`.
- Fokus: border `--accent` + ring `0 0 0 3px rgba(2,132,199,.15)`. Pertahankan outline untuk navigasi keyboard.
- Dropdown: `--surface`, border `--border`, radius `10px`, `--shadow`, `max-height 320px` scroll, `z-index` di atas peta.
- Item hasil: hover & item aktif memakai `--accent-soft`. Tampilkan baris sekunder (provinsi) dalam `--text-muted` 12px.
- Kosong hasil → tampilkan `search-empty` yang membantu (bukan diam saja).

### Panel cuaca (`WeatherPanel.jsx`, `WeatherCard.jsx`)
- `panel-state`: halaman awal/loading/error yang menarik secara visual — gunakan ikon besar (`panel-illustration`) + judul + penjelasan singkat, bukan teks mentah.
- Header wilayah: nama besar (19px, bold) + provinsi/waktu (13px, `--text-muted`). Koordinat jangan sampai wrap di desktop (`white-space: nowrap`).
- Kartu per periode 3 jam: waktu (label), ikon cuaca BMKG (`44px`), suhu besar (24px), deskripsi, lalu grid metrik 2 kolom. Gunakan `<dl>`/`<dt>`/`<dd>` sebagaimana sudah ada.
- Bagian hari ("Hari Ini / Besok / Lusa"): label uppercase kecil `--accent-deep` dengan `letter-spacing`.
- Ikon gagal dimuat → fallback teks (`card-icon-fallback`), jangan broken image.

### Header (`app-header`)
- Brand + searchbox sejajar. Pada mobile, brand di atas, searchbox penuh lebar.
- Logo emoji (`🌦️`) sudah oke; jangan ganti dengan gambar berat.

## 5. Keadaan (states)

Setiap komponen interaktif wajib punya keempat state: **default, hover, active/focus, disabled**. Verifikasi tiap perubahan.

| Keadaan | Perlakuan |
| --- | --- |
| Loading | Spinner `--accent` di atas `--accent-soft` (`.spinner`), tetap berjalan halus (0.8s linear). Jangan flash konten lama. |
| Empty | Ilustrasi + pesan ramah + ajakan aksi (mis. "Klik wilayah di peta"). |
| Error | Warna `#b91c1c` (`.panel-error`), pesan singkat yang bisa ditindaklanjuti, plus tombol coba lagi bila masuk akal. |
| Sukses | Data muncul dengan transisi ringan (fade/slide 200ms), tidak mengejutkan. |

## 6. Responsivitas & performa

- Selalu uji tiga breakpoint yang sudah ada: `900px` (tablet/mobile), `480px` (HP kecil), landscape pendek. Pertahankan media query yang sudah ada di `src/App.css`; tambah hanya bila perlu.
- Input search di mobile: ukuran font ≥16px agar iOS tidak zoom otomatis saat fokus.
- Jangan menaruh animasi berat pada peta (Leaflet sudah berat); animasi boleh untuk panel, kartu, dan transisi.
- Kurangi re-render: komponen peta memakai memo/useCallback seperti yang sudah ada di `App.jsx`.

## 7. Aksesibilitas (jangan dilewati)

- Semua interaktif dapat dioperasikan keyboard (button/asli, bukan div onClick). SearchBox sudah punya navigasi panah — jangan rusak.
- Kontras: teks biasa ≥ 4.5:1 terhadap latarnya; teks besar/ikon dekoratif ≥ 3:1. `--text-muted` (#64748b) pada `--surface` putih aman untuk teks sekunder — jangan membuatnya lebih terang.
- Focus visible: setiap fokus keyboard tampak jelas (ring `--accent` 3px alpha 0.15).
- Semua ikon visual punya `aria-hidden` bila dekoratif + label teks pendamping. `<dt>/<dd>`, `<h1..h3>` dipakai sesuai peran semantiknya.
- Atribusi BMKG wajib tampil dan terbaca (kepatuhan lisensi data) — jangan pernah hilangkan.

## 8. Checklist final (jalankan sebelum selesai)

- [ ] Tidak ada warna/radius/spacing acak di luar tokens.
- [ ] Kontras teks memenuhi WCAG (≥4.5:1 teks biasa).
- [ ] Fokus keyboard terlihat di semua elemen interaktif.
- [ ] Empat state (default/hover/active/disabled) terdefinisi.
- [ ] Responsif di 3 breakpoint + landscape pendek; tidak ada scroll horizontal.
- [ ] Peta tetap berfungsi penuh (klik, zoom, tooltip) setelah perubahan panel/header.
- [ ] Loading & error state terlihat baik (tidak blank).
- [ ] Tidak ada broken image (ikon cuaca BMKG punya fallback).
- [ ] Tidak ada regresi pada fungsi pencarian keyboard.
- [ ] Atribusi BMKG masih ada.
- [ ] `npm run lint` bersih (jalankan oxlint setelah edit komponen).

## 9. Contoh — pola penulisan yang sesuai

```css
.weather-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  background: var(--bg);
  box-shadow: 0 1px 3px rgba(2, 44, 92, 0.08);
  transition: transform 200ms ease-out, border-color 200ms ease-out, box-shadow 200ms ease-out;
}

.weather-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: var(--shadow);
}
```

```jsx
<button
  type="button"
  className="retry-button"
  onClick={onRetry}
  aria-label={`Coba muat ulang cuaca untuk ${region?.nama}`}
>
  Muat Ulang
</button>
```

## 10. Anti-pola yang DILARANG

- ❌ Emoji sebagai pengganti ikon pada data penting (kecuali logo/ilustrasi state).
- ❌ Warna langsung (`#333`, `red`) di luar token dan warna error/sukses yang disepakati.
- ❌ `!important` (hampir selalu tanda spesifisitas bermasalah).
- ❌ Animasi tanpa `prefers-reduced-motion` pertimbangan — tambahkan `@media (prefers-reduced-motion: reduce)` bila menambah animasi.
- ❌ Font dari Google Fonts (membebani build offline / GitHub Pages) tanpa permintaan eksplisit.
- ❌ Menghapus media query yang sudah ada tanpa uji visual ulang.
