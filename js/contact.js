// ---------------------------------------------------------
// contact.js – Simple contact form handler
// ---------------------------------------------------------

export function startContactPage() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  form.addEventListener("submit", handleSubmit);
}

function handleSubmit(e) {
  e.preventDefault();

  const form = e.currentTarget;

  showMessage("Thanks! Your message has been sent.");
  form.reset();
}

function showMessage(text) {
  const msg = document.createElement("p");
  msg.textContent = text;
  msg.className = "temp-message";
  msg.setAttribute("role", "status");

  const target = document.querySelector("#contact-form");
  target.appendChild(msg);

  // Auto-remove the message after a short delay so the UI stays clean
  setTimeout(() => msg.remove(), 2000);
}
