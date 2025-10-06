// ---------------------------------------------------------
// homepage.js – Hanterar ingredienslistan på startsidan
// ---------------------------------------------------------

// GLOBALA VARIABLER
let ingredients = []; // Array som håller alla ingredienser

// Hämtar referenser till alla element vi behöver i DOM
const ingredientForm = document.querySelector("#ingredient-form");
const ingredientInput = document.querySelector("#ingredient-input");
const addIngredientBtn = document.querySelector("#add-ingredient-btn");
const clearIngredientsBtn = document.querySelector("#clear-ingredients-btn");
const ingredientTags = document.querySelector("#ingredient-tags");

// ---------------------------------------------------------
// START
// ---------------------------------------------------------
export function startHomepage() {
  console.log("🚀 Initierar startsidan...");

  if (!ingredientForm || !ingredientInput || !addIngredientBtn || !ingredientTags) {
    console.warn("⚠️ Kunde inte hitta formulärets element.");
    return;
  }

  // 1. Ladda ingredienser från localStorage
  ingredients = loadFromLocalStorage();
  updateIngredientTags();

  // 2. Lägg till eventlyssnare
  addIngredientBtn.addEventListener("click", addIngredient);
  clearIngredientsBtn?.addEventListener("click", clearIngredients);
  ingredientTags.addEventListener("click", removeIngredient);
  ingredientForm.addEventListener("submit", goToRecipes);

  // 3. Gör det möjligt att trycka Enter i inputfältet
  ingredientInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addIngredient();
    }
  });
}

// ---------------------------------------------------------
// FUNKTIONER
// ---------------------------------------------------------

// Lägger till en ny ingrediens i listan
function addIngredient() {
  let newIngredient = ingredientInput.value.trim().toLowerCase();

  // Kolla så fältet inte är tomt
  if (!newIngredient) {
    alert("Skriv in en ingrediens först!"); //vill dock inte använda alert i slutversionen kanske går att lösa snyggare genom att visa ett meddelande på sidan?
    return;
  }

  // Kolla så den inte redan finns
  if (ingredients.includes(newIngredient)) {
    alert("Ingrediensen finns redan i listan.");
    ingredientInput.value = "";
    return;
  }

  // Lägg till och spara
  ingredients.push(newIngredient);
  saveToLocalStorage();
  updateIngredientTags();

  console.log("➕ La till ingrediens:", newIngredient);

  // Rensa fältet
  ingredientInput.value = "";
}

// Tar bort en ingrediens (klick på “×”)
function removeIngredient(event) {
  const button = event.target.closest("button[data-remove]");
  if (!button) return;

  const name = button.dataset.remove;
  ingredients = ingredients.filter((item) => item !== name);
  saveToLocalStorage();
  updateIngredientTags();

  console.log("❌ Tog bort ingrediens:", name);
}

// Rensar hela listan
function clearIngredients() {
  if (!confirm("Vill du ta bort alla ingredienser?")) return;

  ingredients = [];
  saveToLocalStorage();
  updateIngredientTags();
  console.log("🧹 Alla ingredienser borttagna.");
}

// Skickas när man klickar på "Find Recipes"
function goToRecipes(event) {
  event.preventDefault();

  if (!ingredients.length) {
    alert("Lägg till minst en ingrediens först!");
    return;
  }

  saveToLocalStorage();
  console.log("🚀 Går till receptsidan...");
  window.location.href = "pages/recipes.html";
}

// Uppdaterar visuella “taggar” på sidan
function updateIngredientTags() {
  if (!ingredients.length) {
    ingredientTags.innerHTML =
      '<p class="ingredient-empty">No ingredients yet. Add one to start!</p>';
    return;
  }

  let tagHTML = "";
  ingredients.forEach((name) => {
    tagHTML += // Skapar en ny tagg för varje ingrediens.
    `<span class="ingredient-badge">
        ${name}
        <button type="button" data-remove="${name}">×</button>
      </span>
    `;
  });
  ingredientTags.innerHTML = tagHTML;
}

// Sparar till localStorage
function saveToLocalStorage() {
  localStorage.setItem("ingredients", JSON.stringify(ingredients));
}

// Läser in från localStorage
function loadFromLocalStorage() {
  try {
    return JSON.parse(localStorage.getItem("ingredients")) || []; //om det inte finns något i local storage så returnerar den en tom array
  } catch { //denna kodsnutt gör att om det är fel i local storage så kommer det inte att krascha utan bara returnera en tom lista vilket är bra för användarupplevelsen utifall ingredienserna inte kan laddas in
    return [];
  }
}
