# Blueprint & Master Prompt: Aplikasi Web Simulator Kana & Pra-JLPT N5 (Standar Kurikulum Minna no Nihongo)

Dokumen ini berisi dua bagian utama:
1. **Instruksi Pedagogis Sensei:** Panduan cara menggunakan aplikasi dan teknik menghafal cepat di luar kepala (khusus mengatasi kelemahan *Sokuon* dan *Chouon*).
2. **Master Prompt untuk Google AI Studio:** Teks spesifikasi teknis lengkap yang siap di-*copy-paste* langsung ke Google AI Studio / LLM Code Generator untuk membangun aplikasi web secara utuh.

---

## BAGIAN 1: Saran Asesor / Sensei Agar Cepat Hafal di Luar Kepala

Sebagai murid yang menargetkan kerja di Jepang dengan waktu belajar 30–60 menit per hari, Anda **dilarang** menghafal huruf secara pasif (hanya melihat tabel *A-I-U-E-O*). Gunakan 4 protokol wajib dari saya:

1. **Hukum Ketukan Tangan (Untuk Menguasai *Sokuon* & *Chouon* yang Belum Anda Pelajari):**
   * Bahasa Jepang adalah bahasa berbasis ketukan (*Mora*), bukan suku kata.
   * Saat membaca kata dengan **Sokuon (っ/ッ kecil)**, tepukkan tangan Anda atau tahan napas selama 1 ketukan penuh tanpa suara. Contoh: **きって (ki - [tahan 1 ketuk] - te)**.
   * Saat membaca **Chouon (Vokal Panjang)**, ayunkan tangan Anda memanjang 2 ketukan. Jika Anda membaca *Obasan* (Bibi) dan *Obaasan* (Nenek) dengan durasi yang sama, orang Jepang tidak akan paham maksud Anda.
2. **Jangan Hafal Huruf Lepas, Hafalkan Lewat Kosakata Bab 1–5 MNN:**
   * Otak manusia sulit mengingat simbol abstrak, tapi cepat mengingat kata bermakna. Segera setelah hafal bentuk dasar, langsung baca kosakata utuh seperti せんせい (*sensei* - guru), がくせい (*gakusei* - murid), atau エンジニア (*enjinia* - insinyur).
3. **Wajib Gunakan Mode Essay (Active Recall) Minimal 40% dari Waktu Latihan:**
   * Pilihan ganda (*Multiple Choice*) hanya melatih **rekognisi** (mengenali). Mode Essay (mengetik *romaji* atau menyusun huruf tanpa bantuan opsi) memaksa otak melakukan **produksi aktif**. Jika Anda bisa menjawab dalam waktu < 3 detik di mode Essay tanpa melihat opsi, artinya huruf tersebut sudah masuk ke *Long-Term Memory* (hafal di luar kepala).
4. **Sistem Penalti "Mistake Bank" (Bank Kesalahan):**
   * Jangan mengulang huruf yang sudah Anda hafal (seperti あ, い, う). Fokuskan 80% energi Anda pada 20% huruf yang paling sering tertukar (seperti シ vs ツ, ソ vs ン, さ vs ち, れ vs ね vs わ).

---

## BAGIAN 2: MASTER PROMPT (Salin Seluruh Teks di Bawah Ini ke Google AI Studio)

> **Instruksi Penggunaan:** Salin blok kode/teks di bawah ini mulai dari `[START PROMPT]` hingga `[END PROMPT]` dan tempelkan ke dalam **System Instructions** atau **Prompt Box** di Google AI Studio untuk menghasilkan kode aplikasi web (Single-File HTML/JS/Tailwind atau React).

### [START PROMPT]

**Role & Objective:**
Anda adalah Senior Full-Stack Web Developer dan Pakar Kurikulum Bahasa Jepang bersertifikasi JLPT N1 / Asesor JFT-Basic. Tugas Anda adalah membangun sebuah **Single-Page Web Application (SPA)** interaktif, modern, dan responsif bernama **"Nihongo Dojo: Kana & Basic JLPT/JFT Simulator"**. Aplikasi ini dirancang khusus untuk murid pemula yang sedang bersiap masuk ke buku *Minna no Nihongo Shokyu I* dengan target akhir lulus JLPT N4 untuk bekerja di Jepang.

---

### 1. Spesifikasi Teknis & Algoritma Pengacakan (CRITICAL)
* **True Randomization (Fisher-Yates Shuffle Algorithm):**
  * Anda WAJIB mengimplementasikan fungsi algoritma **Fisher-Yates Shuffle (Knuth Shuffle)** murni di JavaScript untuk mengacak:
    1. Pengambilan sampel soal dari Bank Soal (*Question Pool*).
    2. Urutan kemunculan nomor soal (1 s.d. 50 atau 1 s.d. 100) setiap kali sesi ujian dimulai.
    3. Urutan posisi pilihan ganda (A, B, C, D) pada setiap soal, sehingga jawaban yang benar tidak pernah berada di posisi yang statis.
