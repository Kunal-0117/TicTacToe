let boxes = document.getElementsByClassName("box");
let flag = true;
let cTurn = false;
let pvp = false;
let board = [0, 1, 2, 3, 4, 5, 6, 7, 8];

//Game Modes
let impossible = false;
let hard = false;
let medium = false;

function color(i, type) {
  //coloring text semi-white
  for (let box of boxes) {
    box.style.color = "var(--grid-lost-font)";
  }
  let wonColor = "var(--grid-won-font)";

  //coloring green color to the winning one.
  if (type == "r") {
    for (let box of document.querySelectorAll(`.box[data-r='${i}']`)) {
      box.style.color = wonColor;
    }
  } else if (type == "c") {
    for (let box of document.querySelectorAll(`.box[data-c='${i}']`)) {
      box.style.color = wonColor;
    }
  } else if (type == "d" && i == 0) {
    for (let j = 0; j < 3; j++) {
      document.querySelector(`.box[data-r='${j}'][data-c='${j}']`).style.color =
        wonColor;
    }
  } else {
    for (let j = 0; j < 3; j++) {
      document.querySelector(
        `.box[data-r='${j}'][data-c='${2 - j}']`
      ).style.color = wonColor;
    }
  }
}

function winTextColor() {
  // Checking all rows
  if (board[0] == board[1] && board[1] == board[2]) color(0, "r");
  else if (board[3] == board[4] && board[4] == board[5]) color(1, "r");
  else if (board[6] == board[7] && board[7] == board[8]) color(2, "r");
  //checking all columns
  else if (board[0] == board[3] && board[3] == board[6]) color(0, "c");
  else if (board[1] == board[4] && board[4] == board[7]) color(1, "c");
  else if (board[2] == board[5] && board[5] == board[8]) color(2, "c");
  //checking diagonals
  else if (board[0] == board[4] && board[4] == board[8]) color(0, "d");
  else color(1, "d");
}

function trigger(caller) {
  let text = flag ? "X" : "O";
  caller.style.color = flag
    ? "var(--grid-first-player-font)"
    : "var(--grid-second-player-font)";
  caller.textContent = text;
  board[caller.id] = text;
  flag = !flag;

  if (trigger.count === undefined) {
    trigger.count = 0;
  }

  trigger.count++;

  if (trigger.count >= 4) {
    let result = winning(board);

    if (result) {
      winTextColor();
      let winScreen = document.getElementById("win");
      winScreen.querySelector("h1").innerText = `${result} Won!`;
      winScreen.classList.add("visible");
      return;
    }
  }

  //change color of text to black when there is a tie;
  if (trigger.count == 9) {
    for (let box of boxes) {
      box.style.color = "var(--grid-tie-font)";
    }
    document.getElementById("tie").classList.add("visible");
    return;
  }

  //if Player vs CPU, then this condtion is true;

  if (!pvp) {
    cTurn = cTurn ? false : true;

    if (cTurn) {
      let waitTime = Math.floor(200 + Math.random() * 1500);
      setTimeout(function () {
        cpuChoice(caller);
      }, waitTime);
    }
  }
}

function playerMove() {
  if (!cTurn && !this.textContent) {
    trigger(this);
  }
}

function cpuChoice(playerChoice = null) {
  let box;

  //impossible
  if (impossible) {
    box = boxes[minimax(board, "O").index];
    trigger(box);
    return;
  }

  if (!impossible) {
    if (cpuChoice.count === undefined) {
      cpuChoice.count = 0;
    }
    cpuChoice.count++;

    //Hard.
    if (hard && cpuChoice.count == 1) {
      let cond1 = playerChoice.dataset.c;
      let cond2 = playerChoice.dataset.r;

      if (!(cond1 % 2) && cond2 != 1) {
        box = boxes[4];
        rand = 0;
        trigger(box);
        return;
      } else if (cond1 == cond2 && cond1 == 1) {
        let cornerIndex = Math.floor(Math.random() * 4);
        let corners = [0, 2, 6, 8];
        box = boxes[corners[cornerIndex]];
        trigger(box);
        return;
      }
    }

    //Medium
    if (medium && cpuChoice.count >= 2) {
      let unfilledBoxes = avail(board);

      for (let turn of ["O", "X"]) {
        for (boxNumber of unfilledBoxes) {
          board[boxNumber] = turn;
          if (winning(board)) {
            board[boxNumber] = boxNumber;
            box = boxes[boxNumber];
            trigger(box);
            return;
          }
          board[boxNumber] = boxNumber;
        }
      }
    }

    //Easy.
    //Random choice.
    let unfilledBoxes = Array.from(boxes).filter((box) => {
      if (!box.textContent) return box;
    });
    box = unfilledBoxes[Math.floor(Math.random() * unfilledBoxes.length)];
    trigger(box);
  }
}

