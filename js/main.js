// ---------------------------------------------------------
// main.js – Startar rätt modul beroende på aktuell sida
// ---------------------------------------------------------

import { startHomepage } from "./homepage.js";
import { startRecipesPage } from "./recipes.js";
import { startRecipeDetailsPage } from "./recipe-details.js";

document.addEventListener("DOMContentLoaded", init);

function init() {
  const body = document.body;
  if (!body) {
    console.warn("⚠️ Kunde inte hitta något body-element.");
    return;
  }

  const pageId = body.id;

  if (pageId === "home-page") {
    startHomepage();
    return;
  }

  if (pageId === "recipes-page") {
    startRecipesPage();
    return;
  }

  if (pageId === "recipe-details-page") {
    startRecipeDetailsPage();
    return;
  }

}
