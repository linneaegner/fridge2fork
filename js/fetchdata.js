// ---------------------------------------------------------
// fetchdata.js – Allt som har med API-anrop mot Spoonacular att göra
// ---------------------------------------------------------

// OBS! API-nyckeln bör helst ligga i en miljövariabel i ett riktigt projekt.
const API_KEY = "1663bb2ddfbf4b00891cffe70d26f9ed";
const BASE_URL = "https://api.spoonacular.com";

// ---------------------------------------------------------
// Hjälpfunktion – hämtar JSON-data från en URL
// ---------------------------------------------------------
async function fetchJson(url) {
  console.log("🌐 Hämtar data från:", url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // Servern svarade med ett fel (t.ex. 401, 404, 500)
      throw new Error(`Kunde inte hämta data. Statuskod: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Fel uppstod vid hämtning av data:", error);
    throw error; // Skicka vidare felet så att anroparen kan hantera det
  }
}

// ---------------------------------------------------------
// Hämtar en lista med recept utifrån ingredienser och kostkrav
// ---------------------------------------------------------
export async function getRecipes({ ingredients = [], diets = [] } = {}) {
  console.log("📋 Hämtar recept från API:et...", { ingredients, diets });

  const params = new URLSearchParams({
    apiKey: API_KEY,
    number: "24", // hur många recept vi vill ha tillbaka
    addRecipeInformation: "true",
    instructionsRequired: "true",
  });

  if (ingredients.length > 0) {
    params.set("includeIngredients", ingredients.join(","));
  }

  if (diets.length > 0) {
    params.set("diet", diets.join(","));
  }

  const url = `${BASE_URL}/recipes/complexSearch?${params.toString()}`;

  try {
    const data = await fetchJson(url);
    console.log(`✅ Hittade ${data.results?.length || 0} recept.`);
    return data.results || [];
  } catch (error) {
    console.error("⚠️ Kunde inte hämta listan av recept:", error);
    return []; // Returnera tom lista så att sidan fortfarande kan visas
  }
}

// ---------------------------------------------------------
// Hämtar detaljerad information för ett specifikt recept
// ---------------------------------------------------------
export async function getRecipeDetails(id) {
  if (!id) {
    console.warn("⚠️ Försökte hämta receptdetaljer utan att ange id.");
    return null;
  }

  const url = `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`;

  try {
    const data = await fetchJson(url);
    console.log("📄 Hämtade detaljer för recept:", data.title);
    return data;
  } catch (error) {
    console.error("❌ Kunde inte hämta receptdetaljer:", error);
    return null;
  }
}
