// Date à partir de laquelle le jeu sera accessible (format : AAAA-MM-JJ)
const DATE_ACCES = "2026-05-22"; // Remplace par la date de l'anniversaire

// Vérifie si la date actuelle est égale ou postérieure à la date d'accès
function checkDate() {
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    const dateAcces = new Date(DATE_ACCES);
    dateAcces.setHours(0, 0, 0, 0);

    if (aujourdhui.getTime() < dateAcces.getTime()) {
        document.body.innerHTML = `
            <div class="container py-5">
                <div class="text-center">
                    <h1 class="text-pink mb-4">Trop tôt ! Patiente encore un peu...</h1>
                    <p class="fs-4">Reviens à partir du ${dateAcces.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} !</p>
                    <img src="https://media.giphy.com/media/l0HlNaQ6gWfllcjDO/giphy.gif" alt="Attends un peu !" class="img-fluid rounded" style="width: 300px;">
                </div>
            </div>
        `;
        return false;
    }
    return true;
}

// Lance la vérification dès le chargement de la page
if (!checkDate()) {
    throw new Error("Date non autorisée");
}

// Remplace par le prénom de ton amie (en majuscules)
const PRENOM = "LÉANA ♥!";
const memoryGrid = document.getElementById('memory-grid');
const starsContainer = document.getElementById('stars-container');
const prenomContainer = document.getElementById('prenom-container');
const message = document.getElementById('message');

// Cartes pour le mémori (paires d'emojis)
const cardsContent = ['🎂', '🎂', '🎉', '🎉', '💖', '💖', '🎁', '🎁', '🎈', '🎈', '🎊', '🎊', '💝', '💝', '🥳', '🥳'];
let cards = [];
let flippedCards = [];
let stars = [];
let revealedLetters = 0;

// Initialise le mémori
function initMemory() {
    cardsContent.sort(() => Math.random() - 0.5);
    memoryGrid.innerHTML = '';
    cardsContent.forEach((content, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.content = content;
        card.innerHTML = `
            <div class="card-face card-back">?</div>
            <div class="card-face card-front">${content}</div>
        `;
        card.onclick = () => flipCard(card);
        memoryGrid.appendChild(card);
    });
}

// Retourne une carte
function flipCard(card) {
    if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
        card.classList.add('flipped');
        flippedCards.push(card);
        if (flippedCards.length === 2) {
            setTimeout(checkMatch, 1000);
        }
    }
}

// Vérifie si les deux cartes retournées sont identiques
function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.content === card2.dataset.content) {
        addStar();
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }
    flippedCards = [];
}

// Ajoute une étoile à la collection
function addStar() {
    const star = document.createElement('div');
    star.className = 'star';
    star.textContent = '⭐';
    star.onclick = () => revealLetter(star);
    starsContainer.appendChild(star);
    stars.push(star);
}

// Révèle une lettre du prénom quand on clique sur une étoile
function revealLetter(star) {
    if (revealedLetters < PRENOM.length) {
        const letter = document.createElement('div');
        letter.className = 'letter';
        letter.textContent = PRENOM[revealedLetters];
        prenomContainer.appendChild(letter);
        letter.style.display = 'block';

        // Ajoute la classe "revealed" pour agrandir la lettre
        setTimeout(() => {
            letter.classList.add('revealed');
        }, 10);

        starsContainer.removeChild(star);
        revealedLetters++;
        if (revealedLetters === PRENOM.length) {
            setTimeout(showMessage, 500);
        }
    }
}

// Affiche le message final et l'animation de confettis
function showMessage() {
    message.classList.remove('d-none');
    confetti({
        particleCount: 350,
        spread: 110,
        origin: { y: 0.7 },
        colors: ['#ff9a8b', '#ffd166', '#06d6a0', '#4cc9f0', '#f0f0f0'],
        shapes: ['circle', 'square', 'star', 'heart'],
        scalar: 1.6
    });
}

// Lance le jeu
initMemory();