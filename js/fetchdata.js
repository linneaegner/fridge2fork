// ---------------------------------------------------------
// fetchdata.js – Hanterar alla API-anrop till Spoonacular
// ---------------------------------------------------------
//
// Den här filen ansvarar för all kommunikation med Spoonaculars API.
// Här finns funktioner som hämtar receptlistor och detaljerad info om ett recept.
//
// Andra filer (t.ex. recipes.js) "pratar" med API:et genom att anropa dessa funktioner.
// På så sätt slipper vi skriva fetch-anrop på flera ställen i projektet.
// ---------------------------------------------------------

// ---------------------------------------------------------
// 🔑 API-NYCKEL OCH BAS-URL
// ---------------------------------------------------------
//
// I riktiga projekt ska API-nyckeln ligga i en miljövariabel (t.ex. .env-fil)
// så att den inte syns för användaren. Här ligger den öppet för enkel testning.
//
const API_KEY = "1663bb2ddfbf4b00891cffe70d26f9ed";
const BASE_URL = "https://api.spoonacular.com";

// ---------------------------------------------------------
// 🌐 HJÄLPFUNKTION – HÄMTAR JSON-DATA FRÅN EN URL
// ---------------------------------------------------------
//
// Den här funktionen används av båda huvudfunktionerna nedan.
// Den skickar ett "fetch"-anrop till API:et och hanterar eventuella fel.
// Om allt går bra returneras datan som ett JavaScript-objekt.
//
async function fetchJson(url) {
  try {
    console.debug("[API] Skickar förfrågan", url);
    const response = await fetch(url);

    // 🧱 Kontroll: API:t svarade med ett fel (t.ex. 404 eller 401)
    if (!response.ok) {
      throw new Error(`Fel vid hämtning: ${response.status}`);
    }

    // ✅ Om allt gick bra – omvandla svaret till JSON-format
    return await response.json();
  } catch (error) {
    // ⚠️ Om något gick fel loggar vi det i konsolen
    console.error("Fel vid hämtning:", error);
    throw error; // skicka vidare felet så att anroparen kan hantera det
  }
}

// ---------------------------------------------------------
// 🍲 HÄMTA EN LISTA MED RECEPT FRÅN SPOONACULAR
// ---------------------------------------------------------
//
// Denna funktion anropas från recipes.js.
// Den hämtar en lista med recept som matchar användarens ingredienser.
//
// API-parametrarna byggs upp med URLSearchParams, vilket gör det enkelt
// att lägga till eller ta bort värden på ett säkert sätt.
//
export async function getRecipes({ ingredients = [] } = {}) {
  // ---------------------------------------------------------
  // 🔧 Skapa API-parametrar
  // ---------------------------------------------------------
  //
  // "const params" är ett objekt som lagrar alla nyckel-värde-par som ska skickas
  // i URL:en. JavaScript kodar automatiskt specialtecken (t.ex. mellanslag).
  //
  // Exempel på färdig URL efter params.toString():
  // apiKey=123abc&number=6&addRecipeInformation=true&includeIngredients=tomato
  //
  const params = new URLSearchParams({
    apiKey: API_KEY,
    number: "6",                  // hur många recept vi vill hämta
    addRecipeInformation: "true", // extra info (bild, tid, diet)
    instructionsRequired: "true", // endast recept med instruktioner
    offset: "0"                   // startposition (0 = första sidan)
  });

  // ---------------------------------------------------------
  // 🥕 Lägg till ingredienser (om användaren valt några)
  // ---------------------------------------------------------
  if (ingredients.length > 0) {
    params.set("includeIngredients", ingredients.join(","));
  }

  // ---------------------------------------------------------
  // 🧩 Bygg ihop den slutliga URL:en till API-anropet
  // ---------------------------------------------------------
  const url = `${BASE_URL}/recipes/complexSearch?${params.toString()}`;

  console.groupCollapsed("📡 API:getRecipes");
  console.info("Filter för anropet", {
    ingredients,
    url,
  });

  try {
    // 🔹 Använd vår hjälpfunktion för att hämta datan
    const data = await fetchJson(url);

    // 🔹 API:t kan ibland returnera fler recept än vi bett om.
    // const results = (data.results || []).slice(0, 6); // ← exempel på hur man kan begränsa
    const results = data.results || [];

    console.info(`✅ API svarade med ${results.length} recept`);
    if (results.length) {
      console.table(
        results.map(({ id, title, readyInMinutes }) => ({ id, title, readyInMinutes }))
      );
    }

    return results;
  } catch (error) {
    console.error("Kunde inte hämta recept:", error);
    return [];
  } finally {
    console.groupEnd();
  }
}

// ---------------------------------------------------------
// 📖 HÄMTA DETALJER FÖR ETT SPECIFIKT RECEPT
// ---------------------------------------------------------
//
// Den här funktionen används på "recipe-details"-sidan när användaren klickar
// på ett receptkort. Då skickas receptets ID till Spoonacular för att hämta
// all information om just det receptet.
//
export async function getRecipeDetails(id) {
  // 🧱 Kontroll: om inget ID skickas, avbryt
  if (!id) return null;

  // ---------------------------------------------------------
  // 🔹 Bygg URL:en för receptdetaljer
  // ---------------------------------------------------------
  //
  // Här har vi bara en parameter (apiKey), så det är enklare att skriva
  // hela adressen direkt istället för att använda URLSearchParams.
  //
  // Båda metoderna fungerar – valet beror på vad som är tydligast.
  //
  const url = `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`;

  console.groupCollapsed(`📡 API:getRecipeDetails (${id})`);
  console.info("Hämtar detaljer för recept", { id, url });

  try {
    // 🔸 Hämta datan från API:et
    const data = await fetchJson(url);
    if (data) {
      console.info("✅ Hämtade detaljer för recept", {
        id: data.id,
        title: data.title,
        readyInMinutes: data.readyInMinutes,
      });
    }
    return data;
  } catch (error) {
    console.error("Kunde inte hämta receptdetaljer:", error);
    return null;
  } finally {
    console.groupEnd();
  }
}
