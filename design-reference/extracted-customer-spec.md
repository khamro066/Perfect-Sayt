# Perfect Shoes — Customer-Facing Design Spec (extracted from design-reference prototype)

Source files:
- `design-reference/Perfect Shoes.dc (1).html` (2115 lines; markup ~lines 1–1463, JS logic class in `<script type="text/x-dc">` ~lines 1465–2112)
- `design-reference/ProductCard.dc (1).html` (reusable product card component, 61 lines)

This document covers ONLY the customer-facing storefront. The admin panel is documented separately in `extracted-admin-spec.md`.

The prototype is built with a proprietary "DC" component framework driving a single-page app with a `screen` state string. There is **no CSS media query anywhere in the file** — all responsiveness comes from CSS Grid `repeat(auto-fit/auto-fill, minmax(...))`, `flex-wrap:wrap`, and `clamp()` fluid typography. Treat this as "no fixed breakpoints — build fully fluid/responsive layouts using the same grid-min-width technique," but we'll still sanity-test at common device widths since we're building real responsive CSS, not copying the tool's technique verbatim.

---

## 1. Global Design Tokens

### CSS custom properties — Light theme (`:root`)
```
--bg:#eef2f8
--surface:#ffffff
--surface-2:#e6ecf5
--ink:#101828
--muted:#5b6472
--line:#d7e0ec
--accent:#0e2a52
--accent-ink:#ffffff
--accent-soft:#dde6f4
--deep:#0b2545              /* header/footer dark-navy background */
--deep-ink:#ffffff
--deep-muted:#aebbcf
--deep-line:rgba(255,255,255,.14)
--deep-highlight:#c9a24b    /* gold, used for footer column titles + admin link */
--success:#1f8a5b
--warning:#b7791f
--danger:#a5432e
--star:#c9a24b
--preorder-bg:#f0e4fb
--preorder-ink:#7a3fc9
```

### CSS custom properties — Dark theme (`[data-theme="dark"]`)
```
--bg:#0a0e16
--surface:#111827
--surface-2:#1a2333
--ink:#eef1f7
--muted:#a3aebd
--line:#293244
--accent:#4d7cc2
--accent-ink:#08101d
--accent-soft:#182338
--deep:#060b14
--deep-ink:#eef1f7
--deep-muted:#8b96a8
--deep-line:rgba(238,241,247,.10)
--deep-highlight:#d9b66f
--success:#4fb187
--warning:#e0b04a
--danger:#e0836a
--star:#d9b66f
--preorder-bg:#2a1f3d (derived; not literally present in source, kept consistent with light-mode ratio)
--preorder-ink:#c199f0 (derived)
```

Note: `--deep` (header/footer background) is a SEPARATE token from `--accent`, even though both render as dark navy in light theme (`#0b2545` vs `#0e2a52`) — do not conflate them. Header/footer always use `--deep`/`--deep-ink`/`--deep-muted`/`--deep-line`/`--deep-highlight`; buttons, active nav states, links, and product accents use `--accent`/`--accent-ink`/`--accent-soft`.

### Fonts
- Body font: `'Source Sans 3', system-ui, sans-serif` — all body copy, labels, buttons, inputs, prices, badges, meta text.
- Heading font: `'Cormorant Garamond', serif` — ONLY: page `<h1>`/`<h2>` section titles, product names/titles (card title, PDP title), footer wordmark "PERFECT", cart/mini-cart line-item product names, preorder product name in summary block. Weight 500 for page headings, 700 for product-card titles (19px), 600 for footer wordmark and cart line names.
- `-webkit-font-smoothing: antialiased` globally.

### Font sizes/weights observed
- Page H1 (Katalog, Savatcha, Checkout, Profile, Confirm): `font-size:28px; font-weight:500`
- Hero H1 (home): `font-size:clamp(34px,5vw,58px); font-weight:500; line-height:1.07`
- Section H2: `font-size:24px; font-weight:500`
- Featured/CTA H2: `clamp(28px,3.5vw,40px)` or `clamp(26px,3.5vw,38px)`
- Contact page H1: `clamp(30px,4.5vw,46px); line-height:1.1`
- Product card title: `19px / 700 / line-height 1.25`
- Product card brand eyebrow: `11px, letter-spacing .09em, uppercase, weight 600, color var(--muted)`
- Body paragraph copy: `14–17px`, `color:var(--muted)`, `line-height 1.6–1.7`
- Small meta text: `12–13px, color:var(--muted)`
- Prices: `16px/700` cards, `30px/700` PDP, `22px/700` cart total, `21px/700` checkout total, `17px/700` mini-cart total

### Border radius scale
- Large hero/banner blocks: **28px** (home hero), **22–24px** (sale/featured banner, newsletter CTA, confirm card, preorder intro banner)
- Section/panel cards (surface panels): **18px**
- Product cards / review cards / order cards: **16px**
- Image thumbnails: PDP main image **20px**, gallery thumb **12px**, cart line image **12px** (96px), mini-cart **10px** (50px), preorder summary image **14px** (100px), category tile **16px**
- Buttons/inputs/selects: **10–12px**
- Pills/badges/chips: **999px** fully round
- Small rectangular chips (footer payment badges only): **8px**
- Size selector buttons: **10px radius**, `min-width:46px; height:44px`
- Color swatch buttons: circular, 30px diameter on PDP/filters/preorder, 14px on cards

