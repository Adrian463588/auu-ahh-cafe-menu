# Sistem visual dan interaksi

- Background: kertas `#f6f3ec`; surface `#fffdf8`; ink `#242b25`; muted `#5c6258`.
- Primary: zaitun `#384a35`, teks putih; accent: karamel gelap `#8a4529`; danger `#a02e26`.
- Border dekoratif `#d8d6c9`; border kontrol `#777d70`; focus `#a54b23`.
- Semua warna diakses melalui semantic CSS custom properties.
- Judul: Georgia/serif; body: Arial/system sans; harga: tabular numerals. Tanpa permintaan font eksternal.
- Ritme 4/8px; lebar konten maksimal 1248px; daftar menu fleksibel dan panel bon 352px pada desktop.
- Radius kecil untuk tombol/input; tanpa bayangan atau animasi masuk dekoratif.
- Tombol minimal 44px. Fokus 3px dengan offset. Form punya label dan hubungan error eksplisit.
- Kategori adalah filter tombol yang memperbarui URL. Pencarian berlabel. Hasil kosong punya tindakan reset.
- Keranjang memakai kontrol tambah/kurang, total sumber katalog, dan formulir ringkas. Ringkasan final di dialog native.
- CSS print hanya menampilkan bon. Reduced motion dihormati. Ukuran 320/375/768/1024/1440px masuk matriks QA.
