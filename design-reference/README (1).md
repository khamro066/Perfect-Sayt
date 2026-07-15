# Handoff: Perfect Shoes — Oyoq kiyim onlayn do'koni

## Umumiy ma'lumot
Bu paket — Uzbek oyoq kiyim onlayn do'koni uchun to'liq **dizayn prototipi** (mijoz sayti + admin panel). Hozirgi holatda u faqat brauzer xotirasida (frontend state) ishlaydi — hech qanday backend, baza yoki real to'lov/SMS integratsiyasi yo'q. Bu hujjat maqsadi: dasturchi ushbu dizaynni **haqiqiy ishlaydigan saytga** aylantirishi — backend, baza, API va deploy bilan.

## Dizayn fayllari haqida — MUHIM
`files/Perfect Shoes.dc.html` va `files/ProductCard.dc.html` — **dizayn ma'lumotnomasi** sifatida yaratilgan HTML prototiplar. Ular productionga to'g'ridan-to'g'ri ko'chirilmaydi (kod formati maxsus dizayn vositasiga xos). Vazifa: shu HTML fayllarda ko'rsatilgan **ko'rinish, matn, joylashuv va xatti-harakatni** loyihaning haqiqiy texnologik stekida (masalan Next.js/React + Node/Postgres, yoki jamoa tanlagan boshqa stack) qaytadan yaratish.

## Fidelity
**Hifi (yuqori aniqlik)**: Rang, shrift, matnlar, joylashuv — final holatda. Dasturchi buni pixel-perfect qaytarishga harakat qilishi kerak. Rasmlar hozircha placeholder (keyinroq qo'yiladi — pastdagi "Assets" bo'limiga qarang).

---

## 1. Ekranlar / Sahifalar

### Mijoz tomoni
| Ekran | Vazifasi |
|---|---|
| Bosh sahifa | Hero banner (logo watermark bilan), afzalliklar, kategoriyalar, yangi mahsulotlar, chegirmalar, obuna formasi |
| Katalog | Filtr (o'lcham, jins, kategoriya, brend, rang, narx, reyting) + saralash + mahsulot kartalari grid |
| Mahsulot sahifasi | Galereya, rang/o'lcham tanlash (**ombordagi qoldiqqa qarab ba'zi o'lchamlar o'chirilgan/"tugadi"**), miqdor, "Savatga qo'shish"/"Hozir sotib olish", agar qoldiq yetarli bo'lmasa — "Oldindan buyurtma" bloki, tavsif, o'lcham jadvali (modal), mijoz sharhlari ro'yxati + reyting |
| Savatcha | Chiziq bo'yicha miqdor o'zgartirish, kupon, umumiy summa |
| Checkout | Mijoz ma'lumotlari (Ism — majburiy, Familiya — **ixtiyoriy**, label: "Familiya (ixtiyoriy)"), yetkazish usuli, to'lov usuli. Mijoz ma'lumotlari kartasi ichida "Sotuvchi bilan bog'lanish" bloki: Telegram (@Perfect_Mansur) va telefon (`tel:` havola) |
| Tasdiqlash (Confirm) | Buyurtma raqami, agar qoldiq etarli bo'lmagan bo'lsa — "OLDINDAN BUYURTMA" ogohlantirish bannerini ko'rsatadi |
| Oldindan buyurtma (Pre-order) sahifasi | Omborda yo'q mahsulotlar uchun alohida forma: to'lov turi — **"To'liq to'lov"** yoki **"Oldindan to'lov (30%)"** (yetkazishda to'lash yo'q) |
| Profil | Buyurtmalarim (yetkazilgan buyurtmaga "★ Fikr bildirish" tugmasi chiqadi), Oldindan buyurtmalarim, Sevimlilar, Profil ma'lumotlari |
| Aloqa | Kontakt ma'lumotlari |

### Sotuvchi kontakt ma'lumotlari (fixed data)
| Kanal | Qiymat |
|---|---|
| Telegram (sotuvchi) | `@Perfect_Mansur` — https://t.me/Perfect_Mansur |
| Telegram (kanal) | `@perfect_shoes_uz` — https://t.me/perfect_shoes_uz |
| Telefon | `+998 99 986 80 08` (`tel:+998999868008`) |

Bu ma'lumotlar checkout sahifasidagi "Sotuvchi bilan bog'lanish" blokida, Aloqa sahifasida va footerda ishlatiladi. O'zgartirish kerak bo'lsa — bitta konstanta sifatida backendda saqlash tavsiya etiladi.

