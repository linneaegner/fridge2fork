import { startHomepage } from "./homepage.js";
import { startRecipesPage } from "./recipes.js";
import { startRecipeDetailsPage } from "./recipe-details.js";
import { startContactPage } from "./contact.js";
function setupMobileNavigation() {
  const navigation = document.querySelector("#site-header-nav");
  if (!navigation) {
    console.warn("Navigation element not found");
    return;
  }
  const toggleButton = navigation.querySelector("#nav-toggle");
  const menuList = navigation.querySelector("ul");
  if (!toggleButton || !menuList) {
    console.warn("Toggle button or menu list not found");
    return;
  }
  const toggleImage = toggleButton.querySelector("img");
  if (!toggleImage) {
    console.warn("Toggle image not found");
    return;
  }
  const openIconPath = toggleImage.getAttribute("src");
  const closeIconPath = openIconPath
    ? openIconPath.replace(/[^/]+$/, "close.png")
    : "";
  function updateToggleIcon(isMenuOpen) {
    if (!openIconPath || !closeIconPath) return;
    if (isMenuOpen) {
      toggleImage.setAttribute("src", closeIconPath);
    } else {
      toggleImage.setAttribute("src", openIconPath);
    }
  }
  updateToggleIcon(!1);
  toggleButton.setAttribute("aria-expanded", "false");
  toggleButton.addEventListener("click", function () {
    const menuIsOpen = navigation.classList.toggle("site-header-nav--open");
    toggleButton.setAttribute("aria-expanded", String(menuIsOpen));
    updateToggleIcon(menuIsOpen);
  });
  menuList.addEventListener("click", function (event) {
    const clickedElement = event.target;
    if (clickedElement instanceof HTMLElement && clickedElement.closest("a")) {
      navigation.classList.remove("site-header-nav--open");
      toggleButton.setAttribute("aria-expanded", "false");
      updateToggleIcon(!1);
    }
  });
}
document.addEventListener("DOMContentLoaded", () => {
  setupMobileNavigation();
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
