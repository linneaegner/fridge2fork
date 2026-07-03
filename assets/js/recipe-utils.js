export function cleanText(html = "") {
  if (typeof html !== "string") return "";
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text;
}
export function formatTime(minutes) {
  if (!minutes || isNaN(minutes)) return "N/A";
  const label = minutes === 1 ? "min" : "mins";
  return `${minutes} ${label}`;
}
export function formatServings(servings) {
  if (!servings || isNaN(servings)) return "N/A";
  return servings === 1 ? "1 serving" : `${servings} servings`;
}
export function capitalize(text = "") {
  return text
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
export function formatDietTags(diets = [], options = {}) {
  const maxTags = options.maxTags || 4;
  if (!Array.isArray(diets) || diets.length === 0) return "";
  return diets
    .slice(0, maxTags)
    .map((diet) => `<span class="recipe-tag">${capitalize(diet)}</span>`)
    .join("");
}
