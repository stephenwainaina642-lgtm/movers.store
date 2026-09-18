/* ============================================================
   BUSINESS CONFIGURATION
   Single source of truth for contact details used across every
   page. Update phone/WhatsApp/email/location here ONCE and the
   whole site updates automatically — nav, footer, sticky bar,
   floating WhatsApp button and every CTA all read from this file.
   ============================================================ */
const BUSINESS = {
  name: "Clean Water Movers",
  phoneDisplay: "0720 792 185",
  phoneDial: "+254720792185",
  whatsapp: "254720792185", // digits only, country code, no + or leading 0
  email: "njugunagodffrey@gmail.com",
  location: "Githunguri, Kiambu County, Kenya",
  yearsInOperation: "10",
  siteUrl: "https://cleanwatermovers.shop",
};

/* Base WhatsApp message templates per service. A location can be
   appended dynamically (see buildWaLink) so messages sent from a
   location-specific page already say what the customer needs. */
const WA_MESSAGES = {
  water: "Hi Clean Water Movers, I need water delivery{loc}. I'd like to get a quote.",
  moving: "Hi Clean Water Movers, I'd like a quote for moving{loc}.",
  transport: "Hi Clean Water Movers, I'd like to enquire about transport{loc}.",
  house: "Hi Clean Water Movers, I'd like a quote for house moving{loc}.",
  office: "Hi Clean Water Movers, I'd like a quote for office relocation{loc}.",
  general: "Hi Clean Water Movers, I'd like to enquire about your water delivery, moving and transport services{loc}.",
};

/**
 * Build a wa.me link for a given service kind, optionally naming a
 * location so the prefilled message is specific to the page/area
 * the enquiry came from.
 * @param {string} kind - key in WA_MESSAGES
 * @param {string} [location] - e.g. "Nairobi", "Kiambu"
 */
function waLink(kind, location) {
  const template = WA_MESSAGES[kind] || WA_MESSAGES.general;
  const locPhrase = location ? ` to ${location}` : "";
  const msg = encodeURIComponent(template.replace("{loc}", locPhrase));
  return `https://wa.me/${BUSINESS.whatsapp}?text=${msg}`;
}

/* Wire up every element with data-wa / data-call on the page.
   data-wa-location can be set on individual elements to override
   the page-level default (window.PAGE_LOCATION, set per page). */
function initBusinessLinks() {
  document.querySelectorAll("[data-wa]").forEach((el) => {
    const kind = el.getAttribute("data-wa");
    const loc = el.getAttribute("data-wa-location") || window.PAGE_LOCATION || "";
    el.setAttribute("href", waLink(kind, loc));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
  document.querySelectorAll("[data-call]").forEach((el) => {
    el.setAttribute("href", `tel:${BUSINESS.phoneDial}`);
  });
  document.querySelectorAll("[data-email]").forEach((el) => {
    el.setAttribute("href", `mailto:${BUSINESS.email}`);
    if (el.hasAttribute("data-fill-text")) el.textContent = BUSINESS.email;
  });
  document.querySelectorAll("[data-phone-text]").forEach((el) => {
    el.textContent = BUSINESS.phoneDisplay;
  });

  const footerContact = document.getElementById("footer-contact");
  if (footerContact) {
    footerContact.innerHTML = `
      <li><a href="tel:${BUSINESS.phoneDial}">${BUSINESS.phoneDisplay}</a></li>
      <li><a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a></li>
      <li style="color:var(--color-text-on-dark-muted);">${BUSINESS.location}</li>
    `;
  }
}

document.addEventListener("DOMContentLoaded", initBusinessLinks);
