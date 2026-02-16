// Game state variables
let deck = [];
let playerHand = [];
let dealerHand = [];
let chips = 2000;
let currentBet = 0;
let gameActive = false;

// Card values and suits
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Create a deck of cards
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit: suit, value: value });
        }
    }
    shuffleDeck();
}

// Shuffle the deck
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Calculate hand value
function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;
    
    for (let card of hand) {
        if (card.value === 'A') {
            aces++;
            value += 11;
        } else if (['J', 'Q', 'K'].includes(card.value)) {
            value += 10;
        } else {
            value += parseInt(card.value);
        }
    }
    
    // Adjust for aces
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }
    
    return value;
}

// Display a card on screen
function displayCard(card, container) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    
    // Red suits
    if (card.suit === '♥' || card.suit === '♦') {
        cardDiv.classList.add('red');
    }
    
    cardDiv.textContent = card.value + card.suit;
    container.appendChild(cardDiv);
}

// Update the display
function updateDisplay() {
    // Clear card displays
    document.getElementById('playerCards').innerHTML = '';
    document.getElementById('dealerCards').innerHTML = '';
    
    // Show player cards
    for (let card of playerHand) {
        displayCard(card, document.getElementById('playerCards'));
    }
    
    // Show dealer cards
    for (let i = 0; i < dealerHand.length; i++) {
        if (i === 0 && gameActive) {
            // Hide first dealer card during game
            const hiddenCard = document.createElement('div');
            hiddenCard.className = 'card';
            hiddenCard.textContent = '?';
            hiddenCard.style.backgroundColor = '#1a472a';
            hiddenCard.style.color = 'white';
            document.getElementById('dealerCards').appendChild(hiddenCard);
        } else {
            displayCard(dealerHand[i], document.getElementById('dealerCards'));
        }
    }
    
    // Update scores
    document.getElementById('playerScore').textContent = calculateHandValue(playerHand);
    
    if (gameActive) {
        // Only show second card value while game is active
        const visibleCards = dealerHand.slice(1);
        document.getElementById('dealerScore').textContent = calculateHandValue(visibleCards);
    } else {
        document.getElementById('dealerScore').textContent = calculateHandValue(dealerHand);
    }
    
    // Update chips and bet
    document.getElementById('chips').textContent = chips;
    document.getElementById('currentBet').textContent = currentBet;
}

// Place a bet
function placeBet(amount) {
    if (chips >= amount) {
        currentBet += amount;
        chips -= amount;
        updateDisplay();
        document.getElementById('message').textContent = `Bet placed: $${currentBet}. Click Deal to start!`;
    } else {
        document.getElementById('message').textContent = 'Not enough chips!';
    }
}

// Start a new game
function startGame() {
    if (currentBet === 0) {
        document.getElementById('message').textContent = 'Place a bet first!';
        return;
    }
    
    gameActive = true;
    createDeck();
    playerHand = [];
    dealerHand = [];
    
    // Deal initial cards
    playerHand.push(deck.pop());
    dealerHand.push(deck.pop());
    playerHand.push(deck.pop());
    dealerHand.push(deck.pop());
    
    updateDisplay();
    
    // Switch to game controls
    document.getElementById('bettingControls').style.display = 'none';
    document.getElementById('gameControls').style.display = 'block';
    
    // Check for blackjack
    if (calculateHandValue(playerHand) === 21) {
        stand();
    } else {
        document.getElementById('message').textContent = 'Hit or Stand?';
    }
}

// Player hits
function hit() {
    playerHand.push(deck.pop());
    updateDisplay();
    
    if (calculateHandValue(playerHand) > 21) {
        endGame('You busted! Dealer wins.');
    }
}

// Player stands
function stand() {
    gameActive = false;
    
    // Dealer draws until 17 or higher
    while (calculateHandValue(dealerHand) < 17) {
        dealerHand.push(deck.pop());
    }
    
    updateDisplay();
    
    // Determine winner
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    
    if (dealerValue > 21) {
        endGame('Dealer busted! You win!');
    } else if (playerValue > dealerValue) {
        endGame('You win!');
    } else if (playerValue < dealerValue) {
        endGame('Dealer wins!');
    } else {
        endGame('Push! It\'s a tie.');
    }
}

// End the game
function endGame(message) {
    gameActive = false;
    updateDisplay();
    
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    
    // Calculate winnings
    if (message.includes('You win')) {
        if (playerValue === 21 && playerHand.length === 2) {
            // Blackjack pays 3:2
            chips += currentBet * 2.5;
            message = 'Blackjack! You win!';
        } else {
            chips += currentBet * 2;
        }
    } else if (message.includes('tie')) {
        // Return bet on push
        chips += currentBet;
    }
    
    document.getElementById('message').textContent = message;
    currentBet = 0;
    
    // Switch back to betting controls
    document.getElementById('bettingControls').style.display = 'block';
    document.getElementById('gameControls').style.display = 'none';
    
    updateDisplay();
}

// Reset chips back to starting amount
function resetChips() {
    chips = 2000;
    currentBet = 0;
    updateDisplay();
    document.getElementById('message').textContent = 'Chips reset to $2000. Place your bet!';
}
// Initialize the game
updateDisplay();