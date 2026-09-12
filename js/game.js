/**
 * MINI-JEU D'ANNIVERSAIRE : "L'Attrape-Cadeaux & Ballons d'Anniversaire"
 */

// Web Audio API pour les bruitages du jeu
const gameAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSfx(type) {
  if (gameAudioCtx.state === 'suspended') {
    gameAudioCtx.resume();
  }
  const now = gameAudioCtx.currentTime;

  if (type === 'catch') {
    // Petit bip joyeux
    const osc = gameAudioCtx.createOscillator();
    const gain = gameAudioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(gameAudioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } else if (type === 'bonus') {
    // Carillon étincelant pour étoile ou couronne
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = gameAudioCtx.createOscillator();
      const gain = gameAudioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.2, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
      osc.connect(gain);
      gain.connect(gameAudioCtx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.28);
    });
  } else if (type === 'bad') {
    // Boing d'alerte doux
    const osc = gameAudioCtx.createOscillator();
    const gain = gameAudioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.2);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(gameAudioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  } else if (type === 'victory') {
    // Fanfare de victoire
    const notes = [
      { f: 523.25, t: 0 },
      { f: 659.25, t: 0.12 },
      { f: 783.99, t: 0.24 },
      { f: 1046.50, t: 0.38 },
      { f: 880.00, t: 0.58 },
      { f: 1046.50, t: 0.72 }
    ];
    notes.forEach((n) => {
      const osc = gameAudioCtx.createOscillator();
      const gain = gameAudioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(0.22, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + 0.35);
      osc.connect(gain);
      gain.connect(gameAudioCtx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + 0.38);
    });
  }
}

// Configuration du jeu
const ITEM_TYPES = [
  { emoji: '🎁', points: 15, weight: 35, bad: false, label: 'Cadeau' },
  { emoji: '🎂', points: 25, weight: 25, bad: false, label: 'Gâteau' },
  { emoji: '💖', points: 20, weight: 20, bad: false, label: 'Cœur' },
  { emoji: '⭐', points: 40, weight: 10, bad: false, label: 'Étoile d\'Or' },
  { emoji: '👑', points: 60, weight: 5,  bad: false, label: 'Couronne' },
  { emoji: '⏰', points: -20, weight: 12, bad: true,  label: 'Pas de réveil !' },
  { emoji: '🌧️', points: -15, weight: 12, bad: true,  label: 'Nuage gris' }
];

class BirthdayGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.score = 0;
    this.timeLeft = 40;
    this.isPlaying = false;
    this.items = [];
    this.floatingTexts = [];
    this.particles = [];
    
    // Joueur (Panier à surprises)
    this.basket = {
      x: 0,
      y: 0,
      width: 100,
      height: 40,
      speed: 12,
      targetX: 0
    };

    this.keys = { left: false, right: false };
    this.spawnTimer = 0;
    this.spawnInterval = 38; // images entre chaque spawn
    this.animId = null;
    this.secondInterval = null;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.bindEvents();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const width = Math.min(rect.width - 20, 720);
    this.canvas.width = width;
    this.canvas.height = 460;
    this.basket.y = this.canvas.height - 55;
    if (this.basket.x === 0) {
      this.basket.x = this.canvas.width / 2 - this.basket.width / 2;
      this.basket.targetX = this.basket.x;
    }
  }

  bindEvents() {
    // Clavier
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'q' || e.key === 'Q') {
        this.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keys.right = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'q' || e.key === 'Q') {
        this.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keys.right = false;
      }
    });

    // Souris
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.isPlaying) return;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      this.basket.targetX = mouseX - this.basket.width / 2;
    });

    // Touch pour mobile
    this.canvas.addEventListener('touchmove', (e) => {
      if (!this.isPlaying || !e.touches[0]) return;
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      this.basket.targetX = touchX - this.basket.width / 2;
    }, { passive: false });

    // Boutons tactiles gauche / droite
    const leftBtn = document.getElementById('mobileLeftBtn');
    const rightBtn = document.getElementById('mobileRightBtn');
    if (leftBtn && rightBtn) {
      const handleTouch = (key, state) => {
        return (e) => {
          e.preventDefault();
          this.keys[key] = state;
        };
      };
      leftBtn.addEventListener('mousedown', () => this.keys.left = true);
      leftBtn.addEventListener('mouseup', () => this.keys.left = false);
      leftBtn.addEventListener('touchstart', handleTouch('left', true));
      leftBtn.addEventListener('touchend', handleTouch('left', false));

      rightBtn.addEventListener('mousedown', () => this.keys.right = true);
      rightBtn.addEventListener('mouseup', () => this.keys.right = false);
      rightBtn.addEventListener('touchstart', handleTouch('right', true));
      rightBtn.addEventListener('touchend', handleTouch('right', false));
    }
  }

  start() {
    this.score = 0;
    this.timeLeft = 40;
    this.items = [];
    this.floatingTexts = [];
    this.particles = [];
    this.isPlaying = true;
    this.basket.x = this.canvas.width / 2 - this.basket.width / 2;
    this.basket.targetX = this.basket.x;

    this.updateUI();

    if (this.secondInterval) clearInterval(this.secondInterval);
    this.secondInterval = setInterval(() => {
      if (!this.isPlaying) return;
      this.timeLeft--;
      this.updateUI();
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);

    if (this.animId) cancelAnimationFrame(this.animId);
    this.loop();
  }

  getRandomItem() {
    const totalWeight = ITEM_TYPES.reduce((acc, it) => acc + it.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const item of ITEM_TYPES) {
      if (rand < item.weight) {
        return {
          ...item,
          x: Math.random() * (this.canvas.width - 40) + 20,
          y: -40,
          speedY: 2.2 + Math.random() * 2.6,
          swaySpeed: 0.04 + Math.random() * 0.04,
          swayAmp: 1.5 + Math.random() * 2.5,
          angle: 0,
          size: 34
        };
      }
      rand -= item.weight;
    }
    return ITEM_TYPES[0];
  }

  spawnItems() {
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.items.push(this.getRandomItem());
      // Plus le temps passe, plus le rythme s'accélère légèrement
      if (this.timeLeft < 20 && Math.random() < 0.4) {
        this.items.push(this.getRandomItem());
      }
    }
  }

  addParticles(x, y, color) {
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.7) * 6,
        radius: Math.random() * 4 + 2,
        color: color,
        life: 1,
        decay: 0.03 + Math.random() * 0.02
      });
    }
  }

  addFloatingText(text, x, y, isPositive) {
    this.floatingTexts.push({
      text: text,
      x: x,
      y: y,
      alpha: 1,
      color: isPositive ? '#b45309' : '#dc2626'
    });
  }

  checkCollision(item) {
    // Boîte de collision du panier
    const basketBox = {
      x: this.basket.x,
      y: this.basket.y,
      width: this.basket.width,
      height: this.basket.height
    };

    // Item considéré comme un cercle centré
    const itemCenter = { x: item.x, y: item.y };
    const closeX = Math.max(basketBox.x, Math.min(itemCenter.x, basketBox.x + basketBox.width));
    const closeY = Math.max(basketBox.y, Math.min(itemCenter.y, basketBox.y + basketBox.height));
    const distX = itemCenter.x - closeX;
    const distY = itemCenter.y - closeY;
    const distance = Math.sqrt((distX * distX) + (distY * distY));

    return distance < (item.size / 2);
  }

  update() {
    // Mouvement clavier
    if (this.keys.left) {
      this.basket.targetX -= this.basket.speed;
    }
    if (this.keys.right) {
      this.basket.targetX += this.basket.speed;
    }

    // Limites de l'écran
    this.basket.targetX = Math.max(10, Math.min(this.canvas.width - this.basket.width - 10, this.basket.targetX));

    // Lissage du déplacement (lerp)
    this.basket.x += (this.basket.targetX - this.basket.x) * 0.28;

    this.spawnItems();

    // Mise à jour des items qui tombent
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.y += it.speedY;
      it.angle += it.swaySpeed;
      it.x += Math.sin(it.angle) * it.swayAmp;

      // Collision avec le panier
      if (this.checkCollision(it)) {
        if (it.bad) {
          playSfx('bad');
          this.score = Math.max(0, this.score + it.points);
          this.addFloatingText(`${it.points}`, it.x, it.y, false);
          this.addParticles(it.x, it.y, '#ff4d6d');
        } else {
          if (it.points >= 40) {
            playSfx('bonus');
          } else {
            playSfx('catch');
          }
          this.score += it.points;
          this.addFloatingText(`+${it.points}`, it.x, it.y, true);
          this.addParticles(it.x, it.y, '#ffd166');
        }
        this.updateUI();
        this.items.splice(i, 1);
        continue;
      }

      // Sortie de l'écran
      if (it.y > this.canvas.height + 40) {
        this.items.splice(i, 1);
      }
    }

    // Particules
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Textes flottants (+15, +40, etc.)
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 1.3;
      ft.alpha -= 0.025;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Dessin du panier festif (style nacelle dorée avec ruban)
    const bx = this.basket.x;
    const by = this.basket.y;
    const bw = this.basket.width;
    const bh = this.basket.height;

    // Ombre sous le panier
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(bx + bw / 2, by + bh + 4, bw / 2, 8, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Panier dégradé festif
    const grad = this.ctx.createLinearGradient(bx, by, bx, by + bh);
    grad.addColorStop(0, '#ffd166');
    grad.addColorStop(1, '#ff5e98');
    this.ctx.fillStyle = grad;

    // Forme arrondie du panier
    this.ctx.beginPath();
    this.ctx.roundRect(bx, by, bw, bh, [10, 10, 20, 20]);
    this.ctx.fill();
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();

    // Décoration : noeud de cadeau au centre
    this.ctx.font = '22px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('🎀', bx + bw / 2, by + bh / 2);

    // Dessin des items qui tombent
    for (const it of this.items) {
      this.ctx.font = `${it.size}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(it.emoji, it.x, it.y);
    }

    // Dessin des particules d'impact
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Dessin des textes flottants (+25, etc.)
    for (const ft of this.floatingTexts) {
      this.ctx.save();
      this.ctx.globalAlpha = ft.alpha;
      this.ctx.font = 'bold 20px Outfit, sans-serif';
      this.ctx.fillStyle = ft.color;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    }
  }

  loop() {
    if (!this.isPlaying) return;
    this.update();
    this.draw();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  updateUI() {
    const scoreEl = document.getElementById('gameScore');
    const timerEl = document.getElementById('gameTimer');
    if (scoreEl) scoreEl.textContent = this.score;
    if (timerEl) timerEl.textContent = this.timeLeft + 's';

    // Paliers de félicitations en direct
    const milestoneEl = document.getElementById('gameMilestone');
    if (milestoneEl) {
      if (this.score >= 400) {
        milestoneEl.innerHTML = '👑 <strong>Titre Légendaire :</strong> Reine Absolue de la Fête !';
      } else if (this.score >= 250) {
        milestoneEl.innerHTML = '⭐ <strong>Super Combo :</strong> Des vœux magiques en cascade !';
      } else if (this.score >= 120) {
        milestoneEl.innerHTML = '🎁 <strong>Bien joué :</strong> Les cadeaux s\'accumulent !';
      } else {
        milestoneEl.innerHTML = '✨ Attrape un maximum de surprises avant la fin du temps !';
      }
    }
  }

  endGame() {
    this.isPlaying = false;
    if (this.secondInterval) clearInterval(this.secondInterval);
    if (this.animId) cancelAnimationFrame(this.animId);

    playSfx('victory');

    // Confettis de fin de partie
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    // Affichage de l'écran de fin
    const modalEl = document.getElementById('victoryModal');
    const finalScoreEl = document.getElementById('finalScore');
    const rankTitleEl = document.getElementById('rankTitle');
    const rankBadgeEl = document.getElementById('rankBadge');

    if (finalScoreEl) finalScoreEl.textContent = this.score;

    let rank = 'Amie en Or 💛';
    let badge = '🏆 Trophée de Bronze';
    if (this.score >= 400) {
      rank = 'Reine Cosmique de l\'Anniversaire 👑';
      badge = '💎 Trophée Diamant Mythique';
    } else if (this.score >= 250) {
      rank = 'Étoile Brillante du Bonheur ⭐';
      badge = '🥇 Trophée d\'Or Suprême';
    } else if (this.score >= 120) {
      rank = 'Chasseuse de Cadeaux d\'Élite 🎁';
      badge = '🥈 Trophée d\'Argent Festif';
    }

    if (rankTitleEl) rankTitleEl.textContent = rank;
    if (rankBadgeEl) rankBadgeEl.textContent = badge;

    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = new bootstrap.Modal(modalEl);
      bsModal.show();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;

  const game = new BirthdayGame(canvas);

  // Nom de l'amie
  const savedName = localStorage.getItem('birthday_guest_name') || 'Léana';
  const nameTargets = document.querySelectorAll('.friend-name');
  nameTargets.forEach(el => el.textContent = savedName);

  // Bouton Démarrer / Rejouer
  const startBtn = document.getElementById('startGameBtn');
  const replayBtn = document.getElementById('replayGameBtn');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      document.getElementById('startOverlay').classList.add('d-none');
      game.start();
    });
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      const modalEl = document.getElementById('victoryModal');
      const bsModal = bootstrap.Modal.getInstance(modalEl);
      if (bsModal) bsModal.hide();
      game.start();
    });
  }
});
