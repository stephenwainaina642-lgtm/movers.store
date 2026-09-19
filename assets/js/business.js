/* ============================================================
   BUSINESS CONFIGURATION — edit here once, the whole site updates.

   The site presents TWO businesses under one roof:
     • water  → Water Delivery
     • moving → Moving & Transport (house moving, office relocation, goods transport)

   Each business has its own display name and its own contact line.
   Right now both use the same phone / WhatsApp number. When the
   client has a separate number (or brand name) for either business,
   change ONLY that business's block below — every call button,
   WhatsApp button, footer and form link for that business follows.
   ============================================================ */
const BUSINESS = {
  name: "Clean Water Movers",            // umbrella name shown on the hub page
  location: "Githunguri, Kiambu County, Kenya",
  yearsInOperation: "10",
  siteUrl: "https://www.cleanwatermovers.shop",

  // Used on the hub page, contact page and areas page
  main: {
    phoneDisplay: "0720 792 185",
    phoneDial: "+254720792185",
    whatsapp: "254720792185",            // digits only, country code, no + or leading 0
    email: "njugunagodffrey@gmail.com",
  },

  divisions: {
    water: {
      name: "Water Delivery",
      brand: "Clean Water Movers",       // name used inside WhatsApp messages
      phoneDisplay: "0720 792 185",
      phoneDial: "+254720792185",
      whatsapp: "254720792185",
      email: "njugunagodffrey@gmail.com",
    },
    moving: {
      name: "Moving & Transport",
      brand: "Clean Water Movers",
      phoneDisplay: "0720 792 185",
      phoneDial: "+254720792185",
      whatsapp: "254720792185",
      email: "njugunagodffrey@gmail.com",
    },
  },
};

/* Which business each kind of enquiry belongs to */
const WA_DIVISION = { water: "water", moving: "moving", house: "moving", office: "moving", transport: "moving" };

/* Prefilled WhatsApp messages. {brand} and {loc} are filled automatically. */
const WA_MESSAGES = {
  water: "Hi {brand}, I need water delivery{loc}. I'd like to get a quote.",
  moving: "Hi {brand}, I'd like a quote for moving{loc}.",
  transport: "Hi {brand}, I'd like to enquire about transport{loc}.",
  house: "Hi {brand}, I'd like a quote for house moving{loc}.",
  office: "Hi {brand}, I'd like a quote for office relocation{loc}.",
  "water-general": "Hi {brand}, I'd like to enquire about your water delivery service{loc}.",
  "moving-general": "Hi {brand}, I'd like to enquire about your moving and transport services{loc}.",
  general: "Hi {brand}, I'd like to enquire about your water delivery, moving and transport services{loc}.",
};

function pageDivision() {
  const d = document.body.getAttribute("data-division");
  return d === "water" || d === "moving" ? d : null;
}

/* Resolve the contact details for a business key ("water" | "moving" | anything else → main line) */
function lineFor(key) {
  return BUSINESS.divisions[key] || BUSINESS.main;
}

/**
 * Build a wa.me link.
 * @param {string} kind - key in WA_MESSAGES (water, moving, house, office, transport, general)
 * @param {string} [location] - e.g. "Nairobi", so the message says where the enquiry came from
 */
function waLink(kind, location) {
  let divKey = WA_DIVISION[kind];
  let msgKey = kind;
  if (kind === "general") {
    divKey = pageDivision();
    msgKey = divKey ? `${divKey}-general` : "general";
  }
  const line = lineFor(divKey);
  const brand = (BUSINESS.divisions[divKey] || {}).brand || BUSINESS.name;
  const template = WA_MESSAGES[msgKey] || WA_MESSAGES.general;
  const msg = template.replace("{brand}", brand).replace("{loc}", location ? ` to ${location}` : "");
  return `https://wa.me/${line.whatsapp}?text=${encodeURIComponent(msg)}`;
}

function initBusinessLinks() {
  document.querySelectorAll("[data-wa]").forEach((el) => {
    const loc = el.getAttribute("data-wa-location") || window.PAGE_LOCATION || "";
    el.setAttribute("href", waLink(el.getAttribute("data-wa"), loc));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
  const keyFor = (v) => (v === "water" || v === "moving" ? v : pageDivision());
  document.querySelectorAll("[data-call]").forEach((el) => {
    el.setAttribute("href", `tel:${lineFor(keyFor(el.getAttribute("data-call"))).phoneDial}`);
  });
  document.querySelectorAll("[data-phone-text]").forEach((el) => {
    el.textContent = lineFor(keyFor(el.getAttribute("data-phone-text"))).phoneDisplay;
  });
  document.querySelectorAll("[data-email]").forEach((el) => {
    const email = lineFor(keyFor(el.getAttribute("data-email"))).email;
    el.setAttribute("href", `mailto:${email}`);
    if (el.hasAttribute("data-fill-text")) el.textContent = email;
  });
  document.querySelectorAll("[data-division-name]").forEach((el) => {
    const d = BUSINESS.divisions[el.getAttribute("data-division-name")];
    if (d) el.textContent = d.name;
  });
}

document.addEventListener("DOMContentLoaded", initBusinessLinks);
