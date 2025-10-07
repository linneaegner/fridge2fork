// ---------------------------------------------------------
// main.js – Startar rätt modul beroende på vilken sida man är på
// ---------------------------------------------------------
//
// Den här filen fungerar som "hjärnan" som startar rätt del av webbappen.
// När sidan laddas kollar den vilket ID som finns på <body>-elementet,
// och startar rätt modul (startsida, receptsida eller receptdetaljsida).
//
// På så sätt slipper vi ha olika <script>-taggar för varje sida.
// ---------------------------------------------------------

// ---------------------------------------------------------
// 📦 IMPORTERA FUNKTIONER FRÅN ANDRA MODULER
// ---------------------------------------------------------
//
// Varje sida i webbappen har sin egen modul:
//   - homepage.js → hanterar startsidan
//   - recipes.js → hanterar listan av recept
//   - recipe-details.js → visar detaljer för ett recept
//
// Här importerar vi startfunktionerna från dem.
import { startHomepage } from "./homepage.js";
import { startRecipesPage } from "./recipes.js";
import { startRecipeDetailsPage } from "./recipe-details.js";

// ---------------------------------------------------------
// 🚀 START – vänta tills hela sidan laddats
// ---------------------------------------------------------
//
// Vi väntar med att köra koden tills allt innehåll (HTML, bilder, etc.)
// är färdigladdat, så att vi inte försöker läsa element som inte finns än.
document.addEventListener("DOMContentLoaded", init);

// ---------------------------------------------------------
// 🧠 INIT-FUNKTION – bestämmer vilken sida som ska startas
// ---------------------------------------------------------
function init() {
  const body = document.body; // Hämta <body>-elementet (som alltid finns på sidan)

  // 🧱 Säkerhetskontroll – om det mot förmodan inte finns någon <body>
  if (!body) return;

  // Hämta värdet på "id"-attributet från body
  // (Exempel: <body id="home-page"> eller <body id="recipes-page">)
  const pageId = body.id;
  console.info("[Main] Initierar sida", pageId || "okänd");

  // ---------------------------------------------------------
  // 🏠 STARTSIDA
  // ---------------------------------------------------------
  if (pageId === "home-page") {
    startHomepage(); // Kör koden för startsidan
    return;
  }

  // ---------------------------------------------------------
  // 🍲 RECEPTLISTA
  // ---------------------------------------------------------
  if (pageId === "recipes-page") {
    startRecipesPage(); // Kör koden för sidan med receptlistan
    return;
  }

  // ---------------------------------------------------------
  // 📖 RECEPTDETALJ
  // ---------------------------------------------------------
  if (pageId === "recipe-details-page") {
    startRecipeDetailsPage(); // Kör koden för sidan med detaljerat recept
    return;
  }

  // ---------------------------------------------------------
  // ⚠️ OM INGET ID MATCHAR
  // ---------------------------------------------------------
  // Denna del körs bara om sidan inte har något av de förväntade ID:na.
  // Det kan hända om man t.ex. glömmer att sätta ett id på body i HTML.
  console.warn("Ingen känd sida att starta. Kontrollera <body id='...'> i HTML-filen.");
}
