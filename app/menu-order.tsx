"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { categories, menu, type MenuItem } from "../lib/menu";
import { cartLines, normalizeCart, orderText, rupiah, type CartEntry, type Customer } from "../lib/order";

const storageKey = "auu-ahh-order-v1";
const emptyCustomer: Customer = { name: "", service: "dine-in", notes: "" };

function Cup({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M10 21h24v10a12 12 0 0 1-24 0V21Zm24 2h3a5 5 0 0 1 0 10h-3M6 43h33M17 7c-4 4 4 5 0 9M26 4c-4 4 4 6 0 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function MenuRow({ item, add, ready }: { item: MenuItem; add: (itemId: string, variantId: string) => void; ready: boolean }) {
  const [variantId, setVariantId] = useState(item.variants[0].id);
  const selected = item.variants.find((variant) => variant.id === variantId)!;
  return <li className="menu-row" data-testid="menu-item">
    <div className="item-copy"><h3>{item.name}</h3>{item.description && <p>{item.description}</p>}</div>
    <div className="item-actions">
      <span className="item-price">{rupiah(selected.price)}</span>
      <div className="item-controls">
        {item.variants.length > 1 && <select aria-label={`Varian ${item.name}`} value={variantId} onChange={(event) => setVariantId(event.target.value)}>
          {item.variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.name}</option>)}
        </select>}
        <button type="button" className="add-button" aria-label={`Tambah ${item.name}${item.variants.length > 1 ? ` ${selected.name}` : ""}`} onClick={() => add(item.id, variantId)} disabled={!ready}><span aria-hidden="true">+</span><span>Tambah</span></button>
      </div>
    </div>
  </li>;
}

