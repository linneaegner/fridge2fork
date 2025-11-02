// IMPORTS
import { startHomepage } from "./homepage.js";
import { startRecipesPage } from "./recipes.js";
import { startRecipeDetailsPage } from "./recipe-details.js";
import { startContactPage } from "./contact.js";

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  initPage();
});

// -------------------------------------------------------------
// PAGE ROUTING
// -------------------------------------------------------------
function initPage() {
  const pageId = document.body?.id;
  if (!pageId) return;

  switch (pageId) {
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
    default:
      console.warn(`No initialization found for page ID: ${pageId}`);
  }
}

// -------------------------------------------------------------
// MOBILE NAVIGATION
// -------------------------------------------------------------
function initMobileNavigation() {
  const nav = document.querySelector("#site-header-nav");
  if (!nav) return console.warn("Navigation element not found");

  const toggleButton = nav.querySelector("#nav-toggle");
  const menuList = nav.querySelector("ul");
  const toggleImage = toggleButton?.querySelector("img");

  if (!toggleButton || !menuList || !toggleImage) {
    console.warn("Missing navigation elements");
    return;
  }

  const openIconPath = toggleImage.src;
  const closeIconPath = openIconPath.replace(/[^/]+$/, "close.png");

  toggleButton.setAttribute("aria-expanded", "false");
  toggleImage.src = openIconPath;

  toggleButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("site-header-nav--open");
    toggleButton.setAttribute("aria-expanded", String(isOpen));
    toggleImage.src = isOpen ? closeIconPath : openIconPath;
  });

  menuList.addEventListener("click", (e) => {
    const clickedLink = e.target.closest("a");
    if (clickedLink) closeNavigation(nav, toggleButton, toggleImage, openIconPath);
  });
}

function closeNavigation(nav, toggleButton, toggleImage, openIconPath) {
  nav.classList.remove("site-header-nav--open");
  toggleButton.setAttribute("aria-expanded", "false");
  toggleImage.src = openIconPath;
}
