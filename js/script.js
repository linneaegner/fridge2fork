import { fetchRecipes } from "./fetchdata.js";

// Function to render recipes on the page
function renderRecipes(recipes) {
  const resultsContainer = document.getElementById("recipe-results");
  resultsContainer.innerHTML = ""; // Clear previous results

  if (recipes.length === 0) {
    resultsContainer.innerHTML = "<p>No recipes found. Please try different ingredients.</p>";
    return;
  }

  recipes.forEach((recipe) => {
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}" />
      <h3>${recipe.title}</h3>
      <p>Used Ingredients: ${recipe.usedIngredientCount}</p>
      <p>Missing Ingredients: ${recipe.missedIngredientCount}</p>
      <a href="https://spoonacular.com/recipes/${recipe.title.replace(/ /g, "-")}-${recipe.id}" target="_blank">View Recipe</a>
    `;

    resultsContainer.appendChild(recipeCard);
  });

  // Add dietary preference filters
  addDietaryFilters(recipes);
}

// Function to display error messages
function displayError(message) {
  const resultsContainer = document.getElementById("recipe-results");
  resultsContainer.innerHTML = `<p class="error">${message}</p>`;
}

// Function to add dietary preference filters
function addDietaryFilters(recipes) {
  const filterContainer = document.getElementById("dietary-filters");
  filterContainer.innerHTML = ""; // Clear previous filters

  const filters = ["Vegetarian", "Vegan", "Gluten-Free"];

  filters.forEach((filter) => {
    const filterButton = document.createElement("button");
    filterButton.textContent = filter;
    filterButton.addEventListener("click", () => {
      const filteredRecipes = recipes.filter((recipe) => recipe[filter.toLowerCase()]);
      renderRecipes(filteredRecipes);
    });
    filterContainer.appendChild(filterButton);
  });
}

// Event listener for the form submission
document.getElementById("ingredient-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const ingredientsInput = document.getElementById("ingredients").value;
  if (!ingredientsInput.trim()) {
    displayError("Please enter at least one ingredient.");
    return;
  }

  try {
    const recipes = await fetchRecipes(ingredientsInput);
    renderRecipes(recipes);
  } catch (error) {
    displayError("An error occurred while fetching recipes. Please try again.");
  }
});