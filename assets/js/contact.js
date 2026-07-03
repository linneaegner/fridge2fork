export function startContactPage() {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  form.addEventListener("submit", handleSubmit);
}
function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  showMessage(form, "Thanks! Your message has been sent.");
  form.reset();
}
function showMessage(form, text) {
  if (!form) return;
  const msg = document.createElement("p");
  msg.textContent = text;
  msg.className = "temp-message";
  msg.classList.add("fade-in-out");
  msg.setAttribute("role", "status");
  form.appendChild(msg);
  setTimeout(() => msg.remove(), 2000);
}
