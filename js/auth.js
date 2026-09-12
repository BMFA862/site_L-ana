/**
 * LOGIQUE DU PORTAIL D'AUTHENTIFICATION VIP
 */

// Générateur de sons via Web Audio API (aucun fichier audio externe requis)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const now = audioCtx.currentTime;

  if (type === 'unlock') {
    // Carillon joyeux ascendant
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.2, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.4);
    });
  } else if (type === 'error') {
    // Son d'erreur doux
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.25);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  } else if (type === 'click') {
    // Clic subtil
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const authForm = document.getElementById('authForm');
  const nameInput = document.getElementById('nameInput');
  const passInput = document.getElementById('passInput');
  const togglePassBtn = document.getElementById('togglePassBtn');
  const lockIcon = document.getElementById('lockIcon');
  const feedbackMsg = document.getElementById('feedbackMsg');
  const submitBtn = document.getElementById('submitBtn');

  // Afficher / masquer le mot de passe
  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener('click', () => {
      playSound('click');
      const isPassword = passInput.type === 'password';
      passInput.type = isPassword ? 'text' : 'password';
      togglePassBtn.innerHTML = isPassword
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';
    });
  }

  // Fonction de succès et redirection
  function triggerSuccess(userName) {
    playSound('unlock');
    localStorage.setItem('birthday_guest_name', userName || 'Léana');

    // Changement icône et message
    if (lockIcon) {
      lockIcon.className = 'bi bi-unlock-fill text-gold';
      lockIcon.parentElement.style.animation = 'pulseGlow 1s infinite alternate';
    }

    if (feedbackMsg) {
      feedbackMsg.innerHTML = `<span class="text-gold fw-bold">✨ Accès VIP Autorisé ! Bienvenue ${userName || 'Léana'}... ✨</span>`;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Ouverture du salon VIP...';
    }

    // Explosion de confettis
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffd166', '#ff5e98', '#7a3cf5', '#06d6a0']
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);
    }

    // Redirection vers la page d'anniversaire
    setTimeout(() => {
      window.location.href = 'anniv.html';
    }, 1500);
  }

  // Soumission du formulaire
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredName = (nameInput.value || '').trim();
      const enteredPass = (passInput.value || '').trim();

      // Vérification des champs vides
      if (!enteredName && !enteredPass) {
        playSound('error');
        feedbackMsg.innerHTML = '<span class="text-warning"><i class="bi bi-info-circle me-1"></i>Veuillez renseigner votre prénom et le mot de passe.</span>';
        nameInput.focus();
        return;
      }

      if (!enteredName) {
        playSound('error');
        feedbackMsg.innerHTML = '<span class="text-warning"><i class="bi bi-info-circle me-1"></i>Veuillez renseigner votre prénom.</span>';
        nameInput.focus();
        return;
      }

      // Le prénom doit obligatoirement être Léana (insensible à la casse et aux accents)
      const normalizedName = enteredName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (normalizedName !== 'leana') {
        playSound('error');
        feedbackMsg.innerHTML = '<span class="text-danger"><i class="bi bi-x-circle me-1"></i>Prénom incorrect ! L\'accès est réservé exclusivement à Léana.</span>';
        nameInput.focus();
        return;
      }

      if (!enteredPass) {
        playSound('error');
        feedbackMsg.innerHTML = '<span class="text-warning"><i class="bi bi-info-circle me-1"></i>Veuillez renseigner le mot de passe.</span>';
        passInput.focus();
        return;
      }

      // Vérification du mot de passe choisi
      const correctPass = "L34nA22Mai";
      if (enteredPass.toLowerCase() !== correctPass.toLowerCase()) {
        playSound('error');
        feedbackMsg.innerHTML = '<span class="text-danger"><i class="bi bi-x-circle me-1"></i>Mauvais mot de passe !</span>';
        passInput.focus();
        return;
      }

      // Tout est valide -> on déverrouille !
      triggerSuccess('Léana');
    });
  }
});