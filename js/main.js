// ---------------------------------------------------------
// main.js – Start the right page module
// ---------------------------------------------------------

import { startHomepage } from "./homepage.js";
import { startRecipesPage } from "./recipes.js";
import { startRecipeDetailsPage } from "./recipe-details.js";

// === Start app when DOM is ready =========================
document.addEventListener("DOMContentLoaded", () => {
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
  }
});
