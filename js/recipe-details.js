import { getRecipeDetails } from "./fetchdata.js";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/960x540?text=No+image";

// Startar detaljsidan när DOM:en är redo
document.addEventListener("DOMContentLoaded", initDetailsPage);

async function initDetailsPage() {
  const recipeId = readRecipeId();
  if (!recipeId) {
    showError("We could not find a recipe. Please try again from the results page.");
    return;
  }

  try {
    const recipe = await getRecipeDetails(recipeId);
    console.log("📄 Visar recept", recipe.title);
    populateRecipe(recipe);
  } catch (error) {
    console.error("❌ Gick inte att hämta receptdetalj", error);
    showError("Unable to load this recipe right now.");
  }
}

function readRecipeId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("recipeId");
}

function populateRecipe(recipe) {
  setHeroImage(recipe);
  setTitleAndSummary(recipe);
  setMetaInfo(recipe);
  setDietTags(recipe);
  setIngredientList(recipe);
  setInstructionList(recipe);
  bindSourceButton(recipe);
}

function setHeroImage(recipe) {
  const picture = document.getElementById("recipe-picture");
  const image = document.getElementById("recipe-image");
  const sources = buildImageSources(recipe.image);

  if (image) {
    image.src = sources.large || sources.medium || sources.small || PLACEHOLDER_IMAGE;
    image.alt = recipe.title || "Recipe image";
  }

  if (picture && image) {
    picture.querySelectorAll("source").forEach((node) => node.remove());

    if (sources.large) {
      const source = document.createElement("source");
      source.srcset = sources.large;
      source.media = "(min-width: 1024px)";
      picture.insertBefore(source, image);
    }

    if (sources.medium) {
      const source = document.createElement("source");
      source.srcset = sources.medium;
      source.media = "(min-width: 640px)";
      picture.insertBefore(source, image);
    }
  }
}

function setTitleAndSummary(recipe) {
  const title = document.getElementById("recipe-title");
  const summary = document.getElementById("recipe-summary");
  const text = plainText(recipe.summary) || "Open the original recipe for more details.";

  if (title) title.textContent = recipe.title || "Unknown recipe";
  if (summary) summary.textContent = text;
}

function setMetaInfo(recipe) {
  const time = document.getElementById("recipe-time");
  const servings = document.getElementById("recipe-servings");

  if (time) time.textContent = recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "Unknown";
  if (servings) servings.textContent = recipe.servings ? `${recipe.servings} servings` : "Flexible";
}

function setDietTags(recipe) {
  const target = document.getElementById("recipe-tags");
  if (!target) return;

  const level = difficultyLabel(recipe.readyInMinutes);
  const diets = (recipe.diets || []).slice(0, 3).map((diet) => `<span class="pill">${diet}</span>`).join("");

  target.innerHTML = `<span class="pill pill--muted">${level}</span>${diets}`;
}

function setIngredientList(recipe) {
  const list = document.getElementById("ingredients-list");
  if (!list) return;

  const items = recipe.extendedIngredients || [];
  if (!items.length) {
    list.innerHTML = "<li>No ingredients available.</li>";
    return;
  }

  list.innerHTML = items.map((item) => `<li>${item.original}</li>`).join("");
}

function setInstructionList(recipe) {
  const list = document.getElementById("instructions-list");
  if (!list) return;

  const steps = recipe.analyzedInstructions?.[0]?.steps || [];
  if (!steps.length) {
    list.innerHTML = "<li>No instructions available.</li>";
    return;
  }

  list.innerHTML = steps.map((step) => `<li>${step.step}</li>`).join("");
}

function bindSourceButton(recipe) {
  const button = document.getElementById("view-original");
  if (!button) return;

  if (recipe.sourceUrl) {
    button.disabled = false;
    button.classList.remove("btn-disabled");
    button.textContent = "View original recipe";
    button.addEventListener("click", () => window.open(recipe.sourceUrl, "_blank", "noopener"));
  } else {
    button.disabled = true;
    button.classList.add("btn-disabled");
    button.textContent = "Original recipe unavailable";
  }
}

function difficultyLabel(minutes) {
  if (!minutes || Number.isNaN(minutes)) return "Easy";
  if (minutes <= 30) return "Easy";
  if (minutes <= 45) return "Medium";
  return "Hard";
}

function plainText(html) {
  if (!html) return "";
  const container = document.createElement("div");
  container.innerHTML = html;
  return container.textContent || "";
}

function showError(message) {
  const container = document.querySelector(".details-main");
  if (container) {
    container.innerHTML = `<p class="empty-state">${message}</p>`;
  }
}

function buildImageSources(url) {
  if (!url) {
    return { small: PLACEHOLDER_IMAGE };
  }

  const sizePattern = /-(\d+)x(\d+)(\.\w+)$/;
  const match = url.match(sizePattern);
  if (!match) {
    return { large: url };
  }

  const extension = match[3];
  const basePath = url.replace(sizePattern, "");

  return {
    large: `${basePath}-636x393${extension}`,
    medium: `${basePath}-480x360${extension}`,
    small: `${basePath}-312x231${extension}`,
  };
}
