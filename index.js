const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("scoreDisplay");
const gameOverUI = document.getElementById("gameOverUI");
const pauseUI = document.getElementById("pauseUI");
const restartBtn = document.getElementById("restartBtn");
const resumeBtn = document.getElementById("resumeBtn");

const BASE_GAME_SPEED = 4;
const MAX_PROGRESSIVE_SPEED = 10;
let currentSpeedMultiplier = 1;

// Progressive speed increase over time
let progressiveSpeedMultiplier = 1;

let speedEffectTimer = 0;
let freezeEffectTimer = 0;
let droughtEffectTimer = 0;
let oilEffectTimer = 0;

class Player {
  constructor() {
    this.x = canvas.width / 2;
    this.y = 150;
    this.baseRadius = 15;
    this.radius = this.baseRadius;
    this.speed = 6;
    this.dx = 0;
    this.color = "#3498db";
  }

  update() {
    this.dx = 0;

    let currentSpeed = freezeEffectTimer > 0 ? this.speed / 2.5 : this.speed;

    let leftPressed = keys.ArrowLeft;
    let rightPressed = keys.ArrowRight;

    if (oilEffectTimer > 0) {
      leftPressed = keys.ArrowRight;
      rightPressed = keys.ArrowLeft;
    }

    if (leftPressed) this.dx -= currentSpeed;
    if (rightPressed) this.dx += currentSpeed;

    this.x += this.dx;

    if (this.x - this.radius < 0) this.x = this.radius;
    if (this.x + this.radius > canvas.width) this.x = canvas.width - this.radius;
  }

  draw(ctx) {
    const r = this.radius;

    // Draw a cute teardrop / water drop shape instead of a flat circle
    ctx.fillStyle = freezeEffectTimer > 0 ? "#81ecec" : this.color;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - r * 1.3); // Top pointed tip
    ctx.bezierCurveTo(
      this.x + r * 1.1,
      this.y - r * 0.3,
      this.x + r * 1.1,
      this.y + r * 1.1,
      this.x,
      this.y + r * 1.1
    );
    ctx.bezierCurveTo(
      this.x - r * 1.1,
      this.y + r * 1.1,
      this.x - r * 1.1,
      this.y - r * 0.3,
      this.x,
      this.y - r * 1.3
    );
    ctx.fill();

    // Glossy liquid highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(this.x - r * 0.3, this.y - r * 0.6, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Cute kawaii face (eyes and a happy mouth)
    const eyeOffsetX = r * 0.35;
    const eyeOffsetY = r * 0.1;
    const eyeRadius = Math.max(2, r * 0.15);

    ctx.fillStyle = "#2c3e50";

    // Left eye
    ctx.beginPath();
    ctx.arc(this.x - eyeOffsetX, this.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.beginPath();
    ctx.arc(this.x + eyeOffsetX, this.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Happy smile
    ctx.beginPath();
    ctx.arc(this.x, this.y + eyeOffsetY + r * 0.2, r * 0.25, 0, Math.PI);
    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = Math.max(1.5, r * 0.08);
    ctx.stroke();
  }

  modifySize(amount) {
    this.radius += amount;
    if (this.radius < 5) return "dead";
    if (this.radius > 40) this.radius = 40;
    return "alive";
  }
}

class Entity {
  constructor(type) {
    this.type = type;
    this.radius = type === "FIRE" ? Math.random() * 20 + 15 : 10;
    this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
    this.y = canvas.height + this.radius;
    this.markedForDeletion = false;

    if (type === "WATER") this.color = "#00a8ff";
    else if (type === "FIRE") this.color = "#e74c3c";
    else if (type === "AIR") this.color = "#f5f6fa";
    else if (type === "EARTH") this.color = "#8e44ad";
    else if (type === "SNOW") this.color = "#00d2d3";
    else if (type === "SUN") this.color = "#f1c40f";
    else if (type === "OIL") this.color = "#1e272e";
  }

  getEffectiveRadius() {
    if (this.type === "WATER" && droughtEffectTimer > 0) {
      return this.radius / 2.5;
    }
    return this.radius;
  }

  update() {
    // Combine base speed, temporary air boost, and gradual progressive speed
    const totalSpeed = BASE_GAME_SPEED * currentSpeedMultiplier * progressiveSpeedMultiplier;
    this.y -= totalSpeed;

    if (this.y + this.getEffectiveRadius() < 0) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.getEffectiveRadius(), 0, Math.PI * 2);
    ctx.fill();
  }
}

let player;
let entities;
let score;
let frames;
let isGameOver;
let isPaused;

const keys = { ArrowLeft: false, ArrowRight: false };

window.addEventListener("keydown", (e) => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
  if (e.key === "Escape") togglePause();
});