### Admin panel (parol bilan himoyalangan — hozir hardcoded "admin2026", **productionda albatta real auth kerak**)
| Bo'lim | Vazifasi |
|---|---|
| Boshqaruv paneli (Dashboard) | Statistika kartalari + so'nggi buyurtmalar ro'yxati (PRE-ORDER belgisi bilan) |
| Mahsulotlar | Mahsulot qo'shish/ro'yxat |
| Kategoriyalar | Qo'shish/tahrirlash/o'chirish |
| **Ombor nazorati** | Model → rang → o'lcham → qoldiq jadvali, filtrlar (model/rang/o'lcham/holat), miqdorni qo'lda tahrirlash, holat avtomatik: Yetarli / Kam qoldi (<5) / Tugadi (0) |
| **Buyurtmalar** | Holat filtri (chip'lar), har bir buyurtma uchun holat almashtirish dropdown, PRE-ORDER belgisi |
| **Sharhlar** | Mijoz sharhlarini moderatsiya: Tasdiqlash / Rad etish / O'chirish |
| Oldindan buyurtmalar | Real pre-order buyurtmalar + demo namunalar |
| Oldindan buyurtma mahsulotlari | Hali ishlab chiqarilmagan mahsulotlarni qo'shish |
| Mijozlar | Telefon raqami bo'yicha **dublikatsiz** mijozlar ro'yxati, har biriga bog'langan buyurtmalar soni |
| Hisobotlar | Davr bo'yicha statistika (kunlik/haftalik/oylik/yillik) |
| Bildirishnomalar (bell icon) | Yangi buyurtma kelganda badge + dropdown + toast + ovozli signal (Web Audio) + brauzer push (Notification API) |

---

## 2. Ma'lumotlar modeli (baza jadvallari)

Buni relational bazada (Postgres tavsiya etiladi) quyidagicha loyihalash tavsiya etiladi:

### `products`
```
id, name, brand, gender, category, material, price, old_price,
rating, rating_count, description, production_days, created_at
```
### `product_colors` (yoki JSON array `colors: string[]` — hex kodlar)
### `product_sizes` (yoki JSON array `sizes: number[]`)
### `stock` — **model × rang × o'lcham × qoldiq**
```
id, product_id (FK), color_hex, size, quantity, updated_at
UNIQUE(product_id, color_hex, size)
```
### `customers`
```
id, ism (NOT NULL — majburiy), familiya (NULLABLE — ixtiyoriy maydon),
phone (UNIQUE — dublikat tekshiruvi shu ustun bo'yicha),
viloyat, manzil, created_at
```
### `orders`
```
id, order_number (masalan "PS-482910" yoki "PRE-58210"),
customer_id (FK -> customers.id),
total, status ENUM('Yangi','Tasdiqlandi','Tayyorlanmoqda',"Yo'lda",'Yetkazildi','Bekor qilindi'),
is_preorder BOOLEAN,
kind ENUM('order','preorder'),
stock_applied BOOLEAN,   -- ombordan ayirilganmi
created_at
```
### `order_lines`
```
id, order_id (FK), product_id (FK), color_hex, size, qty, unit_price
```
### `order_status_history`
```
id, order_id (FK), status, changed_at
```
### `reviews`
```
id, product_id (FK), customer_id (FK), order_id (FK — sharh qaysi buyurtmaga bog'liq),
rating (1-5), text, photo_url (ixtiyoriy), status ENUM('pending','approved','rejected'),
created_at
```
### `notifications` (admin bell uchun)
```
id, order_id (FK), customer_name, phone, product_summary, amount, kind, read BOOLEAN, created_at
```

---

## 3. Biznes mantiq — QOIDALAR (bular dizaynda ishlab chiqilgan, backend TENG shu mantiqni takrorlashi kerak)

### 3.1 Buyurtma holati (Order status flow)
Bosqichlar: **Yangi → Tasdiqlandi → Tayyorlanmoqda → Yo'lda → Yetkazildi**, yoki istalgan bosqichda **Bekor qilindi**.
- Admin holatni to'g'ridan-to'g'ri istalgan bosqichga o'tkaza oladi (qat'iy ketma-ketlik shart emas).
- Har bir holat o'zgarishi `order_status_history`ga sana-vaqt bilan yoziladi.
- Holat **"Tasdiqlandi"**ga o'tganda: har bir order_line bo'yicha `stock.quantity -= qty` (bir marta, `stock_applied=true` qilib belgilanadi — qayta bosilsa yana ayirilmasin).
- Holat **"Bekor qilindi"**ga o'tganda, agar `stock_applied=true` bo'lsa: `stock.quantity += qty` (qaytarish), so'ng `stock_applied=false`.
- Bu amal **bitta tranzaksiya** ichida bo'lishi kerak (order update + stock update birga commit/rollback).

