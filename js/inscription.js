(() => {
  const form = document.getElementById('inscriptionForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const btnText   = submitBtn.querySelector('.btn__text');
  const btnLoader = submitBtn.querySelector('.btn__loader');
  const feedback  = document.getElementById('formFeedback');

  function showFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.className = `formFeedback formFeedback--${type}`;
    feedback.hidden = false;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    btnText.hidden = on;
    btnLoader.hidden = !on;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.hidden = true;
    setLoading(true);

    const fd = new FormData(form);
    const data = {
      prenom:    fd.get('prenom')?.toString().trim() || '',
      nom:       fd.get('nom')?.toString().trim() || '',
      email:     fd.get('email')?.toString().trim().toLowerCase() || '',
      telephone: fd.get('telephone')?.toString().trim() || '',
      age:       parseInt(fd.get('age')) || null,
      ville:     fd.get('ville')?.toString().trim() || '',
      taille_cm: parseInt(fd.get('taille')) || null,
      poids_kg:  parseInt(fd.get('poids')) || null,
      pseudo:    fd.get('pseudo')?.toString().trim() || null,
      video_url: fd.get('video_url')?.toString().trim() || null,
      message:   fd.get('message')?.toString().trim() || null,
    };

    // Basic validation
    if (!data.prenom || !data.nom || !data.email || !data.telephone || !data.age || !data.ville || !data.taille_cm || !data.poids_kg) {
      showFeedback('Merci de remplir tous les champs obligatoires.', 'error');
      setLoading(false);
      return;
    }

    try {
      // Check duplicate email
      const { data: existing } = await supabase
        .from('inscriptions')
        .select('id')
        .eq('email', data.email)
        .limit(1);

      if (existing && existing.length > 0) {
        showFeedback('Cet email est déjà inscrit au tournoi.', 'error');
        setLoading(false);
        return;
      }

      // Insert into Supabase
      const { error } = await supabase
        .from('inscriptions')
        .insert([data]);

      if (error) throw error;

      // Send custom confirmation email via Edge Function
      try {
        await supabase.functions.invoke('send-confirmation', {
          body: { prenom: data.prenom, nom: data.nom, email: data.email, pseudo: data.pseudo }
        });
      } catch (emailErr) {
        console.warn('Email non envoyé (Edge Function):', emailErr);
        // Don't block registration if email fails
      }

      form.reset();
      showFeedback('Inscription confirmée ! Tu vas recevoir un email de confirmation. Bienvenue dans l\'arène.', 'success');

    } catch (err) {
      console.error('Erreur inscription:', err);
      showFeedback('Une erreur est survenue. Réessaie ou contacte-nous.', 'error');
    } finally {
      setLoading(false);
    }
  });
})();
