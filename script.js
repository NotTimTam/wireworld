// Display data.
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");
let size = 25;
let game = [];
let colors = ["#00000000", "#4555e4", "#ef476f", "#ffd166"];
// 0 = empty, 1 = electron head, 2 = electron tail, 3 = connector.

function display(array) {
    // Clear canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Loop through each column in each row, and display a different character based on its state.
    for (let row = 0; row < array.length; row++) {
        for (let column = 0; column < array[row].length; column++) {
            let color;
            color = colors[game[row][column]];
            ctx.fillStyle = color;
            ctx.fillRect(column * 5, row * 5, 5, 5);
        }
    }
}

function createGame(size) {
    // Create a 2D array of the given size with all empty cells.
    let gameExport = [];
    for (let row = 0; row < size; row++) {
        let newRow = [];
        for (let column = 0; column < size; column++) {
            // Create an empty cell at each location.
            let randNum = Math.ceil(Math.random() * 100);

            // newRow.push(0);
            newRow.push(0);
        }
        gameExport.push(newRow);
    }

    // Set up the canvas.
    canvas.setAttribute("width", size*5);
    canvas.setAttribute("height", size*5);

    // Return the array.
    return gameExport;
}

// Do initial setup.
game = createGame(size);
display(game);

// MOUSE INFO.
let mouseDown = false;
let cursor = {
    worldToGrid() {
        // this.canvX = (((this.x / 500) * (size*2))).toFixed(0);
        // this.canvY = (((this.y / 500) * (size*2))).toFixed(0);

        this.canvX = Math.floor((this.x / 500) * size);
        this.canvY = Math.floor((this.y / 500) * size);
    
        return this;
    }
};
function updateCursor(e) {
    let rect = e.target.getBoundingClientRect();

    cursor.x = (e.clientX - rect.left);
    cursor.y = (e.clientY - rect.top);
}
canvas.addEventListener("mousedown", function (evt) {
    updateCursor(evt);

    // 0 = empty, 1 = electron head, 2 = electron tail, 3 = connector.
    if (evt.button === 0) {
        game[cursor.worldToGrid().canvY][cursor.worldToGrid().canvX] = 3;
    } else if (evt.button === 1) {
        game[cursor.worldToGrid().canvY][cursor.worldToGrid().canvX] = 0;
    } else if (evt.button === 2) {
        game[cursor.worldToGrid().canvY][cursor.worldToGrid().canvX] = 1;
    }
});
window.addEventListener('contextmenu', function (e) { 
    // do something here... 
    e.preventDefault(); 
}, false);

// Functionality
function getNeighbors(x, y) {
    // Find the eight neighbors adjacent to a given cell.
    let neighbors = [];
    
    // All eight nearest neighbors.

    if (y+1 >= game.length) {
        neighbors.push(game[0][x]);
    } else {
        neighbors.push(game[y+1][x]);
    }

    if (y-1 < 0) {
        neighbors.push(game[game.length-1][x]);
    } else {
        neighbors.push(game[y-1][x]);
    }

    if (x+1 >= game[y].length) {
        neighbors.push(game[y][0]);
    } else {
        neighbors.push(game[y][x+1]);
    }

    if (x-1 < 0) {
        neighbors.push(game[y][game[y].length-1]);
    } else {
        neighbors.push(game[y][x-1]);
    }
    
    // Diagonal neighbors.
    try {
        neighbors.push(game[y+1][x+1]);
    } catch {
        
    }
    try {
        neighbors.push(game[y+1][x-1]);
    } catch {
        
    }
    try {
        neighbors.push(game[y-1][x+1]);
    } catch {
        
    }
    try {
        neighbors.push(game[y-1][x-1]);
    } catch {
        
    }

    return neighbors;
}

// ES6 for counting occurences of value in array.
const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

let canRunIter = true;
function runIteration() {
    if (canRunIter) {
        // Run through and set the status of every element in the game.
        canRunIter = false;

        // Create lists of items that need to be changed.
        let headsToTails = [];
        let tailsToConnectors = [];
        let connectorsToHeads = [];
        
        // Loop through each column in each row, check the status of the cell in that position.
        for (let row = 0; row < game.length; row++) {
            for (let column = 0; column < game[row].length; column++) {
                // Get the given cells living neighbor count.
                let neighbors = getNeighbors(column, row);

                // Get the given cells current state.
                let cellStatus = game[row][column];
                // 0 = empty, 1 = electron head, 2 = electron tail, 3 = connector.

                // Run through the rules and see which apply. Note that there is a one in 100 chance of a cell not being the same color as its parents.
                switch(cellStatus) {
                    case 1:
                        // If head.
                        headsToTails.push([column, row]);
                        break;
                    case 2:
                        // If tail.
                        tailsToConnectors.push([column, row]);
                        break;
                    case 3:
                        // If connector.
                        if (countOccurrences(neighbors, 1) == 1 || countOccurrences(neighbors, 1) == 2) {
                            connectorsToHeads.push([column, row]);
                        }
                        break;
                    default:
                        break;
                }
            }
        }

        // Convert all (required) connectors to heads.
        for (let i = 0; i < connectorsToHeads.length; i++) {
            game[connectorsToHeads[i][1]][connectorsToHeads[i][0]] = 1;
        }

        // Convert all tails to connectors.
        for (let i = 0; i < tailsToConnectors.length; i++) {
            game[tailsToConnectors[i][1]][tailsToConnectors[i][0]] = 3;
        }

        // Convert all heads to tails.
        for (let i = 0; i < headsToTails.length; i++) {
            game[headsToTails[i][1]][headsToTails[i][0]] = 2;
        }


        display(game);

        console.log("Ran iteration.");

        canRunIter = true;
        return;
    }
    return; // If we can't run an iteration, we just return...
}

// Run an iteration every X milliseconds.
window.setInterval(runIteration, 50);