// ---------------------------------------------------------
// recipe-details.js – Visar detaljer om ett enskilt recept
// ---------------------------------------------------------
//
// Den här filen ansvarar för logiken på sidan som visar ett specifikt recept.
// Den hämtar receptdata från API:et med hjälp av receptets ID i URL:en
// och visar information som bild, titel, tillagningstid, portioner,
// ingredienser och steg-för-steg-instruktioner.
//
// Den pratar med:
//   → fetchdata.js (för att hämta receptets detaljer från API:et)
//
// Fel loggas i konsolen men visas inte för användaren.
// ---------------------------------------------------------

import { getRecipeDetails } from "./fetchdata.js";

// ---------------------------------------------------------
// 🚀 START – körs automatiskt när receptdetaljsidan laddas
// ---------------------------------------------------------
export async function startRecipeDetailsPage() {
  // 1️⃣ Hämta receptets ID från URL:en (t.ex. ?recipeId=12345)
  const recipeId = new URLSearchParams(window.location.search).get("recipeId");

  // Om inget ID hittas – logga varning och avbryt
  if (!recipeId) {
    console.warn("⚠️ No recipe ID found in the URL.");
    return;
  }

  try {
    // 2️⃣ Hämta detaljerad information om receptet från API:et
    const recipe = await getRecipeDetails(recipeId);

    // Om inget recept hittades – logga och avbryt
    if (!recipe) {
      console.warn("⚠️ Recipe data could not be loaded from the API.");
      return;
    }

    // 3️⃣ Visa receptets innehåll på sidan
    renderRecipe(recipe);
  } catch (error) {
    // Logga eventuella fel i konsolen (användaren ser inget fel)
    console.error("❌ Failed to load recipe details:", error);
  }
}

// ---------------------------------------------------------
// 🖼️ VISA RECEPTETS INFORMATION PÅ SIDAN
// ---------------------------------------------------------
// Den här funktionen fyller HTML-elementen med datan från API:et.
// Om något saknas används ett neutralt standardvärde (fallback).
//
function renderRecipe(recipe) {
  // Hämta referenser till HTML-element på sidan
  const image = document.querySelector("#recipe-image");
  const title = document.querySelector("#recipe-title");
  const summary = document.querySelector("#recipe-summary");
  const time = document.querySelector("#recipe-time");
  const servings = document.querySelector("#recipe-servings");
  const tags = document.querySelector("#recipe-tags");
  const button = document.querySelector("#view-original-btn");

  // Kontrollera att alla nödvändiga element finns
  if (!image || !title || !summary || !time || !servings || !tags) {
    console.warn("⚠️ Missing one or more DOM elements for recipe details.");
    return;
  }

  // ---------------------------------------------------------
  // 🧱 GRUNDINFORMATION (bild, titel, sammanfattning)
  // ---------------------------------------------------------
  image.src = recipe.image || "https://via.placeholder.com/640x360?text=No+image";
  image.alt = recipe.title || "Recipe image";
  title.textContent = recipe.title || "Untitled recipe";
  summary.textContent = plainText(recipe.summary) || "No description available.";

  // ---------------------------------------------------------
  // ⏱️ TILLAGNINGSTID OCH PORTIONER
  // ---------------------------------------------------------
  time.textContent = recipe.readyInMinutes
    ? `${recipe.readyInMinutes} minutes`
    : "Time not available";
  servings.textContent = recipe.servings
    ? `${recipe.servings} servings`
    : "Serving size varies";

  // ---------------------------------------------------------
  // 🧩 SVÅRIGHETSGRAD OCH KOST
  // ---------------------------------------------------------
  const difficulty = getDifficulty(recipe.readyInMinutes);
  const diets = recipe.diets?.length ? recipe.diets.join(", ") : "None";
  tags.textContent = `Difficulty: ${difficulty} • Diet: ${diets}`;

  // ---------------------------------------------------------
  // 🧾 INGREDIENSER
  // ---------------------------------------------------------
  renderList(
    "ingredients-list",
    recipe.extendedIngredients?.map((item) => item.original) || [],
    "No ingredients found."
  );

  // ---------------------------------------------------------
  // 👩‍🍳 INSTRUKTIONER
  // ---------------------------------------------------------
  renderList(
    "instructions-list",
    recipe.analyzedInstructions?.[0]?.steps?.map((step) => step.step) || [],
    "No instructions found."
  );

  // ---------------------------------------------------------
  // 🔗 ORIGINALRECEPT (extern länk)
  // ---------------------------------------------------------
  setupSourceButton(button, recipe.sourceUrl);
}

// ---------------------------------------------------------
// 📋 SKRIV UT EN LISTA (<ul>) ELLER VISA TOMTEXT
// ---------------------------------------------------------
//
// Funktionen tar emot:
//  - id → ID för <ul>-elementet
//  - items → en lista med textsträngar
//  - emptyMessage → text som visas om listan är tom
//
// Den använder en kort "ternary operator" (?:) som betyder:
//   → Om listan är tom → visa fallbacktext
//   → Annars → skapa <li> för varje item
//
function renderList(id, items, emptyMessage) {
  const list = document.getElementById(id);
  if (!list) return;

  list.innerHTML = !items.length
    ? `<li>${emptyMessage}</li>`
    : items.map((text) => `<li>${text}</li>`).join("");
}

// ---------------------------------------------------------
// 🔗 HANTERA KNAPPEN "VIEW ORIGINAL RECIPE"
// ---------------------------------------------------------
// Om receptet har en källa (sourceUrl) gör knappen klickbar.
// Annars blir den inaktiverad med ett neutralt meddelande.
//
function setupSourceButton(button, url) {
  if (!button) return;

  if (url) {
    button.disabled = false;
    button.textContent = "View original recipe";
    button.addEventListener("click", () => {
      window.open(url, "_blank", "noopener"); // öppna i ny flik
    });
  } else {
    button.disabled = true;
    button.textContent = "Original recipe not available";
  }
}

// ---------------------------------------------------------
// 🧹 RENSA HTML-TAGGAR FRÅN TEXTEN (t.ex. <b>, <a>)
// ---------------------------------------------------------
//
// Spoonacular kan returnera text med HTML-taggar.
// Den här funktionen tvättar texten så att bara ren text visas.
// Exempel:
//   "<b>Hello</b>" → "Hello"
//
function plainText(html) {
  const div = document.createElement("div"); // Skapa ett "osynligt" element
  div.innerHTML = html || "";                // Klistra in texten
  return div.textContent || "";              // Returnera bara ren text
}

// ---------------------------------------------------------
// 💪 BERÄKNA SVÅRIGHET BASERAT PÅ TILLAGNINGSTID
// ---------------------------------------------------------
//
// En enkel funktion som klassificerar receptets svårighet
// baserat på hur många minuter det tar att laga.
//
function getDifficulty(minutes) {
  if (!minutes) return "Easy";
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}
