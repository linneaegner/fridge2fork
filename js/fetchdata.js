// ---------------------------------------------------------
// fetchdata.js – Hanterar alla API-anrop till Spoonacular
// ---------------------------------------------------------
//
// Den här filen ansvarar för all kommunikation med Spoonaculars API.
// Andra filer (t.ex. recipes.js) använder dessa funktioner för att
// hämta recept och detaljerad information.
//
// På så sätt slipper vi upprepa fetch-anrop i flera filer.
// ---------------------------------------------------------

// === API-inställningar ===================================
const API_KEY = "1663bb2ddfbf4b00891cffe70d26f9ed";
const BASE_URL = "https://api.spoonacular.com";

// === Hjälpfunktion: hämta och tolka JSON =================
async function fetchJson(url) {
  try {
    const response = await fetch(url);

    // Kontrollera om API:t svarade med ett fel (t.ex. 404, 401)
    if (!response.ok) {
      throw new Error("Fel vid hämtning: " + response.status);
    }

    // Om allt gick bra: omvandla svaret till ett JavaScript-objekt
    return await response.json();
  } catch (error) {
    // Skicka vidare felet så anroparen kan hantera det
    throw error;
  }
}

// === Hämta en lista med recept ===========================
//
// Anropas från recipes.js för att hämta recept baserat på ingredienser.
//
export async function getRecipes({ ingredients = [] } = {}) {
  // === Bygg upp API-parametrar ============================
  const params = new URLSearchParams({
    apiKey: API_KEY,
    number: "6",                   // Antal recept att hämta
    addRecipeInformation: "true",  // Inkludera bild, tid, diet
    instructionsRequired: "true",  // Endast recept med instruktioner
    offset: "0"                    // Startposition (0 = första sidan)
  });

  // Lägg till ingredienser om användaren har valt några
  if (ingredients.length > 0) {
    params.set("includeIngredients", ingredients.join(","));
  }

  // === Bygg slutlig URL ===================================
  const url = `${BASE_URL}/recipes/complexSearch?${params.toString()}`;

  try {
    const data = await fetchJson(url);

    // Om API:t inte returnerar några resultat, returnera en tom lista
    if (!data.results || data.results.length === 0) {
      return [];
    }

    return data.results;
  } catch {
    // Om något går fel, returnera en tom lista
    return [];
  }
}

// === Hämta detaljer för ett specifikt recept =============
//
// Används på "recipe-details"-sidan för att visa all info om ett recept.
//
export async function getRecipeDetails(id) {
  // Om inget ID skickas: avbryt direkt
  if (!id) {
    return null;
  }

  // Bygg URL för det specifika receptet
  const url = `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`;

  try {
    const data = await fetchJson(url);
    return data || null;
  } catch {
    // Om något går fel, returnera null
    return null;
  }
}
