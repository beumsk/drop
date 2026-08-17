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
    ctx.moveTo(this.x, this.y - r * 1.3);
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
    if (this.radius < 6) return "dead";
    // if (this.radius > 40) this.radius = 40;
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
    else if (type === "GEM") this.color = "#f1c40f";
    else if (type === "FIRE") this.color = "#e74c3c";
    else if (type === "AIR") this.color = "#f5f6fa";
    else if (type === "EARTH") this.color = "#8e44ad";
    else if (type === "SNOW") this.color = "#00d2d3";
    else if (type === "SUN") this.color = "#e67e22";
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
    const r = this.getEffectiveRadius();

    if (this.type === "WATER") {
      // Draw collectible water drops as cute mini teardrops
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - r * 1.3);
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

      // Mini gloss highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(this.x - r * 0.3, this.y - r * 0.2, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === "GEM") {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Soft magical glow aura
      ctx.fillStyle = "rgba(116, 185, 255, 0.35)";
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Gemstone table (top flat edge) and pavilion (faceted lower body)
      // Top crown/table facet
      ctx.fillStyle = "#74b9ff";
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, -r * 1.1);
      ctx.lineTo(r * 0.6, -r * 1.1);
      ctx.lineTo(r * 1.2, -r * 0.4);
      ctx.lineTo(0, r * 1.4);
      ctx.lineTo(-r * 1.2, -r * 0.4);
      ctx.closePath();
      ctx.fill();

      // Left facet shading (lighter cyan)
      ctx.fillStyle = "#81ecec";
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.1);
      ctx.lineTo(-r * 1.2, -r * 0.4);
      ctx.lineTo(0, r * 1.4);
      ctx.closePath();
      ctx.fill();

      // Right facet shading (deeper royal blue)
      ctx.fillStyle = "#0984e3";
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.1);
      ctx.lineTo(r * 1.2, -r * 0.4);
      ctx.lineTo(0, r * 1.4);
      ctx.closePath();
      ctx.fill();

      // Top table highlight (flat brilliant top)
      ctx.fillStyle = "#dfe6e9";
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, -r * 1.1);
      ctx.lineTo(r * 0.4, -r * 1.1);
      ctx.lineTo(r * 0.6, -r * 0.7);
      ctx.lineTo(-r * 0.6, -r * 0.7);
      ctx.closePath();
      ctx.fill();

      // Sparkle glint on top left corner
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(-r * 0.4, -r * 0.5, r * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else if (this.type === "FIRE") {
      // Dynamic, organic flame shape with multi-layered fiery colors (outer orange, inner yellow, white core)
      ctx.save();
      ctx.translate(this.x, this.y);

      // Outer heat glow
      ctx.fillStyle = "rgba(231, 76, 60, 0.25)";
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Outer flame body (Deep Orange/Red)
      ctx.fillStyle = "#e74c3c";
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.5); // Main flickering peak
      ctx.bezierCurveTo(r * 1.3, -r * 0.4, r * 1.1, r * 1.2, 0, r * 1.3);
      ctx.bezierCurveTo(-r * 1.1, r * 1.2, -r * 1.3, -r * 0.4, 0, -r * 1.5);
      ctx.fill();

      // Inner flame core (Bright Orange/Yellow flicker)
      ctx.fillStyle = "#f39c12";
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.1);
      ctx.bezierCurveTo(r * 0.8, -r * 0.2, r * 0.7, r * 0.9, 0, r * 1.0);
      ctx.bezierCurveTo(-r * 0.7, r * 0.9, -r * 0.8, -r * 0.2, 0, -r * 1.1);
      ctx.fill();

      // Hot center core (Bright Yellow)
      ctx.fillStyle = "#f1c40f";
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.7);
      ctx.bezierCurveTo(r * 0.4, -r * 0.1, r * 0.35, r * 0.5, 0, r * 0.6);
      ctx.bezierCurveTo(-r * 0.35, r * 0.5, -r * 0.4, -r * 0.1, 0, -r * 0.7);
      ctx.fill();

      ctx.restore();
    } else if (this.type === "AIR") {
      // Air element: spiral vortex, arrow shoots down from its outer end
      ctx.save();
      ctx.translate(this.x, this.y);

      // Soft aura
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.fillStyle = "#ffffff";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(2.5, r * 0.22);

      // --- Spiral (top portion) ---
      // Grows from the center outward, ending its outer edge pointing
      // straight down so it flows directly into the arrow stem.
      const spiralCenterY = -r * 0.55;
      const turns = 1.75;
      const maxRadius = r * 0.9;
      const steps = 40;

      const endAngle = Math.PI / 2; // outer end points straight down
      const startAngle = endAngle - turns * Math.PI * 2; // inner start, winding backward from there

      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = startAngle + t * turns * Math.PI * 2;
        const radius = maxRadius * t; // spiral outward as t increases
        const x = Math.cos(angle) * radius;
        const y = spiralCenterY + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Outer end point of the spiral (straight below spiral center)
      const stemStartX = 0;
      const stemStartY = spiralCenterY + maxRadius;

      // --- Stem (connects spiral's outer end to arrow) ---
      const arrowTipY = r * 1.3;
      const arrowHeadY = arrowTipY - r * 0.5;

      ctx.beginPath();
      ctx.moveTo(stemStartX, stemStartY);
      ctx.lineTo(0, arrowHeadY);
      ctx.stroke();

      // --- Arrowhead pointing down ---
      const arrowWidth = r * 0.5;
      ctx.beginPath();
      ctx.moveTo(-arrowWidth, arrowHeadY);
      ctx.lineTo(0, arrowTipY);
      ctx.lineTo(arrowWidth, arrowHeadY);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    } else if (this.type === "SNOW") {
      // Detailed, intricate crystalline snowflake
      ctx.save();
      ctx.translate(this.x, this.y);

      // Soft icy glow aura
      ctx.fillStyle = "rgba(0, 210, 211, 0.25)";
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(2, r * 0.16);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Draw 6 main axes of the snowflake
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((Math.PI / 3) * i);

        // Main branch
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -r * 1.3);
        ctx.stroke();

        // Upper V-shaped side crystals
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.7);
        ctx.lineTo(-r * 0.35, -r * 1.0);
        ctx.moveTo(0, -r * 0.7);
        ctx.lineTo(r * 0.35, -r * 1.0);
        ctx.stroke();

        // Lower side crystals
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.4);
        ctx.lineTo(-r * 0.25, -r * 0.65);
        ctx.moveTo(0, -r * 0.4);
        ctx.lineTo(r * 0.25, -r * 0.65);
        ctx.stroke();

        ctx.restore();
      }

      // Bright center core crystal hexagon
      ctx.fillStyle = "#00d2d3";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else if (this.type === "EARTH") {
      // Porous, dry earth clod / soil lump that absorbs water (causing shrink)
      ctx.save();
      ctx.translate(this.x, this.y);

      // Dusty brown aura
      ctx.fillStyle = "rgba(142, 68, 173, 0.2)";
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Texture details / dry cracks on the surface
      ctx.fillStyle = "#774438";
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, -r * 0.9);
      ctx.bezierCurveTo(r * 0.7, -r * 1.1, r * 1.2, -r * 0.2, r * 0.9, r * 0.8);
      ctx.bezierCurveTo(r * 0.4, r * 1.2, -r * 0.9, r * 1.0, -r * 1.1, r * 0.1);
      ctx.closePath();
      ctx.fill();

      // Texture details / dry cracks on the surface
      ctx.strokeStyle = "#2d3436";
      ctx.lineWidth = Math.max(1.5, r * 0.12);
      ctx.lineCap = "round";

      // Crack lines (suggesting dry absorption)
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.6);
      ctx.lineTo(r * 0.3, r * 0.2);
      ctx.lineTo(-r * 0.4, r * 0.6);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(r * 0.3, -r * 0.2);
      ctx.lineTo(r * 0.7, -r * 0.4);
      ctx.stroke();

      ctx.restore();
    } else if (this.type === "SUN") {
      // Radiant, glowing sun entity with warm rays
      ctx.save();
      ctx.translate(this.x, this.y);

      // Warm solar heat glow aura
      ctx.fillStyle = "rgba(243, 156, 18, 0.25)";
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.7, 0, Math.PI * 2);
      ctx.fill();

      // Rotating or static sun rays
      ctx.fillStyle = "#e67e22";
      const numRays = 8;
      for (let i = 0; i < numRays; i++) {
        ctx.save();
        ctx.rotate(((Math.PI * 2) / numRays) * i);
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.3);
        ctx.lineTo(-r * 0.25, -r * 0.8);
        ctx.lineTo(r * 0.25, -r * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Central bright sun body
      ctx.fillStyle = "#f1c40f";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Inner warm core highlight
      ctx.fillStyle = "#ffeaa7";
      ctx.beginPath();
      ctx.arc(-r * 0.25, -r * 0.25, r * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else if (this.type === "OIL") {
      // Dark, glossy, iridescent oil slick drop with rainbow sheen reflection
      ctx.save();
      ctx.translate(this.x, this.y);

      // Dark oily aura
      ctx.fillStyle = "rgba(30, 39, 46, 0.3)";
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Main dark body
      ctx.fillStyle = "#1e272e";
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Iridescent oil sheen patches (swirling rainbow reflection colors)
      ctx.fillStyle = "rgba(156, 136, 255, 0.45)"; // Purple sheen
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.2, r * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(52, 152, 219, 0.4)"; // Cyan/Blue sheen
      ctx.beginPath();
      ctx.arc(r * 0.3, r * 0.2, r * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(46, 204, 113, 0.35)"; // Greenish sheen
      ctx.beginPath();
      ctx.arc(0, r * 0.4, r * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Glossy bright surface highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.3, r * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else {
      // Standard circle draw for other entities
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
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

const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");

function bindTouchButton(element, keyName) {
  const pressOn = (e) => {
    e.preventDefault();
    keys[keyName] = true;
  };

  const pressOff = (e) => {
    e.preventDefault();
    keys[keyName] = false;
  };

  element.addEventListener("touchstart", pressOn, { passive: false });
  element.addEventListener("touchend", pressOff, { passive: false });
  element.addEventListener("touchcancel", pressOff, { passive: false });

  // Fallbacks for mouse clicks (testing mobile controls on desktop)
  element.addEventListener("mousedown", pressOn);
  element.addEventListener("mouseup", pressOff);
  element.addEventListener("mouseleave", pressOff);
}

bindTouchButton(btnLeft, "ArrowLeft");
bindTouchButton(btnRight, "ArrowRight");

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
    let type = "";

    if (rand < 0.2) type = "GEM";
    else if (rand < 0.35) type = "WATER";
    else if (rand < 0.45) type = "EARTH";
    else if (rand < 0.5) type = "AIR";
    else if (rand < 0.55) type = "SNOW";
    else if (rand < 0.6) type = "SUN";
    else if (rand < 0.65) type = "OIL";
    else type = "FIRE";

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
        case "GEM":
          let multiplier = Math.max(1, Math.floor(player.radius / 5));
          score += 10 * multiplier;
          break;
        case "WATER":
          player.modifySize(2);
          break;
        case "EARTH":
          if (player.modifySize(-2) === "dead") endGame();
          break;
        case "AIR":
          currentSpeedMultiplier = 2;
          speedEffectTimer = 120;
          break;
        case "SNOW":
          freezeEffectTimer = 120;
          break;
        case "SUN":
          droughtEffectTimer = 120;
          break;
        case "OIL":
          oilEffectTimer = 120;
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

  // Gradually increase scroll speed over time (capped at 10x max progressive speed)
  progressiveSpeedMultiplier = Math.min(MAX_PROGRESSIVE_SPEED, 1 + frames / 1800);

  entities.forEach((entity) => entity.update());
  checkCollisions();
  entities = entities.filter((entity) => !entity.markedForDeletion);

  let currentMultiplier = Math.max(1, Math.floor(player.radius / 5));
  scoreDisplay.innerText = `Score: ${score} | Size Multiplier: ${currentMultiplier}x`;

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
