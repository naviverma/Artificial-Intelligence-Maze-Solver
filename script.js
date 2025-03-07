// script.js
let canvas = document.getElementById("mazeCanvas");
let ctx = canvas.getContext("2d");

let rows = parseInt(document.getElementById("rows").value);
let cols = parseInt(document.getElementById("cols").value);
let branching = parseFloat(document.getElementById("branching").value);
let cellSize = canvas.width / cols; // cell size will be updated on maze generation

// Cell class represents each cell in the grid.
class Cell {
  constructor(i, j) {
    this.i = i; // column index
    this.j = j; // row index
    this.walls = [true, true, true, true]; // top, right, bottom, left
    this.visited = false;
  }

  show() {
    const x = this.i * cellSize;
    const y = this.j * cellSize;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    // Top-wall
    if (this.walls[0]) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cellSize, y);
      ctx.stroke();
    }
    // Right-wall
    if (this.walls[1]) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    // Bottom-wall
    if (this.walls[2]) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y + cellSize);
      ctx.lineTo(x, y + cellSize);
      ctx.stroke();
    }
    // Left-wall
    if (this.walls[3]) {
      ctx.beginPath();
      ctx.moveTo(x, y + cellSize);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // fill visited cells
    if (this.visited) {
      ctx.fillStyle = "lightblue";
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }
}

let grid = [];
let current;
let stack = [];

// Helper function to compute index in grid array.
function index(i, j) {
  if (i < 0 || j < 0 || i >= cols || j >= rows) return -1;
  return i + j * cols;
}

// Setup grid for maze generation.
function setupMaze() {
  grid = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      grid.push(new Cell(i, j));
    }
  }
  current = grid[0];
  stack = [];
}

// Remove walls between two neighboring cells.
function removeWalls(a, b) {
  let x = a.i - b.i;
  if (x === 1) {
    a.walls[3] = false; // remove left wall of a
    b.walls[1] = false; // remove right wall of b
  } else if (x === -1) {
    a.walls[1] = false; // remove right wall of a
    b.walls[3] = false; // remove left wall of b
  }
  let y = a.j - b.j;
  if (y === 1) {
    a.walls[0] = false; // remove top wall of a
    b.walls[2] = false; // remove bottom wall of b
  } else if (y === -1) {
    a.walls[2] = false; // remove bottom wall of a
    b.walls[0] = false; // remove top wall of b
  }
}

// Function to redraw the maze from the existing grid without the "current" cell highlight.
function redrawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let cell of grid) {
    cell.show();
  }
}

// Maze generation using recursive backtracking.
function generateMaze() {
  // Update parameters based on user input.
  rows = parseInt(document.getElementById("rows").value);
  cols = parseInt(document.getElementById("cols").value);
  branching = parseFloat(document.getElementById("branching").value);
  cellSize = canvas.width / cols;

  setupMaze();
  let generationComplete = false;

  function step() {
    if (!generationComplete) {
      current.visited = true;

      // Find all unvisited neighbors.
      let neighbors = [];
      let top = grid[index(current.i, current.j - 1)];
      let right = grid[index(current.i + 1, current.j)];
      let bottom = grid[index(current.i, current.j + 1)];
      let left = grid[index(current.i - 1, current.j)];

      if (top && !top.visited) neighbors.push(top);
      if (right && !right.visited) neighbors.push(right);
      if (bottom && !bottom.visited) neighbors.push(bottom);
      if (left && !left.visited) neighbors.push(left);

      if (neighbors.length > 0) {
        // Add branching probability to sometimes force backtracking.
        let next = neighbors[Math.floor(Math.random() * neighbors.length)];
        stack.push(current);
        removeWalls(current, next);
        current = next;
      } else if (stack.length > 0) {
        current = stack.pop();
      } else {
        generationComplete = true;
        return;
      }

      drawMaze();
      requestAnimationFrame(step);
    }
  }
  step();
}

// Draw the maze on the canvas.
function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let cell of grid) {
    cell.show();
  }

  // Highlight current cell
  const x = current.i * cellSize;
  const y = current.j * cellSize;
  ctx.fillStyle = "orange";
  ctx.fillRect(x, y, cellSize, cellSize);
}

// functions for solving algorithms.
function solveDFS() {
  // Entry aur exit cells define kar lete hain.
  let start = grid[0]; // Entry: cell at (0,0)
  let goal = grid[index(cols - 1, rows - 1)]; // Exit: bottom-right cell

  let stack = [start];
  let visited = new Set();
  let parent = new Map();
  parent.set(index(start.i, start.j), null);

  while (stack.length > 0) {
    let current = stack.pop();
    // Agar humne exit tak pahunch liya
    if (current === goal) {
      let path = [];
      let temp = current;
      while (temp != null) {
        path.push(temp);
        temp = parent.get(index(temp.i, temp.j));
      }
      path.reverse();
      drawSolution(path);
      return;
    }
    visited.add(index(current.i, current.j));

    // Chaar directions: top, right, bottom, left ke liye check karo.
    let directions = [
      { dx: 0, dy: -1, wall: 0 },  // top
      { dx: 1, dy: 0, wall: 1 },   // right
      { dx: 0, dy: 1, wall: 2 },   // bottom
      { dx: -1, dy: 0, wall: 3 }   // left
    ];

    for (let d of directions) {
      // Agar current cell ke us side pe wall nahi hai, toh neighbor accessible hai.
      if (!current.walls[d.wall]) {
        let ni = current.i + d.dx;
        let nj = current.j + d.dy;
        if (ni < 0 || nj < 0 || ni >= cols || nj >= rows) continue;
        let neighbor = grid[index(ni, nj)];
        if (!visited.has(index(ni, nj))) {
          stack.push(neighbor);
          parent.set(index(ni, nj), current);
        }
      }
    }
  }
  console.log("No solution found");
}

