(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = (n) => "$" + n.toFixed(2);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Pricing ---------- */
  const PRICE = { kit: 129, pod: 16, subDiscount: 0.25 };
  const podUnit = (sub) => (sub ? PRICE.pod * (1 - PRICE.subDiscount) : PRICE.pod);

  /* ---------- Hero word cycle ---------- */
  const words = ["soft.", "clean.", "smooth.", "shiny.", "simple."];
  const heroWord = $("#hero-word");
  if (heroWord && !reduceMotion) {
    let i = 0;
    setInterval(() => {
      heroWord.classList.add("out");
      setTimeout(() => {
        i = (i + 1) % words.length;
        heroWord.textContent = words[i];
        heroWord.classList.remove("out");
      }, 480);
    }, 2600);
  }

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  /* ---------- Cart ---------- */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem("osso-cart") || "[]"); } catch { return []; } },
    set(v) { try { localStorage.setItem("osso-cart", JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };
  let cart = store.get();

  const drawer = $("#drawer"), scrim = $("#scrim");
  function openCart() {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    $("#cart-close").focus();
  }
  function closeCart() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
  }
  $("#cart-open").addEventListener("click", openCart);
  $("#cart-close").addEventListener("click", closeCart);
  scrim.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

  function addLine(line) {
    const existing = cart.find((l) => l.key === line.key);
    if (existing) existing.qty += line.qty;
    else cart.push(line);
    store.set(cart);
    renderCart(true);
  }

  function lineTotal(l) { return l.unit * l.qty; }

  function renderCart(bump) {
    const count = cart.reduce((n, l) => n + l.qty, 0);
    const countEl = $("#cart-count");
    countEl.textContent = count;
    if (bump) { countEl.classList.remove("bump"); void countEl.offsetWidth; countEl.classList.add("bump"); }

    const body = $("#cart-items");
    if (!cart.length) {
      body.innerHTML = '<div class="empty"><em>Osso empty.</em>Your softer shower starts with one ring.</div>';
    } else {
      body.innerHTML = cart.map((l, idx) => `
        <div class="line">
          <img src="${l.img}" alt="">
          <div>
            <p class="line-name">${l.name}</p>
            <p class="line-meta">${l.meta}</p>
            ${l.sub ? `<span class="line-sub">Every ${l.cadence} weeks</span><br>` : ""}
            <div class="line-qty">
              <button type="button" data-idx="${idx}" data-d="-1" aria-label="Decrease quantity">−</button>
              <span>${l.qty}</span>
              <button type="button" data-idx="${idx}" data-d="1" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div>
            <p class="line-price">${money(lineTotal(l))}</p>
            <button class="line-remove" type="button" data-remove="${idx}">Remove</button>
          </div>
        </div>`).join("");
    }
    $("#cart-subtotal").textContent = money(cart.reduce((s, l) => s + lineTotal(l), 0));
    $("#cart-sub-note").hidden = !cart.some((l) => l.sub);
    $("#checkout").disabled = !cart.length;
    $("#checkout-msg").textContent = "";
  }

  $("#cart-items").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.remove != null) {
      cart.splice(+b.dataset.remove, 1);
    } else if (b.dataset.idx != null) {
      const l = cart[+b.dataset.idx];
      l.qty += +b.dataset.d;
      if (l.qty < 1) cart.splice(+b.dataset.idx, 1);
    }
    store.set(cart);
    renderCart(false);
  });

  $("#checkout").addEventListener("click", () => {
    $("#checkout-msg").textContent = "Checkout isn't connected in this draft. In production this hands off to Shopify with subscription selling plans.";
  });

  /* ---------- Starter kit ---------- */
  $("#add-kit").addEventListener("click", () => {
    const finish = $('input[name="finish"]:checked').value;
    addLine({
      key: "kit-" + finish, name: "Osso Starter Kit", meta: finish + " · includes 1 pod",
      unit: PRICE.kit, qty: 1, img: "assets/shower.webp", sub: false,
    });
    toast("Starter Kit added to your bag");
    openCart();
  });

  /* ---------- Pods / subscription ---------- */
  const podQty = $("#pod-qty"), podCad = $("#pod-cadence");
  function isSub() { return $('input[name="ptype"]:checked').value === "sub"; }
  function renderPods() {
    const sub = isSub();
    const qty = +podQty.value;
    const unit = podUnit(sub);
    $("#pod-price").innerHTML = sub
      ? `${money(unit)} <span class="strike">${money(PRICE.pod)}</span>`
      : money(unit);
    $("#cadence-wrap").hidden = !sub;
    $("#add-pods").textContent = `${sub ? "Subscribe" : "Add to bag"} · ${money(unit * qty)}${sub ? " / delivery" : ""}`;
    $("#pod-fine").textContent = sub
      ? "First delivery ships when your kit's included pod runs low. Skip or cancel any time."
      : "Ships in 1–2 business days.";
  }
  $$('input[name="ptype"]').forEach((r) => r.addEventListener("change", renderPods));
  podQty.addEventListener("change", renderPods);
  podCad.addEventListener("change", renderPods);

  $("#add-pods").addEventListener("click", () => {
    const sub = isSub();
    const qty = +podQty.value, cad = +podCad.value;
    addLine({
      key: sub ? `pods-sub-${qty}-${cad}` : `pods-once-${qty}`,
      name: sub ? "Recharge Pods subscription" : "Recharge Pods",
      meta: `${qty} pod${qty > 1 ? "s" : ""}${sub ? " per delivery · 25% off" : ""}`,
      unit: podUnit(sub) * qty, qty: 1, img: "assets/pods.webp", sub, cadence: cad,
    });
    toast(sub ? `Subscribed: ${qty} pod${qty > 1 ? "s" : ""} every ${cad} weeks` : "Pods added to your bag");
    openCart();
  });

  /* ---------- Cadence calculator ---------- */
  // Regional hardness averages (gpg) by 3-digit ZIP prefix range. Coarse draft data based on
  // published USGS hardness maps; swap for a utility-level lookup (CCR data) in production.
  const HARDNESS = [
    [10, 27, 2, "Massachusetts"], [28, 29, 3, "Rhode Island"], [30, 38, 3, "New Hampshire"],
    [39, 49, 3, "Maine"], [50, 59, 6, "Vermont"], [60, 69, 4, "Connecticut"], [70, 89, 8, "New Jersey"],
    [100, 104, 2, "New York City"], [105, 149, 7, "New York State"], [150, 196, 9, "Pennsylvania"],
    [197, 199, 9, "Delaware"], [200, 205, 7, "Washington, DC"], [206, 219, 7, "Maryland"],
    [220, 246, 6, "Virginia"], [247, 268, 7, "West Virginia"], [270, 289, 3, "North Carolina"],
    [290, 299, 3, "South Carolina"], [300, 319, 3, "Georgia"], [320, 339, 12, "Florida"],
    [340, 349, 14, "South Florida"], [350, 369, 5, "Alabama"], [370, 385, 7, "Tennessee"],
    [386, 397, 6, "Mississippi"], [398, 399, 3, "Georgia"], [400, 427, 9, "Kentucky"],
    [430, 459, 12, "Ohio"], [460, 479, 15, "Indiana"], [480, 499, 10, "Michigan"], [500, 528, 16, "Iowa"],
    [530, 549, 13, "Wisconsin"], [550, 567, 12, "Minnesota"], [570, 577, 15, "South Dakota"],
    [580, 588, 14, "North Dakota"], [590, 599, 10, "Montana"], [600, 608, 8, "Chicago metro, IL"],
    [609, 629, 13, "Illinois"], [630, 658, 11, "Missouri"], [660, 679, 15, "Kansas"],
    [680, 693, 15, "Nebraska"], [700, 714, 6, "Louisiana"], [716, 729, 5, "Arkansas"],
    [730, 749, 11, "Oklahoma"], [750, 753, 8, "Dallas metro, TX"], [754, 769, 12, "Texas"],
    [770, 775, 9, "Houston metro, TX"], [776, 779, 12, "Texas"], [780, 782, 17, "San Antonio metro, TX"],
    [783, 786, 10, "Austin metro, TX"], [787, 787, 8, "Austin, TX"], [788, 799, 15, "West Texas"],
    [800, 816, 8, "Colorado"], [820, 831, 11, "Wyoming"], [832, 838, 10, "Idaho"], [840, 847, 15, "Utah"],
    [850, 853, 17, "Phoenix metro, AZ"], [854, 865, 16, "Arizona"], [870, 884, 13, "New Mexico"],
    [889, 898, 16, "Nevada"], [900, 918, 12, "Los Angeles metro, CA"], [919, 921, 15, "San Diego metro, CA"],
    [922, 935, 15, "Southern California"], [936, 939, 8, "Central California"],
    [940, 944, 3, "San Francisco Bay Area, CA"], [945, 949, 6, "Bay Area, CA"], [950, 951, 9, "San Jose metro, CA"],
    [952, 961, 6, "Northern California"], [967, 968, 4, "Hawaii"], [970, 979, 2, "Oregon"],
    [980, 994, 3, "Washington"], [995, 999, 4, "Alaska"],
  ];
  const NATIONAL_AVG = 10;

  // Building era → typical flow at the head and a wear factor for sediment from older pipes.
  const ERA = {
    pre1960: { gpm: 1.9, wear: 1.15, note: "Older galvanized pipes often narrow with scale." },
    "1960":  { gpm: 2.3, wear: 1.08, note: "" },
    "1994":  { gpm: 2.2, wear: 1.0, note: "" },
    "2016":  { gpm: 1.8, wear: 1.0, note: "" },
    unknown: { gpm: 2.1, wear: 1.04, note: "" },
  };
  const POD_GRAINS = 6400; // design capacity per pod

  function classify(gpg) {
    if (gpg < 1) return "Soft";
    if (gpg < 3.5) return "Slightly hard";
    if (gpg < 7) return "Moderately hard";
    if (gpg < 10.5) return "Hard";
    return "Very hard";
  }

  function lookupHardness(zip) {
    if (!/^\d{5}$/.test(zip)) return null;
    const p = +zip.slice(0, 3);
    const hit = HARDNESS.find(([a, b]) => p >= a && p <= b);
    return hit ? { gpg: hit[2], region: hit[3] } : { gpg: NATIONAL_AVG, region: "U.S. average", fallback: true };
  }

  // Pick a pack size and cadence that covers usage with the least overshoot.
  function recommend(podsPerWeek) {
    let best = null;
    for (const cad of [2, 4, 6, 8]) {
      for (const qty of [1, 2, 3, 4, 6]) {
        const supply = qty / cad;
        if (supply < podsPerWeek * 0.92) continue; // allow ~8% slack, the fill line shows remaining resin
        const over = supply - podsPerWeek;
        const score = over + (cad === 4 ? -0.005 : 0); // gentle preference for monthly
        if (!best || score < best.score) best = { qty, cad, score };
      }
    }
    return best || { qty: 6, cad: 2 };
  }

  const form = $("#calc-form");
  const showersIn = $("#c-showers"), lengthIn = $("#c-length"), zipIn = $("#c-zip");
  let lastPlan = null;
  const lastHardness = { gpg: 17, region: "Phoenix metro, AZ" };

  function setRangeFill() {
    const pct = ((lengthIn.value - lengthIn.min) / (lengthIn.max - lengthIn.min)) * 100;
    lengthIn.style.setProperty("--pct", pct + "%");
    $("#c-length-out").textContent = lengthIn.value + " min";
  }

  function calc() {
    setRangeFill();
    let showers = Math.round(+showersIn.value || 0);
    showers = Math.min(42, Math.max(1, showers));
    const minutes = +lengthIn.value;
    const era = ERA[$('input[name="age"]:checked').value];

    const zipMsg = $("#c-zip-msg");
    const zip = zipIn.value.trim();
    const h = lookupHardness(zip);
    if (h) {
      Object.assign(lastHardness, h);
      zipMsg.classList.remove("err");
      zipMsg.textContent = h.fallback ? "We don't have regional data for that ZIP yet, so we're using the U.S. average." : "";
    } else if (zip.length) {
      zipMsg.classList.add("err");
      zipMsg.textContent = "Enter a 5-digit U.S. ZIP code.";
    } else {
      zipMsg.classList.remove("err");
      zipMsg.textContent = "No ZIP yet, so we're using the U.S. average.";
      Object.assign(lastHardness, { gpg: NATIONAL_AVG, region: "U.S. average" });
    }
    const gpg = lastHardness.gpg;

    const galWeek = showers * minutes * era.gpm;
    const grainsWeek = galWeek * gpg * era.wear;
    const podsPerWeek = grainsWeek / POD_GRAINS;
    const podLifeDays = podsPerWeek > 0 ? Math.round(7 / podsPerWeek) : 0;
    const plan = recommend(podsPerWeek);
    lastPlan = plan;

    const perDelivery = plan.qty * podUnit(true);
    const perMonth = perDelivery * (4.345 / plan.cad);

    $("#r-gpg").textContent = gpg % 1 ? gpg.toFixed(1) : gpg;
    $("#r-class").textContent = classify(gpg);
    $("#r-pin").style.left = Math.min(100, (gpg / 20) * 100) + "%";
    $("#r-region").textContent = `${lastHardness.region} · regional average${era.note ? " · " + era.note : ""}`;
    $("#r-gal").textContent = Math.round(galWeek).toLocaleString();
    $("#r-gpm").textContent = era.gpm.toFixed(1);
    $("#r-grains").textContent = (Math.round((grainsWeek * 4) / 100) * 100).toLocaleString();
    $("#r-life").textContent = podLifeDays > 120 ? "120+" : podLifeDays;
    $("#r-plan").textContent = `${plan.qty} pod${plan.qty > 1 ? "s" : ""} every ${plan.cad} weeks`;
    $("#r-price").textContent = money(perDelivery);
    $("#r-month").textContent = money(perMonth);
  }

  form.addEventListener("input", calc);
  form.addEventListener("change", calc);
  form.addEventListener("submit", (e) => e.preventDefault());
  zipIn.addEventListener("input", () => { zipIn.value = zipIn.value.replace(/\D/g, "").slice(0, 5); });
  $$(".stepper button").forEach((b) => b.addEventListener("click", () => {
    showersIn.value = Math.min(42, Math.max(1, (+showersIn.value || 0) + +b.dataset.step));
    calc();
  }));

  $("#r-apply").addEventListener("click", () => {
    if (!lastPlan) return;
    $('input[name="ptype"][value="sub"]').checked = true;
    podQty.value = String(lastPlan.qty);
    podCad.value = String(lastPlan.cad);
    renderPods();
    $("#shop").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    toast(`Plan set: ${lastPlan.qty} pod${lastPlan.qty > 1 ? "s" : ""} every ${lastPlan.cad} weeks`);
  });

  /* ---------- Newsletter ---------- */
  $("#newsletter").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("#nl-email").value.trim();
    const msg = $("#nl-msg");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      msg.classList.add("err");
      msg.textContent = "Enter an email address like name@example.com.";
      return;
    }
    msg.classList.remove("err");
    msg.textContent = "Check your inbox. Your guide is on its way.";
    $("#nl-email").value = "";
  });

  renderPods();
  renderCart(false);
  calc();
})();
