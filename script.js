const correctBtn = document.getElementById('correctBtn');
const resetBtn = document.getElementById('resetBtn');
const resultBox = document.getElementById('resultBox');
const scoreText = document.getElementById('scoreText');
const levelText = document.getElementById('levelText');

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function keywordFound(answer, keyword) {
  const cleanAnswer = normalizeText(answer);
  const cleanKeyword = normalizeText(keyword);

  if (!cleanKeyword) return false;

  if (cleanAnswer.includes(cleanKeyword)) return true;

  // Correction approximative simple : accepte quelques mots proches.
  const synonyms = {
    'numeriques': ['technologique', 'technologies', 'digital', 'digitale'],
    'internet': ['web', 'en ligne', 'online'],
    'reseaux sociaux': ['facebook', 'instagram', 'tiktok', 'social'],
    'vendre': ['vente', 'ventes', 'commercialiser', 'acheter'],
    'client': ['clients', 'consommateur', 'consommateurs'],
    'manque': ['besoin', 'absence'],
    'pouvoir': ['capacite', 'moyen'],
    'achat': ['acheter', 'payer'],
    'accord': ['consentement', 'accepter', 'autorisation'],
    'dialoguer': ['parler', 'echanger', 'communiquer'],
    'economiser': ['reduire', 'cout', 'couts', 'moins cher'],
    'dynamiser': ['ameliorer', 'renforcer', 'image', 'marque'],
    'engagement': ['likes', 'commentaires', 'partages', 'interaction']
  };

  if (synonyms[cleanKeyword]) {
    return synonyms[cleanKeyword].some(word => cleanAnswer.includes(normalizeText(word)));
  }

  return false;
}

function correctQCM(question) {
  const points = parseFloat(question.dataset.points);
  const answer = question.dataset.answer;
  const selected = question.querySelector('input[type="radio"]:checked');
  const feedback = question.querySelector('.feedback');

  if (!selected) {
    feedback.className = 'feedback bad';
    feedback.innerHTML = '❌ Aucune réponse choisie. Point obtenu : 0.';
    return 0;
  }

  if (selected.value === answer) {
    feedback.className = 'feedback good';
    feedback.innerHTML = `✅ Bonne réponse. Point obtenu : ${points}.`;
    return points;
  }

  feedback.className = 'feedback bad';
  feedback.innerHTML = `❌ Mauvaise réponse. Bonne réponse : ${answer.toUpperCase()}. Point obtenu : 0.`;
  return 0;
}

function correctOpen(question) {
  const points = parseFloat(question.dataset.points);
  const keywords = question.dataset.keywords.split(',');
  const model = question.dataset.model;
  const textarea = question.querySelector('textarea');
  const feedback = question.querySelector('.feedback');
  const answer = textarea.value.trim();

  if (answer.length < 3) {
    feedback.className = 'feedback bad';
    feedback.innerHTML = `❌ Réponse vide ou trop courte. Point obtenu : 0.<br><strong>Correction :</strong> ${model}`;
    return 0;
  }

  let found = 0;
  let foundWords = [];

  keywords.forEach(keyword => {
    if (keywordFound(answer, keyword)) {
      found++;
      foundWords.push(keyword.trim());
    }
  });

  const ratio = found / keywords.length;
  let obtained = 0;

  if (ratio >= 0.65) {
    obtained = points;
  } else if (ratio >= 0.35) {
    obtained = points * 0.6;
  } else if (ratio >= 0.15) {
    obtained = points * 0.3;
  } else {
    obtained = 0;
  }

  obtained = Math.round(obtained * 100) / 100;

  if (obtained === points) {
    feedback.className = 'feedback good';
    feedback.innerHTML = `✅ Réponse acceptée. Points obtenus : ${obtained}/${points}.<br><strong>Mots reconnus :</strong> ${foundWords.join(', ')}<br><strong>Correction modèle :</strong> ${model}`;
  } else if (obtained > 0) {
    feedback.className = 'feedback medium';
    feedback.innerHTML = `⚠️ Réponse partiellement correcte. Points obtenus : ${obtained}/${points}.<br><strong>Mots reconnus :</strong> ${foundWords.join(', ') || 'peu de mots'}<br><strong>Correction modèle :</strong> ${model}`;
  } else {
    feedback.className = 'feedback bad';
    feedback.innerHTML = `❌ Réponse insuffisante. Points obtenus : 0/${points}.<br><strong>Correction modèle :</strong> ${model}`;
  }

  return obtained;
}

correctBtn.addEventListener('click', () => {
  let total = 0;

  document.querySelectorAll('.question').forEach(question => {
    if (question.classList.contains('qcm')) {
      total += correctQCM(question);
    } else if (question.classList.contains('open')) {
      total += correctOpen(question);
    }
  });

  total = Math.round(total * 100) / 100;
  resultBox.classList.remove('hidden');
  scoreText.textContent = `Votre cote : ${total} / 20`;

  if (total >= 16) {
    levelText.textContent = 'Excellent travail. Tu maîtrises très bien le cours.';
  } else if (total >= 12) {
    levelText.textContent = 'Bon résultat. Il faut encore revoir quelques notions.';
  } else if (total >= 10) {
    levelText.textContent = 'Moyen. Tu as les bases, mais tu dois encore réviser.';
  } else {
    levelText.textContent = 'Insuffisant. Revois surtout les définitions, les 5S, les KPI et les canaux digitaux.';
  }

  resultBox.scrollIntoView({ behavior: 'smooth' });
});

resetBtn.addEventListener('click', () => {
  document.getElementById('quizForm').reset();
  document.querySelectorAll('.feedback').forEach(feedback => {
    feedback.className = 'feedback';
    feedback.innerHTML = '';
  });
  resultBox.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
