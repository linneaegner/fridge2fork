// ---------------------------------------------------------
// recipe-utils.js – Shared helper functions for recipes
// ---------------------------------------------------------

export function cleanText(html = "", options = {}) {
  const { maxLength } = options;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  let text = (doc.body.textContent || "").trim();

  if (maxLength && text.length > maxLength) {
    text = text.slice(0, maxLength).trimEnd() + "...";
  }

  return text;
}

export function formatTime(minutes, options = {}) {
  const { singularLabel = "min", pluralLabel = "mins" } = options;
  if (!minutes) return "N/A";

  const label = minutes === 1 ? singularLabel : pluralLabel;
  return `${minutes} ${label}`;
}

export function formatServings(servings) {
  if (!servings) return "N/A";
  return servings === 1 ? "1 serving" : `${servings} servings`;
}

export function capitalize(text = "") {
  return text
    .split(" ")
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDietTags(diets = [], options = {}) {
  const { maxTags = 4 } = options;

  if (!Array.isArray(diets) || diets.length === 0) {
    return "";
  }

  return diets
    .slice(0, maxTags)
    .map(d => `<span class="recipe-tag">${capitalize(d)}</span>`)
    .join("");
}
