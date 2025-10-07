// ---------------------------------------------------------
// filter-options.js – Samlar alla kost- och intoleransalternativ
// ---------------------------------------------------------
// Här definieras alla alternativ som användaren kan välja som filter.
// Du kan enkelt lägga till, ta bort eller ändra dessa utan att röra resten av koden.

// 🍏 Kostalternativ (Spoonaculars officiella namn)
export const DIETARY_OPTIONS = [
  { name: "gluten free", description: "Avoid gluten-containing grains." },
  { name: "ketogenic", description: "Low carb, high fat diet." },
  { name: "vegetarian", description: "No meat or meat by-products." },
  { name: "lacto-vegetarian", description: "Vegetarian diet, no eggs." },
  { name: "ovo-vegetarian", description: "Vegetarian diet, no dairy." },
  { name: "vegan", description: "No animal products including eggs or honey." },
  { name: "pescetarian", description: "Includes fish and seafood, no meat." },
  { name: "paleo", description: "No grains, dairy, or legumes." },
  { name: "primal", description: "Similar to paleo but includes dairy." },
  { name: "low fodmap", description: "Avoid high-FODMAP foods." },
  { name: "whole30", description: "No sugar, grains, dairy, or legumes." },
];

// 🚫 Intoleranser (Spoonaculars officiella namn)
export const INTOLERANCE_OPTIONS = [
  { name: "dairy", description: "Avoid milk and dairy products." },
  { name: "egg", description: "Avoid eggs and foods containing eggs." },
  { name: "gluten", description: "Avoid gluten-containing grains." },
  { name: "grain", description: "Avoid all grains." },
  { name: "peanut", description: "Avoid peanuts and peanut products." },
  { name: "seafood", description: "Avoid fish and seafood." },
  { name: "sesame", description: "Avoid sesame and sesame oil." },
  { name: "shellfish", description: "Avoid shellfish like shrimp, crab, etc." },
  { name: "soy", description: "Avoid soy and soy-based products." },
  { name: "sulfite", description: "Avoid foods containing sulfites." },
  { name: "tree nut", description: "Avoid nuts like almonds, cashews, etc." },
  { name: "wheat", description: "Avoid all wheat products." },
];
