// ---------------------------------------------------------
// recipe-details.js – Visar ett enskilt recept med ingredienser och steg
// ---------------------------------------------------------

import { getRecipeDetails } from "./fetchdata.js";

// ---------------------------------------------------------
// START
// ---------------------------------------------------------
export async function startRecipeDetailsPage() {
  console.log("📄 Startar logiken för receptdetaljer...");

  // 1️⃣ Hämta recept-id från adressfältet (t.ex. ?recipeId=12345)
  const recipeId = new URLSearchParams(window.location.search).get("recipeId");

  if (!recipeId) {
    console.warn("⚠️ Hittade inget recipeId i URL:en.");
    showMessage("Vi hittade inget recept. Gå tillbaka till föregående sida.");
    return;
  }

  try {
    // 2️⃣ Hämta detaljerad information om receptet från API:et
    const recipe = await getRecipeDetails(recipeId);

    if (!recipe) {
      showMessage("Vi kunde inte läsa in det här receptet just nu.");
      return;
    }

    console.log("✅ Receptdata inläst:", recipe.title);

    // 3️⃣ Visa receptets information på sidan
    renderRecipe(recipe);
  } catch (error) {
    console.error("❌ Kunde inte ladda receptet:", error);
    showMessage("Vi kunde inte ladda receptet just nu. Försök igen senare.");
  }
}

// ---------------------------------------------------------
// FUNKTIONER
// ---------------------------------------------------------

// Skriver ut hela receptet i rätt HTML-element
function renderRecipe(recipe) {
  const image = document.querySelector("#recipe-image");
  const title = document.querySelector("#recipe-title");
  const summary = document.querySelector("#recipe-summary");
  const time = document.querySelector("#recipe-time");
  const servings = document.querySelector("#recipe-servings");
  const tags = document.querySelector("#recipe-tags");
  const button = document.querySelector("#view-original-btn");

  // Kontrollera att alla viktiga element finns innan vi försöker använda dem.
  if (!image || !title || !summary || !time || !servings || !tags) {
    console.warn("⚠️ Hittade inte alla element som behövs för att visa receptet.");
    return;
  }

  // --- Grundläggande information ---
  image.src = recipe.image || "https://via.placeholder.com/640x360?text=Ingen+bild";
  image.alt = recipe.title || "Bild på recept";
  title.textContent = recipe.title || "Okänt recept";
  summary.textContent = plainText(recipe.summary) || "Ingen beskrivning tillgänglig.";
  time.textContent = recipe.readyInMinutes ? `${recipe.readyInMinutes} minuter` : "Okänd tid";
  servings.textContent = recipe.servings ? `${recipe.servings} portioner` : "Varierar";

  // --- Svårighetsgrad och kostinfo ---
  const difficulty = translateDifficulty(getDifficulty(recipe.readyInMinutes));
  const diets = recipe.diets?.length ? recipe.diets.join(", ") : "saknas"; // API:t är på engelska
  tags.textContent = `Svårighet: ${difficulty} • Kost: ${diets}`;

  // --- Ingredienser ---
  renderList(
    "ingredients-list",
    recipe.extendedIngredients?.map((item) => item.original) || [],
    "Inga ingredienser hittades."
  );

  // --- Tillagningssteg ---
  renderList(
    "instructions-list",
    recipe.analyzedInstructions?.[0]?.steps?.map((step) => step.step) || [],
    "Inga steg hittades."
  );

  // --- Länk till originalreceptet ---
  setupSourceButton(button, recipe.sourceUrl);
}

// Skriver ut en lista (<ul>) med text, eller ett fallback-meddelande
function renderList(id, items, emptyMessage) {
  const list = document.getElementById(id);
  if (!list) return;

  if (!items.length) {
    list.innerHTML = `<li>${emptyMessage}</li>`;
    return;
  }

  // Skapa ett <li>-element för varje rad och slå ihop till en sträng
  list.innerHTML = items.map((text) => `<li>${text}</li>`).join("");
}

// Hanterar knappen som öppnar originalreceptet i ny flik
function setupSourceButton(button, url) {
  if (!button) return;

  if (url) {
    button.disabled = false;
    button.textContent = "Visa originalrecept";
    button.addEventListener("click", () => {
      console.log("🔗 Öppnar originalrecept:", url);
      window.open(url, "_blank", "noopener");
    });
  } else {
    button.disabled = true;
    button.textContent = "Originalrecept saknas";
  }
}

// Tar bort HTML-taggar från API:et så vi bara visar ren text
function plainText(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || "";
}

// Omvandla tid i minuter till en enkel svårighetsnivå
function getDifficulty(minutes) {
  if (!minutes) return "Easy";
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}

// Översätt API:ets engelska nivåer till svensk text
function translateDifficulty(value) {
  switch (value) {
    case "Easy":
      return "Lätt";
    case "Medium":
      return "Medel";
    case "Hard":
      return "Svår";
    default:
      return value;
  }
}

// Visar ett meddelande mitt på sidan (främst vid fel)
function showMessage(message) {
  const main = document.querySelector("main.container");
  if (!main) return;

  main.innerHTML = `<p class="empty-state">${message}</p>`;
}
