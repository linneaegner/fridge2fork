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

  alert(`Thanks! Your message has been sent.`);
  form.reset();
}
