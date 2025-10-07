// ---------------------------------------------------------
// main.js – Startar rätt modul beroende på vilken sida man är på
// ---------------------------------------------------------

// Vi importerar funktionerna som startar de olika sidorna
import { startHomepage } from "./homepage.js";
import { startRecipesPage } from "./recipes.js";
import { startRecipeDetailsPage } from "./recipe-details.js";

// Vänta tills hela sidan har laddats innan vi kör koden
document.addEventListener("DOMContentLoaded", init);

// ---------------------------------------------------------
// Bestämmer vilken sida som ska startas
// ---------------------------------------------------------
function init() {
  const body = document.body; // Hämta <body>-elementet

  // Om det inte finns någon body (borde inte hända, men bra att kolla)
  if (!body) return;

  // Läs ut sidans ID, t.ex. "home-page" eller "recipes-page"
  const pageId = body.id;

  // ✅ Starta rätt modul beroende på vilken sida vi är på
  if (pageId === "home-page") {
    startHomepage(); // Startar koden för startsidan
    return;
  }

  if (pageId === "recipes-page") {
    startRecipesPage(); // Startar koden för receptlistan
    return;
  }

  if (pageId === "recipe-details-page") {
    startRecipeDetailsPage(); // Startar koden för enskilt recept
    return;
  }
}
