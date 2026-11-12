# Stock Opname RITA — Frontend

Antarmuka web untuk menjalankan stock opname gudang: membuat sesi, membagi rak ke
koordinator, mengunggah master produk (PLU dan barcode), meninjau hasil hitung, dan
mengekspor laporan.

Aplikasi ini adalah *single page application* yang hanya berbicara dengan API Go di
repo `stockopname-rita-backend`. Semua panggilan API memakai jalur relatif `/api`,
sehingga di produksi frontend dan backend berada di satu host.

---

## Daftar isi

1. [Fitur](#fitur)
2. [Stack](#stack)
3. [Prasyarat](#prasyarat)
4. [Menjalankan di lokal](#menjalankan-di-lokal)
5. [Perintah](#perintah)
6. [Struktur folder](#struktur-folder)
7. [Istilah domain](#istilah-domain)
8. [Alur kerja utama](#alur-kerja-utama)
9. [Autentikasi](#autentikasi)
10. [Konvensi kode](#konvensi-kode)
11. [Build dan deploy](#build-dan-deploy)
12. [Pemecahan masalah](#pemecahan-masalah)
13. [Uji asap manual](#uji-asap-manual)
14. [Batasan yang perlu diketahui](#batasan-yang-perlu-diketahui)

---

## Fitur

- **Sesi stock opname** — daftar, pencarian, pembuatan, dan penghapusan sesi.
- **Koordinator dan rak** — pembagian range rak per koordinator, status progres per rak.
- **Master produk** — kelola PLU, nama, harga beli/jual, departemen, isi karton, dan
  barcode; impor massal dari pasangan berkas `PRODUK.DBF` + `BARCODE.DBF`.
- **Hasil hitung** — tabel hasil per sesi/koordinator/rak, koreksi admin, pemindahan
  baris antar rak, dan riwayat perubahan (audit).
- **Ekspor** — PDF, Excel, dan DBF per sesi maupun per koordinator.
- **Tema** — terang (paper) dan gelap (onyx).

## Stack

| Bagian | Pilihan |
|---|---|
| Runtime UI | React 19, TypeScript 6 dengan `strict` |
| Build | Vite 8, typecheck lewat `tsc -b` |
| Gaya | Tailwind CSS 4; komponen bergaya shadcn di `src/components/ui` |
| Routing | react-router-dom 7, halaman di-*lazy load* per chunk |
| Tabel | @tanstack/react-table, primitives dari @base-ui/react |
| Pendukung | lucide-react (ikon), react-toastify (notifikasi), qrcode.react |

Tidak ada framework test di repo ini. Verifikasi dilakukan lewat build, lint, dan uji
asap manual (lihat bagian [Uji asap manual](#uji-asap-manual)).

## Prasyarat

- **Node.js 22 atau lebih baru.** CI dan image produksi memakai Node 22; Node 24 di
  mesin lokal juga berjalan.
- **npm** (sudah termasuk dalam Node).
- **Backend berjalan di `http://localhost:8080`.** Tanpa itu aplikasi tetap terbuka
  tetapi menampilkan halaman login lalu gagal saat memanggil `/auth/me`.

## Menjalankan di lokal

```bash
npm ci
```

Salin berkas lingkungan:

```bash
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```

Isinya cukup satu baris:

```dotenv
VITE_API_URL=/api
```

Jalankan dev server:

```bash
npm run dev
```

Buka `http://localhost:5173`.

### Kenapa `/api` dan bukan alamat backend langsung

Dev server memproxy `/api` ke backend dan membuang prefix-nya (`vite.config.ts`):

```
browser → localhost:5173/api/auth/me
        → (proxy Vite) → localhost:8080/auth/me
```

Browser melihat semuanya sebagai satu host, sehingga cookie sesi tetap *first-party*.
Konsekuensinya tidak ada CORS yang perlu diatur dan tidak ada perbedaan perilaku
antara lokal dan produksi. Kalau `VITE_API_URL` diisi alamat absolut, cookie tidak
akan ikut terkirim pada request lintas situs dan login tidak akan pernah berhasil.

Kredensial login berasal dari `.env` backend: `AUTH_USERNAME` dan hash
`AUTH_PASSWORD_HASH`. Di mesin lokal biasanya `AUTH_USERNAME=admin`.

## Perintah

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Dev server dengan HMR di port 5173 |
| `npm run build` | `tsc -b && vite build`, hasilnya di `dist/` |
| `npm run lint` | ESLint untuk seluruh `src` |
| `npm run preview` | Menyajikan hasil `dist/` secara lokal |

> **Penting soal typecheck.** `npx tsc --noEmit` **tidak memeriksa apa pun** di repo
> ini. `tsconfig.json` hanya berisi `references` tanpa file, sehingga perintah itu
> selesai seketika seolah semuanya benar. Typecheck yang sebenarnya adalah
> `npm run build` (`tsc -b`). Selalu jalankan build sebelum menyimpulkan kode bersih.

## Struktur folder

```
src/
├── pages/                halaman per fitur
│   ├── stock-opname/     daftar sesi, halaman sesi, koordinator, produk, hasil
│   ├── login-page.tsx
│   └── operator-page.tsx
├── components/
│   ├── ui/               primitives: button, card, dialog, table, toast, sidebar, …
│   └── layout/           sidebar, main layout, scroll-to-top
├── services/             satu berkas per domain; seluruh panggilan API lewat sini
├── lib/                  klien API, konteks auth, util (format, tema, tabel, error)
├── types/                tipe request/response per domain
└── App.tsx               definisi rute dan gerbang sesi
```

Impor selalu memakai alias `@/` yang menunjuk ke `src/`, bukan jalur relatif
bertingkat seperti `../../`.

## Istilah domain

| Istilah | Arti |
|---|---|
| **Sesi** | Satu kegiatan stock opname di satu lokasi, mis. "Gudang A — 10 Sep 2026". |
| **Koordinator** | Penanggung jawab sekelompok rak dalam satu sesi. |
| **Rak** | Unit lokasi hitung; punya status kosong, terisi, sudah diunggah, dan seterusnya. |
| **Upload** | Satu kiriman hasil hitung dari aplikasi mobile untuk satu rak. Setiap upload memiliki pemilik barisnya sendiri. |
| **Master produk** | Daftar PLU beserta harga, departemen, isi karton, dan barcode untuk satu sesi. |
| **Hasil SO** | Baris hitung: produk, rak, jumlah, dan snapshot harga saat baris dibuat. |
| **Snapshot** | Harga dan departemen disalin saat baris dibuat agar laporan lama tidak berubah ketika master diperbarui. |
| **Audit** | Riwayat perubahan baris hasil (nilai sebelum dan sesudah), dikelompokkan per batch. |

## Alur kerja utama

1. **Buat sesi** — isi kode, lokasi, lalu bagi range rak ke tiap koordinator.
2. **Impor master** — unggah `PRODUK.DBF` dan `BARCODE.DBF`. Gunakan opsi *dry-run*
   lebih dulu untuk memastikan jumlah baris dan tidak ada baris invalid sebelum
   menulis ke database.
3. **Hitung di lapangan** — koordinator memindai rak lewat aplikasi mobile; hasilnya
   masuk sebagai upload.
4. **Tinjau** — buka halaman sesi atau koordinator untuk melihat progres, mengoreksi
   jumlah, memindahkan baris antar rak, dan membaca riwayat perubahan.
5. **Ekspor** — unduh laporan PDF, Excel, atau DBF.

## Autentikasi

```
buka /stock-opname
  └─ GET /auth/me
      ├─ belum login ───────────────► /login
      └─ sudah login
            ├─ nama operator kosong ──► /operator (tidak bisa dilewati)
            └─ nama terisi ───────────► aplikasi
```

- Sesi disimpan di cookie `rita_session` yang `HttpOnly` dan berlaku 12 jam.
  **Tidak ada token di `localStorage`.**
- Semua request memakai `credentials: "include"`.
- Bila sebuah request dijawab 401, `api()` mengirim event `rita:unauthorized`;
  `AuthProvider` mengosongkan state dan aplikasi kembali ke `/login`.
- Nama operator diketik bebas setelah login dan dipakai sebagai aktor pada audit.
  Nama itu **tidak diverifikasi** oleh sistem — yang didapat adalah pintu masuk
  terkunci ditambah jejak kebiasaan, bukan bukti identitas per orang.
- **Ganti operator** dan **Keluar** tersedia di kaki sidebar.

## Konvensi kode

- **Seluruh akses API melewati `src/services/`.** Halaman tidak memanggil `fetch`
  langsung. Gunakan `api()`, `apiForm()`, `apiFormWithProgress()`, atau `apiBlob()`
  dari `@/lib/api`.
- **Pesan error untuk pengguna** diambil lewat `errorMessage(err, fallback)` dari
  `@/lib/errors`, bukan `err.message` mentah.
- **TypeScript ketat**: `strict`, `noUnusedLocals`, `noUnusedParameters`, dan
  `erasableSyntaxOnly`. Hindari `any`; pakai `unknown` lalu sempitkan tipenya.
- **Halaman baru** didaftarkan sebagai `lazy()` di `App.tsx` di dalam rute bergerbang
  sesi, bukan impor statis, supaya bundle awal tetap kecil.
- **Komponen UI yang dipakai ulang** diletakkan di `src/components/ui`; komponen yang
  khusus satu halaman diletakkan di dekat halaman tersebut.
- **Nama berkas** memakai kebab-case (`product-master-card.tsx`), komponen memakai
  PascalCase.

## Build dan deploy

`VITE_API_URL` **dibakar saat build**, bukan dibaca saat runtime:

```dockerfile
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build
```

Karena itu mengubah nilai ini menuntut image baru, bukan sekadar restart container.

Alur rilis:

1. Push ke `master` memicu `.github/workflows/release.yml`.
2. Job `CI` menjalankan `npm ci`, `npm run build`, dan `npm run lint`.
3. Image dibangun dari `Containerfile` (stage `node:22-alpine` → `nginx:alpine`) lalu
   didorong ke `ghcr.io/<owner>/<repo>` dengan tag `sha-xxxxxxx` dan `latest`.
4. VPS menjalankan `deploy-frontend.sh <tag>` lewat SSH.

Di VPS, nginx host memproxy `rita.albertt.my.id` ke container ini dan `/api/` ke
container backend. Pengaturan di dalam container (`nginx.conf`):

- `/assets/*` → `try_files $uri =404` dengan `Cache-Control: immutable`. Berkas yang
  sudah tidak ada dijawab 404, bukan `index.html`, supaya browser tidak mencoba
  mengeksekusi HTML sebagai modul JavaScript.
- `/` → `index.html` dengan `Cache-Control: no-cache`, agar deploy berikutnya
  langsung terpakai dan tidak ada tab yang tertinggal di bundle lama.

## Pemecahan masalah

| Gejala | Penyebab yang paling sering |
|---|---|
| `VITE_API_URL belum diisi` saat start | `.env` belum dibuat, atau perintah dijalankan dari folder yang salah |
| Login selalu "username atau password salah" | kredensial di `.env` backend berbeda, atau `AUTH_USERNAME` bukan `admin` |
| Login berhasil lalu langsung kembali ke `/login` | cookie bertanda `Secure` diakses lewat `http`; set `COOKIE_SECURE=false` untuk dev |
| Semua halaman menjawab 401 setelah deploy | tab masih memakai bundle lama; lakukan hard reload (Ctrl+F5) |
| Halaman kosong setelah deploy | aset lama 404; pastikan `nginx.conf` terbaru ikut ter-build |
| Data tidak muncul padahal backend hidup | periksa tab Network: apakah memanggil `/api/...` dan berapa statusnya |
| Impor master berjalan lama tanpa hasil | impor puluhan ribu baris memang menit-menitan; panel progres akan menghitung detik |
| Muncul 502 dari nginx | container backend mati; periksa `docker logs` di VPS |

## Uji asap manual

Belum ada test otomatis, jadi tujuh langkah ini yang dipakai sebelum rilis:

1. Buka `/stock-opname` tanpa login → terlempar ke `/login`.
2. Masukkan password salah → muncul "Username atau password salah." dan tetap di
   halaman login.
3. Masukkan password benar → layar "Siapa yang bertugas?". Buka `/stock-opname`
   langsung → kembali ke layar operator.
4. Isi nama → aplikasi tampil dan nama muncul di kaki sidebar.
5. Reload halaman → sesi bertahan dan nama tetap.
6. Buka sebuah sesi → halaman sesi, koordinator, produk, dan audit termuat.
7. Tekan **Ganti operator** (nama bisa diganti) lalu **Keluar** → kembali ke `/login`
   dan `GET /api/stockopname/sessions` menjawab 401.

## Batasan yang perlu diketahui

- **Nama operator bukan bukti identitas.** Satu kredensial dipakai bersama; nama
  diketik sendiri. Audit trail berguna untuk menelusuri kebiasaan, bukan untuk
  membuktikan siapa yang menekan tombol.
- **Impor master bersifat sinkron.** Satu request menahan sampai seluruh baris selesai
  diproses, sehingga berkas berukuran ratusan ribu baris bisa melampaui timeout
  klien, nginx, maupun `WriteTimeout` backend. Untuk data sebesar itu, naikkan
  timeout di ketiga lapisan lebih dulu.
- **Frontend tidak memiliki test otomatis.** Perubahan perilaku diverifikasi dengan
  build, lint, dan uji asap di atas.