* **Dynamic Distractor Engine (Pengecoh Cerdas Standar JLPT):**
  * Untuk soal pilihan ganda, opsi pengecoh (distractor) tidak boleh acak sembarangan, melainkan harus memiliki kemiripan visual atau fonetik (contoh: jika soalnya adalah `びょういん (byouin)`, maka opsi pengecohnya harus `びよういん (biyouin)`, `ぼいん (boin)`, dan `ぴょういん (pyouin)`).
* **Kuota Soal Dinamis:**
  * Pengguna dapat memilih jumlah soal per sesi: **50 Soal (Standar Latihan Harian)** atau **100 Soal (Simulasi Ketahanan Mental)**.
  * Bank data (*dataset* internal di dalam kode) harus berisi minimal **150+ item unik** (kombinasi huruf, kata modifikasi, dan kalimat dasar) atau dilengkapi *procedural question generator* agar saat pengguna memilih 100 soal, tidak ada soal yang terduplikasi secara identik.

---

### 2. Arsitektur Modul & Fitur Utama Aplikasi

Aplikasi harus memiliki 4 Tab/Menu Utama:

#### Menu A: Mode Belajar Rekomendasi (khususnya Pemantapan *Sokuon* & *Chouon*)
Sebelum tes, pengguna dapat membuka modul belajar interaktif yang ringkas dan tajam, mencakup:
1. **Modul Khusus Sokuon (っ/ッ Kecil) & Chouon (Vokal Panjang):**
   * Penjelasan visual perbandingan kata yang berubah arti jika salah panjang vokal atau jeda konsonan (contoh: *kitte* vs *kite*, *ojisan* vs *ojiisan*, *koko* vs *koukou*, *biru* vs *biiru*).
   * Fitur **Audio Pronunciation (Web Speech API `ja-JP`)**: Tombol *Play Sound* di setiap contoh kata agar murid bisa mendengar langsung perbedaan jeda 1 ketukan *Sokuon* dan ayunan 2 ketukan *Chouon* dari penutur asli (TTS Jepang).
2. **Modul Dakuon, Handakuon, & Youon:** Tabel interaktif klik-untuk-dengar.
3. **Cheat Sheet Huruf Mirip (Visual Traps):** Panduan membedakan huruf yang sering tertukar oleh pemula (シ *shi* vs ツ *tsu*, ソ *so* vs ン *n*, さ *sa* vs ち *chi*, る *ru* vs ろ *ro*, ア *a* vs マ *ma*).
4. **Kamus Mini Bab 1–2 Minna no Nihongo:** Kosakata perkenalan diri (*Jikoshoukai*), profesi, negara, dan partikel dasar (は, も, の, か).

#### Menu B: Konfigurasi Ujian (Test Setup)
Pengguna dapat mengatur parameter ujian sebelum menekan tombol **"Mulai Ujian"**:
1. **Pilihan Jumlah Soal:** `50 Soal` atau `100 Soal`.
2. **Pilihan Level & Kategori Materi (Bisa pilih satu atau *Mix All*):**
   * **Level 1 - Hiragana Murni:** 46 huruf dasar (*Gojuuon*) & kosakata Hiragana dasar.
   * **Level 2 - Katakana Murni:** 46 huruf dasar & kosakata serapan asing (*Gairaigo* seperti コンピュータ, アルバイト, エンジニア).
   * **Level 3 - Modifikasi Huruf (Fokus Kelemahan):** Soal khusus *Dakuon* (゛), *Handakuon* (゜), *Youon* (きゃ, しゅ, ちょ), *Sokuon* (っ/ッ), dan *Chouon* (Vokal Panjang / ー).
   * **Level 4 - Konteks Nyata & Kalimat Dasar (Gaya JLPT/JFT):** Soal terjemahan dan penyusunan kalimat campuran Bahasa Indonesia & Jepang berdasarkan *Minna no Nihongo* Bab 1–3.
   * **Level 5 - Campuran Total (Simulasi Ujian Asli):** Proporsi otomatis (20% Hiragana, 20% Katakana, 30% Modifikasi *Sokuon/Chouon/Youon*, 30% Kalimat Kontekstual & Kosakata).
3. **Pilihan Format Jawaban (Mode Ujian):**
   * **Mode Pilihan Ganda (JLPT/JFT Style):** 4 opsi jawaban (A, B, C, D).
   * **Mode Essay / Ketik Mandiri (Active Recall Mode):** Tanpa pilihan ganda! Pengguna wajib mengetik jawaban (Romaji / arti / susunan kalimat) di *input text box*. Sistem pemeriksa jawaban harus *case-insensitive*, mengabaikan spasi berlebih, dan menerima variasi ejaan Romaji standar (misal: menerima `shi` maupun `si`, `chi` maupun `ti`, `tsu` maupun `tu`, serta untuk partikel は di dalam kalimat harus diketik `wa`).
   * **Mode Hybrid (50% Pilihan Ganda, 50% Essay):** Kombinasi terbaik untuk menguji pengenalan dan hafalan di luar kepala.
