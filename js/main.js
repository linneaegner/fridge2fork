// ---------------------------------------------------------
// main.js – Start the right page module
// ---------------------------------------------------------

import { startHomepage } from "./homepage.js";
import { startRecipesPage } from "./recipes.js";
import { startRecipeDetailsPage } from "./recipe-details.js";
import { startContactPage } from "./contact.js";

function setupMobileNavigation() {
  const nav = document.querySelector("#site-header-nav");
  if (!nav) return;

  const toggle = nav.querySelector("#nav-toggle");
  const menu = nav.querySelector("ul");
  if (!toggle || !menu) return;

  nav.classList.add("is-ready");

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (!event.target.closest("a")) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
}

// === Start app when DOM is ready =========================
document.addEventListener("DOMContentLoaded", () => {
  setupMobileNavigation(); // Keep the header menu usable on small screens.

  const page = document.body?.id;
  if (!page) return;

  switch (page) {
    case "home-page":
      startHomepage();
      break;
    case "recipes-page":
      startRecipesPage();
      break;
    case "recipe-details-page":
      startRecipeDetailsPage();
      break;
    case "contact-page":
      startContactPage();
      break;
  }
});
