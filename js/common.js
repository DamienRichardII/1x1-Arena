
(() => {
  // Year in footer
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  // Mobile nav burger
  const burger = document.querySelector('.nav__burger');
  const panel = document.querySelector('.navmobile');
  if (burger && panel) {
    burger.addEventListener('click', () => {
      const open = !panel.hasAttribute('hidden');
      if (open) {
        panel.setAttribute('hidden', '');
        burger.setAttribute('aria-expanded', 'false');
      } else {
        panel.removeAttribute('hidden');
        burger.setAttribute('aria-expanded', 'true');
      }
    });

    // Close on link click (mobile)
    panel.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      panel.setAttribute('hidden', '');
      burger.setAttribute('aria-expanded', 'false');
    });
  }

  // Smooth scroll for anchor links (optional)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