window.addEventListener("keyup", (e) => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

function initGame() {
  player = new Player();
  entities = [];
  score = 0;
  frames = 0;

  currentSpeedMultiplier = 1;
  progressiveSpeedMultiplier = 1;
  speedEffectTimer = 0;
  freezeEffectTimer = 0;
  droughtEffectTimer = 0;
  oilEffectTimer = 0;

  isGameOver = false;
  isPaused = false;

  scoreDisplay.innerText = `Score: 0 | Multiplier: 3.0x`;
  gameOverUI.style.display = "none";
  pauseUI.style.display = "none";

  keys.ArrowLeft = false;
  keys.ArrowRight = false;

  gameLoop();
}

restartBtn.addEventListener("click", initGame);

function togglePause() {
  if (isGameOver) return;
  isPaused = !isPaused;

  if (isPaused) {
    pauseUI.style.display = "flex";
    resumeBtn.focus();
  } else {
    pauseUI.style.display = "none";
    keys.ArrowLeft = false;
    keys.ArrowRight = false;
    gameLoop();
  }
}

resumeBtn.addEventListener("click", togglePause);

function spawnEntities() {
  let spawnRate = currentSpeedMultiplier > 1 ? 25 : 40;

  if (frames % spawnRate === 0) {
    let rand = Math.random();
    let type = "FIRE";

    if (rand < 0.25) type = "WATER";
    else if (rand < 0.35) type = "EARTH";
    else if (rand < 0.4) type = "AIR";
    else if (rand < 0.45) type = "SNOW";
    else if (rand < 0.5) type = "SUN";
    else if (rand < 0.55) type = "OIL";

    entities.push(new Entity(type));
  }
}

function checkCollisions() {
  entities.forEach((entity) => {
    let dx = player.x - entity.x;
    let dy = player.y - entity.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.radius + entity.getEffectiveRadius() && !entity.markedForDeletion) {
      entity.markedForDeletion = true;

      switch (entity.type) {
        case "FIRE":
          endGame();
          break;
        case "WATER":
          player.modifySize(5);
          break;
        case "EARTH":
          if (player.modifySize(-5) === "dead") endGame();
          break;
        case "AIR":
          currentSpeedMultiplier = 2;
          speedEffectTimer = 120;
          break;
        case "SNOW":
          freezeEffectTimer = 120;
          break;
        case "SUN":
          droughtEffectTimer = 180;
          break;
        case "OIL":
          oilEffectTimer = 180;
          break;
      }
    }
  });
}

function endGame() {
  isGameOver = true;
  gameOverUI.style.display = "flex";
  restartBtn.focus();
}

function updateTimers() {
  if (speedEffectTimer > 0) {
    speedEffectTimer--;
    if (speedEffectTimer === 0) currentSpeedMultiplier = 1;
  }
  if (freezeEffectTimer > 0) freezeEffectTimer--;
  if (droughtEffectTimer > 0) droughtEffectTimer--;
  if (oilEffectTimer > 0) oilEffectTimer--;
}

function update() {
  player.update();
  spawnEntities();
  updateTimers();

  // Gradually increase scroll speed over time (capped at 2.5x max progressive speed)
  progressiveSpeedMultiplier = Math.min(MAX_PROGRESSIVE_SPEED, 1 + frames / 1800);

  entities.forEach((entity) => entity.update());
  checkCollisions();
  entities = entities.filter((entity) => !entity.markedForDeletion);

  let multiplier = player.radius / 5;
  score += (multiplier / 100) * progressiveSpeedMultiplier;

  scoreDisplay.innerText = `Score: ${Math.floor(score)} | Multiplier: ${multiplier.toFixed(1)}x`;

  frames++;
}

function drawHUD(ctx) {
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "left";

  let yPos = 30;
  if (speedEffectTimer > 0) {
    ctx.fillStyle = "#f5f6fa";
    ctx.fillText("WIND: Speed Boost!", 10, yPos);
    yPos += 20;
  }
  if (freezeEffectTimer > 0) {
    ctx.fillStyle = "#00d2d3";
    ctx.fillText("FREEZE: Slow Movement", 10, yPos);
    yPos += 20;
  }
  if (droughtEffectTimer > 0) {
    ctx.fillStyle = "#f1c40f";
    ctx.fillText("DROUGHT: Smaller Targets", 10, yPos);
    yPos += 20;
  }
  if (oilEffectTimer > 0) {
    ctx.fillStyle = "#e74c3c";
    ctx.fillText("OIL: Inverted Controls!", 10, yPos);
    yPos += 20;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  entities.forEach((entity) => entity.draw(ctx));
  player.draw(ctx);
  drawHUD(ctx);
}

function gameLoop() {
  if (isGameOver) return;
  if (isPaused) return;

  update();
  draw();
  requestAnimationFrame(gameLoop);
}

initGame();
