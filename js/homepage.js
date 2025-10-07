// ---------------------------------------------------------
// homepage.js – Hanterar ingredienslistan på startsidan
// ---------------------------------------------------------
//
// Den här filen ansvarar för allt som händer på startsidan.
// Användaren kan:
//  - Skriva in ingredienser (t.ex. "tomato", "cheese")
//  - Se dem som “taggar” på sidan
//  - Ta bort dem en och en eller rensa alla
//  - Klicka på “Find Recipes” för att gå vidare till receptsidan
//
// All data sparas i localStorage, så att den finns kvar om man laddar om sidan.
// ---------------------------------------------------------

// ---------------------------------------------------------
// 🌿 GLOBALA VARIABLER – lagrar ingredienslistan
// ---------------------------------------------------------
let ingredients = []; // Array som håller alla ingredienser som användaren lagt till

// ---------------------------------------------------------
// 📦 HÄMTAR REFERENSER TILL ELEMENT I DOM
// ---------------------------------------------------------
const ingredientForm = document.querySelector("#ingredient-form");
const ingredientInput = document.querySelector("#ingredient-input");
const addIngredientBtn = document.querySelector("#add-ingredient-btn");
const clearIngredientsBtn = document.querySelector("#clear-ingredients-btn");
const ingredientTags = document.querySelector("#ingredient-tags");

// ---------------------------------------------------------
// 🚀 START – körs när sidan laddas
// ---------------------------------------------------------
export function startHomepage() {
  // Om något element saknas i HTML → avbryt för att undvika fel
  if (!ingredientForm || !ingredientInput || !addIngredientBtn || !ingredientTags) {
    return;
  }

  // 1️⃣ Läs in ingredienser från localStorage (om det finns några sparade)
  ingredients = loadFromLocalStorage();
  updateIngredientTags();

  // 2️⃣ Koppla knappar och formulär till sina funktioner
  addIngredientBtn.addEventListener("click", addIngredient);
  clearIngredientsBtn?.addEventListener("click", clearIngredients);

  // Klick på “×” i en tagg ska ta bort ingrediensen
  ingredientTags.addEventListener("click", removeIngredient);

  // Klick på “Find Recipes” (formuläret skickas)
  ingredientForm.addEventListener("submit", goToRecipes);

  // 3️⃣ Gör så att man kan trycka Enter i inputfältet för att lägga till
  ingredientInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Hindrar att sidan laddas om
      addIngredient();
    }
  });
}

// ---------------------------------------------------------
// ✏️ LÄGG TILL EN NY INGREDIENS
// ---------------------------------------------------------
function addIngredient() {
  // Hämtar texten användaren skrev in och rensar mellanslag
  const ingredientName = ingredientInput.value.trim().toLowerCase();

  // 🧱 Kontroll 1: Fältet får inte vara tomt
  if (!ingredientName) {
    showTemporaryMessage("Please enter an ingredient name.");
    return;
  }

  // 🧱 Kontroll 2: Samma ingrediens får inte läggas till flera gånger
  if (ingredients.includes(ingredientName)) {
    showTemporaryMessage("That ingredient is already added.");
    ingredientInput.value = "";
    return;
  }

  // ✅ Allt okej – lägg till i listan
  ingredients.push(ingredientName);
  saveToLocalStorage();
  updateIngredientTags();

  // Rensa fältet efteråt
  ingredientInput.value = "";
}

// ---------------------------------------------------------
// ❌ TA BORT EN INGREDIENS (klick på "×"-knapp)
// ---------------------------------------------------------
function removeIngredient(event) {
  const button = event.target.closest("button[data-remove]");
  if (!button) return; // Om man inte klickade på en knapp – gör inget

  const name = button.dataset.remove; // Hämta namnet på ingrediensen
  ingredients = ingredients.filter((item) => item !== name); // Ta bort den ur listan
  saveToLocalStorage();
  updateIngredientTags();
}

// ---------------------------------------------------------
// 🧼 RENSAR HELA LISTAN (klick på “Clear All”)
// ---------------------------------------------------------
function clearIngredients() {
  ingredients = []; // Töm arrayen
  saveToLocalStorage(); // Spara tom lista
  updateIngredientTags(); // Uppdatera visningen
}

// ---------------------------------------------------------
// 🍳 GÅ VIDARE TILL RECEPTSIDAN
// ---------------------------------------------------------
// När man klickar på “Find Recipes” kontrolleras att man har minst 1 ingrediens.
// Sedan sparas listan och man skickas vidare till recipes.html
function goToRecipes(event) {
  event.preventDefault();

  // Om listan är tom – gör inget
  if (!ingredients.length) {
    showTemporaryMessage("Add at least one ingredient before searching!");
    return;
  }

  // Spara ingredienser och gå vidare till nästa sida
  saveToLocalStorage();
  window.location.href = "pages/recipes.html";
}

// ---------------------------------------------------------
// 🏷️ UPPDATERAR VISUELL LISTA MED “TAGGAR”
// ---------------------------------------------------------
// Denna funktion ritar upp ingredienserna på sidan.
// Varje ingrediens får en liten tagg med ett “×”-kryss för att ta bort den.
function updateIngredientTags() {
  if (!ingredients.length) {
    ingredientTags.innerHTML =
      '<p class="ingredient-empty">No ingredients yet. Add one to start!</p>';
    return;
  }

  // Skapar en HTML-sträng med alla taggar
  const tagHTML = ingredients
    .map(
      (name) => `
      <span class="ingredient-badge">
        ${name}
        <button type="button" data-remove="${name}">×</button>
      </span>
    `
    )
    .join("");

  ingredientTags.innerHTML = tagHTML;
}

// ---------------------------------------------------------
// 💾 SPARAR INGREDIENSER TILL LOCALSTORAGE
// ---------------------------------------------------------
function saveToLocalStorage() {
  localStorage.setItem("ingredients", JSON.stringify(ingredients));
}

// ---------------------------------------------------------
// 📥 LÄSER IN INGREDIENSER FRÅN LOCALSTORAGE
// ---------------------------------------------------------
function loadFromLocalStorage() {
  try {
    // Om det finns sparade ingredienser – hämta dem som en lista
    return JSON.parse(localStorage.getItem("ingredients")) || [];
  } catch {
    // Om något är fel i localStorage – returnera tom lista istället
    return [];
  }
}

// ---------------------------------------------------------
// 💬 VISAR ETT LITET TEMPORÄRT MEDDELANDE PÅ SIDAN
// ---------------------------------------------------------
// Den här funktionen används när något inte går att lägga till, t.ex. om fältet är tomt.
function showTemporaryMessage(message) {
  const msg = document.createElement("p");
  msg.textContent = message;
  msg.className = "temp-message";
  document.body.appendChild(msg);

  // Gör att meddelandet försvinner automatiskt efter 2 sekunder
  setTimeout(() => msg.remove(), 2000);
}
