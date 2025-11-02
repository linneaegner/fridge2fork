// Removes all HTML tags (like <p> or <b>) from a string.
// Also shortens the text if it's too long.
export function cleanText(html = "", options = {}) {
  const maxLength = options.maxLength;

  // Use a built-in browser tool to remove HTML tags
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  let text = (doc.body.textContent || "").trim();

  // If text is longer than allowed, cut it and add "..."
  if (maxLength && text.length > maxLength) {
    text = text.slice(0, maxLength).trimEnd() + "...";
  }

  return text;
}

// Turns a number of minutes into readable text like "30 mins" or "1 min".
export function formatTime(minutes) {
  if (!minutes || isNaN(minutes)) return "N/A";

  const label = minutes === 1 ? "min" : "mins";
  return `${minutes} ${label}`;
}

// Turns a number of servings into readable text like "2 servings".
export function formatServings(servings) {
  if (!servings || isNaN(servings)) return "N/A";

  if (servings === 1) {
    return "1 serving";
  } else {
    return `${servings} servings`;
  }
}

// Makes the first letter of each word uppercase.
export function capitalize(text = "") {
  const words = text.split(" ").filter(Boolean);
  const capitalizedWords = words.map(
    (word) => word[0].toUpperCase() + word.slice(1)
  );
  return capitalizedWords.join(" ");
}

// Creates small tag elements (like badges) for diet types, e.g. "Vegan" or "Gluten Free".
export function formatDietTags(diets = [], options = {}) {
  const maxTags = options.maxTags || 4;

  if (!Array.isArray(diets) || diets.length === 0) {
    return "";
  }

  // Take the first few diet names, capitalize them, and wrap them in HTML spans
  const tags = diets.slice(0, maxTags).map((diet) => {
    const name = capitalize(diet);
    return `<span class="recipe-tag">${name}</span>`;
  });

  return tags.join("");
}
