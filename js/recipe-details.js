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

const RecipeDetails = document.querySelector("#recipe-details-widget");

function showFallback(message = "Could not find recipe.") {
  if (!RecipeDetails) return;
  RecipeDetails.innerHTML = `<p class="empty-state">${message}</p>`;
}

// ---------------------------------------------------------
// 🚀 START – körs automatiskt när receptdetaljsidan laddas
// ---------------------------------------------------------
export async function startRecipeDetailsPage() {
  if (!RecipeDetails) {
    console.warn("⚠️ Missing recipe details container.");
    return;
  }

  // 1️⃣ Hämta receptets ID från URL:en (t.ex. ?recipeId=12345)
  const recipeId = new URLSearchParams(window.location.search).get("recipeId");

  // Om inget ID hittas – logga varning och avbryt
  if (!recipeId) {
    console.warn("⚠️ No recipe ID found in the URL.");
    showFallback();
    return;
  }

  try {
    console.groupCollapsed(`📋 UI:startRecipeDetailsPage (${recipeId})`);
    // 2️⃣ Hämta detaljerad information om receptet från API:et
    const recipe = await getRecipeDetails(recipeId);

    // Om inget recept hittades – logga och avbryt
    if (!recipe) {
      console.warn("⚠️ Recipe data could not be loaded from the API.");
      showFallback();
      console.groupEnd();
      return;
    }

    console.info("[RecipeDetails] Renderar recept", {
      id: recipe.id,
      title: recipe.title,
      readyInMinutes: recipe.readyInMinutes,
    });

    // 3️⃣ Visa receptets innehåll på sidan
    renderRecipe(recipe);
  } catch (error) {
    // Logga eventuella fel i konsolen (användaren ser inget fel)
    console.error("❌ Failed to load recipe details:", error);
    showFallback("Could not load recipe details.");
  } finally {
    console.groupEnd?.();
  }
}

// ---------------------------------------------------------
// 🖼️ VISA RECEPTETS INFORMATION PÅ SIDAN
// ---------------------------------------------------------
// Den här funktionen fyller HTML-elementen med datan från API:et.
// Om något saknas används ett neutralt standardvärde (fallback).
//
function renderRecipe(recipe) {
  if (!RecipeDetails) return;

  RecipeDetails.innerHTML = `
    <article id="recipe-details" class="card">
      <div class="recipe-media">
        <img
          id="recipe-image"
          src="https://via.placeholder.com/640x360?text=Loading..."
          alt="Recipe image"
        />
      </div>

      <div class="recipe-info">
        <h1 id="recipe-title"></h1>
        <p id="recipe-summary"></p>

        <dl class="recipe-meta recipe-card__meta">
          <div class="recipe-meta__item recipe-card__meta-item">
            <dt class="sr-only">Time</dt>
            <dd id="recipe-time">
              <span class="recipe-card__icon">⏱️</span>
              <span id="recipe-time-value"></span>
            </dd>
          </div>
          <div class="recipe-meta__item recipe-card__meta-item">
            <dt class="sr-only">Servings</dt>
            <dd id="recipe-servings">
              <span class="recipe-card__icon">👥</span>
              <span id="recipe-servings-value"></span>
            </dd>
          </div>
        </dl>

        <p id="recipe-tags" class="recipe-tags"></p>

        <button id="view-original-btn" class="btn-primary" type="button">
          View Original Recipe
        </button>
      </div>
    </article>

    <section id="recipe-content" class="recipe-lists">
      <div class="card">
        <h2>Ingredients</h2>
        <ul id="ingredients-list"></ul>
      </div>

      <div class="card">
        <h2>Instructions</h2>
        <ol id="instructions-list"></ol>
      </div>
    </section>
  `;

  // Hämta referenser till HTML-element på sidan
  const image = document.querySelector("#recipe-image");
  const title = document.querySelector("#recipe-title");
  const summary = document.querySelector("#recipe-summary");
  const timeValue = document.querySelector("#recipe-time-value");
  const servingsValue = document.querySelector("#recipe-servings-value");
  const tags = document.querySelector("#recipe-tags");
  const button = document.querySelector("#view-original-btn");
  const recipeDetailsSection = document.querySelector("#recipe-details");

  // Kontrollera att alla nödvändiga element finns
  if (!image || !title || !summary || !timeValue || !servingsValue || !tags || !recipeDetailsSection) {
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
  timeValue.textContent = formatMinutes(recipe.readyInMinutes);
  servingsValue.textContent = formatServings(recipe.servings);

  // ---------------------------------------------------------
  // 🧩 KOST- OCH DIETSPECIFIKA TAGGAR
  // ---------------------------------------------------------
  const dietTags = formatDietTags(recipe.diets);
  tags.innerHTML = dietTags;

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
// ⏱️ FORMATTERINGS-HJÄLPARE FÖR TID, PORTIONER OCH DIETER
// ---------------------------------------------------------
function formatMinutes(minutes) {
  if (!minutes || Number.isNaN(Number(minutes))) {
    return "N/A";
  }

  return `${minutes} ${minutes === 1 ? "min" : "mins"}`;
}

function formatServings(servings) {
  if (!servings || Number.isNaN(Number(servings))) {
    return "N/A servings";
  }

  const value = Number(servings);
  return `${value} ${value === 1 ? "serving" : "servings"}`;
}

function formatDietTags(diets = []) {
  if (!Array.isArray(diets) || diets.length === 0) {
    return createTag("Diet: None", "none");
  }

  return diets
    .slice(0, 4)
    .map((diet) => createTag(capitalizeWords(diet), slugifyClass(diet)))
    .join("");
}

function createTag(label, variant = "") {
  const classes = ["recipe-tag", "recipe-tag--diet"];

  if (variant) {
    classes.push(`recipe-tag--${variant}`);
  }

  return `<span class="${classes.join(" ")}">${label}</span>`;
}

function capitalizeWords(text = "") {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function slugifyClass(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
