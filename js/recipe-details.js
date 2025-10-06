// ---------------------------------------------------------
// 📖 recipe-details.js – Visar detaljer för ett valt recept
// ---------------------------------------------------------

import { getRecipeDetails } from "./fetchdata.js";

export async function startRecipeDetailsPage() {
  console.log("📄 Startar receptdetaljer");

  const recipeId = new URLSearchParams(window.location.search).get("recipeId");
  if (!recipeId) {
    showMessage("Kunde inte hitta något recept-ID.");
    return;
  }

  try {
    const recipe = await getRecipeDetails(recipeId);
    renderRecipe(recipe);
  } catch (error) {
    console.error(error);
    showMessage("Kunde inte ladda receptet just nu.");
  }
}

function renderRecipe(recipe) {
  const image = document.getElementById("recipe-image");
  const title = document.getElementById("recipe-title");
  const summary = document.getElementById("recipe-summary");
  const time = document.getElementById("recipe-time");
  const servings = document.getElementById("recipe-servings");
  const tags = document.getElementById("recipe-tags");
  const button = document.getElementById("view-original-btn");

  if (!image || !title || !summary || !time || !servings || !tags) {
    console.warn("⚠️ Kunde inte hitta alla element för receptdetaljer.");
    return;
  }

  image.src = recipe.image || "https://via.placeholder.com/640x360";
  image.alt = recipe.title || "Receptbild";
  title.textContent = recipe.title || "Okänt recept";
  summary.textContent = plainText(recipe.summary) || "Ingen beskrivning tillgänglig.";
  time.textContent = recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "Okänd";
  servings.textContent = recipe.servings ? `${recipe.servings} portioner` : "Varierar";
  tags.textContent = `${translateDifficulty(getDifficulty(recipe.readyInMinutes))} • ${
    recipe.diets?.join(", ") || "n/a"
  }`;

  renderList("ingredients-list", recipe.extendedIngredients?.map((item) => item.original));
  renderList(
    "instructions-list",
    recipe.analyzedInstructions?.[0]?.steps?.map((step) => step.step)
  );

  if (button) {
    if (recipe.sourceUrl) {
      button.addEventListener("click", () => window.open(recipe.sourceUrl, "_blank"));
    } else {
      button.disabled = true;
      button.textContent = "Originalrecept saknas";
    }
  }
}

function renderList(id, items = []) {
  const list = document.getElementById(id);
  if (!list) return;

  list.innerHTML = items.length
    ? items.map((text) => `<li>${text}</li>`).join("")
    : "<li>Ingen information.</li>";
}

function plainText(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || "";
}

function getDifficulty(minutes) {
  if (!minutes) return "Easy";
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}

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

function showMessage(message) {
  const main = document.querySelector("main.container");
  if (!main) return;
  main.innerHTML = `<p class="empty-state">${message}</p>`;
}