function resetGame() {
  for (let box of boxes) {
    box.textContent = "";
    box.removeAttribute("style");
  }

  flag = true;
  cTurn = false;
  cpuChoice.count = 0;
  trigger.count = 0;
  board = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  document.querySelector(".visible").classList.remove("visible");
}

function minimax(reboard, player) {
  let huPlayer = "X";
  let aiPlayer = "O";
  let array = avail(reboard);
  let result = winning(reboard);
  if (result) {
    if (result == "X") {
      return {
        score: -10,
      };
    } else {
      return {
        score: 10,
      };
    }
  } else if (array.length === 0) {
    return {
      score: 0,
    };
  }

  var moves = [];
  for (var i = 0; i < array.length; i++) {
    var move = {};
    move.index = reboard[array[i]];
    reboard[array[i]] = player;

    if (player == aiPlayer) {
      var g = minimax(reboard, huPlayer);
      move.score = g.score;
    } else {
      var g = minimax(reboard, aiPlayer);
      move.score = g.score;
    }
    reboard[array[i]] = move.index;
    moves.push(move);
  }

  var bestMove;
  if (player === aiPlayer) {
    var bestScore = -10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    var bestScore = 10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}

//available spots
function avail(reboard) {
  return reboard.filter((s) => s != "X" && s != "O");
}

// winning combinations
function winning(board) {
  let winEle = "";
  if (board[0] && board[0] == board[1] && board[1] == board[2])
    winEle = board[0];
  else if (board[3] && board[3] == board[4] && board[4] == board[5])
    winEle = board[3];
  else if (board[6] && board[6] == board[7] && board[7] == board[8])
    winEle = board[6];
  else if (board[0] && board[0] == board[3] && board[3] == board[6])
    winEle = board[0];
  else if (board[1] && board[1] == board[4] && board[4] == board[7])
    winEle = board[1];
  else if (board[2] && board[2] == board[5] && board[5] == board[8])
    winEle = board[2];
  else if (board[0] && board[0] == board[4] && board[4] == board[8])
    winEle = board[0];
  else if (board[2] && board[2] == board[4] && board[4] == board[6])
    winEle = board[2];
  return winEle;
}

//Event Listeners

//Boxes
for (let box of boxes) {
  box.addEventListener("click", playerMove);
}

//Buttons
const replays = document.getElementsByClassName("replay");
Array.from(replays).forEach((replay) => {
  replay.addEventListener("click", resetGame);
});

const homes = document.getElementsByClassName("home");
Array.from(homes).forEach(function (home) {
  home.addEventListener("click", function () {
    impossible = false;
    hard = false;
    medium = false;
    resetGame();

    //intro screen.
    document.getElementById("intro").classList.add("visible");
  });
});

const pvpPlay = document.getElementById("pvpPlay");
pvpPlay.addEventListener("click", function () {
  pvp = true;
  document.getElementById("intro").classList.remove("visible");
});

const cpuPlay = document.getElementById("cpuPlay");
cpuPlay.addEventListener("click", function () {
  pvp = false;
  document.getElementById("intro").classList.remove("visible");
  document.getElementById("difficulty").classList.add("visible");
});

//Modes
document.getElementById("easyMode").addEventListener("click", function () {
  document.getElementById("difficulty").classList.remove("visible");
});

document.getElementById("mediumMode").addEventListener("click", function () {
  medium = true;
  document.getElementById("difficulty").classList.remove("visible");
});

document.getElementById("hardMode").addEventListener("click", function () {
  hard = true;
  medium = true;
  document.getElementById("difficulty").classList.remove("visible");
});

document
  .getElementById("impossibleMode")
  .addEventListener("click", function () {
    impossible = true;
    document.getElementById("difficulty").classList.remove("visible");
  });

// Theme Button
let themeBtn = document.getElementById("themeBtn");
themeBtn.addEventListener("change", changeTheme);
function changeTheme() {
  let mode = this.checked ? "add" : "remove";
  document.querySelector(":root").classList[mode]("dark");
}
