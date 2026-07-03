import { startHomepage } from "./homepage.js";
import { startRecipesPage } from "./recipes.js";
import { startRecipeDetailsPage } from "./recipe-details.js";
import { startContactPage } from "./contact.js";
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
function setupMobileNavigation() {
  const nav = document.querySelector("#site-header-nav");
  if (!nav) return;
  const toggleButton = nav.querySelector("#nav-toggle");
  const menuList = nav.querySelector("ul");
  const toggleImage = toggleButton?.querySelector("img");
  if (!toggleButton || !menuList || !toggleImage) return;
  const openIcon = toggleImage.getAttribute("src");
  const closeIcon = openIcon?.replace(/[^/]+$/, "close.png") || "";
  toggleButton.addEventListener("click", () => {
    const menuIsOpen = nav.classList.toggle("site-header-nav--open");
    toggleButton.setAttribute("aria-expanded", String(menuIsOpen));
    updateToggleIcon(menuIsOpen, toggleImage, openIcon, closeIcon);
  });
  menuList.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link) {
      nav.classList.remove("site-header-nav--open");
      toggleButton.setAttribute("aria-expanded", "false");
      updateToggleIcon(!1, toggleImage, openIcon, closeIcon);
    }
  });
}
function updateToggleIcon(isOpen, image, openPath, closePath) {
  if (!image || !openPath || !closePath) return;
  image.setAttribute("src", isOpen ? closePath : openPath);
}
