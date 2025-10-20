// ---------------------------------------------------------
// main.js – Startar rätt modul beroende på vilken sida man är på
// ---------------------------------------------------------
//
// Den här filen fungerar som "hjärnan" i webbappen.
// När sidan laddas kollar den vilket ID som finns på <body>-elementet,
// och startar rätt modul (t.ex. startsida, receptlista eller receptdetaljer).
//
// På så sätt behöver vi bara ha EN script-fil som laddas överallt.
// ---------------------------------------------------------

// === Importera moduler ===================================
import { startHomepage } from "./homepage.js";
import { startRecipesPage } from "./recipes.js";
import { startRecipeDetailsPage } from "./recipe-details.js";

// === Starta när sidan laddats ============================
//
// Vi väntar tills hela sidan (HTML, bilder, CSS) har laddats,
// så att alla element finns tillgängliga i DOM:en.
document.addEventListener("DOMContentLoaded", init);

// === Init-funktion =======================================
//
// Här kollar vi vilket ID <body> har, och kör rätt startfunktion.
//
function init() {
  const body = document.body;
  if (!body) return;

  const pageId = body.id;

  if (pageId === "home-page") {
    startHomepage();
  } else if (pageId === "recipes-page") {
    startRecipesPage();
  } else if (pageId === "recipe-details-page") {
    startRecipeDetailsPage();
  }
}
