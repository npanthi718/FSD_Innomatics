let selectedCategory = '';
let cardArray = [];
let flippedCards = [];
let matchedCards = 0;
let score = 0;
let timer = 30;
let gameInterval;
let gameEnded = false;
let soundFlip = new Audio('assets/flip-sound.mp3');
let soundMatch = new Audio('assets/match-sound.mp3');
let soundEnd = new Audio('assets/game-over.mp3');

const categories = {
    fruits: ['🍎', '🍌', '🍇', '🍍', '🍑', '🍒', '🍓', '🍉'],
    emojis: ['😊', '😂', '😢', '😍', '😎', '🤩', '🤔', '😱'],
    animals: ['🐱', '🐶', '🐭', '🐹', '🐰', '🐻', '🦊', '🐸'],
    planets: ['🌍', '🌑', '🌕', '🌟', '🪐', '🌌', '🌒', '🌚'],
    flags: ['🚩', '🎌', '🏳️‍🌈', '🏴', '🏳️', '🏳️‍⚧️', '🏁', '🏴']
};

window.onload = () => {
    const savedState = JSON.parse(localStorage.getItem('memoryMatchGameState'));
    if (savedState) {
    selectedCategory = savedState.selectedCategory;
    cardArray = savedState.cardArray;
    score = savedState.score;
    matchedCards = savedState.matchedCards;
    timer = savedState.timer;
    flippedCards = savedState.flippedCards;

    if (selectedCategory && cardArray.length > 0) {
        document.querySelector('.category-selection').style.display = 'none';
        document.querySelector('.game').style.display = 'block';
        document.getElementById('score').textContent = `Score: ${score}`;
        document.getElementById('timer').textContent = `Time: ${timer}s`;
        createCards();
      startTimer(true); // Restart the timer if loaded
    }
}
};

document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', startGame);
});

document.getElementById('restart-btn').addEventListener('click', restartGame);

function startGame(event) {
    selectedCategory = event.target.dataset.category;
    cardArray = shuffle([...categories[selectedCategory], ...categories[selectedCategory]]);
    matchedCards = 0;
    score = 0;
    timer = 30;
    gameEnded = false;

    saveGameState();
    document.querySelector('.category-selection').style.display = 'none';
    document.querySelector('.game').style.display = 'block';
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('timer').textContent = `Time: ${timer}s`;
    document.getElementById('end-message').style.display = 'none';

    createCards();
    startTimer();
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function createCards() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';

    cardArray.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.setAttribute('data-id', index);
        cardElement.textContent = '?';
        cardElement.addEventListener('click', handleCardClick);
        gameBoard.appendChild(cardElement);
    });
}

function handleCardClick(event) {
    if (gameEnded || flippedCards.length === 2 || event.target.classList.contains('flipped')) {
        return;
    }

    const card = event.target;
    const cardId = card.getAttribute('data-id');
    card.textContent = cardArray[cardId];
    card.classList.add('flipped');
    flippedCards.push(card);

    soundFlip.play();

    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

function checkForMatch() {
    if (flippedCards[0].textContent === flippedCards[1].textContent) {
        soundMatch.play();
        matchedCards++;
        score += 10;
        document.getElementById('score').textContent = `Score: ${score}`;

        flippedCards.forEach(card => card.removeEventListener('click', handleCardClick));
        flippedCards = [];

        saveGameState();

        if (matchedCards === cardArray.length / 2) {
        gameOver('You Win!');
        }
    } else {
        setTimeout(() => {
        flippedCards.forEach(card => {
            card.textContent = '?';
            card.classList.remove('flipped');
        });
        flippedCards = [];
        }, 1000);
    }
}

function startTimer(isReloaded = false) {
    gameInterval = setInterval(() => {
        if (!isReloaded) {
        timer--;
        }
        document.getElementById('timer').textContent = `Time: ${timer}s`;

        if (timer <= 0) {
        gameOver('Game Over');
        }

        saveGameState();
    }, 1000);
}

function gameOver(message) {
    clearInterval(gameInterval);
    gameEnded = true;
    document.getElementById('end-message').style.display = 'block';
    document.getElementById('end-message').querySelector('h2').textContent = message;
    document.getElementById('score').textContent = `You have scored ${score}`;
    soundEnd.play();

    saveGameState();
}

function restartGame() {
    localStorage.removeItem('memoryMatchGameState');
    window.location.href = 'index.html'; // Redirect to main page
}

function saveGameState() {
    const gameState = {
        selectedCategory,
        score,
        matchedCards,
        timer
    };

    // Retrieve any previous game records and add the new one
    let gameRecords = JSON.parse(localStorage.getItem('memoryMatchGameRecords')) || [];
    gameRecords.push(gameState);

    // Save the updated game records back to localStorage
    localStorage.setItem('memoryMatchGameRecords', JSON.stringify(gameRecords));
}

