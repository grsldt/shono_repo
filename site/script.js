/**********************
 * CONFIGURATION CONFIG
 **********************/
const BRAND = {
  name: "SHONON",
  whatsapp: "+84943086947"
};

const RAW_CATALOG = window.CATALOG || {};
const RAW_REVIEWS = window.REVIEWS_DATA || [];

/**********************
 * ALIASES & CATEGORY BEHAVIORS
 **********************/
const CAT_ALIASES = {
  "t-shirts": "tshirt", "t_shirts": "tshirt", "tshirt": "tshirt", "t-shirt": "tshirt",
  "jacket": "jackets", "jackets": "jackets",
  "pant": "pants", "pants": "pants",
  "shoe": "shoes", "shoes": "shoes",
  "sweater": "sweaters", "sweaters": "sweaters",
  "short": "shorts", "shorts": "shorts",
  "tracksuit": "tracksuit", "electronics": "electronics",
  "watch": "watch", "watches": "watch", "perfume": "perfum", "perfum": "perfum"
};

function normCat(cat){
  const c = String(cat || "").trim().toLowerCase();
  return CAT_ALIASES[c] || c;
}

const DEFAULT_PRICE_BY_CAT = {
  shoes: 27, tshirt: 10, sweaters: 20, pants: 15, shorts: 15, jackets: 35,
  tracksuit: 35, electronics: 50, watch: 55, perfum: 15, cap: 15, bag: 55, underwear: 10, goyard: 10
};

const DEFAULT_SIZES_BY_CAT = {
  tshirt: ["S","M","L","XL"], sweaters: ["S","M","L","XL"], pants: ["S","M","L","XL"],
  shorts: ["S","M","L","XL"], jackets: ["S","M","L","XL"], tracksuit: ["S","M","L","XL"],
  shoes: ["37","38","39","40","41","42","43","44","45"]
};

/**********************
 * ENGINE HELPERS
 **********************/
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function cleanPhone(phone){ return (phone || "").replace(/[^\d]/g, ""); }
function waLink(message){ return `https://wa.me/${cleanPhone(BRAND.whatsapp)}?text=${encodeURIComponent(message)}`; }

// Fonction mise à jour pour gérer correctement les prix manquants (null)
function moneyUSD(n){ 
  if (n === null || n === undefined || Number.isNaN(n) || n === "NaN") return "N/A";
  return typeof n === "string" ? n : `$${Number(n).toFixed(2)}`; 
}

