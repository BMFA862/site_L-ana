/**
 * LOGIQUE ET INTERACTIONS DE LA PAGE ANNIVERSAIRE (anniv.html)
 */

// Le fichier audio est déclaré dans anniv.html
const birthdayAudio = document.getElementById('birthdayAudio');

function updateMusicButton(isPlaying) {
  const musicBtn = document.getElementById('musicToggleBtn');
  if (!musicBtn) return;
  if (isPlaying) {
    musicBtn.classList.add('playing');
    musicBtn.innerHTML = '<i class="bi bi-volume-up-fill"></i>';
    musicBtn.title = "Couper la musique";
  } else {
    musicBtn.classList.remove('playing');
    musicBtn.innerHTML = '<i class="bi bi-music-note-beamed"></i>';
    musicBtn.title = "Lancer la musique d'anniversaire";
  }
}

function toggleMusic() {
  if (!birthdayAudio.paused) {
    birthdayAudio.pause();
    updateMusicButton(false);
  } else {
    birthdayAudio.play().then(() => {
      updateMusicButton(true);
    }).catch(err => {
      console.warn("Impossible de lire 'musicanniv.mp3' (vérifiez que le fichier est bien présent dans le dossier) :", err);
      updateMusicButton(false);
    });
  }
}

// Synchroniser le bouton avec la lecture, y compris le démarrage HTML (autoplay).
birthdayAudio.addEventListener('play', () => {
  updateMusicButton(true);
});

birthdayAudio.addEventListener('pause', () => {
  updateMusicButton(false);
});

// Réinitialiser le bouton si la musique se termine (au cas où loop est désactivé)
birthdayAudio.addEventListener('ended', () => {
  updateMusicButton(false);
});

// Tir de confettis en pluie festive
function fireConfettiRain() {
  if (typeof confetti !== 'function') return;

  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#ff5e98', '#ffd166', '#7a3cf5', '#06d6a0']
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#ff5e98', '#ffd166', '#7a3cf5', '#06d6a0']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

// Vœux magiques
const magicWishes = [
  "✨ Une année remplie de voyages dépaysants, de fous rires et de découvertes incroyables !",
  "💫 365 jours de pur bonheur, de projets couronnés de succès et de zénitude absolue !",
  "🌟 Des moments inoubliables avec les personnes qui comptent le plus pour toi !",
  "🍰 Zéro calories sur tous les gâteaux et chocolats mangés aujourd'hui !",
  "🚀 Plein de victoires, d'énergie positive et des étoiles plein les yeux tout au long de l'année !"
];

document.addEventListener('DOMContentLoaded', () => {
  // Personnalisation du prénom
  const savedName = localStorage.getItem('birthday_guest_name') || 'Léana';
  const nameTargets = document.querySelectorAll('.friend-name');
  nameTargets.forEach(el => {
    el.textContent = savedName;
  });

  // Lancement automatique des confettis de bienvenue
  setTimeout(() => {
    fireConfettiRain();
  }, 400);

  // Bouton Confettis interactif
  const confettiBtn = document.getElementById('confettiBtn');
  if (confettiBtn) {
    confettiBtn.addEventListener('click', () => {
      fireConfettiRain();
    });
  }

  // Contrôleur de musique
  const musicBtn = document.getElementById('musicToggleBtn');
  if (musicBtn) {
    musicBtn.addEventListener('click', toggleMusic);
  }

  // Ouverture de l'enveloppe / lettre secrète
  const envelopeBtn = document.getElementById('envelopeCard');
  const letterContent = document.getElementById('letterContent');
  const envelopePrompt = document.getElementById('envelopePrompt');

  if (envelopeBtn && letterContent) {
    envelopeBtn.addEventListener('click', () => {
      letterContent.classList.toggle('d-none');
      if (!letterContent.classList.contains('d-none')) {
        letterContent.classList.add('fade-in-up');
        envelopePrompt.innerHTML = '<i class="bi bi-envelope-open-fill text-gold me-1"></i> Lettre dépliée avec tendresse (clique pour replier)';
        // Petit effet confettis doux
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
      } else {
        envelopePrompt.innerHTML = '<i class="bi bi-envelope-heart-fill text-danger me-1"></i> Cliquez sur l\'enveloppe pour ouvrir ton mot spécial';
      }
    });
  }

  // Générateur de vœux
  const wishBtn = document.getElementById('wishBtn');
  const wishDisplay = document.getElementById('wishDisplay');
  if (wishBtn && wishDisplay) {
    let lastIndex = -1;
    wishBtn.addEventListener('click', () => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * magicWishes.length);
      } while (nextIndex === lastIndex && magicWishes.length > 1);
      lastIndex = nextIndex;

      wishDisplay.style.opacity = '0';
      setTimeout(() => {
        wishDisplay.textContent = magicWishes[nextIndex];
        wishDisplay.style.opacity = '1';
        wishDisplay.classList.add('text-gold');
      }, 200);

      if (typeof confetti === 'function') {
        confetti({
          particleCount: 20,
          spread: 45,
          origin: { y: 0.8 }
        });
      }
    });
  }
});
