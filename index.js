const tiles = document.querySelectorAll(".tile");
const PLAYER_X = 'X';
const PLAYER_O = 'O';
let turn = PLAYER_X;
let IS_MULTIPLAYER_MODE = false;

const boardState = Array(tiles.length);
boardState.fill(null);
const previousStates = [];


//Elements
const strike = document.getElementById("strike");
const gameOverArea = document.getElementById("game-over-area");
const gameOverText = document.getElementById("game-over-text");
const playButton = document.getElementById("play-again");
const single = document.getElementById("single");
const multi = document.getElementById("multi");
const undo = document.getElementById("undo");
const restart = document.getElementById("restart");


playButton.addEventListener("click", startNewGame);
single.addEventListener("click", singlePlayerGame);
multi.addEventListener("click", multiPlayerGame);
undo.addEventListener("click", undoGame);
restart.addEventListener("click", startNewGame);

const menuSound = new Audio('sounds/menu.wav');
const gameOverSound = new Audio('sounds/game_over.wav');
const click1 = new Audio('sounds/click1.wav');
const click2 = new Audio('sounds/click2.wav');

tiles.forEach((tile) => tile.addEventListener("click", tileClick));

function startNewGame() {
    strike.className = "strike";
    gameOverArea.className = "hidden";
    boardState.fill(null);
    previousStates.splice(0, previousStates.length);
    tiles.forEach((tile) => tile.innerText = "");
    turn = PLAYER_X;
    setHoverText();
    if(IS_MULTIPLAYER_MODE) {
        single.className = 'inactive';
        multi.className = 'active';
    } else {
        single.className = 'active';
        multi.className = 'inactive';
    }
    menuSound.play();
}

function singlePlayerGame() {
    IS_MULTIPLAYER_MODE = false;
    startNewGame();
}

function multiPlayerGame() {
    IS_MULTIPLAYER_MODE = true;
    startNewGame();
}

function undoGame() {
    let state = previousStates.pop();
    if(!state || gameOverArea.classList.contains('visible')) {
        return;
    }

    for (let index = 0; index < state.length; index++) {
        if(state[index] !== null) {
            tiles[index].innerText = state[index];
        } else {
            tiles[index].innerText = "";
        }
        boardState[index] = state[index];
    }
    menuSound.play();
}

function setHoverText() {
    const hoverClass = `${turn.toLowerCase()}-hover`;

    tiles.forEach(tile => {
        tile.classList.remove("x-hover");
        tile.classList.remove("o-hover");
        if(tile.innerText == "") {
            tile.classList.add(hoverClass);
        }
    });
}

setHoverText();

function tileClick(event) {
    if(gameOverArea.classList.contains('visible')) {
        return;
    }

    const tile = event.target;
    const tileNumber = tile.dataset.index;
    if(tile.innerText != "") {
        return;
    }

    if(turn === PLAYER_X) {
        updatePreviousState();
        tile.innerText = PLAYER_X;
        boardState[tileNumber-1] = PLAYER_X;
        turn = PLAYER_O;
        click1.play();
    } else {
        if(IS_MULTIPLAYER_MODE) {
            updatePreviousState();
        }
        tile.innerText = PLAYER_O;
        boardState[tileNumber-1] = PLAYER_O;
        turn = PLAYER_X;
        click2.play();
    }

    setHoverText();
    const isFinished = checkWinner();
    if(!isFinished && turn === PLAYER_O && !IS_MULTIPLAYER_MODE) {
        botClick();
    }
}

function updatePreviousState() {
    let currentState = JSON.parse(JSON.stringify(boardState));
    previousStates.push(currentState);
}

function botClick() {
    const random = Math.floor(Math.random() * tiles.length);
    const tile = tiles[random];
    if(tiles[random].innerText !== "") {
        botClick();
    }

    tile.click();
}

function checkWinner() {
    // Check for a winner
    for (const winningCombination of winningCombinations) {
        //Object Destructuring
        const { combo, strikeClass } = winningCombination;
        const tileValue1 = boardState[combo[0] - 1];
        const tileValue2 = boardState[combo[1] - 1];
        const tileValue3 = boardState[combo[2] - 1];

        if(tileValue1 != null && tileValue1 === tileValue2 && tileValue2 === tileValue3) {
            strike.classList.add(strikeClass);
            gameOverScreen(tileValue1);
            return true;
        }
    }

    //Check for a draw
    const allTileFilledIn = boardState.every((tile) => tile !== null);
    if(allTileFilledIn) {
        gameOverScreen(null);
        return true;
    }

    return false;
}

function gameOverScreen(winnerText) {
    let text = 'Draw!';
    if(winnerText != null) {
        text = `Winner is ${winnerText}`;
    }
    gameOverArea.className = "visible";
    gameOverText.innerText = text;
    gameOverSound.play();
}
 
const winningCombinations = [
    //rows
    { combo: [1, 2, 3], strikeClass: "strike-row-1" },
    { combo: [4, 5, 6], strikeClass: "strike-row-2" },
    { combo: [7, 8, 9], strikeClass: "strike-row-3" },
    //columns
    { combo: [1, 4, 7], strikeClass: "strike-column-1" },
    { combo: [2, 5, 8], strikeClass: "strike-column-2" },
    { combo: [3, 6, 9], strikeClass: "strike-column-3" },
    //diagonals
    { combo: [1, 5, 9], strikeClass: "strike-diagonal-1" },
    { combo: [3, 5, 7], strikeClass: "strike-diagonal-2" },
];