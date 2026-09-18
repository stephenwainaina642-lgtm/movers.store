/* ============================================================
   MAIN SITE BEHAVIOUR
   Nav scroll state, mobile menu, FAQ accordions, smart quote
   form, and lightweight conversion-event tracking hooks.
   ============================================================ */

/* Push a conversion event to dataLayer if analytics is installed.
   No-ops safely if no analytics tool is present yet — wire up
   GA4 / Meta Pixel later and these events start flowing. */
function trackEvent(eventName, params) {
  if (window.dataLayer && typeof window.dataLayer.push === "function") {
    window.dataLayer.push({ event: eventName, ...(params || {}) });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById("siteNav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile menu ---------- */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const mmClose = document.getElementById("mmClose");
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      document.body.style.overflow = isOpen ? "hidden" : "";
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }
  if (mmClose) mmClose.addEventListener("click", closeMenu);
  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
    mobileMenu.querySelectorAll(".mm-group-head").forEach((head) => {
      head.addEventListener("click", () => {
        const group = head.closest(".mm-group");
        const wasOpen = group.classList.contains("open");
        mobileMenu.querySelectorAll(".mm-group.open").forEach((g) => g.classList.remove("open"));
        if (!wasOpen) group.classList.add("open");
      });
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-q");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const isOpen = item.getAttribute("data-open") === "true";
      item.setAttribute("data-open", isOpen ? "false" : "true");
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  });

  /* ---------- Click tracking on primary CTAs ---------- */
  document.querySelectorAll("[data-wa]").forEach((el) => {
    el.addEventListener("click", () => trackEvent("whatsapp_click", { service: el.getAttribute("data-wa") }));
  });
  document.querySelectorAll("[data-call]").forEach((el) => {
    el.addEventListener("click", () => trackEvent("phone_click"));
  });

  /* ---------- Smart quote form ---------- */
  const form = document.getElementById("quote-form");
  const success = document.getElementById("formSuccess");
  if (form) {
    const serviceSelect = document.getElementById("f-service");
    const movingFields = form.querySelectorAll("[data-group='moving']");
    const waterFields = form.querySelectorAll("[data-group='water']");
    const transportFields = form.querySelectorAll("[data-group='transport']");

    function showGroup(groupEls, show) {
      groupEls.forEach((el) => {
        el.style.display = show ? "" : "none";
        const input = el.querySelector("input,select,textarea");
        if (input) input.required = show && el.hasAttribute("data-required");
      });
    }

    function syncFieldsToService() {
      if (!serviceSelect) return;
      const v = serviceSelect.value;
      const isMoving = v === "House Moving" || v === "Office Moving";
      const isWater = v === "Water Delivery";
      const isTransport = v === "Goods Transport" || v === "Furniture Transport" || v === "Other Transport";
      showGroup(movingFields, isMoving);
      showGroup(waterFields, isWater);
      showGroup(transportFields, isTransport);
    }
    if (serviceSelect) {
      serviceSelect.addEventListener("change", syncFieldsToService);
      syncFieldsToService();
    }

    const requiredFields = [
      { id: "f-name", msg: "Please enter your name." },
      { id: "f-phone", msg: "Please enter a valid phone number." },
      { id: "f-service", msg: "Please select a service." },
      { id: "f-location", msg: "Please enter your location." },
    ];

    function validate() {
      let valid = true;
      requiredFields.forEach((f) => {
        const el = document.getElementById(f.id);
        if (!el) return;
        const wrapper = el.closest(".form-field");
        const errorSpan = wrapper ? wrapper.querySelector(".field-error") : null;
        const value = el.value.trim();
        const invalid = f.id === "f-phone" ? !/^[0-9+()\s-]{7,}$/.test(value) : value.length === 0;
        if (invalid) {
          if (wrapper) wrapper.classList.add("error");
          if (errorSpan) errorSpan.textContent = f.msg;
          valid = false;
        } else {
          if (wrapper) wrapper.classList.remove("error");
          if (errorSpan) errorSpan.textContent = "";
        }
      });
      return valid;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) return;

      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      /* Submitted via Netlify Forms (form has data-netlify="true" and a
         hidden form-name field). AJAX submit keeps the on-page success
         state instead of a full page reload. If the site is ever hosted
         somewhere other than Netlify, this fetch will fail silently and
         fall back to a normal POST via the form's own action/method. */
      const formData = new FormData(form);
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      })
        .then(() => {
          form.classList.add("hide");
          if (success) success.classList.add("show");
          trackEvent("quote_form_submit", { service: (document.getElementById("f-service") || {}).value });
        })
        .catch(() => {
          form.classList.add("hide");
          if (success) success.classList.add("show");
          trackEvent("quote_form_submit", { service: (document.getElementById("f-service") || {}).value, note: "fetch_failed_fallback" });
        });
    });
  }
});
