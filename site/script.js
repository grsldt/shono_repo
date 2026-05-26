/**********************
 * BRAND (NO EMAIL)
 **********************/
const BRAND = {
  name: "SHONON",
  whatsapp: "+84943086947",
  // tracking: "https://neocartrige.com"
};

/**********************
 * CATALOG
 * expected: window.CATALOG = { Brand: { category: [ [imgs], [imgs] ... ] } }
 **********************/
const RAW_CATALOG = window.CATALOG || {};

/**********************
 * CATEGORY NORMALIZASHANANTION
 * (fix Apple / Vapes not showing when keys differ)
 **********************/
const CAT_ALIASES = {
  // shirts
  "t-shirts": "tshirt",
  "t_shirts": "tshirt",
  "tshirt": "tshirt",
  "t-shirts ": "tshirt",
  "t_shirt": "tshirt",
  "t-shirt": "tshirt",

  // jackets
  "jacket": "jackets",
  "jackets": "jackets",

  // pants
  "pant": "pants",
  "pants": "pants",

  // shoes
  "shoe": "shoes",
  "shoes": "shoes",

  // sweaters
  "sweater": "sweaters",
  "sweaters": "sweaters",

  // shorts
  "short": "shorts",
  "shorts": "shorts",

  // tracksuit
  "track": "tracksuit",
  "tracksuit": "tracksuit",

  // running
  "running": "running",

  // underwear
  "underwear": "underwear",

  // vapes
  "vape": "vapes",
  "vapes": "vapes",

  // electronics
  "electronic": "electronics",
  "electronics": "electronics",

  // others
  "watch": "watch",
  "watches": "watch",
  "perfum": "perfum",
  "perfume": "perfum",
  "cash": "cash",
  "lego": "lego",
  "apple": "electronics" // sometimes you may have "Apple" brand and "apple" category; safe fallback
};

function normCat(cat){
  const c = String(cat || "").trim().toLowerCase();
  return CAT_ALIASES[c] || c;
}

/**********************
 * DEFAULT PRICE / SIZES by normalized category
 **********************/
const DEFAULT_PRICE_BY_CAT = {
  shoes: 27,
  tshirt: 15,
  sweaters: 20,
  pants: 15,
  shorts: 15,
  jackets: 35,
  tracksuit: 35,
  running: 15,
  underwear: 15,
  vapes: "whatsapp",
  electronics: 50,
  watch: 55,
  perfum: 15,
  cap : 15,
  money :  "whatsapp",
  bag : 55,
  dyson : 35,
  goyard : 15,
  lego : 45,
  shirt : 15,
  Gshock : 29.99,
  rolex : 55

};

const DEFAULT_OLDPRICE_BY_CAT = {
  shoes: 89.99,
  tshirt: 49.99,
  sweaters: 59.99,
  pants: 54.99,
  shorts: 44.99,
  jackets: 109.99,
  tracksuit: 89.99,
  running: 79.99,
  underwear: 39.99,
  vapes: 0,
  electronics: 0,
  watch: 0,
  perfum: 0,
  cash: 0,
  lego: 0
};

const DEFAULT_SIZES_BY_CAT = {
  tshirt: ["S","M","L","XL"],
  sweaters: ["S","M","L","XL"],
  pants: ["S","M","L","XL"],
  shorts: ["S","M","L","XL"],
  jackets: ["S","M","L","XL"],
  tracksuit: ["S","M","L","XL"],
  running: ["S","M","L","XL"],
  underwear: ["S","M","L","XL"],

  shoes: ["37","38","39","40","41","42","43","44","45"],

  vapes: [],
  electronics: [],
  watch: [],
  perfum: [],
  cash: [],
  lego: []
};

/**********************
 * OPTIONAL per-product overrides (if you want later)
 * id format: `${brand}__${cat}__${index}`
 **********************/
const PRODUCT_OVERRIDES = {
  // "Apple__electronics__1": { price: 99.99, sizes: [], title: "iPhone case", desc:"..." }
};

