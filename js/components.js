// Function to load an HTML component into a placeholder element
async function loadComponent(tagName, filePath) {
  const container = document.querySelector(tagName);
  if (container) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Failed to load ${filePath}`);
      const html = await response.text();
      container.innerHTML = html;
    } catch (error) {
      console.error(error);
    }
  }
}

// Load components on page load
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("header", "/components/header.html");
  loadComponent("footer", "/components/footer.html");
});
