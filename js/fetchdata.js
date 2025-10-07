// ---------------------------------------------------------
// fetchdata.js – Hanterar alla API-anrop till Spoonacular
// ---------------------------------------------------------

// 🔑 Din API-nyckel (ska helst ligga gömd i en miljövariabel i riktiga projekt).
// Här ligger den synligt bara för att göra det enkelt att testa under utveckling.
const API_KEY = "1663bb2ddfbf4b00891cffe70d26f9ed";
const BASE_URL = "https://api.spoonacular.com";

// ---------------------------------------------------------
// Hjälpfunktion: Hämtar data (JSON) från en given URL
// ---------------------------------------------------------
// Den här funktionen används av båda nedanstående funktioner.
// Den gör ett fetch-anrop till API:t och hanterar fel.
// Om allt går bra returnerar den data som ett JavaScript-objekt.
async function fetchJson(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Fel vid hämtning: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fel:", error);
    throw error;
  }
}

// ---------------------------------------------------------
// Hämta en lista med recept baserat på ingredienser, kost och intoleranser
// ---------------------------------------------------------
// Den här funktionen anropas från recipes.js och hämtar recept som matchar
// de ingredienser, dieter och intoleranser användaren valt.
export async function getRecipes({ ingredients = [], diets = [], intolerances = [] } = {}) {
  // 🔹 Vi använder URLSearchParams för att skapa URL-parametrar på ett säkert sätt.
  const params = new URLSearchParams({
    apiKey: API_KEY,
    number: "6",                  // hur många recept vi vill ha
    addRecipeInformation: "true", // ger oss extra data (bild, tid, diet)
    instructionsRequired: "true", // ta bara recept med instruktioner
    offset: "0"                   // börja från första resultatet
  });

  // 🔹 Lägg till ingredienser (från startsidan)
  if (ingredients.length > 0) {
    params.set("includeIngredients", ingredients.join(","));
  }

  // 🔹 Lägg till kostpreferenser (t.ex. vegan, gluten free)
  if (diets.length > 0) {
    params.set("diet", diets.join(",")); // flera värden = AND
  }

  // 🔹 Lägg till intoleranser (t.ex. gluten, dairy, peanut)
  // Dessa innebär "får inte innehålla".
  if (intolerances.length > 0) {
    params.set("intolerances", intolerances.join(","));
  }

  // 🔹 Bygg färdig URL till Spoonaculars endpoint
  const url = `${BASE_URL}/recipes/complexSearch?${params.toString()}`;

  try {
    const data = await fetchJson(url);

    // 🔹 API:t kan skicka fler recept än vi begärt – här kan man begränsa om man vill.
    // const results = (data.results || []).slice(0, 6);
    const results = data.results || [];

    console.log(`✅ Hämtade ${results.length} recept från API:t`);
    return results;
  } catch (error) {
    console.error("Kunde inte hämta recept:", error);
    return [];
  }
}

// ---------------------------------------------------------
// Hämta detaljerad information om ett specifikt recept
// ---------------------------------------------------------
// Den här funktionen används på "receptdetalj"-sidan när man klickar på ett receptkort.
// Då skickas receptets ID (t.ex. 12345) till Spoonacular för att hämta detaljer.
export async function getRecipeDetails(id) {
  if (!id) return null;

  // 🔹 Här skriver vi hela URL:en direkt eftersom vi bara har en parameter (apiKey).
  const url = `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`;

  try {
    const data = await fetchJson(url);
    return data;
  } catch (error) {
    console.error("Kunde inte hämta receptdetaljer:", error);
    return null;
  }
}
