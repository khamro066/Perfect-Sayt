# Perfect Shoes — Admin Panel Design Spec (extracted from Perfect Shoes.dc.html)

## Global tokens & shared patterns (used throughout admin)

Root CSS variables (`:root`, light theme):
```
--bg:#eef2f8; --surface:#ffffff; --surface-2:#e6ecf5; --ink:#101828; --muted:#5b6472;
--line:#d7e0ec; --accent:#0e2a52; --accent-ink:#ffffff; --accent-soft:#dde6f4;
--deep:#0b2545; --deep-ink:#ffffff; --deep-muted:#aebbcf; --deep-line:rgba(255,255,255,.14);
--deep-highlight:#c9a24b; --success:#1f8a5b; --warning:#b7791f; --danger:#a5432e; --star:#c9a24b;
```
Dark theme (`[data-theme="dark"]`):
```
--bg:#0a0e16; --surface:#111827; --surface-2:#1a2333; --ink:#eef1f7; --muted:#a3aebd;
--line:#293244; --accent:#4d7cc2; --accent-ink:#08101d; --accent-soft:#182338;
--deep:#060b14; --deep-ink:#eef1f7; --deep-muted:#8b96a8; --deep-line:rgba(238,241,247,.10);
--deep-highlight:#d9b66f; --success:#4fb187; --warning:#e0b04a; --danger:#e0836a; --star:#d9b66f;
```
Fonts: `'Source Sans 3'` (400/500/600/700) for body/UI text; `'Cormorant Garamond'` (600/700, italic 600) for large headings/titles (e.g. "Boshqaruv paneli").