4. **Mode Timer:** Pilihan *Stopwatch Normal* atau *JLPT Strict Timer* (batas waktu 15 detik per soal untuk melatih kecepatan baca di luar kepala).

#### Menu C: Antarmuka Simulasi Ujian (CBT JFT-Basic / JLPT Interface)
* Tampilan bersih ala layar CBT (*Computer Based Test*) JFT-Basic.
* Indikator progres soal (misal: `Soal 14 / 50`), *timer* berjalan, dan tombol navigasi soal (bisa menandai soal "Ragu-ragu" / *Flag for Review*).
* **Variasi Tipe Pertanyaan Kontekstual (Wajib ada di dalam Bank Soal):**
  * *Tipe 1 (Bacaan & Arti):* "Bagaimana cara membaca dan apa arti dari kata berikut: **びょういん**?" -> Opsi: `byouin (Rumah Sakit)` vs `biyouin (Salon Kecantikan)`.
  * *Tipe 2 (Terjemahan Kalimat Nyata):* "Terjemahkan ke dalam susunan kalimat Bahasa Jepang yang tepat: **'Nama saya adalah Kelvin'**" -> Opsi:
    * A. わたし の なまえ は ケルビン です (Benar)
    * B. わたし は なまえ の ケルビン です (Salah partikel)
    * C. わたし の なまえ は クルビン です (Salah huruf Katakana ケ vs ク)
    * D. わたくし を なまえ は ケルビン ます (Salah tata bahasa)
  * *Tipe 3 (Deteksi Kesalahan Partikel & Sokuon/Chouon):* "Manakah penulisan Katakana yang tepat untuk kata **'Pekerjaan Paruh Waktu (Arubaito)'**?" -> Opsi: アルバイト vs アレバイト vs アルパイト vs アールバイト.
  * *Tipe 4 (Soal Cerita Pendek / Dokkai Mikro):* Menampilkan 2–3 baris kalimat perkenalan diri sederhana dalam Hiragana & Katakana (contoh: *"Hajimemashite. Watashi wa Indoneshia kara kimashita. Kenshuusei desu."* dalam huruf Jepang), lalu menanyakan: "Apa status/pekerjaan orang tersebut?"

#### Menu D: Dashboard Hasil Instan, Analitik & Evaluasi Sensei
Begitu pengguna menekan tombol **Submit Ujian**, tampilkan halaman hasil komprehensif secara instan tanpa *reload* halaman:
1. **Skor Akhir & Status Kelulusan:**
   * Persentase skor (0–100%) dan Grade: **S (95–100% - Siap Masuk MNN Bab 1)**, **A (85–94% - Lulus Standar)**, **B (75–84% - Rawan Lupa)**, **C/D (<75% - Wajib Mengulang, Dilarang Lanjut Bab Baru)**.
2. **Radar / Breakdown Kelemahan Spesifik:**
   * Menampilkan persentase akurasi per kategori: *Hiragana Dasar*, *Katakana Dasar*, *Modifikasi (Sokuon/Chouon/Youon)*, dan *Kalimat/Kosakata*.
   * Menampilkan rata-rata waktu jawab per soal (jika > 5 detik per kata, sistem memberikan peringatan bahwa hafalan belum di luar kepala).
3. **Komentar Objektif Sensei (Dynamic AI/Rule-based Feedback):**
   * Tampilkan pesan evaluasi yang tegas, rasional, dan objektif sesuai skor. Contoh: *"Skor Katakana dan Sokuon Anda di bawah 70%. Jangan menyentuh pola kalimat Minna no Nihongo dulu. Ulangi latihan khusus Level 3 di Mode Essay sampai skor Anda minimal 90%!"*
4. **Tabel Review Jawaban & Fitur "Uji Ulang Soal yang Salah":**
   * Daftar lengkap seluruh soal yang baru dikerjakan: menampilkan Soal, Jawaban Anda (merah jika salah, hijau jika benar), Kunci Jawaban Benar, tombol Audio cara baca yang benar, serta **Penjelasan Singkat (Kenapa jawaban tersebut benar/salah)**.
   * **Tombol "Retry Mistakes Only":** Satu tombol khusus untuk langsung memulai kuis baru yang **hanya** berisi soal-soal yang baru saja dijawab salah sampai semuanya 100% benar.

---

### 3. Desain UI/UX & Penyimpanan Data
* Gunakan **Tailwind CSS** dengan tema modern, bersih, berfokus pada keterbacaan tipografi bahasa Jepang (gunakan font *Noto Sans JP* atau *Hiragino Kaku Gothic* berukuran besar dan jelas pada karakter Kana agar perbedaan ukuran huruf kecil っ, ゃ, ゅ, ょ terlihat sangat kontras).
* Simpan riwayat skor ujian dan daftar huruf yang sering salah ke dalam `localStorage` browser, sehingga pengguna dapat melihat grafik perkembangan belajarnya dari hari ke hari.

### [END PROMPT]