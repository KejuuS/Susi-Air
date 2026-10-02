# Susi Air Pilot App

Ini potongan kecil dari aplikasi pilot Susi Air. Bentuknya web app yang dirancang untuk layar HP: pilot login, lalu bisa melihat seberapa dekat jam terbangnya dengan batas, mengecek dokumen mana yang mau habis masa berlakunya, dan membuka jadwal bulanannya.

Repo ini isinya dua aplikasi:

- `nest/` adalah backend-nya (NestJS 11, TypeScript). Semua perhitungan ada di sini, datanya diambil dari tiga file JSON contoh.
- `nuxt/` adalah tampilan web-nya (Nuxt 3, Vue 3, Pinia, SCSS). Sengaja dibuat "polos": dia cuma menampilkan apa yang dikirim API.
- `mock-data/` berisi file JSON asli dari brief. API pakai salinannya sendiri di `nest/src/data/json/`, jadi API bisa di-deploy tanpa folder ini.

Untuk login, pakai **`johndoe`** dan password **`susiairtest`**.

**Versi online-nya bisa langsung dicoba di <https://susi-air-azkal.vercel.app>.** API-nya ada di <https://susi-air-api.vercel.app> (cek <https://susi-air-api.vercel.app/health>).

## Daftar isi

1. [Menjalankan di komputer sendiri](#menjalankan-di-komputer-sendiri)
2. [Pengaturan (environment variables)](#pengaturan-environment-variables)
3. [Daftar endpoint API](#daftar-endpoint-api)
4. [Keputusan teknis dan alasannya](#keputusan-teknis-dan-alasannya)
5. [Kasus khusus perhitungan jam terbang](#kasus-khusus-perhitungan-jam-terbang)
6. [Keanehan di data](#keanehan-di-data)
7. [Catatan soal tampilan](#catatan-soal-tampilan)
8. [Pengujian](#pengujian)
9. [Cara deploy](#cara-deploy)
10. [Kalau ada waktu lebih](#kalau-ada-waktu-lebih)

## Menjalankan di komputer sendiri

Yang perlu ada cuma Node.js versi 20.18 ke atas (saya sarankan Node 22 LTS) dan npm. Bisa dicek pakai `node -v`.

Jalankan API-nya dulu di satu terminal:

```bash
cd nest
npm install
npm run start:dev
```

Kalau sudah muncul `API listening on port 3001`, biarkan terminal itu terbuka. Lalu buka terminal kedua untuk web-nya:

```bash
cd nuxt
npm install
npm run dev
```

Setelah muncul `Local: http://localhost:3000/`, buka <http://localhost:3000> di browser dan login dengan akun di atas. Kalau mau mengecek API-nya saja, buka <http://localhost:3001/health>, yang seharusnya membalas `{"status":"ok","today":"2026-05-15"}`. Untuk mematikan aplikasinya, tekan `Ctrl+C` di terminal masing-masing.

File `.env` tidak wajib dibuat, karena semua pengaturan sudah punya nilai bawaan. Kalau ingin mengubah sesuatu, salin dulu file contohnya dengan `cp .env.example .env` (bash) atau `Copy-Item .env.example .env` (PowerShell).

Satu hal kecil untuk pengguna Windows: PowerShell 5.1 tidak mengenal `&&`, jadi jalankan perintahnya satu per satu seperti contoh di atas.

Beberapa perintah yang mungkin berguna:

| Aplikasi | Perintah | Untuk apa |
|---|---|---|
| nest | `npm run start:dev` | Menjalankan API, otomatis restart tiap kode diubah |
| nest | `npm run build` lalu `npm run start:prod` | Build dan jalankan versi production |
| nest | `npm test` | Unit test |
| nest | `npm run test:e2e` | Tes end-to-end API |
| nest | `npm run lint` | Merapikan dan mengecek gaya kode |
| nuxt | `npm run dev` | Menjalankan web, halaman langsung ter-update saat kode diubah |
| nuxt | `npm run build` lalu `npm run preview` | Build versi production dan coba di lokal |
| nuxt | `npm run typecheck` | Cek kesalahan tipe di semua file `.ts` dan `.vue` |

## Pengaturan (environment variables)

### API (`nest/.env.example`)

| Variabel | Nilai bawaan | Kegunaan |
|---|---|---|
| `PORT` | `3001` | Port API saat dijalankan sebagai server biasa. Di Vercel tidak dipakai, dan di Render atau Railway diisi sendiri oleh platform-nya. |
| `APP_TODAY` | `2026-05-15` | Tanggal yang dianggap "hari ini" oleh seluruh aplikasi. |
| `JWT_SECRET` | `dev-only-change-me` | Kunci untuk membuat token login. Selama masih nilai bawaan, API akan menampilkan peringatan saat start. Di production harus diganti. |
| `JWT_EXPIRES_IN_SECONDS` | `3600` | Berapa lama token berlaku, dalam detik (3600 berarti 1 jam). |
| `AUTH_USERNAME` | `johndoe` | Username satu-satunya akun pilot. |
| `AUTH_PASSWORD` | `susiairtest` | Password akun tersebut. |
| `CORS_ORIGIN` | `http://localhost:3000` | Alamat web yang boleh memanggil API. Bisa lebih dari satu, dipisah koma, tanpa garis miring di akhir. |

Semua nilai ini dicek begitu API dinyalakan. Jadi kalau ada yang salah ketik, misalnya `APP_TODAY=2026-02-30` (tanggal yang tidak ada), API langsung berhenti dengan pesan yang jelas, bukannya error aneh belakangan.

### Web (`nuxt/.env.example`)

| Variabel | Nilai bawaan | Kegunaan |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | `http://localhost:3001` | Alamat API, tanpa garis miring di akhir. |

## Daftar endpoint API

Hampir semua endpoint butuh token login di header `Authorization: Bearer <token>`. Pengecualiannya cuma tiga yang ditandai "publik" di tabel ini.

| Method | Alamat | Balasannya |
|---|---|---|
| POST | `/auth/login` (publik) | `{ accessToken, expiresIn, pilot: { name } }`. Kalau username atau password salah, balasannya 401 dengan pesan `Invalid username or password`. |
| GET | `/health` (publik) | `{ status, today }`, untuk mengecek API hidup atau tidak. |
| GET | `/pilot/me` | `{ name, totalFlightHours, avatarUrl }` |
| GET | `/pilot/avatar.svg` (publik) | Gambar avatar berisi inisial nama. Dibuat publik supaya bisa langsung dipakai di tag `<img>`. |
| GET | `/flight-hours?from=YYYY-MM-DD&to=YYYY-MM-DD` | Jam terbang per hari dalam rentang tanggal: `{ from, to, today, days: [{ date, hours, isFuture }] }`. Setiap tanggal pasti ada, yang tidak punya data diisi `0`. |
| GET | `/flight-hours/summary?range=1w\|1m\|3m\|6m\|1y` | Data grafik plus empat kartu batas jam: `{ range, today, windowDays, limit, yMax, points, cards }`. Kalau `range` dikosongkan, dipakai `1w`. |
| GET | `/documents` | Dokumen pilot lengkap dengan sisa hari dan statusnya, `{ today, warningDays, documents: [...] }`, diurutkan dari yang paling mendesak. |
| GET | `/schedules?year=YYYY&month=M` | Jadwal sebulan dan legenda warnanya: `{ year, month, today, entries, legend }`. Kalau tahun dan bulan tidak diisi, yang dikirim bulan "hari ini". |

Kalau berhasil, balasannya selalu objek JSON biasa (tidak dibungkus `{ data }`). Daftar data juga selalu ada di dalam objek, supaya nanti bisa menambah field baru tanpa merusak aplikasi yang sudah memakainya.

Untuk error, saya buat semuanya punya bentuk yang sama, apa pun penyebabnya. Mau itu input yang salah, belum login, alamat yang tidak ada, isi request yang rusak, atau server yang error, frontend cukup menangani satu format ini:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [{ "field": "to", "messages": ["to must be on or after from"] }],
  "path": "/flight-hours?from=2026-05-10&to=2026-05-01",
  "timestamp": "2026-10-02T03:15:00.000Z"
}
```

`details` hanya terisi kalau inputnya tidak valid. Untuk error 500, detail dari dalam server tidak pernah ikut dikirim.

Soal pengecekan input, aturannya begini. Tanggal harus berformat `YYYY-MM-DD` dan memang ada di kalender, jadi `2026-02-30` ditolak. Di `/flight-hours`, `from` tidak boleh lebih besar dari `to` dan rentangnya paling panjang 366 hari. `range` cuma boleh salah satu dari lima pilihan, `month` harus angka 1 sampai 12, dan parameter yang tidak dikenal juga ditolak.

Kalau mau mencoba dari terminal (bash):

```bash
TOKEN=$(curl -s -X POST localhost:3001/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"johndoe","password":"susiairtest"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).accessToken')

curl -H "Authorization: Bearer $TOKEN" "localhost:3001/flight-hours/summary?range=1m"
curl -H "Authorization: Bearer $TOKEN" "localhost:3001/schedules?year=2026&month=6"
```

## Keputusan teknis dan alasannya

### "Hari ini" cuma diatur di satu tempat

Aplikasi ini selalu jalan seolah-olah hari ini 15 Mei 2026. Tanggalnya diambil dari `APP_TODAY` lewat satu komponen, `ClockService`. Semua bagian lain bertanya ke komponen ini dan tidak ada yang memakai jam komputer (`new Date()`) untuk menentukan hari ini. Jadi kalau mau ganti tanggal, cukup ubah satu pengaturan. Tes otomatis juga memakai cara yang sama.

File data contohnya sebenarnya punya field `today` sendiri-sendiri, dan isinya beda: `mock-documents.json` bilang `2026-05-31`, sedangkan `mock-schedules.json` bilang `2026-05-15`. Keduanya sengaja saya abaikan supaya semua fitur sepakat di satu tanggal. Kalau tanggal dari file dokumen ikut dipakai, Security Clearance akan terlihat telat 30 hari di daftar dokumen, sementara bagian lain aplikasi menganggap sekarang masih pertengahan Mei.

Semua hitungan tanggal memakai teks `YYYY-MM-DD` dan zona waktu UTC (pakai `dayjs`). Dengan begitu hasilnya selalu sama di server mana pun, termasuk kalau dibuka dari WIB.

### Belum pakai database

Datanya cukup disimpan di memori. Waktu API start, file JSON dibaca sekali, lalu bagian lain aplikasi mengambil data lewat tiga "repository" kecil. Keuntungannya, kalau nanti mau pindah ke database sungguhan, yang perlu diganti cuma lapisan repository itu.

Bentuk file JSON-nya juga ikut dicek oleh TypeScript. Kalau suatu saat strukturnya berubah, kesalahannya langsung ketahuan waktu build, bukan setelah aplikasi berjalan.

### Menghitung total jam berjalan (rolling sum)

Fungsi `FlightHoursService.rollingSum(tanggal, jumlahHari)` menghitung total jam terbang dalam beberapa hari terakhir yang berakhir di tanggal tersebut. Contohnya, total 7 hari sampai 15 Mei.

Supaya cepat, saya pakai trik jumlah kumulatif (*prefix sum*). Waktu API start, saya susun dulu jam terbang per hari dari data pertama sampai terakhir tanpa ada tanggal yang bolong (tanggal yang tidak ada di file diisi 0). Dari situ dibuat deret jumlah kumulatif, yaitu total jam dari awal sampai hari itu. Setelah itu, total untuk rentang berapa pun cukup didapat dari satu pengurangan: kumulatif di akhir rentang dikurangi kumulatif tepat sebelum rentang dimulai. Jadi tidak perlu menjumlahkan sampai 365 angka setiap kali grafik minta satu titik. Hasilnya saya bandingkan di tes dengan cara menjumlah biasa, untuk setiap tanggal dan panjang rentang 1 sampai 20 hari.

Angkanya baru dibulatkan ke satu angka di belakang koma saat menyiapkan balasan API, tidak di tengah perhitungan, jadi tidak akan muncul angka seperti `12.299999`. Tanda "lewat batas" dan status kartu juga dihitung dari angka yang sudah dibulatkan, supaya tandanya selalu cocok dengan angka yang terlihat di layar.

Pengaturan grafik tidak saya tulis langsung di kode, tapi diambil dari `chartBounds` dan `limits` di file JSON:

| Pilihan | Rentang | Batas | Tinggi maksimal grafik |
|---|---|---|---|
| 1w | 7 hari | 40 | 45 |
| 1m | 30 hari | 100 | 125 |
| 3m | 90 hari | 300 | 325 |
| 6m | 180 hari | 600 | 625 |
| 1y | 365 hari | 1050 | 1200 |

Grafiknya menampilkan 15 titik: 7 hari sebelum hari ini, hari ini, dan 7 hari sesudahnya.

Empat kartu batas jam selalu dihitung per hari ini, apa pun pilihan rentang di grafik:

| Kartu | Rentang | Batas |
|---|---|---|
| Daily | 1 hari | 8 jam |
| Weekly | 7 hari | 40 jam |
| Monthly | 30 hari | 100 jam |
| Annual | 365 hari | 1050 jam |

Statusnya `safe` kalau masih di bawah 80% dari batas, `warning` kalau sudah 80% sampai 100%, dan `over` kalau sudah lewat 100%. Tepat di batas masih saya anggap boleh. Untuk 15 Mei 2026, hasilnya seperti ini:

| Kartu | Terpakai / batas | Persen | Status |
|---|---|---|---|
| Daily | 6.4 / 8 | 80% | warning |
| Weekly | 25.2 / 40 | 63% | safe |
| Monthly | 87.2 / 100 | 87.2% | warning |
| Annual | 1,013.8 / 1,050 | 96.6% | warning |

### Dokumen

Sisa hari (`daysRemaining`) dihitung dari tanggal kedaluwarsa dikurangi hari ini, dalam hari penuh. Batas peringatannya diambil dari `warningDays` di JSON, yaitu 30 hari. Kalau sisa harinya 0 atau kurang, statusnya `expired`. Kalau 1 sampai 30 hari, `soon`. Lebih dari itu, `safe`.

Daftarnya diurutkan dari yang paling mendesak. Untuk 15 Mei 2026:

| Dokumen | Sisa hari | Status |
|---|---|---|
| Security Clearance | -14 | expired |
| Indonesian License | 14 | soon |
| Indonesian Medical | 27 | soon |
| Recurrent | 152 | safe |
| PPC | 224 | safe |

Ada tes yang memastikan hasilnya persis seperti tabel ini.

### Jadwal

Untuk jadwal, API memfilter data per bulan, mengurutkannya per tanggal, dan mengubah nama field dari `snake_case` di JSON jadi `camelCase`. Setiap hari juga diberi tiga field tambahan hasil hitungan. `remaining` adalah jumlah jadwal dikurangi logbook yang sudah diisi (tidak pernah minus). `isComplete` bernilai `true` kalau semua logbook sudah terisi. `isToday` menandai tanggal hari ini.

Legenda warnanya selalu ikut dikirim lengkap, jadi aplikasi web tidak perlu menyimpan daftar jenis tugas sendiri.

### Login dan keamanan

`POST /auth/login` mencocokkan username dan password dengan pengaturan, lalu mengembalikan token JWT. Username dan password selalu dicek dua-duanya dengan cara yang waktunya konstan, jadi orang tidak bisa menebak mana yang salah dari cepat-lambatnya balasan.

Token diperiksa oleh satu "penjaga" (*guard*) global di setiap endpoint. Endpoint yang memang boleh dibuka tanpa login (login, health, dan avatar) cukup ditandai `@Public()`. Penjaganya saya tulis sendiri di satu file kecil pakai `JwtService.verifyAsync`. Menurut saya itu lebih masuk akal daripada menambah Passport, yang butuh tiga paket tambahan hanya untuk satu cara login.

### Log aktivitas

Setiap request ke API dicatat satu baris di terminal API, lengkap dengan status dan berapa lama prosesnya, plus pesan error kalau ada. Login juga dicatat berhasil atau gagal, tapi password-nya tidak pernah ditulis:

```
[HTTP] POST /auth/login 401 5ms - Invalid username or password
[Auth] Login succeeded for "johndoe"
[HTTP] GET /flight-hours/summary?range=1m 200 3ms
```

Waktu development, web-nya juga mencatat aktivitasnya sendiri: tombol apa yang diklik, API mana yang dipanggil, dan pindah ke halaman mana. Catatan ini muncul di console browser dan juga di terminal `npm run dev`, lewat satu alamat khusus development (`/_dev/log`). Di versi production pencatat ini diam saja, dan alamat itu cuma membalas 404.

### Library dan versi yang dikunci

Saya usahakan library-nya seminimal mungkin:

| Library | Dipakai untuk |
|---|---|
| `@nestjs/config` | Membaca dan mengecek pengaturan |
| `@nestjs/jwt` | Membuat dan memeriksa token login |
| `class-validator`, `class-transformer` | Mengecek input request |
| `dayjs` | Hitungan tanggal di API |
| `pinia`, `@pinia/nuxt` | Menyimpan data di sisi web |
| `lucide-vue-next` | Ikon |
| `sass` | Menulis style (SCSS) |

Tidak ada library grafik dan tidak ada paket komponen UI.

Ada beberapa versi yang sengaja saya kunci supaya proyek ini tetap bisa jalan di Node 20.18. Nuxt saya kunci di `3.17.7`, karena mulai 3.18 Nuxt butuh minimal Node 20.19. `@pinia/nuxt` saya kunci di `0.11.2` (dengan Pinia 3), karena versi setelahnya sudah ditujukan untuk Nuxt 4. Lalu `@nestjs/config` 4 dan `@nestjs/jwt` 11, karena versi terbarunya hanya tersedia dalam format modul ESM yang tidak bisa dimuat build NestJS ini di Node 20.18.

Soal `npm audit`: untuk API hasilnya bersih. Untuk web, ada beberapa peringatan di paket bawaan Nuxt 3.17, yaitu devtools dan plugin build untuk Netlify dan minifier. Saya sudah cek hasil build-nya, dan tidak ada satu pun dari paket itu yang ikut ke aplikasi yang di-deploy (folder `.output`). Semuanya cuma jalan di komputer developer. Untuk benar-benar menghilangkannya perlu Node 20.19+ dan Nuxt 3.21, dan itu upgrade pertama yang akan saya lakukan.

## Kasus khusus perhitungan jam terbang

Ada empat kasus yang diminta di brief, dan begini cara saya menanganinya.

**Hari tanpa jam terbang.** Dihitung 0. Tanggal yang isinya `hours: 0` dan tanggal yang memang tidak ada di file diperlakukan sama, dan tidak ada tanggal yang dilewati.

**Rentang yang mulai sebelum data ada.** Data baru dimulai 27 Desember 2024, jadi hari-hari sebelumnya dihitung 0. Titik seperti ini diberi tanda `partialWindow: true`, supaya tampilan bisa memberi tahu kalau totalnya belum lengkap.

**Tanggal setelah hari ini.** File-nya berisi jam terbang sampai 31 Mei 2026, padahal yang setelah hari ini belum benar-benar diterbangkan. Jadi untuk titik di masa depan, saya hanya menghitung jam sampai hari ini. Artinya kira-kira: "kalau mulai sekarang tidak terbang lagi, segini total jam berjalanmu di tanggal itu". Menurut saya ini berguna secara operasional, karena terlihat kapan jam-jam lama mulai keluar dari hitungan dan ruang terbang bertambah lagi. Titik ini diberi tanda `isFuture: true` dan di grafik digambar putus-putus.

Pilihan lainnya adalah ikut menghitung jam yang sudah dijadwalkan sebagai proyeksi. Perubahannya kecil di `rollingSum`, misalnya lewat satu parameter tambahan. Endpoint `/flight-hours` (daftar harian mentah) tetap menampilkan jam yang tercatat untuk tanggal ke depan, dengan tanda `isFuture`, karena di sana nilai rencananya memang yang ingin dilihat.

**Nilai yang melewati batas.** Server mengirim angkanya apa adanya, tidak dipotong, dengan tanda `overLimit: true`. Di grafik, titiknya diberi bulatan merah. Kalau nilainya sampai melewati tinggi maksimal grafik (`yMax`), sumbu Y-nya saya perpanjang ke angka bulat berikutnya, bukan dipotong. Di data asli ada satu contohnya: di pilihan 1 bulan, tanggal 8 Mei 2026 nilainya 102.2, lewat dari batas 100.

## Keanehan di data

Waktu membaca file JSON-nya, saya menemukan beberapa hal yang tidak cocok dengan brief atau dengan panduan di file itu sendiri. Semuanya saya biarkan sesuai data, tidak saya "perbaiki":

- Brief menyebut kode tugas DUTY, RL, TR, TX, dan UL, tapi di JSON kodenya DTY, RLV, TRD, TRX, ULV (plus SCK, ADM, FER, MED, REC). Saya ikut isi JSON-nya.
- Jadwal `97041` (4 Juni 2026) jenisnya `TRX`, tapi warnanya (`base_color`) `#FBA577`, yang sebenarnya warna TRD. Karena brief minta hari diwarnai pakai `base_color` dari API, warnanya saya teruskan apa adanya, jadi di kalender hari itu tampil oranye.
- Jadwal `97027` (hari ini) statusnya masih `1` alias belum selesai, padahal 6 dari 6 logbook sudah diisi. Tanda centang di kalender saya ambil dari jumlah logbook, bukan dari status, jadi hari itu tetap tampil selesai.
- `base_name` untuk jenis RLV isinya `HLP`, padahal panduan di file bilang jenis selain DTY isinya kode tugas. Ini juga saya teruskan apa adanya.
- Field `today` di masing-masing file isinya beda-beda, jadi tidak saya pakai. Alasannya ada [di atas](#hari-ini-cuma-diatur-di-satu-tempat).

## Catatan soal tampilan

Prinsip utamanya, web tidak menghitung apa pun dan tidak menyimpan data contoh. Status, sisa hari, total jam, legenda, sampai tanggal "hari ini" semuanya datang dari API. Yang dikerjakan web cuma urusan tampilan, misalnya memilih teks biru tua atau putih supaya angka di setiap hari kalender tetap terbaca di atas warna latarnya.

Web-nya saya jalankan sebagai single-page app (`ssr: false`). Alasannya ada tiga. Sapaan *Good morning/afternoon/evening* memakai jam di HP pilot, yang tidak diketahui server. Data dimuat langsung di browser, jadi tiap bagian halaman punya tampilan loading sendiri dan tidak saling menunggu. Dan kalau request pertama ke API agak lambat karena server-nya baru dinyalakan, halaman tidak jadi kosong lama.

Semua panggilan ke API lewat satu pintu, `useApi`. Di sini alamat API diatur, token login ditempel otomatis, dan error dikelompokkan jadi empat jenis: belum login, input salah, server bermasalah, atau tidak ada koneksi. Kalau token ditolak (401) di halaman selain login, pengguna otomatis dikeluarkan dan diarahkan ke `/login`.

Token login disimpan di cookie dengan `SameSite=Lax`, `Secure` di production, dan masa berlaku yang sama dengan token-nya. Cookie ini tidak `httpOnly`, karena web perlu membacanya untuk dikirim ke API. Sebenarnya cookie `httpOnly` yang dibuat langsung oleh API akan lebih aman dari serangan XSS, dan itu masuk daftar perbaikan di bagian akhir.

Setiap bagian yang memuat data punya tampilan loading, kosong, dan error, lengkap dengan tombol *Try again*. Waktu rentang grafik atau bulan kalender diganti, tampilan sebelumnya tetap terlihat (agak redup), tidak berkedip jadi kosong. Kalau tombolnya ditekan cepat berkali-kali, balasan yang sudah usang diabaikan, jadi yang tampil selalu sesuai pilihan terakhir.

Grafiknya saya buat sendiri pakai SVG, tanpa library seperti Chart.js. Isinya cuma 15 titik, satu garis, garis batas, dan penanda hari ini, jadi satu komponen jauh lebih sederhana daripada mengatur library, dan tidak menambah paket. Hari ini posisinya di tengah dan diberi sorotan, hari-hari ke depan digambar putus-putus, dan saat kursor diarahkan muncul garis bantu beserta nilainya. Grafiknya juga bisa dipakai lewat keyboard (Tab ke grafik, lalu tombol panah). Di bawahnya ada tabel *Show values* berisi semua angka. Tabel ini penting, karena warna grafik dari brand (`#22C5E8`) kurang kontras di atas latar putih.

Bulan yang sedang dibuka di kalender ikut tersimpan di alamat halaman (`/schedule?year=2026&month=6`), jadi kalau halaman di-refresh, bulannya tidak hilang. Kalau dibuka tanpa bulan, web bertanya ke API bulan sekarang. Kalau bulan di alamat tidak valid, otomatis kembali ke bulan sekarang.

Untuk aksesibilitas:
- Setiap input punya label, ada tanda fokus yang jelas kalau pakai keyboard, dan semua tombol memang elemen `<button>`.
- Status selalu ditampilkan dengan ikon dan teks, tidak cuma warna.
- Tombol pilihan memakai `aria-pressed`, dan setiap hari di kalender punya keterangan teks untuk pembaca layar.
- Kontras teks sudah saya cek sesuai standar WCAG AA.
- Animasinya berhenti kalau perangkat meminta gerakan dikurangi.

Warna, ukuran, dan jarak dikumpulkan di `assets/styles/_tokens.scss` dan bisa dipakai di komponen mana pun tanpa import. Font-nya Plus Jakarta Sans, ikonnya dari Lucide.

Halaman Logbook, More, dan detail hari memang masih placeholder, sesuai yang diperbolehkan brief. Data JSON-nya juga tidak punya detail per penerbangan untuk ditampilkan di sana.

## Pengujian

Untuk API (jalankan dari folder `nest/`):

`npm test` menjalankan 30 unit test. Isinya:
- **Rolling sum:** tanggal yang bolong, hari tanpa jam terbang, rentang sebelum data ada, tanggal di masa depan, nilai yang lewat batas, dan pembulatan. Ada juga perbandingan dengan cara menjumlah biasa, serta hasil kartu dan grafik 1 minggu dari data asli.
- **Status dokumen:** batas-batas statusnya dan daftar persis yang diharapkan untuk 15 Mei 2026.
- **Jadwal:** 21 jadwal di bulan Mei, bulan yang kosong, field hasil hitungan, dan dua keanehan data di atas.

`npm run test:e2e` menjalankan 23 tes end-to-end pada aplikasi yang benar-benar berjalan. Yang dicek:
- endpoint yang dilindungi menolak request tanpa token (401) dengan bentuk error yang standar;
- login dengan password salah dan benar;
- error input lengkap dengan `details`, isi request yang rusak, dan alamat yang tidak ada (404);
- alur normal di setiap endpoint.

Untuk web (dari folder `nuxt/`), `npm run typecheck` mengecek semua file. Saya juga mengaturnya supaya gagal kalau ada nama komponen yang salah ketik, karena biasanya kesalahan seperti itu cuma membuat sebagian halaman diam-diam tidak muncul. Semua layar sudah saya cek di browser sungguhan, di lebar HP (390px) dan desktop, tapi memang belum ada tes browser otomatis di repo ini.

## Cara deploy

API dan web sama-sama saya taruh di **Vercel**, sebagai dua project terpisah dari repo yang sama. Paket gratisnya (Hobby) tidak minta kartu kredit, jadi semuanya bisa dijalankan tanpa biaya.

Kenapa bukan Render atau Railway seperti di brief? Keduanya sekarang meminta verifikasi kartu kredit (Render menarik tes $1 lalu mengembalikannya), dan kartu debit saya ditolak. Hugging Face Spaces juga sempat saya coba, tapi opsi Docker di sana sekarang berbayar. Konfigurasi untuk Render dan Railway tetap saya simpan di repo, penjelasannya ada di bagian [paling bawah](#kalau-ingin-pakai-render-atau-railway).

Di Vercel, API berjalan sebagai *serverless function*. Saat build, `npm run build` mengubah kode di `src/` menjadi `dist/`, lalu `nest/api/index.js` menyalakan aplikasi NestJS sekali dan memakainya untuk semua request berikutnya. Pengaturannya ada di `nest/vercel.json`: semua alamat diarahkan ke function itu, dan function-nya dijalankan di region Singapore supaya dekat ke Indonesia. API ini cocok untuk serverless karena datanya cuma dibaca dari file JSON dan login memakai JWT, jadi tidak ada data yang perlu disimpan di server.

Urutannya: deploy API dulu, lalu web, terakhir sambungkan keduanya. Sebelum mulai, pastikan semua perubahan sudah di-push dan masuk ke branch `main`.

### 1. Deploy API ke Vercel

1. Buka <https://vercel.com> dan login pakai GitHub.
2. Klik **Add New**, pilih **Project**, lalu **Import** repo ini.
3. Isi pengaturannya:

   | Isian | Nilai |
   |---|---|
   | Project Name | `susi-air-api` (nanti jadi bagian alamat API) |
   | Root Directory | klik *Edit*, pilih folder `nest` |
   | Framework Preset | **Other** (biasanya sudah otomatis karena `vercel.json`) |
   | Build and Output Settings | biarkan saja, sudah diatur oleh `vercel.json` |

4. Buka **Environment Variables** dan tambahkan:

   | Key | Value |
   |---|---|
   | `APP_TODAY` | `2026-05-15` |
   | `JWT_SECRET` | teks acak yang panjang, misalnya hasil `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `JWT_EXPIRES_IN_SECONDS` | `3600` |
   | `AUTH_USERNAME` | `johndoe` |
   | `AUTH_PASSWORD` | `susiairtest` |
   | `CORS_ORIGIN` | `http://localhost:3000` untuk sementara, karena alamat web-nya belum ada |

   Biar cepat, isi `.env` bisa langsung di-paste sekaligus ke kolom Key, nanti Vercel memecahnya sendiri per baris. `PORT` tidak perlu diisi.
5. Klik **Deploy** dan tunggu sampai selesai, biasanya 1 sampai 2 menit.
6. Salin alamat API-nya dari halaman project, misalnya `https://susi-air-api.vercel.app`. Kalau nama project-nya sudah dipakai orang lain, Vercel akan memberi alamat yang sedikit berbeda, jadi selalu salin alamat yang benar-benar muncul di project kamu.
7. Cek dengan membuka `https://<alamat-api>/health`. Kalau balasannya `{"status":"ok","today":"2026-05-15"}`, API sudah jalan.

Log setiap request bisa dilihat di tab **Logs** pada project API. Request pertama setelah API lama tidak dipakai bisa sedikit lebih lambat (sekitar satu sampai dua detik) karena aplikasinya perlu dinyalakan dulu, tapi tidak sampai "tidur" lama seperti beberapa layanan gratis lain.

### 2. Deploy web ke Vercel

1. Di Vercel, klik lagi **Add New**, pilih **Project**, lalu **Import** repo yang sama.
2. Isi **Project Name**, misalnya `susi-air-<nama-kamu>`. Nama yang terlalu umum seperti `susi-air` kemungkinan besar sudah dipakai orang lain.
3. Di bagian **Root Directory**, klik *Edit* dan pilih folder `nuxt`. Langkah ini jangan sampai terlewat. Framework-nya akan otomatis terdeteksi sebagai Nuxt, jadi tidak perlu file `vercel.json`.
4. Buka **Environment Variables** dan tambahkan `NUXT_PUBLIC_API_BASE` dengan isi alamat API dari langkah 1, tanpa garis miring di akhir. Contohnya `https://susi-air-api.vercel.app`.
5. Klik **Deploy**. Versi Node-nya dipilih otomatis dari `engines` di `nuxt/package.json`.
6. Salin alamat web-nya dari **Settings**, lalu **Domains**, misalnya `https://susi-air-azkal.vercel.app`. Pakai alamat ini, bukan alamat deployment yang panjang (seperti `susi-air-8f3k2x-namatim.vercel.app`), karena yang panjang itu berubah setiap kali deploy.

### 3. Sambungkan web dan API

1. Buka project **API** di Vercel, lalu **Settings**, lalu **Environment Variables**.
2. Ubah `CORS_ORIGIN` menjadi alamat web dari langkah 2, tanpa garis miring di akhir. Contohnya `https://susi-air-azkal.vercel.app`. Simpan.
3. Perubahan environment variable di Vercel baru berlaku setelah deploy ulang. Buka tab **Deployments**, klik titik tiga di deployment paling atas, lalu pilih **Redeploy**.
4. Buka alamat web dan login dengan `johndoe` / `susiairtest`.

Kalau setelah itu muncul pesan "Could not reach the server", hampir pasti masalahnya di `CORS_ORIGIN`. Pastikan isinya persis sama dengan alamat yang terlihat di address bar browser saat membuka web: pakai `https`, tanpa `/` di akhir, tanpa spasi, lalu pastikan API sudah di-redeploy. Alamat lain bisa ditambahkan dengan pemisah koma, misalnya `https://susi-air-azkal.vercel.app,http://localhost:3000` supaya bisa sekalian mencoba dari laptop.

Setelah semuanya tersambung, setiap kali ada perubahan yang masuk ke `main`, Vercel akan otomatis men-deploy ulang project yang folder-nya berubah.

### Kalau ingin pakai Render atau Railway

Dua-duanya bisa, asalkan akunnya sudah terverifikasi dengan kartu kredit. API-nya tetap jalan sebagai server biasa lewat `npm run start:prod`.

- **Render:** pengaturannya sudah ada di `render.yaml`, jadi cukup **New**, lalu **Blueprint**, lalu pilih repo ini. Kalau mau membuat **Web Service** manual, isi Root Directory `nest`, Build Command `npm ci && npm run build`, Start Command `npm run start:prod`, Health Check Path `/health`, ditambah variabel `NODE_VERSION=22` dan variabel yang sama seperti di Vercel di atas.
- **Railway:** buat project dari repo ini, isi **Root Directory** dengan `nest` (perintah start dan health check sudah diatur di `nest/railway.json`), isi variabel yang sama, lalu buat domain publik di bagian **Networking**.

Di kedua platform ini `PORT` diisi otomatis, jadi tidak perlu ditambahkan.

## Kalau ada waktu lebih

Ini hal-hal yang akan saya kerjakan berikutnya:

- **Login yang lebih aman.** Token disimpan di cookie `httpOnly` yang dibuat langsung oleh API, ditambah refresh token supaya pilot tidak perlu login ulang tiap jam. Lalu pembatasan percobaan login (*rate limit*) dengan `@nestjs/throttler`, dan tabel pengguna sungguhan dengan password yang di-hash.
- **Database sungguhan**, misalnya PostgreSQL dengan migrasi. Karena data sudah lewat repository, yang perlu diganti cuma lapisan itu.
- **Tipe data yang dipakai bersama.** Sekarang `nuxt/types/api.ts` masih saya salin manual dari API. Dengan paket bersama atau tipe yang dibuat otomatis dari OpenAPI, frontend dan backend selalu sinkron.
- **Tes browser dan CI.** Tes otomatis di browser pakai Playwright untuk login, dashboard, dan kalender. Unit test frontend pakai Vitest untuk fungsi-fungsi bantu (kalender, warna, hitungan grafik). Lalu GitHub Actions yang menjalankan lint, typecheck, dan semua tes di setiap pull request.
- **Upgrade ke Node 22 dan Nuxt terbaru**, supaya peringatan `npm audit` hilang dan versi tidak perlu dikunci lagi.
- **Bisa dipakai tanpa internet**, untuk pilot yang sering di daerah terpencil. Aplikasinya dijadikan PWA yang menyimpan jadwal, batas jam, dan dokumen terakhir, dan isian logbook diantrikan lalu dikirim otomatis begitu koneksi kembali.
- **Halaman Logbook dan detail hari yang sebenarnya**, setelah API punya data per penerbangan. Proyeksi jam yang sudah dijadwalkan juga bisa jadi pilihan tambahan di grafik.
- **Dua bahasa** (Inggris dan Indonesia), dengan format tanggal dan angka yang ikut menyesuaikan.
- **Dokumentasi API dan pemantauan.** Swagger yang dibuat otomatis dari DTO, log berformat JSON dengan ID per request, dan notifikasi kalau `/health` tidak merespons.

## Kredit

Logo dan ikon Susi Air di `nuxt/public/` milik Susi Air dan cuma dipakai untuk technical test ini. Data pilotnya berasal dari file contoh yang diberikan bersama brief.