### 3.2 Oldindan buyurtma (Pre-order) aniqlash qoidasi — TASDIQLANGAN BIZNES QOIDA
Checkout vaqtida, **har bir order_line uchun**: `so'ralgan_qty > stock.quantity` (shu product_id+color+size bo'yicha) tekshiriladi.
- Agar **kamida bitta line** shartga to'g'ri kelsa (ombordagi qoldiqdan ko'p so'ralgan bo'lsa) →  **BUTUN buyurtma** `is_preorder = true` deb belgilanadi (qisman bo'linmaydi — bu aniq tasdiqlangan qoida).
- `is_preorder=true` bo'lgan buyurtmalar:
  - "Buyurtmalar" umumiy ro'yxatida **PRE-ORDER** belgisi (badge) bilan ko'rinadi.
  - "Oldindan buyurtmalar" bo'limida HAM ko'rinishi SHART (bu oldin xato bo'lgan joy — ehtiyot bo'ling: ikki alohida ro'yxat/endpoint yozmang, bitta `orders` jadvalidan `is_preorder=true` filtri bilan oling — aks holda ular sinxron bo'lmay qoladi).
  - Tasdiqlangach ham xuddi shu stock decrement qoidasi ishlaydi (0dan pastga tushmaydi, `MAX(0, quantity - qty)`).
- Agar qoldiq **yetarli** bo'lsa → oddiy buyurtma, "Oldindan buyurtma" so'zi/belgisi HECH QAYERDA (saytda ham, admin panelda ham) chiqmasligi kerak.
- **Muhim**: bu tekshiruv frontendda HAM, backendda HAM (server-side) bajarilishi kerak — API to'g'ridan-to'g'ri chaqirilganda ham stock ma'lumoti noto'g'ri bo'lib qolmasligi uchun.

### 3.3 Mahsulot sahifasida o'lcham ko'rsatish
- Har bir o'lcham tugmasi tanlangan rang bo'yicha `stock.quantity`ni tekshiradi.
- `quantity <= 0` → tugma kulrang, bosilmaydigan, chizilgan (strikethrough) holatda.
- `0 < quantity < 3` → "Faqat X dona qoldi!" ogohlantirishi chiqadi.
- Butunlay omborda yo'q variant tanlanganda — "Oldindan buyurtma" blok-CTA ko'rinadi.

### 3.4 Mijozlar — dublikat oldini olish
- Checkout paytida telefon raqami bo'yicha `customers` jadvalidan qidiriladi.
- Topilsa: mavjud customer_id ishlatiladi, `summa`/manzil yangilanadi (qo'shiladi).
- Topilmasa: yangi customer yoziladi.
- Bu amal ham order yaratish bilan bitta tranzaksiyada bo'lishi kerak.

### 3.5 Sharhlar (Reviews) — moderatsiya va huquq
- Mijoz faqat **haqiqatda sotib olgan** (o'ziga tegishli `order_line` mavjud) VA order holati **"Yetkazildi"** bo'lgan mahsulotga sharh yoza oladi.
- Yangi sharh `status='pending'` bilan saqlanadi — saytda hali ko'rinmaydi.
- Admin "Sharhlar" bo'limida Tasdiqlash (`approved`) / Rad etish (`rejected`) / O'chirish qila oladi.
- Faqat `status='approved'` sharhlar mahsulot sahifasida ko'rinadi.

### 3.6 Bildirishnomalar (real-time)
- Yangi buyurtma tushganda: admin panelning bell ikonkasida qizil badge, dropdown ro'yxat, ekranning yuqori o'ng burchagida 5-7 soniyalik toast, va ovozli signal.
- **Productionda**: WebSocket (Socket.io) yoki Server-Sent Events orqali amalga oshiring — har bir yangi order backendda yaratilgan zahoti barcha ochiq admin sessiyalariga signal yuborilsin. Agar bu murakkab bo'lsa, 5-10 soniyalik polling ham qabul qilinadi.
- Browser Notification API — admin boshqa tabda bo'lsa ham xabar berish uchun (ixtiyoriy, tavsiya etiladi).

---

## 4. Taklif etilayotgan API endpointlar

```
GET    /api/products                     — filtr/sort bilan ro'yxat
GET    /api/products/:id
GET    /api/products/:id/stock           — rang×o'lcham qoldiqlar
GET    /api/products/:id/reviews         — faqat approved

POST   /api/orders                       — checkout (server-side stock tekshiruvi + is_preorder aniqlash shu yerda)
GET    /api/orders/:orderNumber

POST   /api/preorders                    — "Oldindan buyurtma" forma (bu ham /api/orders orqali is_preorder=true bilan yozilishi mumkin — yagona manba tavsiya etiladi)

POST   /api/reviews                      — mijoz sharh yuboradi (eligibility server-side tekshiriladi)

-- Admin (auth bilan himoyalangan):
POST   /api/admin/login
GET    /api/admin/orders?status=&isPreorder=
PATCH  /api/admin/orders/:id/status      — holat almashtirish (stock decrement/restock shu yerda)
GET    /api/admin/stock?model=&color=&size=&status=
PATCH  /api/admin/stock/:id              — qoldiqni qo'lda tahrirlash
GET    /api/admin/customers
GET    /api/admin/reviews?status=pending
PATCH  /api/admin/reviews/:id            — approve/reject/delete
GET    /api/admin/notifications
WS     /ws/admin                         — real-time yangi buyurtma signali
```

---

## 5. Dizayn tokenlari

- **Ranglar**: `--bg:#eef2f8`, `--surface:#ffffff`, `--ink:#101828`, `--muted:#5b6472`, `--line:#d7e0ec`, `--accent:#0e2a52` (asosiy — logotip rangi), `--accent-soft:#dde6f4`, `--danger` (qizil), `--warning` (sariq), `--success` (yashil), `--star` (sariq yulduzcha). Dark rejim variantlari ham mavjud (`data-theme="dark"`).
- **Shriftlar**: sarlavhalar — `Cormorant Garamond` (serif, 500 og'irlik), matn — `Source Sans 3` (sans-serif).
- **Border-radius**: kartalar 16px, katta bloklar 22-28px, tugmalar 10-12px, pill-badge 999px.
- **PRE-ORDER badge**: fon `#f0e4fb`, matn `#7a3fc9`.

## 6. Assets
Hozircha barcha mahsulot rasmlari **placeholder** (`<image-slot>` — drag-drop joy tutuvchi). Logotip fayllari: `pefect-logo-white-mrda6190.png` (shaffof fon, navy rang — asosiy foydalanilgan versiya), `perfect-logo.jpg`, `perfect-logo-blue-mrdcv22w.jpg`. Haqiqiy mahsulot suratlari keyinroq qo'yiladi — **kvadrat (1:1), tavsiya etilgan o'lcham 800×800px** (min. 600×600px).

## 7. Deploy bo'yicha tavsiya
- **Frontend**: Next.js (React) — dizaynni komponentlarga bo'lib qayta yozish tavsiya etiladi (bosh sahifa, katalog, mahsulot, checkout, admin — alohida route'lar).
- **Backend**: Node.js (Express/Fastify) yoki Next.js API routes + Postgres (Supabase/Neon/Railway — tez ishga tushirish uchun qulay) yoki O'zbekiston ichida joylashgan hosting talab qilinsa mahalliy VPS + Postgres.
- **Fayl/rasm saqlash**: S3-compatible storage (Cloudflare R2, yoki mahalliy alternativ).
- **To'lov**: Payme/Click/Uzcard API integratsiyasi — checkout formasi hozir shu maydonlarni tayyor holda ko'rsatadi, lekin real to'lov chaqiruvi yo'q, buni backend qo'shishi kerak.
- **SMS/Telegram bot**: Eskiz.uz yoki Play Mobitel kabi mahalliy SMS-gateway, yoki Telegram Bot API — buyurtma holati o'zgarganda xabar yuborish uchun.
- **Hosting**: Vercel (frontend) + Railway/Render (backend+DB) tezkor boshlash uchun qulay; O'zbekistonda joylashgan foydalanuvchilar uchun tezlik muhim bo'lsa — mahalliy datacenter (masalan UZINFOCOM, Beeline Cloud) ko'rib chiqilsin.

## 8. Fayllar
- `files/Perfect Shoes.dc.html` — asosiy dizayn (butun sayt + admin panel, bitta faylda, ichida barcha ekran holatlari va logika kommentariyasiz JS bilan — dasturchi buni **o'qib mantiqni tushunish** uchun, nusxa ko'chirish uchun emas, ishlatsin).
- `files/ProductCard.dc.html` — mahsulot kartasi komponenti (katalog/bosh sahifada takrorlanadigan blok).
