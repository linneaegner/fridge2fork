// -------------------------------------------------------------
// MAIN SCRIPT – Handles navigation and page initialization
// -------------------------------------------------------------

import { startHomepage } from "./homepage.js";
import { startRecipesPage } from "./recipes.js";
import { startRecipeDetailsPage } from "./recipe-details.js";
import { startContactPage } from "./contact.js";

// -------------------------------------------------------------
// INIT
// -------------------------------------------------------------
// Körs när DOM är redo. Startar navigationen och laddar rätt sida.
document.addEventListener("DOMContentLoaded", () => {
  setupMobileNavigation();

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
  }
});

// -------------------------------------------------------------
// NAVIGATION
// -------------------------------------------------------------
// Hanterar öppning/stängning av mobilmenyn.
function setupMobileNavigation() {
  const nav = document.querySelector("#site-header-nav");
  if (!nav) return;

  const toggleButton = nav.querySelector("#nav-toggle");
  const menuList = nav.querySelector("ul");
  const toggleImage = toggleButton?.querySelector("img");

  if (!toggleButton || !menuList || !toggleImage) return;

  const openIcon = toggleImage.getAttribute("src");
  const closeIcon = openIcon?.replace(/[^/]+$/, "close.png") || "";

  // Växlar mellan öppet/stängt meny-läge
  toggleButton.addEventListener("click", () => {
    const menuIsOpen = nav.classList.toggle("site-header-nav--open");
    toggleButton.setAttribute("aria-expanded", String(menuIsOpen));
    updateToggleIcon(menuIsOpen, toggleImage, openIcon, closeIcon);
  });

  // Stänger menyn när användaren klickar på en länk
  menuList.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link) {
      nav.classList.remove("site-header-nav--open");
      toggleButton.setAttribute("aria-expanded", "false");
      updateToggleIcon(false, toggleImage, openIcon, closeIcon);
    }
  });
}

// Uppdaterar ikonbild beroende på meny-läge
function updateToggleIcon(isOpen, image, openPath, closePath) {
  if (!image || !openPath || !closePath) return;
  image.setAttribute("src", isOpen ? closePath : openPath);
}