function escapeHtml(str){ return String(str ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
function titleCase(s){ return String(s || "").replaceAll("_"," ").replaceAll("-"," ").trim(); }

/**********************
 * CONSTRUCT DATA MODEL
 **********************/
function getBrands(){ return Object.keys(RAW_CATALOG || {}).sort((a,b)=>a.localeCompare(b)); }

function buildAllProducts(){
  const out = [];
  Object.entries(RAW_CATALOG || {}).forEach(([brandName, categories]) => {
    Object.entries(categories || {}).forEach(([rawCat, entries]) => {
      const cat = normCat(rawCat);
      (entries || []).forEach((group, i) => {
        const images = Array.isArray(group) ? group : [group];
        const index = i + 1;
        out.push({
          id: `${brandName}__${cat}__${index}`,
          brand: brandName,
          category: cat,
          title: `${brandName} ${titleCase(cat)} #${index}`,
          images: images.filter(Boolean),
          // Utilisation de null si la catégorie n'est pas trouvée
          price: DEFAULT_PRICE_BY_CAT[cat] ?? null,
          sizes: DEFAULT_SIZES_BY_CAT[cat] || [],
          desc: "Direct factory sourcing. Order via secure WhatsApp channel."
        });
      });
    });
  });
  return out;
}

const STATE = {
  brands: getBrands(),
  activeBrand: "HOME",
  productsAll: buildAllProducts(),
  search: "",
  cat: "all",
  sort: "featured",
  brandSearch: ""
};

/**********************
 * DOM BINDINGS
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
const homeView = $("#homeView");
const topbarControls = $("#topbarControls");
const reviewsScroll = $("#reviewsScroll");
const modalBackdrop = $("#modalBackdrop");
const modal = $("#modal");
const modalClose = $("#modalClose");
const modalBody = $("#modalBody");
const modalTitle = $("#modalTitle");

// WhatsApp Generic Link Setup
if ($("#waGeneric")) {
  $("#waGeneric").href = waLink("Hello, I would like to contact a Shonon agent for a sourcing request.");
}

/**********************
 * APP LOGIC & RENDERERS
 **********************/
function renderBrands(){
  const q = STATE.brandSearch.trim().toLowerCase();
  const list = STATE.brands.filter(b => !q || b.toLowerCase().includes(q));

  if (brandList) {
    brandList.innerHTML = list.map(b => {
      const isActive = STATE.activeBrand === b;
      const count = STATE.productsAll.filter(p => p.brand === b).length;
      return `
        <button class="brand-btn ${isActive ? 'active' : ''}" data-brand="${escapeHtml(b)}">
          <span>${escapeHtml(b)}</span>
          <small>${count}</small>
        </button>
      `;
    }).join("");
  }
}

function setBrand(brandOrHome){
  if(brandOrHome === null) {
    brandOrHome = STATE.brands[0] || "HOME";
  }

  STATE.activeBrand = brandOrHome;
  
  $$("[data-brand]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.brand === brandOrHome);
  });

  if (brandOrHome === "HOME") {
    if (homeView) homeView.classList.remove("hidden");
    if (grid) grid.classList.add("hidden");
    if (empty) empty.classList.add("hidden");
    if (topbarControls) topbarControls.style.display = "none";
    if (brandHeading) brandHeading.textContent = "Dashboard";
    if (brandSub) brandSub.textContent = "Global and verified supply platform.";
  } else {
    if (homeView) homeView.classList.add("hidden");
    if (grid) grid.classList.remove("hidden");
    if (topbarControls) topbarControls.style.display = "block";
    if (brandHeading) brandHeading.textContent = brandOrHome;
    if (brandSub) brandSub.textContent = "Select a reference to review sourcing options.";
    renderCatFilter();
    renderGrid();
  }
}

function renderReviews(){
  if (!reviewsScroll) return;
  if (!RAW_REVIEWS.length){
    reviewsScroll.innerHTML = `<p class="muted">No delivery proof available.</p>`;
    return;
  }

  reviewsScroll.innerHTML = RAW_REVIEWS.map((img, index) => `
    <div class="review-card" data-review-idx="${index}">
      <img src="${escapeHtml(img)}" alt="Delivery Proof #${index+1}" loading="lazy" />
    </div>
  `).join("");
}

function renderGrid(){
  if (!grid) return;
  let items = STATE.productsAll.filter(p => p.brand === STATE.activeBrand);

  if (STATE.cat !== "all") items = items.filter(p => p.category === STATE.cat);

  const q = STATE.search.trim().toLowerCase();
  if (q) items = items.filter(p => p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));

  if (STATE.sort === "priceLow") items.sort((a,b)=>a.price-b.price);
  if (STATE.sort === "priceHigh") items.sort((a,b)=>b.price-a.price);
  if (STATE.sort === "az") items.sort((a,b)=>a.title.localeCompare(b.title));

  if (!items.length){ 
    grid.innerHTML = ""; 
    if (empty) empty.classList.remove("hidden"); 
    return; 
  }
  if (empty) empty.classList.add("hidden");

  grid.innerHTML = items.map(p => `
    <article class="card" data-open="${escapeHtml(p.id)}">
      <div class="thumb">
        <img src="${escapeHtml(p.images[0])}" alt="${escapeHtml(p.title)}" loading="lazy" />
        <div class="priceTag">${moneyUSD(p.price)}</div>
      </div>
      <div class="cardBody">
        <div class="cardTitle">${escapeHtml(p.title)}</div>
        <div class="cardMeta">
          <span>BATCH FACTORY</span>
          <span>•</span>
          <span>${escapeHtml(titleCase(p.category))}</span>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCatFilter(){
  if (!catFilter) return;
  const items = STATE.productsAll.filter(p => p.brand === STATE.activeBrand);
  const cats = Array.from(new Set(items.map(p => p.category))).sort();
  catFilter.innerHTML = `<option value="all">All Categories</option>` + 
    cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(titleCase(c))}</option>`).join("");
  catFilter.value = STATE.cat;
}

/**********************
 * MODAL SYSTEM (PRODUCTS & LIGHTBOX)
 **********************/
function openModal(){
  if (modalBackdrop) modalBackdrop.classList.remove("hidden");
  if (modal) modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeModal(){
  if (modalBackdrop) modalBackdrop.classList.add("hidden");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}

if (modalClose) modalClose.addEventListener("click", closeModal);
if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);

