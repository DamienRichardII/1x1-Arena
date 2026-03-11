(() => {
  // ============================================================
  // CONFIG — Change le mot de passe admin ici
  // ============================================================
  const ADMIN_PASSWORD = '1x1arena2025';

  // ============================================================
  // DOM
  // ============================================================
  const loginOverlay  = document.getElementById('loginOverlay');
  const dashboard     = document.getElementById('adminDashboard');
  const pwdInput      = document.getElementById('adminPwd');
  const loginBtn      = document.getElementById('loginBtn');
  const loginError    = document.getElementById('loginError');
  const logoutBtn     = document.getElementById('logoutBtn');
  const refreshBtn    = document.getElementById('refreshBtn');
  const exportPdfBtn  = document.getElementById('exportPdfBtn');
  const inscBody      = document.getElementById('inscBody');
  const statTotal     = document.getElementById('statTotal');
  const statVideo     = document.getElementById('statVideo');
  const statLast      = document.getElementById('statLast');

  // Modal
  const videoModal    = document.getElementById('videoModal');
  const modalTitle    = document.getElementById('modalTitle');
  const modalLink     = document.getElementById('modalLink');
  const modalEmbed    = document.getElementById('modalEmbed');
  const modalClose    = document.getElementById('modalClose');
  const modalBackdrop = videoModal?.querySelector('.modal__backdrop');

  let inscriptions = [];

  // ============================================================
  // AUTH (simple localStorage session)
  // ============================================================
  function isLoggedIn() { return sessionStorage.getItem('1x1_admin') === 'true'; }
  function login() { sessionStorage.setItem('1x1_admin', 'true'); }
  function logout() { sessionStorage.removeItem('1x1_admin'); }

  function showDashboard() {
    loginOverlay.hidden = true;
    dashboard.hidden = false;
    loadInscriptions();
  }

  if (isLoggedIn()) showDashboard();

  loginBtn.addEventListener('click', () => {
    if (pwdInput.value === ADMIN_PASSWORD) {
      login();
      loginError.hidden = true;
      showDashboard();
    } else {
      loginError.hidden = false;
      pwdInput.value = '';
      pwdInput.focus();
    }
  });

  pwdInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') loginBtn.click(); });

  logoutBtn.addEventListener('click', () => {
    logout();
    dashboard.hidden = true;
    loginOverlay.hidden = false;
    pwdInput.value = '';
  });

  // ============================================================
  // LOAD DATA
  // ============================================================
  async function loadInscriptions() {
    inscBody.innerHTML = '<tr><td colspan="12" class="table-empty">Chargement…</td></tr>';

    try {
      const { data, error } = await supabase
        .from('inscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      inscriptions = data || [];
      renderTable();
      renderStats();
    } catch (err) {
      console.error('Erreur chargement:', err);
      inscBody.innerHTML = '<tr><td colspan="12" class="table-empty">Erreur de chargement. Vérifie ta config Supabase.</td></tr>';
    }
  }

  refreshBtn.addEventListener('click', loadInscriptions);

  // ============================================================
  // RENDER TABLE
  // ============================================================
  function renderTable() {
    if (inscriptions.length === 0) {
      inscBody.innerHTML = '<tr><td colspan="12" class="table-empty">Aucune inscription pour le moment.</td></tr>';
      return;
    }

    inscBody.innerHTML = inscriptions.map((r, i) => {
      const date = r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
      const videoCell = r.video_url
        ? `<button class="video-link" data-url="${escHtml(r.video_url)}" data-name="${escHtml(r.prenom + ' ' + r.nom)}">▶ Voir</button>`
        : '<span class="no-video">—</span>';

      return `<tr>
        <td>${i + 1}</td>
        <td>${escHtml(r.prenom)}</td>
        <td>${escHtml(r.nom)}</td>
        <td>${escHtml(r.pseudo || '—')}</td>
        <td>${escHtml(r.email)}</td>
        <td>${escHtml(r.telephone)}</td>
        <td>${r.age || '—'}</td>
        <td>${escHtml(r.ville)}</td>
        <td>${r.taille_cm ? r.taille_cm + ' cm' : '—'}</td>
        <td>${r.poids_kg ? r.poids_kg + ' kg' : '—'}</td>
        <td>${videoCell}</td>
        <td>${date}</td>
      </tr>`;
    }).join('');
  }

  function escHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ============================================================
  // STATS
  // ============================================================
  function renderStats() {
    statTotal.textContent = inscriptions.length;
    statVideo.textContent = inscriptions.filter(r => r.video_url).length;
    if (inscriptions.length > 0 && inscriptions[0].created_at) {
      statLast.textContent = new Date(inscriptions[0].created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    } else {
      statLast.textContent = '—';
    }
  }

  // ============================================================
  // VIDEO MODAL
  // ============================================================
  inscBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.video-link');
    if (!btn) return;
    const url = btn.dataset.url;
    const name = btn.dataset.name;
    openVideoModal(url, name);
  });

  function openVideoModal(url, name) {
    modalTitle.textContent = `Vidéo — ${name}`;
    modalLink.href = url;
    modalEmbed.innerHTML = '';

    // Try to embed YouTube / Instagram
    const ytId = extractYouTubeId(url);
    if (ytId) {
      modalEmbed.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}" allowfullscreen></iframe>`;
    } else {
      modalEmbed.innerHTML = `<div style="display:grid;place-items:center;height:100%;color:rgba(255,255,255,.5);font-size:13px;padding:20px;text-align:center">
        Aperçu non disponible pour ce lien.<br>Clique sur "Ouvrir le lien" ci-dessus.
      </div>`;
    }

    videoModal.hidden = false;
  }

  function extractYouTubeId(url) {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
      if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    } catch {}
    return null;
  }

  function closeModal() { videoModal.hidden = true; modalEmbed.innerHTML = ''; }
  modalClose?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);

  // ============================================================
  // PDF EXPORT (jsPDF + autoTable)
  // ============================================================
  exportPdfBtn.addEventListener('click', () => {
    if (inscriptions.length === 0) return alert('Aucune inscription à exporter.');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // ---- HEADER ----
    // Dark background header bar
    doc.setFillColor(5, 6, 10);
    doc.rect(0, 0, pageW, 28, 'F');

    // Gradient accent line
    const gradSteps = 60;
    const lineY = 28;
    for (let i = 0; i < gradSteps; i++) {
      const ratio = i / gradSteps;
      const r = Math.round(255 * (1 - ratio) + 35 * ratio);
      const g = Math.round(45 * (1 - ratio) + 213 * ratio);
      const b = Math.round(189 * (1 - ratio) + 255 * ratio);
      doc.setFillColor(r, g, b);
      doc.rect((pageW / gradSteps) * i, lineY, pageW / gradSteps + 0.5, 1.5, 'F');
    }

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('1X1 ARENA', 14, 12);

    doc.setFontSize(10);
    doc.setTextColor(180, 180, 190);
    doc.text('Liste des inscriptions — Arena Tournament', 14, 19);

    // Date + count
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 155);
    const now = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.text(`Export du ${now} • ${inscriptions.length} inscrit${inscriptions.length > 1 ? 's' : ''}`, 14, 25);

    // ---- TABLE ----
    const headers = [['#', 'Prénom', 'Nom', 'Pseudo', 'Email', 'Tél.', 'Âge', 'Ville', 'Taille', 'Poids', 'Date']];

    const rows = inscriptions.map((r, i) => {
      const date = r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
      return [
        i + 1,
        r.prenom || '',
        r.nom || '',
        r.pseudo || '—',
        r.email || '',
        r.telephone || '',
        r.age || '—',
        r.ville || '',
        r.taille_cm ? r.taille_cm + ' cm' : '—',
        r.poids_kg ? r.poids_kg + ' kg' : '—',
        date
      ];
    });

    doc.autoTable({
      startY: 34,
      head: headers,
      body: rows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
        lineWidth: 0.1,
        lineColor: [40, 42, 55],
        textColor: [220, 220, 230],
        fillColor: [15, 16, 22],
      },
      headStyles: {
        fillColor: [30, 32, 45],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'left',
      },
      alternateRowStyles: {
        fillColor: [22, 24, 34],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        6: { halign: 'center', cellWidth: 10 },
        8: { halign: 'center', cellWidth: 16 },
        9: { halign: 'center', cellWidth: 16 },
        10: { halign: 'center', cellWidth: 18 },
      },
      margin: { left: 10, right: 10 },
      didDrawPage: (data) => {
        // Footer on each page
        const pageNum = doc.internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 115);
        doc.text(`1X1 ARENA — Page ${pageNum}`, pageW / 2, pageH - 6, { align: 'center' });

        // Bottom accent line
        for (let i = 0; i < gradSteps; i++) {
          const ratio = i / gradSteps;
          const r = Math.round(255 * (1 - ratio) + 35 * ratio);
          const g = Math.round(45 * (1 - ratio) + 213 * ratio);
          const b = Math.round(189 * (1 - ratio) + 255 * ratio);
          doc.setFillColor(r, g, b);
          doc.rect((pageW / gradSteps) * i, pageH - 3, pageW / gradSteps + 0.5, 1, 'F');
        }
      }
    });

    // Save
    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`1X1-ARENA_Inscriptions_${dateStr}.pdf`);
  });

})();