// Draw the solution path on the maze canvas.
function drawSolution(path) {
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.lineWidth = cellSize / 4;
  // Start point: cell center.
  let startX = path[0].i * cellSize + cellSize / 2;
  let startY = path[0].j * cellSize + cellSize / 2;
  ctx.moveTo(startX, startY);

  for (let i = 1; i < path.length; i++) {
    let x = path[i].i * cellSize + cellSize / 2;
    let y = path[i].j * cellSize + cellSize / 2;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function solveBFS() {
  // Entry: top-left cell; Exit: bottom-right cell.
  let start = grid[0];
  let goal = grid[index(cols - 1, rows - 1)];

  let queue = [start];
  let visited = new Set();
  let parent = new Map();
  parent.set(index(start.i, start.j), null);

  while (queue.length > 0) {
    let current = queue.shift();

    // Agar goal mil gaya, toh path reconstruct karo.
    if (current === goal) {
      let path = [];
      let temp = current;
      while (temp !== null) {
        path.push(temp);
        temp = parent.get(index(temp.i, temp.j));
      }
      path.reverse();
      drawSolution(path);
      return;
    }

    visited.add(index(current.i, current.j));

    // Check karo ke current cell ke chaar directions (top, right, bottom, left) accessible hain.
    let directions = [
      { dx: 0, dy: -1, wall: 0 },  // Top
      { dx: 1, dy: 0, wall: 1 },   // Right
      { dx: 0, dy: 1, wall: 2 },   // Bottom
      { dx: -1, dy: 0, wall: 3 }   // Left
    ];

    for (let d of directions) {
      // Agar wall nahi hai, matlab neighbor accessible hai.
      if (!current.walls[d.wall]) {
        let ni = current.i + d.dx;
        let nj = current.j + d.dy;
        if (ni < 0 || nj < 0 || ni >= cols || nj >= rows) continue;
        let neighbor = grid[index(ni, nj)];
        if (!visited.has(index(ni, nj)) && !parent.has(index(ni, nj))) {
          queue.push(neighbor);
          parent.set(index(ni, nj), current);
        }
      }
    }
  }
  console.log("No solution found using BFS");
}

// Heuristic function using Manhattan distance.
function heuristic(cell, goal) {
  return Math.abs(cell.i - goal.i) + Math.abs(cell.j - goal.j);
}

function solveAStar() {
  let start = grid[0];
  let goal = grid[index(cols - 1, rows - 1)];

  // openSet will hold cells to be evaluated.
  let openSet = [start];
  let cameFrom = new Map();

  // Initialize gScore and fScore maps.
  let gScore = new Map();
  let fScore = new Map();
  for (let cell of grid) {
    gScore.set(index(cell.i, cell.j), Infinity);
    fScore.set(index(cell.i, cell.j), Infinity);
  }
  gScore.set(index(start.i, start.j), 0);
  fScore.set(index(start.i, start.j), heuristic(start, goal));

  while (openSet.length > 0) {
    // Current is the cell in openSet with the lowest fScore.
    let current = openSet.reduce((prev, curr) => {
      return fScore.get(index(prev.i, prev.j)) < fScore.get(index(curr.i, curr.j)) ? prev : curr;
    });

    if (current === goal) {
      // Reconstruct path from goal to start.
      let path = [];
      let temp = current;
      while (temp !== null) {
        path.push(temp);
        temp = cameFrom.get(index(temp.i, temp.j)) || null;
      }
      path.reverse();
      drawSolution(path);
      return;
    }

    // Remove current from openSet.
    openSet = openSet.filter(cell => cell !== current);

    let directions = [
      { dx: 0, dy: -1, wall: 0 },  // Top
      { dx: 1, dy: 0, wall: 1 },   // Right
      { dx: 0, dy: 1, wall: 2 },   // Bottom
      { dx: -1, dy: 0, wall: 3 }   // Left
    ];

    for (let d of directions) {
      if (!current.walls[d.wall]) {
        let ni = current.i + d.dx;
        let nj = current.j + d.dy;
        if (ni < 0 || nj < 0 || ni >= cols || nj >= rows) continue;
        let neighbor = grid[index(ni, nj)];
        let tentative_gScore = gScore.get(index(current.i, current.j)) + 1; // Cost between cells is 1.
        if (tentative_gScore < gScore.get(index(neighbor.i, neighbor.j))) {
          cameFrom.set(index(neighbor.i, neighbor.j), current);
          gScore.set(index(neighbor.i, neighbor.j), tentative_gScore);
          fScore.set(index(neighbor.i, neighbor.j), tentative_gScore + heuristic(neighbor, goal));
          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
    }
  }
  console.log("No solution found using A*");
}

// Event listeners for buttons.
document.getElementById("generateMazeBtn").addEventListener("click", () => {
  generateMaze();
});

document.getElementById("solveMazeBtn").addEventListener("click", () => {
  redrawMaze();
  const algorithm = document.getElementById("algorithm").value;
  if (algorithm === "dfs") {
    solveDFS();
  } else if (algorithm === "bfs") {
    solveBFS();
  } else if (algorithm === "astar") {
    solveAStar();
  }
});

// Generate a maze on initial load.
generateMaze();