// INTERCEPT CLICKS
document.addEventListener("click", (e)=>{
  // 1. Click on a review (Full-screen lightbox view)
  const revCard = e.target.closest(".review-card");
  if(revCard) {
    const idx = Number(revCard.dataset.reviewIdx);
    const imgSrc = RAW_REVIEWS[idx];
    if (modalTitle) modalTitle.textContent = `Delivery Verification #${idx + 1}`;
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="lightbox-img-container">
          <img src="${escapeHtml(imgSrc)}" alt="Full review proof" />
        </div>
      `;
    }
    openModal();
    return;
  }

  // 2. Click on a catalog product
  const prodCard = e.target.closest("[data-open]");
  if(prodCard) {
    const p = STATE.productsAll.find(x => x.id === prodCard.dataset.open);
    if (!p) return;
    if (modalTitle) modalTitle.textContent = `SOURCING SHEET — UNIT`;
    
    const slides = p.images.map(src=>`<div class="slide"><img src="${escapeHtml(src)}" loading="lazy"></div>`).join("");
    const dots = p.images.length > 1 ? `<div class="dots">${p.images.map((_,i)=>`<button class="dot ${i===0?'active':''}"></button>`).join("")}</div>` : '<div class="dots"></div>';
    const sizeBlock = p.sizes.length ? `
      <div class="block">
        <div class="label">Available Sizes</div>
        <div class="sizes" id="sizeRow">${p.sizes.map(s=>`<button class="size" data-size="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join("")}</div>
      </div>` : '';

    if (modalBody) {
      modalBody.innerHTML = `
        <div class="product">
          <div class="carousel">
            <div class="track" id="track">${slides}</div>
            <div class="carouselBar">
              ${dots}
              <div class="navBtns">
                <button class="navBtn" id="prevBtn">Prev</button>
                <button class="navBtn" id="nextBtn">Next</button>
              </div>
            </div>
          </div>
          <div class="panel">
            <div class="pTitle">${escapeHtml(p.title)}</div>
            <div class="pMeta">Factory Origin • ID: ${escapeHtml(p.id)}</div>
            <div class="priceRow"><div class="pPrice">${moneyUSD(p.price)}</div></div>
            ${sizeBlock}
            <div class="block">
              <div class="label">Order Quantity</div>
              <div class="qty"><button id="qtyMinus">−</button><span id="qtyVal">1</span><button id="qtyPlus">+</button></div>
            </div>
            <div class="block">
              <a class="btn btn-green" id="waOrder" target="_blank" rel="noopener">Send Order via WhatsApp</a>
            </div>
            <div class="note">Logistics fees calculated directly by your liaison agent. No on-site payment.</div>
          </div>
        </div>
      `;
    }

    // Carousel internal logic
    const track = $("#track");
    let activeIdx = 0;
    const updateCarousel = (idx) => {
      if (!track) return;
      activeIdx = Math.max(0, Math.min(p.images.length - 1, idx));
      track.scrollTo({ left: activeIdx * track.clientWidth, behavior: "smooth" });
      $$(".dot").forEach((d, i) => d.classList.toggle("active", i === activeIdx));
    };
    $("#prevBtn")?.addEventListener("click", () => updateCarousel(activeIdx - 1));
    $("#nextBtn")?.addEventListener("click", () => updateCarousel(activeIdx + 1));

    // Sizes and Quantities
    let qty = 1;
    $("#sizeRow")?.addEventListener("click", (ev) => {
      const b = ev.target.closest(".size"); if(!b) return;
      $$(".size").forEach(x => x.classList.remove("active")); b.classList.add("active"); updateWA();
    });
    $("#qtyMinus")?.addEventListener("click", () => { qty = Math.max(1, qty - 1); const qVal = $("#qtyVal"); if(qVal) qVal.textContent = qty; updateWA(); });
    $("#qtyPlus")?.addEventListener("click", () => { qty = Math.min(99, qty + 1); const qVal = $("#qtyVal"); if(qVal) qVal.textContent = qty; updateWA(); });

    function updateWA(){
      const activeSize = $(".size.active")?.dataset.size || "Not specified";
      const sizeLine = p.sizes.length ? `Size: ${activeSize}\n` : "";
      const msg = `Hello Supply Desk, I would like to order this reference:\n\nModel: ${p.title}\nReference ID: ${p.id}\n${sizeLine}Quantity: ${qty}\nPrice: ${moneyUSD(p.price)}`;
      const waOrderBtn = $("#waOrder");
      if (waOrderBtn) waOrderBtn.href = waLink(msg);
    }
    updateWA();
    openModal();
  }
});

/**********************
 * NAVIGATION & FILTER EVENTS
 **********************/
const sidebarEl = $(".sidebar");
if (sidebarEl) {
  sidebarEl.addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-brand]");
    if (!btn) return;
    setBrand(btn.dataset.brand);
  });
}

if (brandSearch) brandSearch.addEventListener("input", () => { STATE.brandSearch = brandSearch.value; renderBrands(); });
if (search) search.addEventListener("input", () => { STATE.search = search.value; renderGrid(); });
if (catFilter) catFilter.addEventListener("input", () => { STATE.cat = catFilter.value; renderGrid(); });
if (sortBy) sortBy.addEventListener("input", () => { STATE.sort = sortBy.value; renderGrid(); });

// RUNTIME INITIALIZATION
renderBrands();
renderReviews();
setBrand("HOME");