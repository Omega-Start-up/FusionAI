const chatEl = document.getElementById('chat');
const promptEl = document.getElementById('prompt');
const formEl = document.getElementById('promptForm');
const previewEl = document.getElementById('preview');
const codeOutEl = document.getElementById('codeOut');
const downloadBtn = document.getElementById('downloadBtn');
const openBtn = document.getElementById('openBtn');
const resetBtn = document.getElementById('resetBtn');

let lastGeneratedHtml = '';

function addMessage(role, text) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message';
  const avatar = document.createElement('div');
  avatar.className = 'avatar ' + (role === 'user' ? 'user' : 'bot');
  avatar.textContent = role === 'user' ? 'U' : 'A';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatEl.appendChild(wrapper);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function setPreview(html) {
  lastGeneratedHtml = html;
  previewEl.srcdoc = html;
  codeOutEl.textContent = html;
}

function htmlSkeleton({ title = 'Nouvelle app', body = '', accent = '#6aa6ff' }) {
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { --bg:#0e1220; --card:#11162a; --muted:#8fa0c6; --text:#e8eeff; --accent:${accent}; --border:#202a4a; }
    *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--text);font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif}
    .container{max-width:1120px;margin:0 auto;padding:24px}
    header{position:sticky;top:0;background:rgba(14,18,32,.7);backdrop-filter:blur(6px);border-bottom:1px solid var(--border)}
    .brand{font-weight:800;letter-spacing:.3px;padding:12px 0}
    .grid{display:grid;gap:16px}
    .grid-3{grid-template-columns:repeat(3,1fr)}
    .grid-2{grid-template-columns:repeat(2,1fr)}
    .card{background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01));border:1px solid var(--border);border-radius:14px;padding:16px}
    .muted{color:var(--muted)}
    .btn{display:inline-block;padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:linear-gradient(135deg,var(--accent),#9f6aff);color:white;text-decoration:none;font-weight:600}
    .cta{display:flex;gap:12px;flex-wrap:wrap}
    .hero{display:grid;gap:18px;padding:40px 0}
    .hero h1{font-size:40px;line-height:1.1;margin:0}
    .hero p{color:var(--muted);margin:0}
    footer{margin-top:40px;padding:20px 0;border-top:1px solid var(--border);color:var(--muted)}
    @media (max-width: 900px){ .grid-3{grid-template-columns:1fr} .grid-2{grid-template-columns:1fr} .hero h1{font-size:30px}}
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="brand">${escapeHtml(title)}</div>
    </div>
  </header>
  <main>
    <div class="container">${body}</div>
  </main>
  <footer>
    <div class="container">Fait avec Emergent-like MVP</div>
  </footer>
</body>
</html>`;
}

function sectionHero({ heading, subheading, ctaPrimary = 'Commencer', ctaSecondary = 'En savoir plus' }) {
  return `
<section class="hero">
  <h1>${escapeHtml(heading)}</h1>
  <p>${escapeHtml(subheading)}</p>
  <div class="cta">
    <a class="btn" href="#">${escapeHtml(ctaPrimary)}</a>
    <a class="btn" style="background:transparent;color:var(--accent)" href="#">${escapeHtml(ctaSecondary)}</a>
  </div>
</section>`;
}

function sectionFeatures(items) {
  const cards = items.map(i => `
    <div class="card">
      <h3>${escapeHtml(i.title)}</h3>
      <p class="muted">${escapeHtml(i.desc)}</p>
    </div>
  `).join('');
  return `
<section>
  <h2>Fonctionnalités</h2>
  <div class="grid grid-3">${cards}</div>
</section>`;
}

function sectionPricing(plans) {
  const cards = plans.map(p => `
    <div class="card">
      <h3>${escapeHtml(p.name)}</h3>
      <p style="font-size:28px;margin:4px 0"><strong>${escapeHtml(p.price)}</strong><span class="muted">/mo</span></p>
      <ul class="muted" style="padding-left:18px;margin:8px 0 12px 0">
        ${p.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
      </ul>
      <a class="btn" href="#">Choisir ${escapeHtml(p.name)}</a>
    </div>
  `).join('');
  return `
<section>
  <h2>Tarifs</h2>
  <div class="grid grid-3">${cards}</div>
</section>`;
}

function sectionFaq(faqs) {
  const items = faqs.map(f => `
    <div class="card">
      <strong>${escapeHtml(f.q)}</strong>
      <p class="muted">${escapeHtml(f.a)}</p>
    </div>
  `).join('');
  return `
<section>
  <h2>FAQ</h2>
  <div class="grid grid-2">${items}</div>
</section>`;
}

function sectionGallery(projects) {
  const cards = projects.map(p => `
    <div class="card">
      <h3>${escapeHtml(p.title)}</h3>
      <p class="muted">${escapeHtml(p.desc)}</p>
    </div>
  `).join('');
  return `
<section>
  <h2>Projets</h2>
  <div class="grid grid-3">${cards}</div>
</section>`;
}

function sectionTable() {
  return `
<section>
  <h2>Tableau</h2>
  <div class="card">
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th style="text-align:left;border-bottom:1px solid var(--border);padding:8px">Nom</th>
          <th style="text-align:left;border-bottom:1px solid var(--border);padding:8px">Statut</th>
          <th style="text-align:left;border-bottom:1px solid var(--border);padding:8px">Mise à jour</th>
        </tr>
      </thead>
      <tbody>
        ${[1,2,3,4,5].map(i => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid var(--border)">Élément ${i}</td>
            <td style="padding:8px;border-bottom:1px solid var(--border)">${i%2?'Actif':'En pause'}</td>
            <td style="padding:8px;border-bottom:1px solid var(--border)">${new Date().toLocaleDateString('fr-FR')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</section>`;
}

function generateCodeFromPrompt(prompt) {
  const p = (prompt || '').toLowerCase();
  const title = deriveTitle(prompt);
  const accent = deriveAccent(prompt);

  let parts = [];
  // Hero
  parts.push(sectionHero({
    heading: title,
    subheading: deriveSubheading(prompt),
    ctaPrimary: 'Commencer',
    ctaSecondary: 'Découvrir'
  }));

  // Features or projects
  if (p.includes('portfolio') || p.includes('projet')) {
    parts.push(sectionGallery([
      { title: 'Projet A', desc: 'Exploration visuelle et UI' },
      { title: 'Projet B', desc: 'Animation WebGL et 3D' },
      { title: 'Projet C', desc: 'Identité de marque' },
    ]));
  } else {
    parts.push(sectionFeatures([
      { title: 'Rapide', desc: 'Prototypage et itérations en quelques secondes.' },
      { title: 'Flexible', desc: 'Sections réutilisables et design adaptable.' },
      { title: 'Moderne', desc: 'UI soignée, responsive et accessible.' },
    ]));
  }

  // Pricing if landing
  if (p.includes('pricing') || p.includes('tarif') || p.includes('landing')) {
    parts.push(sectionPricing([
      { name: 'Starter', price: '0€', features: ['1 projet', 'Support communautaire', 'Hébergement basique']},
      { name: 'Pro', price: '19€', features: ['Projets illimités', 'Domaines personnalisés', 'Analytics']},
      { name: 'Business', price: '99€', features: ['SLA', 'SSO', 'Support prioritaire']},
    ]));
  }

  // Table if dashboard
  if (p.includes('dashboard') || p.includes('tableau') || p.includes('admin')) {
    parts.push(sectionTable());
  }

  // FAQ often useful
  if (p.includes('faq')) {
    parts.push(sectionFaq([
      { q: 'Puis-je annuler à tout moment ?', a: 'Oui, la résiliation est possible en un clic.' },
      { q: 'Puis-je connecter un domaine ?', a: 'Oui, configuration simple en quelques minutes.' },
      { q: 'Offrez-vous des remises ?', a: 'Des remises annuelles sont disponibles.' },
      { q: 'Ai-je besoin de coder ?', a: 'Non pour commencer, mais le code est exportable.' },
    ]));
  }

  const body = parts.join('\n');
  return htmlSkeleton({ title, body, accent });
}

function deriveTitle(prompt) {
  const m = /(?:pour|de|d\')\s+([a-z0-9\-\s]{3,50})/i.exec(prompt || '');
  if (m) return capitalize(m[1].trim());
  if ((prompt||'').trim().length > 0) return capitalize((prompt||'').trim().slice(0, 32));
  return 'Nouvelle Application';
}
function deriveSubheading(prompt) {
  if (!prompt) return "Crée des interfaces modernes en quelques secondes.";
  return `Version initiale basée sur: ${prompt.slice(0, 140)}`;
}
function deriveAccent(prompt) {
  const colors = ['#6aa6ff', '#a86aff', '#1fbf75', '#ff7a59', '#ffd166', '#06d6a0'];
  let hash = 0;
  for (let i = 0; i < (prompt||'').length; i++) hash = ((hash<<5) - hash) + prompt.charCodeAt(i);
  return colors[Math.abs(hash) % colors.length];
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function escapeHtml(str) { return (str||'').replace(/[&<>"]+/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s])); }

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const prompt = promptEl.value.trim();
  if (!prompt) return;
  addMessage('user', prompt);
  addMessage('bot', 'Génération en cours...');
  // Simulate async work
  setTimeout(() => {
    const html = generateCodeFromPrompt(prompt);
    setPreview(html);
    // Replace last bot message text
    const last = chatEl.querySelectorAll('.message .bubble');
    const bubble = last[last.length - 1];
    bubble.textContent = 'Code généré. Tu peux régénérer en changeant la consigne.';
  }, 200);
});

resetBtn.addEventListener('click', () => {
  chatEl.innerHTML = '';
  promptEl.value = '';
  setPreview('');
});

downloadBtn.addEventListener('click', () => {
  if (!lastGeneratedHtml) return;
  const blob = new Blob([lastGeneratedHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'site.html';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

openBtn.addEventListener('click', () => {
  if (!lastGeneratedHtml) return;
  const url = 'data:text/html;charset=utf-8,' + encodeURIComponent(lastGeneratedHtml);
  window.open(url, '_blank');
});

// Seed with a first message
addMessage('bot', "Décris ce que tu veux créer (ex: 'Landing page SaaS avec héros, features, pricing, FAQ').");