### Shadows
- Product card hover: `box-shadow:0 14px 34px rgba(0,0,0,.10)` + `transform:translateY(-3px)`, `transition: box-shadow .2s ease, transform .2s ease`
- Card heart/wishlist button: `box-shadow:0 2px 8px rgba(0,0,0,.14)`
- Mini-cart flyout: `box-shadow:0 20px 48px rgba(10,20,40,.22), 0 2px 8px rgba(10,20,40,.1)`
- Bottom toast: `box-shadow:0 10px 30px rgba(0,0,0,.28)`
- Top-right "new order" toast: `box-shadow:0 20px 50px rgba(0,0,0,.2)`

### Transitions
- Card hover: `transition: box-shadow .2s ease, transform .2s ease`
- Add-to-cart outline button hover: fills solid, `transition: all .18s ease`
- Filter/size/color chip toggle: `transition: all .15s ease`
- Custom scrollbar: `::-webkit-scrollbar{width/height:8px}`, thumb `background:var(--line); border-radius:999px`
- Cart badge pop animation on change (scale 1→1.35→1, 0.3s ease)
- Mini-cart panel open: fade+scale from `translateY(-8px) scale(.97)`, `.22s cubic-bezier(.2,.8,.2,1)`

---

## 2. Global Layout

### Header (sticky, `position:sticky; top:0; z-index:40`)
Background always `var(--deep)` (dark navy) regardless of light/dark theme. Two rows:

**Row 1** — container `max-width:1280px; margin:0 auto; padding:14px 24px; display:flex; align-items:center; gap:22px; flex-wrap:wrap`:
1. Logo: white version (`perfect-logo-white.png`), `height:40px`, clickable → home.
2. Spacer.
3. Right cluster (`gap:6px`):
   - Theme toggle: circular 42×42px, border `1px solid var(--deep-line)`, transparent bg, glyph `☾`/`☀`. Hover: `background:rgba(255,255,255,.1)`.
   - Cart button: rounded-rect (11px radius), border `1px solid var(--deep-line)`, transparent bg, text **"Savatcha"** + round count badge (shown only if cart non-empty) — badge bg `var(--deep-ink)`/text `var(--deep)` equivalent contrast, `min-width:20px;height:20px`, pop animation on change. Click toggles mini-cart flyout; if cart empty, navigates straight to `/savat` instead.

**No search box and no account/profile icon in the header** in the prototype — this is a real gap worth deciding on. Also no hamburger/drawer menu; mobile "nav" is just horizontal-scroll of the row-2 nav bar.

**Row 2 — Nav bar**: `border-top:1px solid var(--deep-line); background:var(--deep)`, inner `max-width:1280px; padding:0 18px; display:flex; gap:2px; overflow-x:auto`. Items `font-size:13px; text-transform:uppercase; letter-spacing:.04em; padding:14px 15px`; active = `color:var(--deep-ink); font-weight:700` + 2px bottom border; inactive = `color:var(--deep-muted); font-weight:500`. Hover → `color:var(--deep-ink)`.

Nav items (5 total):
```
Bosh sahifa         → /              (active-tracked)
Katalog              → /katalog       (active-tracked)
Yangi mahsulotlar    → /katalog?sort=new  (no active state)
Chegirmalar          → /katalog?sale=1    (no active state)
Biz haqimizda        → /aloqa         (active-tracked)
```
"Oldindan buyurtma" is NOT a top nav item — only reachable via footer link, PDP CTA, or a sold-out product card's button.

### Footer
`background:var(--deep); margin-top:24px`. Grid `max-width:1280px; padding:52px 24px 28px; display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:36px`, 4 columns:

1. **Brand column** (max-width 280px): wordmark **PERFECT** (Cormorant, 22px/600, letter-spacing .04em, `var(--deep-ink)`); tagline *"O'zbekistondagi premium oyoq kiyim do'koni. Original mahsulotlar, ishonchli xizmat."* (13.5px, `var(--deep-muted)`); phone **"+998 99 986 80 08"**; two circular (36×36px) social icon links, border `1px solid var(--deep-line)`: Telegram channel → `https://t.me/perfect_shoes_uz` (title "Telegram kanal"), Telegram seller → `https://t.me/Perfect_Mansur` (title "Sotuvchi bilan bog'lanish"). Hover: `border-color:var(--accent); color:var(--accent)`.

2. **"Do'kon"** column (label `text-transform:uppercase; font-size:12px; letter-spacing:.1em; color:var(--deep-highlight)`; links 13.5px `var(--deep-muted)`): Erkaklar, Ayollar, Bolalar, Yangi mahsulotlar, Chegirmalar (all → filtered catalog).

3. **"Yordam"** column: Oldindan buyurtma (→ pre-order page), Qaytarish siyosati (→ catalog, no dedicated page), Buyurtmani kuzatish (→ profile), Bog'lanish (→ contact).

4. **"To'lov usullari"** column: 8 small chips (8px radius, 11.5px/600, border `1px solid var(--deep-line)`, transparent bg): Payme, Click, Uzum Bank, Humo, UzCard, Visa, Mastercard, Naqd pul. Below: gold link **"Admin kirish →"** (`var(--deep-highlight)`) → admin login.

Bottom bar (`border-top:1px solid var(--deep-line)`, `padding:18px 24px; display:flex; justify-content:space-between; flex-wrap:wrap`): left **"© 2026 Perfect Shoes. Barcha huquqlar himoyalangan."**, right **"Toshkent, O'zbekiston"** (both 12.5px, `var(--deep-muted)`).