/**********************
 * HELPERS
 **********************/
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function cleanPhone(phone){ return (phone || "").replace(/[^\d]/g, ""); }
function waLink(message){
  const phone = cleanPhone(BRAND.whatsapp);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
function moneyUSD(n){
  const v = Number(n || 0);
  return `$${v.toFixed(2)}`;
}
function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function titleCase(s){
  return String(s || "")
    .replaceAll("_"," ")
    .replaceAll("-"," ")
    .trim();
}

/**********************
 * PREPARE BRANDS + PRODUCTS
 **********************/
function getBrands(){
  return Object.keys(RAW_CATALOG || {}).sort((a,b)=>a.localeCompare(b));
}

function buildProductsForBrand(brandName){
  const brandObj = RAW_CATALOG?.[brandName] || {};
  const out = [];

  Object.entries(brandObj).forEach(([rawCat, entries]) => {
    const cat = normCat(rawCat);
    const groups = entries || [];

    (groups || []).forEach((group, i) => {
      // group can be array of images, or a single string image
      const images = Array.isArray(group) ? group : [group];
      const index = i + 1;

      const id = `${brandName}__${cat}__${index}`;
      const baseTitle = `${brandName} ${titleCase(cat)} #${index}`;

      const p = {
        id,
        brand: brandName,
        category: cat,
        title: baseTitle,
        images: images.filter(Boolean),
        price: DEFAULT_PRICE_BY_CAT[cat] ?? 29.99,
        oldPrice: DEFAULT_OLDPRICE_BY_CAT[cat] ?? 0,
        sizes: DEFAULT_SIZES_BY_CAT[cat] ?? [],
        desc: `No payment on site. Order via WhatsApp.`
      };

      const ov = PRODUCT_OVERRIDES[id];
      if (ov){
        if (typeof ov.title === "string") p.title = ov.title;
        if (typeof ov.desc === "string") p.desc = ov.desc;
        if (typeof ov.price === "number") p.price = ov.price;
        if (typeof ov.oldPrice === "number") p.oldPrice = ov.oldPrice;
        if (Array.isArray(ov.sizes)) p.sizes = ov.sizes;
      }

      if (!(p.oldPrice > p.price)) p.oldPrice = 0;

      // if no image, still push (but it will show empty)
      out.push(p);
    });
  });

  return out;
}

function buildAllProducts(){
  const brands = getBrands();
  const all = [];
  brands.forEach(b => all.push(...buildProductsForBrand(b)));
  return all;
}

/**********************
 * STATE
 **********************/
const STATE = {
  brands: getBrands(),
  activeBrand: null, // null => all
  productsAll: [],
  search: "",
  cat: "all",
  sort: "featured",
  brandSearch: ""
};

/**********************
 * DOM
 **********************/
const brandList = $("#brandList");
const brandHeading = $("#brandHeading");
const brandSub = $("#brandSub");

const brandSearch = $("#brandSearch");
const search = $("#search");
const catFilter = $("#catFilter");
const sortBy = $("#sortBy");

const grid = $("#grid");
const empty = $("#empty");

const modalBackdrop = $("#modalBackdrop");
const modal = $("#modal");
const modalClose = $("#modalClose");
const modalBody = $("#modalBody");
const modalTitle = $("#modalTitle");

/**********************
 * LINKS
 **********************/
const waGenericMsg =
`Hello 👋
Send me the product name OR a photo/link from internet.
I’ll tell you if we have it and send price + shipping ✅`;

$("#waGeneric").href = waLink(waGenericMsg);
$("#trackLink").href = BRAND.tracking;

/**********************
 * INIT PRODUCTS
 **********************/
STATE.productsAll = buildAllProducts();

/**********************
 * UI: BRANDS
 **********************/
function brandCount(brand){
  // count number of product groups across categories
  return buildProductsForBrand(brand).length;
}

function renderBrands(){
  const q = STATE.brandSearch.trim().toLowerCase();
  const list = STATE.brands.filter(b => !q || b.toLowerCase().includes(q));

  // If active brand not in filtered list, keep it anyway (not needed)
  const html = list.map(b => {
    const isActive = STATE.activeBrand === b;
    const count = brandCount(b);
    return `
      <button class="brand-btn ${isActive ? "active":""}" data-brand="${escapeHtml(b)}">
        <span>${escapeHtml(b)}</span>
        <small>${count}</small>
      </button>
    `;
  }).join("");

  brandList.innerHTML = html || `<div class="muted" style="padding:8px 4px;">No brand</div>`;
}

function setBrand(brandOrNull){
  STATE.activeBrand = brandOrNull;
  $$(".brand-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.brand === brandOrNull));

  const label = brandOrNull ? brandOrNull : "All products";
  brandHeading.textContent = label;
  // brandSub.textContent = "Click a product to see details, choose size, then order via WhatsApp.";

  renderCatFilter();
  renderGrid();
}

/**********************
 * UI: CATEGORY FILTER (from current selection)
 **********************/
function getVisibleBaseProducts(){
  let items = STATE.productsAll;

  if (STATE.activeBrand){
    items = items.filter(p => p.brand === STATE.activeBrand);
  }

  // category filter
  if (STATE.cat !== "all"){
    items = items.filter(p => p.category === STATE.cat);
  }

  // search
  const q = STATE.search.trim().toLowerCase();
  if (q){
    items = items.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // sort
  switch(STATE.sort){
    case "az": items = [...items].sort((a,b)=>a.title.localeCompare(b.title)); break;
    case "za": items = [...items].sort((a,b)=>b.title.localeCompare(a.title)); break;
    case "priceLow": items = [...items].sort((a,b)=>a.price-b.price); break;
    case "priceHigh": items = [...items].sort((a,b)=>b.price-a.price); break;
    default: items = [...items]; break;
  }

  return items;
}

function renderCatFilter(){
  // gather cats from selected scope
  let items = STATE.productsAll;
  if (STATE.activeBrand){
    items = items.filter(p => p.brand === STATE.activeBrand);
  }
  const cats = Array.from(new Set(items.map(p => p.category))).sort((a,b)=>a.localeCompare(b));

  // preserve selection if still exists
  if (STATE.cat !== "all" && !cats.includes(STATE.cat)) STATE.cat = "all";

  const opts = [`<option value="all">All categories</option>`]
    .concat(cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(titleCase(c))}</option>`))
    .join("");

  catFilter.innerHTML = opts;
  catFilter.value = STATE.cat;
}

/**********************
 * UI: GRID
 **********************/
function renderGrid(){
  const items = getVisibleBaseProducts();

  if (!items.length){
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  grid.innerHTML = items.map(p => {
    const img = p.images?.[0] || "";
    return `
      <article class="card" data-open="${escapeHtml(p.id)}">
        <div class="thumb">
          <img src="${escapeHtml(img)}" alt="${escapeHtml(p.title)}" loading="lazy" />
          <div class="priceTag">${moneyUSD(p.price)}</div>
        </div>
        <div class="cardBody">
          <div class="cardTitle">${escapeHtml(p.title)}</div>
          <div class="cardMeta">
            <span>${escapeHtml(p.brand)}</span>
            <span>•</span>
            <span>${escapeHtml(titleCase(p.category))}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

/**********************
 * PRODUCT LOOKUP
 **********************/
function getProductById(id){
  return STATE.productsAll.find(p => p.id === id) || null;
}

/**********************
 * MODAL
 **********************/
function openModal(){
  modalBackdrop.classList.remove("hidden");
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeModal(){
  modalBackdrop.classList.add("hidden");
  modal.classList.add("hidden");
  document.body.style.overflow = "";
  modalBody.innerHTML = "";
}

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);
document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeModal(); });

function renderProductModal(p){
  modalTitle.textContent = p.brand;

  const slides = (p.images || []).map((src, i)=>`
    <div class="slide"><img src="${escapeHtml(src)}" alt="${escapeHtml(p.title)} ${i+1}" loading="lazy"></div>
  `).join("");

  const dots = (p.images || []).length > 1
    ? `<div class="dots" id="dots">${p.images.map((_,i)=>`<button class="dot ${i===0?"active":""}" data-dot="${i}"></button>`).join("")}</div>`
    : `<div class="dots"></div>`;

  const promo = p.oldPrice > p.price;

  const sizeBlock = (p.sizes || []).length
    ? `
      <div class="block">
        <div class="label">SIZE</div>
        <div class="sizes" id="sizeRow">
          ${p.sizes.map(s=>`<button class="size" data-size="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join("")}
        </div>
      </div>
    `
    : `
      <div class="block">
        <div class="label">SIZE</div>
        <div class="muted" style="font-weight:800;">No size needed</div>
      </div>
    `;

  modalBody.innerHTML = `
    <div class="product">
      <div class="carousel">
        <div class="track" id="track">${slides}</div>
        <div class="carouselBar">
          ${dots}
          <div class="navBtns">
            <button class="navBtn" id="prevBtn" type="button">‹</button>
            <button class="navBtn" id="nextBtn" type="button">›</button>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="pTitle">${escapeHtml(p.title)}</div>
        <div class="pMeta">${escapeHtml(p.brand)} • ${escapeHtml(titleCase(p.category))} • ID: ${escapeHtml(p.id)}</div>

        <div class="priceRow">
          <div class="pPrice">${moneyUSD(p.price)}</div>
          ${promo ? `<div class="pOld">${moneyUSD(p.oldPrice)}</div>` : ""}
        </div>

        ${sizeBlock}

        <div class="block">
          <div class="label">QUANTITY</div>
          <div class="qty">
            <button id="qtyMinus" type="button">−</button>
            <span id="qtyVal">1</span>
            <button id="qtyPlus" type="button">+</button>
          </div>
        </div>

        <div class="block">
          <a class="btn btn-green" id="waOrder" target="_blank" rel="noopener">Order via WhatsApp</a>
          <button class="btn" id="closeBtn" type="button">Close</button>
        </div>

        <div class="note">
          No payment on site.<br/>
          You can send a photo/internet link on WhatsApp → we'll tell you if we're selling.
        </div>
      </div>
    </div>
  `;

  const track = $("#track");
  const dotsWrap = $("#dots");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");

  function setActiveDot(idx){
    if (!dotsWrap) return;
    $$("#dots .dot").forEach((d,i)=>d.classList.toggle("active", i===idx));
  }

  function goTo(idx){
    if (!track) return;
    const w = track.clientWidth;
    track.scrollTo({ left: idx * w, behavior: "smooth" });
  }

  if (dotsWrap){
    dotsWrap.addEventListener("click", (e)=>{
      const d = e.target.closest(".dot");
      if (!d) return;
      const idx = Number(d.dataset.dot || "0");
      goTo(idx);
    });
  }

  if (track){
    track.addEventListener("scroll", ()=>{
      const idx = Math.round(track.scrollLeft / track.clientWidth);
      setActiveDot(idx);
    }, { passive:true });
  }

  if (prevBtn){
    prevBtn.addEventListener("click", ()=>{
      const idx = Math.round(track.scrollLeft / track.clientWidth);
      goTo(Math.max(0, idx - 1));
    });
  }
  if (nextBtn){
    nextBtn.addEventListener("click", ()=>{
      const idx = Math.round(track.scrollLeft / track.clientWidth);
      goTo(Math.min((p.images.length || 1) - 1, idx + 1));
    });
  }

  // size selection
  const sizeRow = $("#sizeRow");
  if (sizeRow){
    sizeRow.addEventListener("click", (e)=>{
      const b = e.target.closest(".size");
      if (!b) return;
      $$("#sizeRow .size").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      updateWA();
    });
  }

  // qty
  let qty = 1;
  const qtyVal = $("#qtyVal");
  const updateQty = ()=>{ qtyVal.textContent = String(qty); updateWA(); };
  $("#qtyMinus").addEventListener("click", ()=>{ qty = Math.max(1, qty - 1); updateQty(); });
  $("#qtyPlus").addEventListener("click", ()=>{ qty = Math.min(99, qty + 1); updateQty(); });

  function getSize(){
    const active = $("#sizeRow .size.active");
    return active ? active.dataset.size : "";
  }

  function updateWA(){
    const size = getSize();
    const sizeLine = size ? `Size: ${size}\n` : "";
    const msg =
`Hello 👋 I want to order:

${p.title}
Brand: ${p.brand}
Category: ${p.category}
ID: ${p.id}
${sizeLine}Qty: ${qty}
Price: ${moneyUSD(p.price)} (each)

Send me shipping info please ✅
(You can also accept internet photo/link)`;

    $("#waOrder").href = waLink(msg);
  }

  updateWA();
  $("#closeBtn").addEventListener("click", closeModal);
}

/**********************
 * EVENTS
 **********************/
brandList.addEventListener("click", (e)=>{
  const btn = e.target.closest("[data-brand]");
  if (!btn) return;
  setBrand(btn.dataset.brand);
});

brandSearch?.addEventListener("input", ()=>{
  STATE.brandSearch = brandSearch.value || "";
  renderBrands();
});

search.addEventListener("input", ()=>{
  STATE.search = search.value || "";
  renderGrid();
});

catFilter.addEventListener("input", ()=>{
  STATE.cat = catFilter.value || "all";
  renderGrid();
});

sortBy.addEventListener("input", ()=>{
  STATE.sort = sortBy.value || "featured";
  renderGrid();
});

document.addEventListener("click", (e)=>{
  const open = e.target.closest("[data-open]");
  if (!open) return;
  const p = getProductById(open.dataset.open);
  if (!p) return;
  renderProductModal(p);
  openModal();
});

/**********************
 * FIRST RENDER
 **********************/
renderBrands();
renderCatFilter();
renderGrid();

/* Default brand = first brand if you want:
if (STATE.brands.length) setBrand(STATE.brands[0]);
*/
setBrand(STATE.brands.length ? STATE.brands[0] : null);
