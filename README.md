# Diary App — CRUD Full-Stack (Mobile Programming Pertemuan 09)

Aplikasi pencatatan harian (*Diary App*) berbasis **React Native (Expo Router)** dan **Redux Toolkit** yang terhubung ke REST API **Node.js + Express.js** dan database **MySQL**.

**Identitas Mahasiswa:**
- **Nama:** Ahmad Yusuf Abdhillah
- **NIM:** 2430511042
- **Kelas:** 5C
- **Program Studi:** Teknik Informatika — Universitas Muhammadiyah Sukabumi (UMMI)
- **Mata Kuliah:** Mobile Programming (Pertemuan 9)
- **Dosen Pengampu:** Prajoko, M.Kom

---

## Arsitektur & Teknologi
- **Frontend:** React Native (Web), Expo Router, TypeScript, Redux Toolkit (`createAsyncThunk`), Fetch API, React Native Animated
- **Backend:** Node.js, Express.js, CORS, Dotenv, MySQL2
- **Database & API Testing:** MySQL (`diary_app`) & Postman

---

## Fitur Utama
- **Full CRUD Terintegrasi MySQL:** Tambah (`POST`), baca (`GET`), ubah (`PUT`), dan hapus (`DELETE`) catatan harian secara persisten.
- **Interactive Mood Picker:** Pilihan ekspresi mood harian dengan animasi *spring bounce*.
- **Pencarian & Filter Real-Time:** Filter daftar catatan berdasarkan kata kunci judul/isi maupun kategori mood.
- **Dashboard Statistik Ringkas:** Menampilkan total catatan, mood terakhir, dan status sinkronisasi database (*MySQL Sync*).
- **Transisi & Animasi Halus:** *Staggered card animation* pada daftar catatan serta modal konfirmasi hapus interaktif.

---

## Struktur Folder
```text
mobile-programming/
├── backend/
│   ├── src/
│   │   └── server.js          # Endpoint REST API (GET, POST, PUT, DELETE)
│   ├── .env                   # Konfigurasi port & koneksi MySQL (ignored)
│   ├── package.json
│   └── schema.sql             # Query DDL & data awal tabel diaries
├── diary-app9/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx    # Navigasi Bottom Tabs
│   │   │   ├── index.tsx      # Halaman Home, Search, Filter & Statistik
│   │   │   └── create.tsx     # Halaman Tambah Catatan Baru
│   │   ├── detail/
│   │   │   └── [id].tsx       # Halaman Detail & Modal Hapus Catatan
│   │   ├── edit/
│   │   │   └── [id].tsx       # Halaman Edit / Update Catatan
│   │   └── _layout.tsx        # Root Stack & Redux Provider
│   ├── src/
│   │   ├── AnimatedCard.tsx   # Komponen animasi transisi UI
│   │   ├── api.ts             # Service HTTP fetch() ke Express API
│   │   ├── constants.ts       # Konfigurasi tema gelap & preset mood
│   │   ├── diarySlice.ts      # Redux state & async thunks
│   │   ├── hooks.ts           # Typed useAppDispatch & useAppSelector
│   │   └── store.ts           # Konfigurasi Redux Store
│   └── .env                   # Konfigurasi EXPO_PUBLIC_API_URL (ignored)
├── .gitignore
└── README.md