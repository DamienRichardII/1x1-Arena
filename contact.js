
(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const subject = (data.get('subject') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();

    const to = 'Onexone.arena@gmail.com';
    const fullSubject = subject ? `[1X1 ARENA] ${subject}` : '[1X1 ARENA] Contact';
    const body =
`Nom: ${name}
Email: ${email}

Message:
${message}`;

    const url = `mailto:${to}?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  });
})();