Accent color presets (site-wide, affects admin's `--accent` in light theme only): `Asosiy` → `["#0e2a52","#ffffff"]` (default), `Tilla` → `["#b08d2e","#1b1a16"]`, `Qora` → `["#1b1a16","#ffffff"]`, `Ko'k och` → `["#1d4ed8","#ffffff"]`.

Shared style helper functions (reproduce as utility classes/functions):
- `pill(active)`: `padding:8px 14px;border-radius:999px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .15s ease;` + active → `background:var(--accent);color:var(--accent-ink);border:1px solid var(--accent);` else → `background:var(--surface);color:var(--ink);border:1px solid var(--line);`
- `tabSty(active)` (sidebar nav / admin nav buttons): `text-align:left;padding:11px 14px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;border:none;width:100%;transition:all .15s ease;` + active → `background:var(--accent);color:var(--accent-ink);` else → `background:transparent;color:var(--ink);`
- Generic bottom toast: `position:fixed;bottom:28px;left:50%;transform:translateX(-50%);z-index:200;background:var(--ink);color:var(--bg);padding:13px 22px;border-radius:999px;font-size:14px;font-weight:500;box-shadow:0 10px 30px rgba(0,0,0,.28)`; auto-hides after 2200ms.
- Color name lookup table (used in Stock Control, Orders line items, product color selects): `{"#1b1a16":"Qora","#f4f1ea":"Oq","#8a8880":"Kulrang","#6b4a2f":"Jigarrang","#2c4a7a":"Ko'k","#0a5c3a":"Yashil","#a83232":"Qizil","#d8c7a8":"Bej"}`

Order statuses (exactly 6, in this order): `Yangi, Tasdiqlandi, Tayyorlanmoqda, Yo'lda, Yetkazildi, Bekor qilindi`
Order status → color map (`orderStatusColor`) — note only 3 distinct colors are used across 6 statuses:
- `Yangi` → `var(--star)`
- `Tasdiqlandi` → `#2c6fb0` (hardcoded blue, not a token)
- `Tayyorlanmoqda` → `#2c6fb0`
- `Yo'lda` → `#2c6fb0`
- `Yetkazildi` → `var(--accent)`
- `Bekor qilindi` → `var(--danger)`

Stock statuses (exactly 3): `Yetarli, Kam qoldi, Tugadi` — computed as `qty<=0` → `Tugadi` (`var(--danger)`), `qty<5` → `Kam qoldi` (`var(--warning)`), else `Yetarli` (`var(--success)`).

PRE-ORDER badge (used in Dashboard recent orders and Orders list, next to order number when `order.isPreorder`): `background:#f0e4fb;color:#7a3fc9;font-size:10px;font-weight:700;padding:3px 7px;border-radius:999px;letter-spacing:.03em` — text literally `PRE-ORDER`. Confirmed: exact hex codes match `#f0e4fb` bg / `#7a3fc9` text (matches README section 5).

---

## Login (Admin panelga kirish)

Reached via a link in the customer-site footer (bottom-right column, under payment badges): `Admin kirish →` — style `cursor:pointer;color:var(--deep-highlight);font-size:13px;font-weight:600;margin-top:4px`.

Layout: full-viewport centered flex container — `min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--bg)`.

Card: `width:100%;max-width:400px;background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:36px;display:flex;flex-direction:column;gap:18px;box-shadow:0 24px 60px rgba(0,0,0,.12)`.

Card contents top-to-bottom:
1. Centered logo image (`display:flex;justify-content:center`) — blue Perfect Shoes brand mark (same asset reused at the top of the admin sidebar) — use `perfect-logo-blue.jpg`.
2. Heading block, centered: bold 17px ink text **"Admin panelga kirish"**, with subtext (muted, 13.5px, margin `6px 0 0`) **"Faqat administratorlar uchun"**.
3. Password field: label text **"Parol"** (13px muted) wrapping a `type="password"` input, placeholder **"Parolni kiriting"**, style `padding:13px 15px;border:1px solid var(--line);border-radius:11px;background:var(--bg);color:var(--ink);font-size:14px;outline:none`.
4. Submit button, full width: **"Kirish"** — `background:var(--accent);color:var(--accent-ink);border:none;font-weight:600;font-size:15px;padding:14px;border-radius:12px;cursor:pointer`.
5. Demo hint, centered, 12px muted: **"Namoyish uchun parol: admin2026"** (drop this in production — real auth replaces it).
6. Back link, centered, 13px muted: **"← Do'konga qaytish"** → returns to storefront home.

Validation logic (prototype): compares password to the hardcoded literal string `"admin2026"`. On match: authenticated, go to admin dashboard. On mismatch: shows the generic bottom-center toast with text **"Parol noto'g'ri"**. In production this becomes real NextAuth Credentials auth (per our Step 1 decision) — same visual flow, real hashed password check server-side.

---

## Sidebar & Shell (applies to every admin tab)

Outer wrapper: `display:flex;min-height:100vh;align-items:stretch`.

**Sidebar** (`<aside>`): `width:250px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--line);padding:22px 16px;display:flex;flex-direction:column;gap:6px;position:sticky;top:0;height:100vh;overflow:auto`.
- Top: logo image, `padding:6px 8px 18px` (blue logo asset).
- Section label: **"Admin panel"** — `font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700;padding:0 8px 8px`.
- Nav buttons (full-width, `tabSty(active)` styling), in this exact order with these exact labels:
  1. `dashboard` → **"Boshqaruv paneli"**
  2. `products` → **"Mahsulotlar"**
  3. `categories` → **"Kategoriyalar"**
  4. `stock` → **"Ombor nazorati"**
  5. `orders` → **"Buyurtmalar"**
  6. `reviews` → **"Sharhlar"**
  7. `preorders` → **"Oldindan buyurtmalar"**
  8. `preorderProducts` → **"Oldindan buyurtma mahsulotlari"**
  9. `customers` → **"Mijozlar"**
  10. `reports` → **"Hisobotlar"**
- Bottom (pushed down via `margin-top:auto`): **"← Do'konga qaytish"** button — `text-align:left;padding:11px 14px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;border:1px solid var(--line);background:transparent;color:var(--ink)` → navigates to storefront home.

**Main content area**: `flex:1;min-width:0;padding:26px 30px 48px;background:var(--bg)`.

**Top header row** (present identically on every tab — the prototype's `<h1>` text never changes; we will make it dynamic per section instead, e.g. "Mahsulotlar" on the Products tab, since a static heading everywhere is a prototype quirk not worth reproducing): `display:flex;align-items:center;justify-content:space-between;margin-bottom:26px;gap:12px;flex-wrap:wrap`.
- Left: `<h1>` — `font-family:'Cormorant Garamond',serif;font-weight:500;font-size:28px;margin:0;color:var(--ink)`.
- Right: notification bell button + theme toggle button (see Notifications section below), `display:flex;align-items:center;gap:10px`.
  - Theme toggle: 42×42 circular button, `border:1px solid var(--line);background:var(--surface);border-radius:999px;cursor:pointer;font-size:16px;color:var(--ink)`, glyph `☾` (light theme) / `☀` (dark theme).

---

## Dashboard

Section wrapper: `display:flex;flex-direction:column;gap:26px`.

**Stat cards row**: `display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px`. Each card: `background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:22px;display:flex;flex-direction:column;gap:8px` with a muted 13px/500 label span and a 24px/700 ink value span. Exactly 4 cards, in order:
1. **"Jami mahsulotlar"** — total live product count.
2. **"Ombordagi juftlar"** — sum of stock across all live products.
3. **"Faol oldindan buyurtmalar"** — count of live pre-orders (prototype hardcoded to `"3"`; we compute for real).
4. **"Oylik daromad"** — monthly revenue, formatted `48 200 000 so'm` (prototype hardcoded; we compute for real).

**"So'nggi buyurtmalar" card** (recent orders): `background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:22px`. Title bold 16px. Table header row (`grid-template-columns:1.2fr 1.5fr 1fr 1fr 1fr;gap:12px;padding:10px 8px;font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--line)`), columns in order: **Raqam, Mijoz, Sana, Summa, Holat**.
Rows use `grid-template-columns:1.2fr 1.5fr 1fr 1fr 1fr;gap:12px;padding:13px 8px;font-size:13.5px;color:var(--ink);border-bottom:1px solid var(--line);align-items:center`.
- Raqam: bold, flex with 6px gap so the PRE-ORDER badge sits inline after the number when applicable.
- Mijoz: plain.
- Sana: muted.
- Summa: bold.
- Holat: bold, text color = `orderStatusColor[status]`.

Show newest orders first (most recent `created_at` first), reasonable cap (e.g. latest 10) with no separate "view all" link needed since Orders tab exists.

---

## Products (Mahsulotlar)

Three stacked panels in `display:flex;flex-direction:column;gap:20px`.

### 1. "Yangi mahsulot qo'shish" (Add new product card)
Form grid: `display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-top:16px`. Each field is a `<label>` with a 12.5px muted caption above the control (`display:flex;flex-direction:column;gap:6px`); inputs/selects share `padding:11px 13px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink);font-size:14px;outline:none`. Fields, in order:
- **"Nomi"** — text input, placeholder "Mahsulot nomi"
- **"Brend"** — text input, placeholder "Brend (ixtiyoriy)"
- **"Kategoriya"** — `<select>` populated from live categories
- **"Rang"** — `<select>` of 8 color options (value=hex, label=Uzbek color name from the lookup table)
- **"Narx (so'm)"** — number input, placeholder "890000"
- **"Ombordagi soni"** — number input, placeholder "10"

**Image upload sub-panel** (`background:var(--surface-2);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:12px;margin-top:16px`):
- Title (13px/600 ink): **"Mahsulot rasmlari"**
- Helper paragraph (12px muted, line-height 1.5), verbatim: **"Format: JPG, PNG yoki WebP · Nisbat: kvadrat (1:1) · Tavsiya etilgan o'lcham: 800×800px · Minimal: 600×600px · Maksimal fayl hajmi: 5MB. Bir nechta rasm yuklash mumkin — birini asosiy (muqova) rasm sifatida belgilang."**
- Upload control: a styled `<label>` acting as button, text **"+ Rasm yuklash"** (`display:inline-flex;align-items:center;gap:8px;width:fit-content;background:var(--surface);border:1px dashed var(--line);color:var(--ink);font-weight:600;font-size:13px;padding:12px 18px;border-radius:10px;cursor:pointer`), wrapping a hidden `<input type="file" accept="image/jpeg,image/png,image/webp" multiple>`.
- If images have been added: thumbnail grid `display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:12px`. Each thumbnail: `position:relative;width:100%;aspect-ratio:1/1;border-radius:10px;overflow:hidden;background:var(--surface);border:2px solid {accent if primary else transparent}` containing the image (`object-fit:cover`) and a circular remove "✕" button top-right (`position:absolute;top:5px;right:5px;background:rgba(16,24,40,.65);color:#fff;width:20px;height:20px;border-radius:999px;font-size:12px`). Below each thumbnail, a text button (`color:var(--accent);font-weight:600;font-size:11.5px`) reading **"Asosiy"** if that image is already primary, or **"Asosiy qilish"** if not.

Upload validation to reproduce client-side: reject non-JPG/PNG/WebP → toast `"{filename}: faqat JPG, PNG yoki WebP"`; reject >5MB → toast `"{filename}: fayl hajmi 5MB dan katta"`; reject width/height < 600px → toast `"{filename}: rasm juda kichik (kamida 600×600px)"`. First accepted image auto-set as primary/cover if none set yet.

**Discount sub-panel** (`background:var(--surface-2);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:12px;margin-top:16px`):
- Label (13px/600 ink): **"Ushbu mahsulot chegirmada sotiladimi?"**
- Two pill toggle buttons: **"Ha"** / **"Yo'q"** — `pill(active)` styling.
- If "Ha": a **"Chegirma foizi (%)"** number input (placeholder "20", max-width 220px) appears; if price+percent present, show computed line: **"Yakuniy narx: "** + final price in bold accent color.

**Submit button**: **"+ Mahsulotni qo'shish"** — `margin-top:16px;background:var(--accent);color:var(--accent-ink);border:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:11px;cursor:pointer`.
Validation: requires name + price → toast **"Nom va narxni kiriting"**. Discount percentage clamped 0–90%. Toast on success: **"Mahsulot qo'shildi"**, form resets.

### 2. "Mahsulotlar ro'yxati" (Product list card)
Header row: `grid-template-columns:1.8fr 1fr 1.1fr 1fr 1fr 0.7fr;gap:12px;padding:10px 8px;margin-top:12px;font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--line)`. Columns, in order: **Nomi, Brend, Kategoriya, Narx, Ombor**, (empty 6th column header for the delete action).

Row style: same grid, `padding:13px 8px;font-size:13.5px;color:var(--ink);border-bottom:1px solid var(--line);align-items:center`.
- Nomi: bold
- Brend: muted
- Kategoriya: muted
- Narx: bold (formatted price)
- Ombor: bold, colored, text = `"{stock} · {stockLabel}"`:
  - `stock<=0` → color `var(--danger)`, label **"Tugagan"**
  - `0 < stock<=5` → color `var(--warning)`, label **"Kam qoldi"**
  - `stock>5` → color `var(--success)`, label **"Mavjud"**
  (Note: Stock Control tab uses slightly different labels — `Tugadi / Kam qoldi / Yetarli` — both are legitimate per-tab vocabularies, reproduce as-is per tab.)
- Delete button, right-aligned (`justify-self:end`): text **"O'chirish"** — `background:transparent;border:1px solid var(--danger);color:var(--danger);font-weight:600;font-size:12.5px;padding:7px 12px;border-radius:8px;cursor:pointer;white-space:nowrap`. Opens the delete-confirmation modal.

### 3. Delete-confirmation modal (product delete, with active-order warning)
Full-screen overlay: `position:fixed;inset:0;z-index:270;background:rgba(10,15,25,.5);display:flex;align-items:center;justify-content:center;padding:20px` — clicking the overlay cancels.

Card: `background:var(--surface);border-radius:18px;padding:28px;max-width:420px;width:100%;display:flex;flex-direction:column;gap:16px`.
- Header row: bold 16px **"Mahsulotni o'chirish"** + a muted "✕" close icon (18px).
- Body copy (14px ink, line-height 1.55): **"«{name}» mahsulotini o'chirishga ishonchingiz komilmi? Bu amalni orqaga qaytarib bo'lmaydi."**
- **Active-order warning** (only shown if product appears in ≥1 order with status in `Yangi, Tasdiqlandi, Tayyorlanmoqda, Yo'lda`): red-tinted box `background:rgba(200,60,50,.08);border:1px solid var(--danger);border-radius:10px;padding:12px 14px;font-size:13.5px;color:var(--danger);line-height:1.5`, text: **"Bu mahsulot {activeCount} ta faol buyurtmada mavjud. Baribir o'chirilsinmi?"**
- Button row: **"Bekor qilish"** (cancel) and **"O'chirish"** (confirm), both `flex:1;font-size:14px;padding:13px;border-radius:12px`.

Toast on success: **"Mahsulot o'chirildi"**.

---

## Stock Control (Ombor nazorati)

Single card: `background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:22px`.
- Title, bold 16px: **"Ombor nazorati"**
- Subtitle (13px muted, `margin:6px 0 16px`): **"Model → rang → o'lcham bo'yicha qoldiqlar. Kam qolgan (sariq) va tugagan (qizil) qatorlarga e'tibor bering."**
- **Filter row** (`display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px`) — four `<select>` dropdowns (`padding:9px 12px;border:1px solid var(--line);border-radius:9px;background:var(--bg);color:var(--ink);font-size:13px;outline:none`), in order:
  1. Model filter — `"Barchasi"` + every live product name.
  2. Rang filter — `"Barchasi"` + hex codes (shown as swatch + Uzbek name in our real build, nicer than the raw-hex prototype).
  3. O'lcham filter — `"Barchasi"` + sizes 36–45.
  4. Holat filter — `"Barchasi", "Yetarli", "Kam qoldi", "Tugadi"`.
- Table (`overflow-x:auto` wrapper, inner `min-width:560px`). Header: `grid-template-columns:2fr 1fr 0.8fr 1fr 1.2fr;gap:12px;padding:10px 8px;font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--line)`. Columns: **Model, Rang, O'lcham, Qoldiq, Holat**.
  Row: same grid, `padding:11px 8px;font-size:13.5px;color:var(--ink);border-bottom:1px solid var(--line);align-items:center`.
  - Model: bold, product name.
  - Rang: `display:flex;align-items:center;gap:6px;color:var(--muted)` — 14×14px circular swatch (`border-radius:999px;border:1px solid var(--line);background:{hex}`) + Uzbek color name.
  - O'lcham: plain size number.
  - Qoldiq: **inline-editable** number `<input>` (`width:76px;padding:7px 9px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink);font-size:13px;outline:none`) — updates on every change, min 0.
  - Holat: bold text, color-coded: **Tugadi** (`qty<=0`, `var(--danger)`), **Kam qoldi** (`qty<5`, `var(--warning)`), **Yetarli** (`qty>=5`, `var(--success)`).

Rows = real `stock` table rows (product × color × size), filtered by the four selects.

---

## Orders (Buyurtmalar)

Card: `background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:22px`. Title bold 16px: **"Barcha buyurtmalar"**.

**Status filter chips** (`display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 4px`), 7 chips total, `pill(active)` styling:
- `all` → **"Barchasi"**
- then: **Yangi, Tasdiqlandi, Tayyorlanmoqda, Yo'lda, Yetkazildi, Bekor qilindi**

**Table header**: `grid-template-columns:0.3fr 1.1fr 1.4fr 0.9fr 1fr 1.4fr;gap:12px;padding:10px 8px;margin-top:12px;font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--line)`. Columns: (blank chevron column), **Raqam, Mijoz, Sana, Summa, Holat**.

Each order row, `border-bottom:1px solid var(--line)`, containing:
1. **Clickable summary row** (toggles expand on click), same 6-column grid, `padding:13px 8px;font-size:13.5px;color:var(--ink);align-items:center`:
   - Chevron cell: `▾` expanded / `▸` collapsed (muted, 12px, 14px wide).
   - Raqam: bold, flex with 6px gap for inline PRE-ORDER badge (when `isPreorder`).
   - Mijoz: customer name.
   - Sana: muted date (`dd.mm.yyyy`).
   - Summa: bold formatted total.
   - Holat: an actual `<select>` bound to current status, all 6 statuses as options, `padding:8px 10px;border:1px solid var(--line);border-radius:9px;background:var(--bg);color:{statusColor};font-size:12.5px;font-weight:600;cursor:pointer;outline:none`. Clicking the select stops row-toggle propagation; changing it updates status immediately (server round-trip in our build, applying business rule 3.1 stock decrement/restock).
2. **Expanded detail** — `padding:4px 8px 16px 34px;background:var(--surface-2)`:
   - Info line (`display:flex;flex-wrap:wrap;gap:20px;padding:10px 0 4px;font-size:13px;color:var(--ink)`): **"Mijoz: "** + bold name, **"Manzil: "** + bold address (or `—`), **"To'lov: "** + bold payment label (or `—`).
   - Line-item list (`gap:8px;padding-top:10px`): each row `display:flex;align-items:center;gap:14px;font-size:13px;color:var(--ink);background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 14px`, showing: product name (bold, `flex:1.4`), `"{unitPrice} / dona"` (muted), line total (bold), 12×12 color swatch + name (muted), `"O'lcham {size}"` (muted), `"{qty} juft"` (muted).

**Status-change side effects** (business rule 3.1, already implemented in our schema/business logic plan): changing to "Tasdiqlandi" decrements stock per line (once, `stock_applied=true`); changing to "Bekor qilindi" restores stock if it had been applied. All other transitions don't touch stock. Every change appends to `order_status_history`.

---

## Reviews (Sharhlar) — moderation

Card: `background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:22px`. Title bold 16px: **"Mijoz sharhlari"**. Subtitle (13px muted, `margin:6px 0 16px`): **"Yangi sharhlar avval shu yerda tasdiqlanadi, keyin mahsulot sahifasida ko'rinadi."**

Empty state (`padding:24px;text-align:center;color:var(--muted);font-size:13px`): **"Hozircha sharhlar yo'q"**.

List (`display:flex;flex-direction:column;gap:12px`). Each review card: `border:1px solid var(--line);border-radius:14px;padding:16px 18px;display:flex;flex-direction:column;gap:8px`:
- Header row (`justify-content:space-between;flex-wrap:wrap;gap:8px`): left = product name (bold 14px) then `"{customer} · {date}"` (12.5px muted); right = status pill (`font-size:12px;font-weight:700;background:var(--surface-2);padding:4px 10px;border-radius:999px`). We'll show a translated Uzbek label (Kutilmoqda/Tasdiqlangan/Rad etilgan) rather than the prototype's raw `pending/approved/rejected` — nicer for a real admin UI. Colors: approved→`var(--accent)`, pending→`var(--star)`, rejected→`var(--danger)`.
- Star line: filled stars up to rating count (`RatingStars` component).
- Review text paragraph, 13.5px muted, line-height 1.6.
- Action row (`gap:8px;margin-top:4px`): **"Tasdiqlash"** (accent-filled), **"Rad etish"** (bordered/neutral), **"O'chirish"** (danger-bordered, transparent bg) — same 12.5px/600, `padding:8px 14px;border-radius:8px`.

Delete has no confirmation dialog (unlike product delete — intentional prototype asymmetry, reproduce as-is).

---

## Pre-orders (Oldindan buyurtmalar)

Card: `background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:22px`. Title bold 16px: **"Oldindan buyurtmalar"**. Subtitle (13px muted, `margin:6px 0 16px`): **"Real oldindan buyurtmalar shu yerda, umumiy 'Buyurtmalar' bo'limi bilan bir xil ma'lumotdan (is_preorder=true)."** — per README's explicit warning (3.2), this must read from the SAME `orders` table filtered by `is_preorder=true`, not a separate list.

Table header: `grid-template-columns:1fr 1.3fr 1.5fr 0.6fr 1fr 1.4fr;gap:12px;padding:10px 8px;font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--line)`. Columns: **Raqam, Mijoz, Mahsulot, Soni, Yetkazish, Holat**.

Row: same grid, `padding:12px 8px;font-size:13px;color:var(--ink);border-bottom:1px solid var(--line);align-items:center`. Holat = status `<select>` (real orders use the same 6 `orderStatuses`; functional, unlike the prototype's non-wired demo-row select).

---

## Pre-order Products (Oldindan buyurtma mahsulotlari)

Two stacked cards, `display:flex;flex-direction:column;gap:20px`.

### 1. "Oldindan buyurtma mahsuloti qo'shish"
Subtitle (13px muted, `margin:6px 0 14px`): **"Hali omborda yo'q yoki ishlab chiqarilmagan mahsulotlarni shu yerdan qo'shing — ular mijozlar uchun \"Oldindan buyurtma\" bo'limida ko'rinadi."**

Form grid, same input styling as Products:
- **"Nomi"** — text, placeholder "Mahsulot nomi"
- **"Kategoriya"** — select
- **"Rang"** — select (8 colors)
- **"Narx (so'm)"** — number, placeholder "1290000"
- **"Ishlab chiqarish (kun)"** — number, placeholder "21" (maps to `products.production_days`)

Submit: **"+ Oldindan buyurtma mahsulotini qo'shish"**. Validation: name+price required → **"Nom va narxni kiriting"**. New product defaults: `stock: 0` (so it always qualifies as out-of-stock), `productionDays` defaults to 21 if invalid. Toast: **"Oldindan buyurtma mahsuloti qo'shildi"**.

### 2. "Oldindan buyurtma mahsulotlari ro'yxati"
Header: `grid-template-columns:2fr 1.2fr 1fr 1fr`. Columns: **Nomi, Kategoriya, Narx, Ishlab chiqarish**. Rows: name (bold), category (muted), price (bold), `"{days} kun"` (muted).
List = every live product with total stock `<= 0` (any product that's run out via normal orders will also appear here — this is correct/intentional per the prototype).

---

## Categories (Kategoriyalar) — CRUD

Two stacked cards, `display:flex;flex-direction:column;gap:20px`.

### 1. "Yangi kategoriya qo'shish"
`display:flex;gap:12px;margin-top:14px;flex-wrap:wrap`: text input (`flex:1;min-width:220px`, placeholder **"Kategoriya nomi (masalan: Sandal)"**) + button **"+ Qo'shish"** (`border:none;background:var(--accent);color:var(--accent-ink);font-weight:700;font-size:14px;padding:12px 22px;border-radius:10px;white-space:nowrap`).

Validation: trims whitespace; empty → **"Kategoriya nomini kiriting"**; case-insensitive duplicate → **"Bunday kategoriya allaqachon mavjud"**; success → clears input, toast **"Kategoriya qo'shildi"**.

### 2. "Mavjud kategoriyalar"
Grid: `repeat(auto-fill,minmax(240px,1fr));gap:14px;margin-top:16px`. Each card: `background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:16px 18px;display:flex;flex-direction:column;gap:10px` (note: `var(--bg)` background, not `var(--surface)` — flush with page, differentiated by border).

- **View mode**: row `justify-content:space-between;align-items:center` with category name (bold 14.5px) and `"{count} mahsulot"` (12px muted). Below: **"Tahrirlash"** (bordered/neutral) and **"O'chirish"** (red border/text, transparent bg), full-width split.
- **Edit mode**: text input pre-filled (`border:1px solid var(--accent)`), plus **"Saqlash"** (accent-filled) and **"Bekor qilish"** (bordered/neutral).

Edit validation: non-empty + no duplicate among others → renames everywhere (category table + cascades to product category references). Toast: **"Kategoriya yangilandi"**.

Delete: confirmation dialog (unlike the prototype which has none — for a real admin panel deleting a category that has products should be confirmed, so we add a lightweight confirm here as a deliberate, minor, safety-improving deviation). If category has products: warn in the confirmation copy that products in it will need reassignment (our schema requires `category_id` NOT NULL, so — flagging for later: deletion should be blocked or require reassigning affected products first, rather than silently orphaning them like the prototype implies. We'll block deletion with a clear message if products are still assigned, which is safer than the prototype's silent-delete behavior).

Seed categories (6, in order): **Krossovka, Klassik, Lofer, Skechers, Etik, Tapochka**.

---

## Customers (Mijozlar)

One card (view/manage only — no "add customer manually" form; customers are created via checkout per business rule 3.4, which is the single source of truth for dedup-by-phone, so we don't reproduce the prototype's separate manual-add form since it created duplicate, non-deduped rows — a bug we're intentionally not carrying forward).

`overflow-x:auto` wrapper, `min-width:640px`. Header: `grid-template-columns:1.1fr 1.2fr 1.2fr 1.4fr 0.9fr 0.9fr;gap:12px`. Columns: **Ism, Telefon, Viloyat, Manzil, Summa, Buyurtmalar**.

Row (`font-size:13px;color:var(--ink);padding:13px 8px;border-bottom:1px solid var(--line);align-items:center`):
- Ism: `"{ism} {familiya}"` bold
- Telefon: muted
- Viloyat: muted
- Manzil: muted
- Summa: bold — sum of all order totals for that customer
- Buyurtmalar: bold — count of orders for that customer (join, not a stored counter)

Seed customers (from our Step 2 seed): Dilnoza Karimova.

---

## Reports (Hisobotlar)

`display:flex;flex-direction:column;gap:20px`.

**Period selector row**: `display:flex;align-items:center;gap:10px;flex-wrap:wrap`. Label (13.5px/600 ink): **"Davr:"**. Four `pill()`-styled buttons: **Kunlik, Haftalik** (default active)**, Oylik, Yillik**.

**Stat cards**: same grid/card styling as Dashboard. 4 cards, recomputed per selected period:
1. `"{PeriodLabel} daromad"` — period revenue (real, computed from orders in range)
2. `"{PeriodLabel} buyurtmalar"` — period order count
3. **"O'rtacha chek"** — `revenue / orders`, rounded
4. **"Faol oldindan buyurtmalar"** — real count of live pre-orders

**Bar chart card**: `background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:24px`. Title bold 16px: **"Sotuv statistikasi · {periodLabel}"**. Chart area: `display:flex;align-items:flex-end;gap:14px;height:180px;margin-top:22px`. Each bar column: `flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end`, fill bar (`width:100%;border-radius:8px 8px 0 0;background:var(--accent);height:{n}%`) + label below (11.5px muted). Bucket labels per period: daily→hour buckets, weekly→`Du,Se,Ch,Pa,Ju,Sh,Ya` (Mon–Sun abbreviations), monthly→`1-h,2-h,3-h,4-h` (week-of-month), yearly→`Yan,Fev,Mar,Apr,May,Iyun,...` (month abbreviations). In Step 3 (mock data) we'll use the prototype's exact static demo numbers; in Step 4 these become real aggregate queries.

---

## Notifications (bell, dropdown, toast)

**Trigger**: every new order or pre-order placed by a customer.

**Bell button** (top-right of admin header): 42×42 circular button (`border:1px solid var(--line);background:var(--surface);border-radius:999px;font-size:17px;color:var(--ink)`) with 🔔 emoji. Click toggles dropdown.

**Unread badge**: shown when unread count > 0. `position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;padding:0 4px;border-radius:999px;background:#c8483d;color:#fff;font-size:10.5px;font-weight:700;display:flex;align-items:center;justify-content:center;line-height:1` (hardcoded red `#c8483d`, distinct from `--danger` token — reproduce exactly).

**Dropdown panel**: `position:absolute;top:50px;right:0;width:340px;max-height:420px;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.18);z-index:60;display:flex;flex-direction:column`.
- Header: bold 14px **"Bildirishnomalar"** + sound-toggle icon (🔊/🔇, title **"Ovozni yoqish/o'chirish"**).
- Empty state: **"Hozircha bildirishnoma yo'q"**.
- Rows: `padding:13px 16px;border-bottom:1px solid var(--line);cursor:pointer;display:flex;flex-direction:column;gap:3px`, background `var(--accent-soft)` if unread else transparent. Line 1: name (bold 13px) + time (11px muted). Line 2 (12.5px muted): `"{product} · {amount}"`.
- Click a row: marks read, closes dropdown, deep-links to `preorders` tab if that notification was a pre-order, else `orders` tab.

**Top-right toast** on new order (separate from the generic bottom toast): `position:fixed;top:20px;right:20px;z-index:250;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 18px;box-shadow:0 20px 50px rgba(0,0,0,.2);max-width:320px;display:flex;gap:10px;align-items:flex-start` — 🛒 emoji + bold **"Yangi buyurtma!"** + muted detail `"{customer} — {amount}"`. Auto-dismiss after 6000ms.

Sound: short "ding" via Web Audio API (sine 880Hz→1320Hz over ~0.16s, gain envelope). Browser Notification API for background-tab alerts, per README 3.6 (optional/recommended, not blocking).

Step 3 will build this with mock/local state (polling comes in Step 4 per our approved architecture decision — Vercel + 5-10s polling instead of WebSockets).

---

## Notes on data model / seed content useful for exact reproduction

- `orderStatuses` (fixed array, exact order): `["Yangi","Tasdiqlandi","Tayyorlanmoqda","Yo'lda","Yetkazildi","Bekor qilindi"]`
- `stockStatuses`: `["Yetarli","Kam qoldi","Tugadi"]`
- Categories seed: `["Krossovka","Klassik","Lofer","Skechers","Etik","Tapochka"]` (our Step 2 seed used different category names — Krossovkalar/Botinkalar/Sandallar; both are fine, just data, no need to reconcile)
- Sizes: `[36,37,38,39,40,41,42,43,44,45]`
- Colors (8 hex values with Uzbek names, see lookup table above)
- Provinces (14): Toshkent shahri, Toshkent viloyati, Samarqand, Buxoro, Andijon, Farg'ona, Namangan, Qashqadaryo, Surxondaryo, Xorazm, Navoiy, Jizzax, Sirdaryo, Qoraqalpog'iston