export default function MenuOrder() {
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [online, setOnline] = useState(true);
  const [storageNotice, setStorageNotice] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [nameError, setNameError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [copying, setCopying] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const orderHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const readLocation = () => {
      const params = new URLSearchParams(window.location.search);
      const nextCategory = params.get("kategori") ?? "all";
      setCategory(categories.some((item) => item.id === nextCategory) ? nextCategory : "all");
      setQuery((params.get("cari") ?? "").slice(0, 100));
    };
    const readConnection = () => setOnline(navigator.onLine);
    readLocation();
    readConnection();
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        // Device-only storage is restored after static hydration; the server cannot read it.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCart(normalizeCart(saved?.cart));
        if (saved?.customer && typeof saved.customer === "object") {
          setCustomer({
            name: typeof saved.customer.name === "string" ? saved.customer.name.slice(0, 60) : "",
            notes: typeof saved.customer.notes === "string" ? saved.customer.notes.slice(0, 240) : "",
            service: saved.customer.service === "takeaway" ? "takeaway" : "dine-in",
          });
        }
      }
    } catch {
      setStorageNotice("Pesanan tersimpan tidak bisa dibaca atau penyimpanan perangkat dibatasi. Kamu tetap bisa membuat pesanan di halaman ini.");
    }
    setReady(true);
    window.addEventListener("popstate", readLocation);
    window.addEventListener("online", readConnection);
    window.addEventListener("offline", readConnection);
    return () => {
      window.removeEventListener("popstate", readLocation);
      window.removeEventListener("online", readConnection);
      window.removeEventListener("offline", readConnection);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ cart, customer }));
    } catch {
      // An external storage write can fail; the user needs recovery feedback.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageNotice("Penyimpanan perangkat tidak tersedia. Pesanan tetap bisa dibuat selama halaman ini terbuka.");
    }
  }, [cart, customer, ready]);

  const lines = cartLines(cart);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const visible = menu.filter((item) => (category === "all" || item.category === category) && item.name.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")));
  const ticket = orderText(lines, customer);

  function filter(nextCategory: string, nextQuery: string, replace = false) {
    setCategory(nextCategory);
    setQuery(nextQuery);
    const url = new URL(window.location.href);
    if (nextCategory === "all") url.searchParams.delete("kategori");
    else url.searchParams.set("kategori", nextCategory);
    if (nextQuery) url.searchParams.set("cari", nextQuery);
    else url.searchParams.delete("cari");
    window.history[replace ? "replaceState" : "pushState"]({}, "", url);
  }

  function add(itemId: string, variantId: string) {
    const existing = cart.find((entry) => entry.itemId === itemId && entry.variantId === variantId);
    if (existing?.quantity === 99) {
      setAnnouncement("Maksimal 99 untuk setiap pilihan menu.");
      return;
    }
    setCart((previous) => normalizeCart([...previous, { itemId, variantId, quantity: 1 }]));
    setAnnouncement(`${menu.find((item) => item.id === itemId)?.name} ditambahkan ke pesanan.`);
  }

  function changeQuantity(itemId: string, variantId: string, change: number) {
    setCart((previous) => normalizeCart(previous.map((entry) => entry.itemId === itemId && entry.variantId === variantId ? { ...entry, quantity: Math.min(99, entry.quantity + change) } : entry)));
  }

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lines.length) return;
    if (!customer.name.trim()) {
      setNameError("Isi nama pemesan sebelum menyiapkan ringkasan.");
      nameInput.current?.focus();
      return;
    }
    setCustomer((previous) => ({ ...previous, name: previous.name.trim(), notes: previous.notes.trim() }));
    setNameError("");
    setCopyStatus("");
    dialog.current?.showModal();
  }

  async function copyTicket() {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(ticket);
      setCopyStatus("Ringkasan berhasil disalin.");
    } catch {
      setCopyStatus("Salin otomatis tidak tersedia. Buka Teks pesanan di bawah, lalu salin secara manual.");
    } finally {
      setCopying(false);
    }
  }

  function newOrder() {
    dialog.current?.close();
    setCart([]);
    setCustomer(emptyCustomer);
    setAnnouncement("Pesanan baru siap dibuat.");
    orderHeading.current?.focus();
  }

  return <>
    <a href="#menu" className="skip-link">Langsung ke menu</a>
    <header className="site-header shell">
      <Link className="brand" href="/" onClick={() => { setCategory("all"); setQuery(""); }}><Cup /><span>AUU AHH<span className="brand-sub">cafe & good company</span></span></Link>
      <nav aria-label="Navigasi utama"><a href="#menu">Menu</a><a href="#cara-pesan">Cara pesan</a><a href="#pesanan" className="header-order">Pesanan <span>{count}</span></a></nav>
    </header>

    <main className="shell">
      <section className="intro" aria-labelledby="page-title">
        <div><p className="intro-note"><span className="small-line" />Ada jeda, ada cerita.</p><h1 id="page-title">Mau pesan apa<br /><em>hari ini?</em></h1><p className="intro-description">Kopi, teman ngobrol, dan pilihan menu untuk melengkapi waktumu. Pilih sesukamu, pesan di kasir.</p><a href="#menu" className="intro-link">Temukan pilihanmu <span aria-hidden="true">↙</span></a></div>
        <div className="how-to" id="cara-pesan"><Cup className="intro-cup" /><h2>Santai, pilih dulu.</h2><ol><li><span>01</span>Pilih menu & varian.</li><li><span>02</span>Lengkapi pesananmu.</li><li><span>03</span>Tunjukkan ringkasan ke kasir.</li></ol><p>Pembayaran dan ketersediaan menu<br /> dikonfirmasi langsung di kasir.</p></div>
      </section>

      {!online && <p role="status" className="notice offline">Kamu sedang offline. Menu yang sudah terbuka tetap bisa dipakai. Hindari memuat ulang halaman sampai koneksi kembali.</p>}

      <div className="ordering-layout">
        <section className="catalog" id="menu" aria-labelledby="menu-title" tabIndex={-1}>
          <div className="section-top"><div><span className="section-index" aria-hidden="true">01 /</span><h2 id="menu-title">Menu kami</h2></div><span className="menu-count">32 pilihan. Satu tempat.</span></div>
          <div className="catalog-tools"><label className="search-label" htmlFor="menu-search"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.5" /></svg><span className="sr-only">Cari menu</span><input type="search" id="menu-search" placeholder="Cari kopi, makanan, atau yang manis…" value={query} maxLength={100} onChange={(event) => filter(category, event.target.value, true)} /></label></div>
          <div className="category-filters" aria-label="Kategori menu"><button type="button" aria-pressed={category === "all"} onClick={() => filter("all", query)}>Semua menu</button>{categories.map((item) => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => filter(item.id, query)}>{item.name}</button>)}</div>
          <p className="results-count" role="status">{visible.length} menu{query.trim() ? ` untuk “${query.trim()}”` : " untuk dipilih"}</p>

          {visible.length === 0 ? <div className="empty-search"><h3>Belum ketemu yang dicari?</h3><p>Coba nama lain atau lihat lagi seluruh menu kami.</p><button className="secondary-button" type="button" onClick={() => filter("all", "")}>Tampilkan semua menu</button></div> : categories.map((group) => {
            const items = visible.filter((item) => item.category === group.id);
            return items.length > 0 && <section className="menu-category" key={group.id} aria-labelledby={`category-${group.id}`}><div className="category-heading"><h3 id={`category-${group.id}`}>{group.name}</h3><span>{String(items.length).padStart(2, "0")}</span></div><p className="category-description">{group.description}</p><ul className="menu-list">{items.map((item) => <MenuRow key={item.id} item={item} add={add} ready={ready} />)}</ul></section>;
          })}
          <p className="menu-footnote">Hot / Ice mengikuti pilihan dan harga pada menu asli. <a href="/menu-asli.pdf" target="_blank" rel="noreferrer">Lihat menu asli (PDF)<span className="sr-only">, buka tab baru</span> <span aria-hidden="true">↗</span></a></p>
        </section>

        <aside className="order-panel" id="pesanan" aria-labelledby="order-title">
          <div className="receipt-brand">AUU AHH <span>cafe</span></div>
          <div className="order-heading"><h2 id="order-title" ref={orderHeading} tabIndex={-1}>Pesananmu</h2><span>{count} item</span></div>
          <p className="order-caption">Dibuat sesuai pilihanmu.</p>
          {storageNotice && <p className="notice" role="status">{storageNotice}</p>}
          {!ready ? <p className="cart-loading" role="status">Memulihkan pesanan…</p> : lines.length === 0 ? <div className="empty-cart"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M12 12h24v30l-4-3-4 3-4-3-4 3-4-3-4 3V12ZM19 12V7h10v5M18 22h12M18 28h8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg><h3>Masih kosong, nih.</h3><p>Mulai dari kopi favoritmu<br />atau sesuatu yang mengenyangkan.</p><a href="#menu">Pilih menu <span aria-hidden="true">↗</span></a></div> : <ul className="cart-items">{lines.map((line) => <li key={line.key}><div className="cart-line-title"><span>{line.name}{line.variantId !== "regular" && <small>{line.variant}</small>}</span><strong>{rupiah(line.subtotal)}</strong></div><div className="cart-line-bottom"><div className="quantity-controls" aria-label={`Jumlah ${line.name} ${line.variant}`}><button type="button" aria-label={`Kurangi ${line.name} ${line.variant}`} onClick={() => changeQuantity(line.itemId, line.variantId, -1)}>−</button><span aria-label={`${line.quantity} buah`}>{line.quantity}</span><button type="button" aria-label={`Tambah jumlah ${line.name} ${line.variant}`} disabled={line.quantity === 99} onClick={() => changeQuantity(line.itemId, line.variantId, 1)}>+</button></div><button type="button" className="remove-button" aria-label={`Hapus ${line.name} ${line.variant}`} onClick={() => setCart((previous) => previous.filter((entry) => !(entry.itemId === line.itemId && entry.variantId === line.variantId)))}>Hapus</button></div></li>)}</ul>}
          <div className="receipt-total"><span>Total menu</span><strong data-testid="cart-total">{rupiah(total)}</strong></div>
          <p className="total-note">Total mengikuti harga menu. Konfirmasi akhir di kasir.</p>
          <form onSubmit={review} noValidate className="order-form">
            <label htmlFor="customer-name">Nama pemesan <span aria-hidden="true">*</span></label><input ref={nameInput} id="customer-name" name="name" autoComplete="given-name" maxLength={60} required disabled={!ready} value={customer.name} aria-invalid={!!nameError} aria-describedby={nameError ? "name-error" : undefined} onChange={(event) => { setCustomer((previous) => ({ ...previous, name: event.target.value })); if (nameError) setNameError(""); }} placeholder="Nama kamu" />
            {nameError && <p className="field-error" id="name-error" role="alert">{nameError}</p>}
            <fieldset><legend>Pilihan pesanan</legend><div className="service-options"><label><input type="radio" name="service" value="dine-in" checked={customer.service === "dine-in"} onChange={() => setCustomer((previous) => ({ ...previous, service: "dine-in" }))} />Di tempat</label><label><input type="radio" name="service" value="takeaway" checked={customer.service === "takeaway"} onChange={() => setCustomer((previous) => ({ ...previous, service: "takeaway" }))} />Bawa pulang</label></div></fieldset>
            <label htmlFor="order-notes">Catatan <span className="optional">opsional</span></label><textarea id="order-notes" maxLength={240} rows={2} value={customer.notes} onChange={(event) => setCustomer((previous) => ({ ...previous, notes: event.target.value }))} placeholder="Ada permintaan khusus?" aria-describedby="notes-help" /><p className="input-hint" id="notes-help">Permintaan dikonfirmasi ke kasir.</p>
            <button type="submit" className="primary-button" disabled={!ready || !lines.length}>Siapkan ringkasan <span aria-hidden="true">↗</span></button>
          </form>
          <p className="privacy-note">Tersimpan hanya di perangkatmu.<br />Tunjukkan ringkasan ke kasir untuk memesan.</p>
        </aside>
      </div>
    </main>

    <footer className="site-footer shell"><span className="footer-brand">AUU AHH <i>cafe</i></span><p>Menu pilihanmu. Waktu untukmu.</p><span>Proyek menu & pemesanan</span></footer>
    <a className="mobile-order" href="#pesanan"><span>Pesananmu <b>{count}</b></span><span>{rupiah(total)} <span aria-hidden="true">↗</span></span></a>
    <p className="sr-only" role="status" aria-live="polite">{announcement}</p>

    <dialog ref={dialog} className="ticket-dialog" aria-labelledby="ticket-title" aria-describedby="ticket-help">
      <div className="dialog-bar no-print"><span>Ringkasan untuk kasir</span><button type="button" autoFocus aria-label="Tutup ringkasan" onClick={() => dialog.current?.close()}>×</button></div>
      <div className="ticket-content"><div className="receipt-brand">AUU AHH <span>cafe</span></div><h2 id="ticket-title">Pilihanmu sudah siap.</h2><p id="ticket-help">Tunjukkan ringkasan ini ke kasir untuk memesan. Pesanan belum dikirim atau dikonfirmasi oleh kafe.</p><dl className="customer-details"><div><dt>Nama</dt><dd>{customer.name}</dd></div><div><dt>Pesanan</dt><dd>{customer.service === "dine-in" ? "Makan di tempat" : "Bawa pulang"}</dd></div></dl><ul className="ticket-lines">{lines.map((line) => <li key={line.key}><span><b>{line.quantity}×</b> {line.name}{line.variantId !== "regular" && <small>{line.variant}</small>}</span><strong>{rupiah(line.subtotal)}</strong></li>)}</ul><div className="receipt-total"><span>Total menu</span><strong>{rupiah(total)}</strong></div>{customer.notes && <p className="ticket-notes"><strong>Catatan</strong>{customer.notes}</p>}<p className="ticket-ending">Sampai ketemu di kasir.</p></div>
      <div className="ticket-actions no-print"><button type="button" className="primary-button" onClick={copyTicket} disabled={copying}>{copying ? "Menyalin…" : "Salin ringkasan"}</button><button type="button" className="secondary-button" onClick={() => window.print()}>Cetak / simpan PDF</button><p role="status" className="copy-status">{copyStatus}</p><details><summary>Teks pesanan</summary><textarea readOnly value={ticket} rows={9} aria-label="Teks ringkasan pesanan untuk disalin" /></details><div className="ticket-bottom"><button type="button" className="text-button" onClick={() => dialog.current?.close()}>Ubah pesanan</button><button type="button" className="text-button" onClick={newOrder}>Pesanan baru</button></div></div>
    </dialog>
  </>;
}
