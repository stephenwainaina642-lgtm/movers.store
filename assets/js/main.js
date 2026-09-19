/* ============================================================
   SITE BEHAVIOUR
   Nav state, mobile menu, FAQ accordion, contact tabs,
   the two quote forms (water order / moving & transport quote)
   and light conversion-event hooks.
   ============================================================ */

/* Pushes to dataLayer if analytics (GA4 / Meta Pixel via GTM) is installed later. */
function trackEvent(name, params) {
  if (window.dataLayer && typeof window.dataLayer.push === "function") {
    window.dataLayer.push({ event: name, ...(params || {}) });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Header state ---------- */
  const nav = document.getElementById("siteNav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  const closeBtn = document.getElementById("mmClose");
  const setMenu = (open) => {
    if (!menu) return;
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "";
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open && closeBtn) closeBtn.focus();
  };
  if (toggle) toggle.addEventListener("click", () => setMenu(true));
  if (closeBtn) closeBtn.addEventListener("click", () => setMenu(false));
  if (menu) menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-q");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const open = item.getAttribute("data-open") === "true";
      item.setAttribute("data-open", open ? "false" : "true");
      btn.setAttribute("aria-expanded", open ? "false" : "true");
    });
  });

  /* ---------- Conversion tracking ---------- */
  document.querySelectorAll("[data-wa]").forEach((el) =>
    el.addEventListener("click", () => trackEvent("whatsapp_click", { service: el.getAttribute("data-wa") })));
  document.querySelectorAll("[data-call]").forEach((el) =>
    el.addEventListener("click", () => trackEvent("phone_click", { business: el.getAttribute("data-call") })));

  /* ---------- Contact page: switch between the two businesses ---------- */
  const tabs = document.querySelectorAll(".tabs [data-tab]");
  const panels = document.querySelectorAll(".contact-panel");
  if (tabs.length && panels.length) {
    const show = (key, push) => {
      tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.tab === key ? "true" : "false"));
      panels.forEach((p) => p.classList.toggle("active", p.dataset.b === key));
      if (push && history.replaceState) history.replaceState(null, "", "#" + key);
    };
    tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.tab, true)));
    const fromHash = () => (location.hash === "#moving" ? "moving" : "water");
    show(fromHash(), false);
    window.addEventListener("hashchange", () => show(fromHash(), false));
  }

  /* ---------- Quote forms ---------- */
  document.querySelectorAll("form[data-quote-form]").forEach((form) => {
    const wrap = form.parentElement;
    const success = wrap.querySelector(".form-success");
    const kind = form.getAttribute("data-quote-form"); // "water" | "moving"

    /* Moving form: show the fields that fit the chosen service */
    const service = form.querySelector('select[name="service"]');
    const groups = form.querySelectorAll("[data-group]");
    const sync = () => {
      if (!service) return;
      const v = service.value;
      const isMove = v === "House Moving" || v === "Office Moving";
      const isTransport = v === "Goods Transport" || v === "Furniture Transport" || v === "Other Transport";
      groups.forEach((el) => {
        const g = el.getAttribute("data-group");
        el.style.display = (g === "move" && isMove) || (g === "transport" && isTransport) ? "" : "none";
      });
    };
    if (service) { service.addEventListener("change", sync); sync(); }

    const validate = () => {
      let ok = true;
      form.querySelectorAll("[data-req]").forEach((input) => {
        const field = input.closest(".form-field");
        const err = field && field.querySelector(".field-error");
        const v = input.value.trim();
        const bad = input.type === "tel" ? !/^[0-9+()\s-]{7,}$/.test(v) : v.length === 0;
        if (field) field.classList.toggle("error", bad);
        if (err) err.textContent = bad ? input.getAttribute("data-req") : "";
        if (bad) ok = false;
      });
      return ok;
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) {
        const first = form.querySelector(".form-field.error input, .form-field.error select");
        if (first) first.focus();
        return;
      }
      const btn = form.querySelector("button[type='submit']");
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      const done = (note) => {
        form.classList.add("hide");
        if (success) { success.classList.add("show"); success.setAttribute("tabindex", "-1"); success.focus(); }
        trackEvent("quote_form_submit", { business: kind, ...(note ? { note } : {}) });
      };
      /* Netlify Forms: the form has data-netlify="true" + a hidden form-name field.
         AJAX keeps the visitor on the page and shows the confirmation. */
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString(),
      }).then(() => done()).catch(() => done("fetch_failed_fallback"));
    });
  });
});