### Global overlays

1. **Bottom toast**: fixed `bottom:28px`, centered, pill (`border-radius:999px`), `background:var(--ink); color:var(--bg); padding:13px 22px`, auto-dismiss **2200ms**. Used for validation errors and confirmations across the app.

2. **Order toast** (top-right "Yangi buyurtma!" with 🛒) — admin-facing, fires on any order/preorder placement, auto-dismiss 6000ms. (Documented fully in admin spec's Notifications section.)

3. **Review modal**: centered, backdrop `rgba(10,15,25,.5)`, click-outside closes, card `max-width:420px; border-radius:18px; padding:28px`. Header `"{{ productName }} haqida fikr"` + `✕`. Body: 5 clickable stars (`★`, 26px, `var(--star)`, opacity 1 if ≤ selected else .3), default 5; `<textarea>` placeholder **"Mahsulot haqida fikringiz (ixtiyoriy)"**, min-height 100px; submit **"Sharhni yuborish"**. On submit: creates pending review, toast **"Sharh yuborildi — moderatsiyadan so'ng ko'rinadi"**, closes modal. Reachable only from Profile → Buyurtmalarim, on a delivered order without an existing review.

4. **Mini-cart flyout** (only if cart non-empty): fixed `top:96px; right:24px; width:340px (max 88vw); max-height:min(70vh,520px)`, `border-radius:18px`, animated in. Auto-closes after **4000ms** idle; hover pauses timer; backdrop click closes immediately.
   - Header: **"Savatcha · {{ cartCount }} ta"** + `×`.
   - Line list (max-height 340px): 50×50px thumb, name (ellipsis), **"O'lcham {{size}} · {{colorName}}"**, qty stepper (22×22 `−`/`+`), line price, small `×` remove (hover → `var(--danger)`).
   - Footer (if non-empty): **"Jami"** + subtotal; buttons **"Savatchani ko'rish"** (outline → cart) and **"Rasmiylashtirish"** (solid → checkout).

5. **Size chart modal** (from PDP): centered, `max-width:360px; border-radius:18px; padding:28px`. Header **"O'lcham jadvali"** + `✕`. Table columns **"EU o'lcham"** / **"Uzunlik (sm)"**. Rows (hardcoded 8): EU 38→24.0cm, 39→24.6, 40→25.3, 41→26.0, 42→26.7, 43→27.3, 44→28.0, 45→28.7cm.

---

## 3. Per-Screen Specs

## Home
Sections top to bottom, all wrapped `max-width:1280px; margin:0 auto`:

1. **Hero banner** (`padding:36px 24px 12px` outer, inner `padding:clamp(30px,5vw,68px)`): 28px-radius card, `min-height:420px`, `border:1px solid var(--line)`, background = `radial-gradient(130% 130% at 100% 0%, var(--accent-soft) 0%, #cfdbee 32%, var(--surface) 58%, var(--bg) 100%)`. Decorative shoe artwork image, absolutely positioned right, `pointer-events:none`. Foreground (`max-width:640px`): eyebrow pill **"Perfect Shoes"**; H1 **"Har qadamingiz uchun mukammal tanlov"**; paragraph **"O'zbekistondagi eng qulay oyoq kiyimlar kolleksiyasi. Sifatli mahsulotlar, tez yetkazib berish va qulay to'lov."**

2. **Trust bar** (`padding:32px 24px`): 1 card, `grid-template-columns:repeat(auto-fit,minmax(220px,1fr))`, 3 cells (icon `color:var(--accent)`, right border between cells):
   - Sifat kafolati — *"Barcha mahsulotlar yuqori sifatli materiallardan"*
   - Tez yetkazib berish — *"O'zbekiston bo'ylab 1-2 kun ichida"*
   - Xavfsiz to'lov — *"Online to'lov tizimi 100% himoyalangan"*

3. **"Kategoriyalar"**: H2 + "Katalog →" link. Grid `repeat(auto-fill,minmax(150px,1fr))` gap 16px. Square rounded-16px tile + name label (14px/600) below, clickable → filtered catalog. 5 tiles: Klassik, Lofer, Skechers, Etik, Tapochka (Krossovka intentionally excluded from home tiles in the prototype, though it exists as a filterable category).

4. **"Yangi mahsulotlar"**: H2 + "Barchasini ko'rish →". Product-card row, `repeat(auto-fill,minmax(230px,260px))` gap 20px. (Prototype shows only 1 card via a hardcoded slice — almost certainly a placeholder-count artifact; we'll show a fuller row, e.g. 4, in the real build.)

5. **"Eng ko'p sotilganlar"**: same pattern, sorted by units sold desc.

6. **Featured banner**: 22px-radius 2-col grid (`repeat(auto-fit,minmax(280px,1fr))`) — left: eyebrow **"Tanlangan kolleksiya"**, H2 **"Klassika, qayta kashf etilgan"**, paragraph *"Har mavsumda tanlab olingan eng sifatli modellar — charm, zamsh va zamonaviy dizayn uyg'unligi."*, button **"Kolleksiyani ko'rish"** (solid ink) → catalog; right: full-bleed image (`min-height:320px`). Below: another product row.

7. **"Chegirmadagi mahsulotlar"**: H2 + red **"SALE"** pill + "Barchasini ko'rish →". Row of discounted products.

8. **"Mijozlar fikri"**: H2, grid `repeat(auto-fit,minmax(280px,1fr))` gap 20px, 3 review cards (16px radius, `padding:24px`): star row, review text (15px), 40px round avatar (initial letter, accent-soft bg/accent text) + name (14px/600) + city (12.5px muted). 3 hardcoded reviews:
   - Dilnoza Karimova, Toshkent, ★5 — *"Krossovka juda sifatli chiqdi, o'lchami aniq keldi. Yetkazib berish ertasiga bo'ldi — juda mamnunman!"*
   - Sardor Aliyev, Samarqand, ★5 — *"Original mahsulot, charm etiklar zo'r. Viloyatga ham tez yetib keldi. Yana buyurtma beraman."*
   - Malika Yusupova, Farg'ona, ★4 — *"Sayt qulay, qidiruv tez ishlaydi. Chegirmalar ajoyib. Faqat rangi rasmga nisbatan biroz och."*

9. **Newsletter CTA**: `accent-soft` bg, 24px radius, centered: eyebrow **"Yangiliklar"**, H2 **"Yangiliklardan xabardor bo'ling"**, paragraph *"Yangi kolleksiyalar va maxsus chegirmalar haqida birinchilardan bo'lib bilib oling."*, email input (placeholder **"Email manzilingiz"**) + button **"Obuna bo'lish"**. Submit → toast **"Obuna uchun rahmat!"**, clears field (mock-only, no persistence needed at Step 3).

## Catalog
Container `max-width:1280px; padding:28px 24px 40px`. Header: H1 **"Katalog"** + subtitle **"{{count}} ta mahsulot topildi"**; sort `<select>`:
```
new (default) → "Eng yangi"
popular       → "Eng mashhur"
rating        → "Eng yuqori baholangan"
priceAsc      → "Narxi: arzon"
priceDesc     → "Narxi: qimmat"
discount      → "Eng katta chegirma"
```

Body: `display:flex; gap:28px` — filters sidebar (`width:270px`, sticky `top:150px`, `background:var(--surface); border-radius:18px; padding:22px`) + results grid (`flex:3 1 520px`).

**Filters sidebar**: header **"Filtrlar"** + **"Tozalash"** (clear) link. Sections:
1. **"Oyoq o'lchami"** — size chips 36–45 (46×44px, 10px radius, active = solid accent)
2. **"Jinsi"** — pills: Erkaklar, Ayollar, Bolalar, Uniseks
3. **"Kategoriya"** — pills: Krossovka, Klassik, Lofer, Skechers, Etik, Tapochka
4. **"Brend"** — non-functional placeholder in prototype (*"Brendlar keyinroq qo'shiladi"*); we'll make this a real functional filter since we have real brand data — deliberate improvement over the prototype.
5. **"Rang"** — 30px circular swatches, 8 palette colors, active = accent ring
6. **"Material"** — pills: Charm, Zamsh, Mesh, Tekstil, Rezina
7. **"Narx oralig'i"** — two range sliders (`min:0, max:2000000, step:50000`) for min/max, each clamped against the other
8. **"Reyting"** — pills: "★ 4.5+", "★ 4.0+", "★ 3.5+" (single-select, click-again to clear)
9. 4 checkboxes: Chegirmadagi mahsulotlar, Omborda mavjud, Yangi mahsulotlar, Mashhur mahsulotlar

**Results grid**: `repeat(auto-fill,minmax(220px,1fr))` gap 20px, ProductCard components. **Empty state**: centered `padding:80px 20px`, **"Hech narsa topilmadi"** (bold) + **"Filtrlarni o'zgartirib ko'ring yoki tozalang."** (muted).

## Product detail page (PDP)
Container `max-width:1280px; padding:20px 24px 40px`. Breadcrumb: `Bosh sahifa / Katalog / {{Product Name}}` (13px muted, last crumb ink-colored).

**Two-column** (`display:flex; gap:40px`):

**Left (`flex:1 1 420px`) — Gallery**: main image square, 20px radius, `border:1px solid var(--line)`. Thumbnail row: `repeat(4,1fr)` grid, gap 12px, 12px radius squares; active thumb = 2px accent ring.

**Right (`flex:1 1 380px`) — Info**:
1. Brand eyebrow → product name H1 (Cormorant 28px/500) → rating row: filled stars + numeric + `"· {{ratingCount}} ta sharh"`.
2. Price row: current (30px/700/accent) + if discounted: old price (17px muted strikethrough) + red discount pill `"-{{discount}}%"`.
3. **Stock indicator**: colored dot (9px) + label:
   - `stock<=0` → **"Omborda yo'q"**, `var(--danger)`
   - `0 < stock<=5` → **"Kam qoldi — {{stock}} juft"**, `var(--warning)`
   - else → **"Omborda mavjud — {{stock}} juft"**, `var(--success)`
4. **Color selector**: *"Rang: {{name}}"* + 30px circular swatches; selecting recalculates size availability for that color.
5. **Size selector**: header **"O'lchamni tanlang"** + right link **"O'lcham jadvali"** (opens modal). Size buttons (46×44px, 10px radius): in-stock for selected color = normal; out of stock for that color+size = `cursor:not-allowed; background:var(--surface-2); color:var(--muted); text-decoration:line-through; opacity:.6`, disabled.
   - **Low-stock note**: selected size qty > 0 and < 3 → `⚠ Faqat {{qty}} dona qoldi!`, `var(--warning)`, weight 600.
6. **Quantity stepper**: label **"Miqdor"**, `−`(42×42)/count(48w)/`+`(42×42). Min 1, no client max (validated server-side against stock at checkout).
7. **Action area** — two independent conditional blocks (both can show together):
   - **In stock** (`stock>0`): **"Savatchaga qo'shish"** (solid accent) + **"Hozir sotib olish"** (solid ink, adds line then jumps to checkout) side by side; below, full-width outline wishlist toggle: **"♡ Sevimlilarga"** / **"♥ Sevimlilarda"**.
   - **Pre-order eligible** (`stock<=0` OR selected qty ≥ 3): highlighted panel (1.5px accent border, accent-soft bg, 16px radius, `padding:20px`):
     - Pill **"OLDINDAN BUYURTMA"** (accent bg/ink)
     - If truly out of stock: *"Bu mahsulot hozircha omborda yo'q. Oldindan buyurtma bering — ishlab chiqarilgach, sizga birinchi bo'lib yetkaziladi."*
     - If in-stock but qty≥3: *"3 juft va undan ko'p buyurtma uchun oldindan buyurtma tavsiya etiladi — yetkazish muddati kafolatlanadi."*
     - Meta: **"Ishlab chiqarish: 14–21 kun"** + **"Taxminiy yetkazish: {{DD.MM.YYYY – DD.MM.YYYY}}"**
     - Button **"Oldindan buyurtma berish"** → pre-order page, prefilled.
8. **Trust strip** (border-top, 3-col auto-fit): Yetkazib berish / *"1–4 ish kuni · butun O'zbekiston"*; Qaytarish / *"14 kun ichida bepul qaytarish"*; Material / `{{material}}`.
9. **"Tavsif"** (border-top): auto-generated: *"Zamonaviy dizayn va yuqori sifatli {{material lowercased}} materialidan tayyorlangan {{name}}. Kun bo'yi qulaylik ta'minlaydigan yumshoq ichki qism va chidamli taglik. Har qanday uslubga mos keladi."* — but we have a real `description` field in the DB (README schema), so use the real admin-entered description instead of auto-generating one; this is an intentional, sensible deviation.

**Below**: "Mijoz sharhlari" (approved reviews only; empty state *"Hozircha tasdiqlangan sharh yo'q — birinchi bo'lib fikr bildiring."*) → "Yaqinda ko'rilgan" (recently viewed, only if non-empty, last 8 excluding current) → "Tavsiya etamiz" (same gender, up to 4) → "O'xshash mahsulotlar" (same brand, up to 4).

Note: PDP main image placeholder text implies hover-zoom ("sichqoncha bilan kattalashtiring") but no zoom is actually implemented in the prototype — copy-only, treat as optional nice-to-have not required for parity.

## Cart
Container `max-width:1180px; padding:28px 24px 48px`. H1 **"Savatcha"**.

**Empty**: centered card `padding:70px 20px`, 18px radius: **"Savatchangiz bo'sh"** (18px ink) + *"Yoqtirgan mahsulotlaringizni savatchaga qo'shing."* (muted) + button **"Xaridni boshlash"** → catalog.

**Non-empty**: 2-col (`flex:2 1 460px` lines / `flex:1 1 300px` sticky `top:150px` summary).
- Line item cards (16px radius, `padding:16px`): 96×96 image, brand eyebrow, name (Cormorant 18px), **"O'lcham: {{size}} · Rang: {{colorName}}"**, red **"O'chirish"** text-button; right: line total (16px/700) + qty stepper (34px buttons/38px count).
- Summary aside: **"Buyurtma xulosasi"**. Rows: **"Mahsulotlar"** (subtotal), optional **"Chegirma"** (coupon, accent color, prefixed `−`), **"Yetkazib berish"** (flat rule: `subtotal>=500000 ? 0 : 25000` so'm — cart screen only, since delivery method isn't chosen yet). Divider, **"Jami"** (22px bold), button **"Rasmiylashtirishga o'tish"** → checkout.
- Coupon: prototype has no visible input despite wired logic — we'll add a real coupon input (per our Step 1 decision: UI-only placeholder, no backend discount logic yet). Codes for reference only if we ever wire it: `SALOM10`→10%, `PERFECT15`→15%, case-insensitive.

## Checkout
Container `max-width:1100px; padding:28px 24px 48px`. H1 **"Buyurtmani rasmiylashtirish"**.

2-col (`flex:2 1 440px` form / `flex:1 1 300px` sticky `top:150px` summary), form = 4 stacked cards (18px radius, `padding:24px`, gap 16px):

1. **"Aloqa ma'lumotlari"**: 2-col — **Ism** (required, placeholder "Ismingiz") + **Familiya (ixtiyoriy)** (optional, placeholder "Familiyangiz"); full-width **Telefon raqami** (placeholder "+998 90 123 45 67"). Below: accent-soft help banner *"**Savolingiz bormi?** Buyurtmadan oldin sotuvchi bilan bog'laning."* + 2 pill links: **"Telegram orqali yozish"** (→ `https://t.me/Perfect_Mansur`), **"+998 99 986 80 08"** (→ `tel:+998999868008`).

2. **"Yetkazib berish manzili"**: 2-col — **Viloyat** (`<select>`, 14 provinces, default "Toshkent shahri") + **Tuman** (free text); full-width **Manzil** (placeholder "Ko'cha, uy, kvartira").

3. **"Yetkazib berish usuli"**: 3 selectable cards (selected = 1.5px accent border + accent-soft bg):
   - Kuryer orqali (Toshkent bo'ylab) — *"1-2 kun"* — 25 000 so'm
   - BTS Express (viloyatlarga) — *"2-4 kun"* — 40 000 so'm
   - Do'kondan olib ketish — *"Bugun tayyor"* — Bepul
   Default: kuryer.

4. **"To'lov usuli"**: pills, single-select: **"Naqd pul"** / **"Karta orqali"** (default cash). Helper: *"To'lov xavfsiz shifrlangan ulanish orqali amalga oshiriladi."*

Summary aside: **"Buyurtma"**, scrollable line list (max-height 230px, 52×52 thumb + `"{{size}} · {{qty}} dona"` + line total), subtotal, optional discount, divider, **"Jami"** (21px bold = subtotal − discount + delivery fee), button **"Buyurtmani tasdiqlash"**.

**Validation order** (each failure = bottom toast, abort): no ism → **"Ismingizni kiriting"**; no phone → **"Telefon raqamini kiriting"**; no manzil → **"Yetkazib berish manzilini kiriting"**; no payment → **"To'lov usulini tanlang"** (defensive, always has default).

On success: order number `"PS-" + 6-digit random`; address = `tuman ? tuman+", "+manzil : manzil`; `isPreorder` determined server-side by checking whether ANY line's requested qty exceeds available stock for that exact size+color (README rule 3.2 — same logic, not a UI trick); if triggered, extra toast **"Omborda yetarli emas — bu buyurtma OLDINDAN BUYURTMA sifatida qabul qilindi"**; cart cleared, coupon reset, → confirm screen.

## Confirm (order-success)
Container `max-width:640px; padding:56px 24px 64px`. Centered card (22px radius, `padding:clamp(28px,5vw,48px)`), 72px circular checkmark badge (`accent-soft` bg, `✓` 38px accent) at top.

Two header states:
- **Pre-order confirm**: H1 **"Oldindan buyurtma qabul qilindi"** + *"Buyurtmangiz ishlab chiqarish navbatiga qo'shildi. Holat o'zgarganda sizga xabar beramiz."*
- **Regular order confirm**: H1 **"Buyurtma tasdiqlandi"** + *"Xaridingiz uchun rahmat! Buyurtmangiz qabul qilindi va tayyorlanmoqda."*
  - **If flagged as pre-order due to insufficient stock at checkout** (README rule 3.2), extra banner under the description: light-purple box (`background:#f5eaff; border:1px solid #c9a8f0; color:#6b3fa0` — one-off literal hex values, not tokens, used only here) with **"⏳ Diqqat: so'ralgan miqdor omborda yetarli emas — bu buyurtma OLDINDAN BUYURTMA sifatida qabul qilindi."**

Details box (`bg:var(--bg)` inset, 14px radius, `padding:20px`): always **"Raqam"** = `{{orderNumber}}`. Then:
- Pre-order: **"Ishlab chiqarish"** = "14–21 kun", **"Taxminiy yetkazish"** = computed 14–21 day range, **"Holat"** = **"Kutilmoqda"** (star color).
- Regular order: **"Taxminiy yetkazish"** = computed 2–4 day range, **"Holat"** = **"Tayyorlanmoqda"** (accent color).

Below: centered pill **"Tasdiqnoma SMS va Email orqali yuborildi"** (SMS/email confirmation isn't actually wired yet per our stack — display only, matches prototype).

Bottom buttons: **"Buyurtmalarim"** (solid accent → profile) + **"Bosh sahifaga"** (outline → home).

## Pre-order page
Container `max-width:1100px; padding:28px 24px 48px`.

**Intro banner** (always shown): accent-soft bg, 22px radius, `padding:clamp(28px,4vw,44px)`. Eyebrow **"Oldindan buyurtma tizimi"**. H1 **"Kutayotgan modelingizni oldindan buyurtma qiling"**. Paragraph: *"Omborda mavjud bo'lmagan, hali ishlab chiqarilmagan yoki katta miqdordagi (3+ juft) buyurtmalar uchun. Oldindan buyurtma bering — biz ishlab chiqarib, sizga yetkazamiz."* 3-step strip (`repeat(auto-fit,minmax(220px,1fr))`), numbered circle badges:
1. **"Model, o'lcham va miqdorni tanlang"** — *"Kerakli mahsulot xususiyatlarini belgilang."*
2. **"Ma'lumot va to'lov turini kiriting"** — *"To'liq, oldindan (30%) yoki yetkazishda to'lash."*
3. **"Ishlab chiqarilgach yetkazamiz"** — *"Holat SMS va Telegram orqali kuzatiladi."*

**A. No product chosen** (reached from footer/nav): H2 **"Oldindan buyurtmaga tayyor modellar"** + *"Hozircha omborda yo'q — bosing va oldindan buyurtma bering."* Grid of ProductCards, sourced from products with `stock<=0`. Below: **"Butun katalogni ko'rish"** button (dark ink) → catalog.

**B. Product chosen** (via PDP's "Oldindan buyurtma berish"): 2-col (`flex:2 1 440px` form / `flex:1 1 300px` sticky summary), form = 4 stacked cards:
1. Product mini-summary: 100×100 image, brand eyebrow, name (Cormorant 20px), `"{{price}} / juft"`, and if genuinely out of stock: red **"Hozircha omborda yo'q"**.
2. **"Mahsulot tafsilotlari"**: O'lcham chips (all selectable, no stock-based disabling since this IS the pre-order flow); Rang swatches; Miqdor stepper (40×40 buttons/46 count), default qty 3.
3. **"Buyurtmachi ma'lumotlari"**: 2-col **Ism**/**Familiya** (BOTH required here — unlike checkout where Familiya is optional), full-width **Telefon raqami**, full-width **"Yetkazib berish manzili"** (single combined field, placeholder "Viloyat, tuman, ko'cha, uy").
4. **"To'lov turi"**: 2 selectable cards: **"To'liq to'lov"** / **"Oldindan to'lov (30%)"** (default deposit).

Summary aside: **"Oldindan buyurtma xulosasi"**. Rows: **"Ishlab chiqarish"** = "14–21 kun", **"Taxminiy yetkazish"** = computed 18–25 day range, **"Navbatdagi o'rin"** = a display-only queue position, **"Boshlang'ich holat"** = **"Kutilmoqda"**. Divider: **"Umumiy summa"** = unit × qty. Highlighted "due now" row: `full` → **"Hozir to'lanadi"** = full total; `deposit` → **"Oldindan to'lov (30%)"** = 30% rounded. Button **"Oldindan buyurtmani tasdiqlash"**. Footer note: *"Tasdiqlangach SMS va Telegram orqali xabar yuboriladi."*

**Validation**: requires ism, phone, size → **"Ism, telefon va o'lchamni to'ldiring"**. On success: order number `"PRE-" + 5-digit random`, → confirm (pre-order branch).

## Profile
Container `max-width:1180px; padding:28px 24px 48px`. H1 **"Shaxsiy kabinet"**.

**Sidebar** (`width:250px, max 280px`, 18px radius, `padding:16px`): avatar circle (46px, accent-soft bg, initial letter) + customer name + phone (identified via our phone-cookie approach per Step 1, not a hardcoded mock). Tabs (`tabSty()`, active = solid accent fill):
```
Buyurtmalarim              (Orders)             [default active]
Oldindan buyurtmalar        (Pre-orders)
Sevimli mahsulotlar         (Favorites)
Profil                      (Profile info)
```
(The prototype also has "Parolni o'zgartirish" and "Manzillar" tabs, but both are static/non-functional mock forms with no backend meaning under our phone-only, no-password identification model — we'll omit these two since they don't map to any real feature in our system, a deliberate deviation to avoid building fake UI.)

### Buyurtmalarim
Order cards (16px radius, `padding:20px`): order number (bold) + items summary + date (left); total + status pill (right, `background:var(--surface-2)`, colored per status). If `status==="Yetkazildi"` and no review yet for that order+product → **"★ Fikr bildirish"** button (outline accent) opens review modal; if already reviewed → **"✓ Siz sharh qoldirdingiz"** (muted text). Neither shown for undelivered orders.

### Oldindan buyurtmalar
Same card style + extra footer row (border-top): **"Taxminiy yetkazish: {{eta}}"** + **"Navbatdagi o'rin: {{queue}}"**.

### Sevimli mahsulotlar
Empty: centered card, **"Sevimlilar bo'sh"** + *"Yoqtirgan mahsulotlarni ♡ tugmasi orqali qo'shing."* Otherwise: ProductCard grid (`repeat(auto-fill,minmax(210px,1fr))` gap 18px).

### Profil
Form card (18px radius, `padding:24px`, max-width 520px): 2-col **Ism**/**Familiya**; full-width **Telefon**; full-width viloyat/manzil (from the customer record). Button **"Saqlash"**. (Prototype's version is static mock with no persistence; ours will actually read/update the real customer row tied to the phone cookie.)

## Contact
Container `max-width:1080px; padding:40px 24px 56px`, stack gap 40px.

1. Intro (max-width 660px): eyebrow **"Biz haqimizda"**. H1 **"Perfect Shoes — ishonchli oyoq kiyim do'koni"**. Paragraph: *"Biz O'zbekiston bo'ylab erkaklar, ayollar va bolalar uchun sifatli, qulay va zamonaviy oyoq kiyimlarni yetkazib beramiz. Har bir juft — original mahsulot, rasmiy kafolat bilan. Tez yetkazib berish va qulay to'lov."*

2. Info card grid (`repeat(auto-fit,minmax(230px,1fr))` gap 16px), 4 cards (16px radius, `padding:24px`):
   - **"Telefon"** — **"+998 99 986 80 08"** (19px/700) — *"Har kuni 09:00 – 22:00"*
   - **"Manzil"** (clickable, links to the Google Maps URL from README) — pin icon + **"Toshkent shahri, Olmazor tumani, Allon 25A"** + **"Xaritada ko'rish →"**
   - **"Yetkazib berish"** — *"Toshkent — 1 kun / Viloyatlar — 3-5 kun"*
   - **"Telegram"** — **"Rasmiy kanal"** (→ `https://t.me/perfect_shoes_uz`, 15px/600) + **"Sotuvchi bilan bog'lanish"** (→ `https://t.me/Perfect_Mansur`, 13px muted)

3. Bottom CTA: accent-soft bg, 20px radius, `padding:clamp(28px,4vw,44px)`: H2 **"Savolingiz bormi?"**, paragraph *"Buyurtma, o'lcham yoki yetkazib berish bo'yicha bizga qo'ng'iroq qiling — yordam beramiz."*, button **"+998 99 986 80 08"** (→ `tel:+998999868008`, solid accent pill).

---

## 4. ProductCard component

Used across Home rows, Catalog grid, PDP recommendation rows, Profile favorites grid, Pre-order product listing.

**Root**: `display:flex; flex-direction:column; background:var(--surface); border:1px solid var(--line); border-radius:16px; overflow:hidden; cursor:pointer; height:100%`. Hover: `box-shadow:0 14px 34px rgba(0,0,0,.10); transform:translateY(-3px)`. Whole card click → PDP.

**Image area**: `position:relative; width:100%; aspect-ratio:1/1; background:var(--surface-2)`. Source images intended 800×800px.
- Badges (top-left, stacked, gap 6px, `pointer-events:none`), all can co-occur:
  1. **"Yangi"** (if new) — `background:var(--accent); color:var(--accent-ink)`, 11px/600, `padding:4px 9px; border-radius:999px`
  2. **"-{{discount}}%"** (if discounted) — `background:var(--danger); color:#fff`, 11px/700
  3. **"Tugagan"** (if sold out) — `background:var(--ink); color:var(--bg)`, 11px/600
- Wishlist heart (top-right, 36×36px circle, white surface bg, `box-shadow:0 2px 8px rgba(0,0,0,.14)`): `♥` filled accent if favorited, `♡` outline muted if not. Click stops propagation.

**Body** (`padding:14px 15px 16px`, gap 6px, `flex:1`):
1. Brand eyebrow (11px uppercase, letter-spacing .09em, weight 600, muted)
2. Name (Cormorant 19px/700, line-height 1.25, ink)
3. Rating row: `★` (star color) + numeric + `"({{ratingCount}})"` (12.5px muted)
4. Price row: current (16px/700 accent) + old price if discounted (12.5px muted, strikethrough)
5. Color swatch dots (14×14px circles, 1px line border, gap 5px)
6. Footer button (full width, `margin-top:auto`, outline accent → fills solid on hover, 10px radius, `padding:10px`, 13px/600): **"Oldindan buyurtma"** if sold out (click → PDP), else **"Savatga qo'shish"** (click → add to cart, stops propagation).

---

## 5. Exact numeric values (quick reference)

| Element | Value |
|---|---|
| Header row 1 padding | `14px 24px` |
| Most sections container max-width | `1280px` |
| Cart container max-width | `1180px` |
| Checkout / Preorder container max-width | `1100px` |
| Confirm container max-width | `640px` |
| Contact container max-width | `1080px` |
| Product card grid min-width | `230px` (home/PDP rows) / `220px` (catalog, favorites) / `210px` (recs) |
| Category tile grid min-width | `150px` |
| Product image aspect ratio | `1/1` everywhere, intended source `800×800px` |
| PDP main image radius | `20px` |
| PDP gallery thumb | 4-col grid, `1/1`, `12px` radius, `12px` gap |
| Card badge padding/radius | `4px 9px` / `999px` |
| Card heart button | `36×36px` circle |
| Cart line image | `96×96px`, `12px` radius |
| Mini-cart line image | `50×50px`, `10px` radius |
| Preorder summary image | `100×100px`, `14px` radius |
| Category tile radius | `16px` |
| Size button | `min-width:46px; height:44px; radius:10px` |
| Color swatch (PDP/preorder/filters) | `30px` diameter |
| Color swatch (card) | `14px` diameter |
| Qty stepper (PDP) | `42×42px` |
| Qty stepper (Cart line) | `34×34px` |
| Qty stepper (mini-cart) | `22×22px` |
| Qty stepper (Preorder) | `40×40px` |
| Theme toggle button | `42×42px` circle |
| Sticky sidebar offset | `top:150px` |
| Mini-cart panel | `top:96px; right:24px; width:340px (max 88vw); max-height:min(70vh,520px)` |
| Mini-cart auto-close | `4000ms` |
| Toast auto-dismiss | `2200ms` (bottom), `6000ms` (order toast) |
| Price range slider | `min:0, max:2000000, step:50000` (so'm) |
| Free delivery threshold (Cart flat rule) | `subtotal >= 500 000 so'm → free, else 25 000` |
| Delivery fees (Checkout) | Kuryer `25 000`, Express `40 000`, Pickup `0` |
| Pre-order deposit | `30%` of total |
| Pre-order min qty trigger | `3` pairs |
| Size chart | EU 38–45 ↔ 24.0–28.7cm |
| Currency formatting | Thousands-space-separated + `" so'm"` suffix, e.g. `890 000 so'm` |

---

## 6. Deliberate deviations from the prototype (decided, not asking again)

- Show a fuller row (4 items) in Home's product carousels instead of the prototype's 1-item slice.
- Add a real coupon input on Cart (UI-only per Step 1 decision — no backend logic yet).
- Make the Catalog "Brend" filter actually functional (real brand data exists in our schema).
- PDP description uses the real DB `description` field, not an auto-generated string.
- No header search box or account icon in the prototype — we'll leave these out to match the prototype exactly unless the user asks to add them later.
- Profile omits "Parolni o'zgartirish" and "Manzillar" tabs (no real feature behind them in our phone-only auth model).
- No hover-zoom on PDP image (copy in the prototype implies it but it's not implemented) — out of scope for Step 3.
