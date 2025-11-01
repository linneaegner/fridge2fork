// ---------------------------------------------------------
// main.js – Start the right page module
// ---------------------------------------------------------

import { startHomepage } from "./homepage.js";
import { startRecipesPage } from "./recipes.js";
import { startRecipeDetailsPage } from "./recipe-details.js";
import { startContactPage } from "./contact.js";

function setupMobileNavigation() {
  // Find the navigation container
  const navigation = document.querySelector("#site-header-nav");
  if (!navigation) {
    console.warn("Navigation element not found");
    return;
  }

  // Find the toggle button and the menu list
  const toggleButton = navigation.querySelector("#nav-toggle");
  const menuList = navigation.querySelector("ul");
  if (!toggleButton || !menuList) {
    console.warn("Toggle button or menu list not found");
    return;
  }

  // Find the image inside the toggle button
  const toggleImage = toggleButton.querySelector("img");
  if (!toggleImage) {
    console.warn("Toggle image not found");
    return;
  }

  // Store the original icon and determine the close icon path
  const openIconPath = toggleImage.getAttribute("src");
  const closeIconPath = openIconPath
    ? openIconPath.replace(/[^/]+$/, "close.png")
    : "";

  // Function to change the icon depending on whether the menu is open
  function updateToggleIcon(isMenuOpen) {
    if (!openIconPath || !closeIconPath) return;

    if (isMenuOpen) {
      toggleImage.setAttribute("src", closeIconPath);
    } else {
      toggleImage.setAttribute("src", openIconPath);
    }
  }

  // Initial state: menu closed
  updateToggleIcon(false);
  toggleButton.setAttribute("aria-expanded", "false");

  // Handle toggle button click
  toggleButton.addEventListener("click", function () {
    const menuIsOpen = navigation.classList.toggle("site-header-nav--open");

    toggleButton.setAttribute("aria-expanded", String(menuIsOpen));
    updateToggleIcon(menuIsOpen);
  });

  // Close the menu when a link is clicked
  menuList.addEventListener("click", function (event) {
    const clickedElement = event.target;

    // Make sure the click came from a link
    if (clickedElement instanceof HTMLElement && clickedElement.closest("a")) {
      navigation.classList.remove("site-header-nav--open");
      toggleButton.setAttribute("aria-expanded", "false");
      updateToggleIcon(false);
    }
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
