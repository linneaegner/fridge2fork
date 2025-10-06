// ---------------------------------------------------------
// 🧭 main.js – Startar rätt modul beroende på aktuell sida
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

  const classes = Array.from(body.classList);

  if (classes.includes("home-page")) {
    console.log("🏠 Startar startsidan");
    startHomepage();
    return;
  }

  if (classes.includes("recipes-page")) {
    console.log("📋 Startar receptsidan");
    startRecipesPage();
    return;
  }

  if (classes.includes("details-page")) {
    console.log("📄 Startar receptdetaljer");
    startRecipeDetailsPage();
    return;
  }

  if (classes.some((name) => ["about-page", "contact-page"].includes(name))) {
    console.log("ℹ️ Ingen särskild JavaScript behövs här.");
    return;
  }

  console.warn("❌ Okänd sida – inget script att köra.");
}
