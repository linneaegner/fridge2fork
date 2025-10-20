// ---------------------------------------------------------
// homepage.js – Hanterar ingredienslistan på startsidan
// ---------------------------------------------------------
//
// Den här filen ansvarar för allt som händer på startsidan.
// Användaren kan:
//  - Skriva in ingredienser (t.ex. "tomato", "cheese")
//  - Se dem som taggar på sidan
//  - Ta bort dem en och en eller rensa alla
//  - Klicka på “Find Recipes” för att gå vidare till receptsidan
//
// Alla ingredienser sparas i localStorage, så att de finns kvar vid omladdning.
// ---------------------------------------------------------

// === Globala variabler ===================================
let ingredients = []; // Håller alla ingredienser som användaren lagt till

// === Hämta element från DOM ===============================
const ingredientForm = document.querySelector("#ingredient-form");
const ingredientInput = document.querySelector("#ingredient-input");
const addIngredientBtn = document.querySelector("#add-ingredient-btn");
const clearIngredientsBtn = document.querySelector("#clear-ingredients-btn");
const ingredientTags = document.querySelector("#ingredient-tags");

// === Startfunktion ========================================
export function startHomepage() {
  // Om något element saknas i HTML → avbryt
  if (!ingredientForm || !ingredientInput || !addIngredientBtn || !ingredientTags) {
    return;
  }

  // 1️⃣ Läs in ingredienser från localStorage (om det finns några sparade)
  ingredients = loadFromLocalStorage();
  updateIngredientTags();

  // 2️⃣ Koppla knappar och formulär till sina funktioner
  addIngredientBtn.addEventListener("click", addIngredient);
  if (clearIngredientsBtn) {
    clearIngredientsBtn.addEventListener("click", clearIngredients);
  }

  // Klick på “×” i en tagg ska ta bort ingrediensen
  ingredientTags.addEventListener("click", removeIngredient);

  // Klick på “Find Recipes” (formuläret skickas)
  ingredientForm.addEventListener("submit", goToRecipes);

  // 3️⃣ Lägg till ingrediens när man trycker Enter i fältet
  ingredientInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addIngredient();
    }
  });
}

// === Lägg till en ny ingrediens ===========================
function addIngredient() {
  const ingredientName = ingredientInput.value.trim().toLowerCase();

  // Kontroll 1: fältet får inte vara tomt
  if (!ingredientName) {
    showTemporaryMessage("Please enter an ingredient name.");
    return;
  }

  // Kontroll 2: får inte vara en dubblett
  if (ingredients.includes(ingredientName)) {
    showTemporaryMessage("That ingredient is already added.");
    ingredientInput.value = "";
    return;
  }

  // Lägg till ingrediens
  ingredients.push(ingredientName);
  saveToLocalStorage();
  updateIngredientTags();

  // Rensa inputfältet
  ingredientInput.value = "";
}

// === Ta bort en ingrediens ================================
function removeIngredient(event) {
  const button = event.target.closest("button[data-remove]");
  if (!button) return;

  const name = button.dataset.remove;
  ingredients = ingredients.filter(function (item) {
    return item !== name;
  });

  saveToLocalStorage();
  updateIngredientTags();
}

// === Rensa alla ingredienser ==============================
function clearIngredients() {
  ingredients = [];
  saveToLocalStorage();
  updateIngredientTags();
}

// === Gå vidare till receptsidan ===========================
//
// Kontrollerar att minst en ingrediens finns, sparar listan
// och skickar användaren till recipes.html
//
function goToRecipes(event) {
  event.preventDefault();

  if (!ingredients.length) {
    showTemporaryMessage("Add at least one ingredient before searching!");
    return;
  }

  saveToLocalStorage();
  window.location.href = "pages/recipes.html";
}

// === Uppdatera visuella taggar ============================
//
// Ritar upp ingredienserna på sidan som små “taggar”.
// Varje tagg har ett “×”-kryss för att ta bort den.
//
function updateIngredientTags() {
  if (!ingredients.length) {
    ingredientTags.innerHTML =
      '<p class="ingredient-empty">No ingredients yet. Add one to start!</p>';
    return;
  }

  const tagHTML = ingredients
    .map(function (name) {
      return `
        <span class="ingredient-badge">
          ${name}
          <button type="button" data-remove="${name}">×</button>
        </span>
      `;
    })
    .join("");

  ingredientTags.innerHTML = tagHTML;
}

// === Spara ingredienser till localStorage =================
function saveToLocalStorage() {
  localStorage.setItem("ingredients", JSON.stringify(ingredients));
}

// === Läs in ingredienser från localStorage ================
function loadFromLocalStorage() {
  try {
    const stored = JSON.parse(localStorage.getItem("ingredients")) || [];
    return stored;
  } catch {
    return [];
  }
}

// === Visa temporärt meddelande ============================
//
// Visar ett litet meddelande när användaren gjort något fel,
// till exempel försökt lägga till en tom ingrediens.
//
function showTemporaryMessage(message) {
  const msg = document.createElement("p");
  msg.textContent = message;
  msg.className = "temp-message";
  document.body.appendChild(msg);

  // Ta bort meddelandet efter 2 sekunder
  setTimeout(function () {
    msg.remove();
  }, 2000);
}
