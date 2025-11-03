// -------------------------------------------------------------
// RECIPE UTILITIES – Text formatting and helper functions
// -------------------------------------------------------------

// Tar bort alla HTML-taggar från en text, och kortar den vid behov.
export function cleanText(html = "", { maxLength } = {}) {
  const text = html.replace(/<[^>]*>/g, "").trim();
  return maxLength && text.length > maxLength
    ? text.slice(0, maxLength).trimEnd() + "..."
    : text;
}

// Gör om minuter till läsbar text, t.ex. "30 mins" eller "1 min".
export function formatTime(minutes) {
  if (!minutes || isNaN(minutes)) return "N/A";
  const label = minutes === 1 ? "min" : "mins";
  return `${minutes} ${label}`;
}

// Gör om antal portioner till text, t.ex. "2 servings".
export function formatServings(servings) {
  if (!servings || isNaN(servings)) return "N/A";
  return servings === 1 ? "1 serving" : `${servings} servings`;
}

// Gör första bokstaven i varje ord stor.
export function capitalize(text = "") {
  return text
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

// Skapar små taggar (badges) för kosttyper, t.ex. "Vegan" eller "Gluten Free".
export function formatDietTags(diets = [], options = {}) {
  const maxTags = options.maxTags || 4;
  if (!Array.isArray(diets) || diets.length === 0) return "";

  return diets
    .slice(0, maxTags)
    .map((diet) => `<span class="recipe-tag">${capitalize(diet)}</span>`)
    .join("");
}
