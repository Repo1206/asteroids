const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
  constructor({ position, velocity }) {
    this.position = position; // (x, y)
    this.velocity = velocity;
    this.rotation = 0;
  }
  draw() {
    c.save();

    c.translate(this.position.x, this.position.y);
    c.rotate(this.rotation);
    c.translate(-this.position.x, -this.position.y);

    c.beginPath();
    c.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false);

    c.fill();
    c.closePath();

    // c.fillRect(this.position.x, this.position.y, 100, 100);
    c.beginPath();
    c.moveTo(this.position.x + 30, this.position.y);
    c.lineTo(this.position.x - 10, this.position.y - 10);
    c.lineTo(this.position.x - 10, this.position.y + 10);
    c.closePath();

    c.strokeStyle = "white";
    c.stroke();
    c.restore();
  }

  update() {
    this.draw((this.position.x += this.velocity.x));
    this.draw((this.position.y += this.velocity.y));
  }
  getVertices() {
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);

    return [
      {
        x: this.position.x + cos * 30 - sin * 0,
        y: this.position.y + sin * 30 + cos * 0,
      },
      {
        x: this.position.x + cos * -10 - sin * 10,
        y: this.position.y + sin * -10 + cos * 10,
      },
      {
        x: this.position.x + cos * -10 - sin * -10,
        y: this.position.y + sin * -10 + cos * -10,
      },
    ];
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 5;
  }
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    c.closePath();
    c.fillStyle = "white";
    c.fill();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Asteroid {
  constructor({ position, velocity, radius }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.vertices = Math.floor(Math.random() * 10) + 5; // Random number of vertices for jagged shape
  }
  draw() {
    c.beginPath();
    c.moveTo(
      this.position.x + this.radius * Math.cos(0),
      this.position.y + this.radius * Math.sin(0)
    );

    // Draw different shapes based on the number of vertices
    if (this.vertices >= 8 && this.vertices <= 10) {
      // Draw star-like shape
      for (let i = 1; i <= this.vertices; i++) {
        const angle = (Math.PI * 2 * i) / this.vertices;
        const radius = i % 2 === 0 ? this.radius * 0.4 : this.radius;
        const x = this.position.x + radius * Math.cos(angle);
        const y = this.position.y + radius * Math.sin(angle);
        c.lineTo(x, y);
      }
    } else if (this.vertices > 5) {
      // Draw jagged shape with random vertices
      for (let i = 1; i <= this.vertices; i++) {
        const angle = (Math.PI * 2 * i) / this.vertices;
        const x = this.position.x + this.radius * Math.cos(angle);
        const y = this.position.y + this.radius * Math.sin(angle);
        c.lineTo(x, y);
      }
    } else {
      // Draw circle for less than or equal to 5 vertices
      c.arc(
        this.position.x,
        this.position.y,
        this.radius,
        0,
        Math.PI * 2,
        false
      );
    }

    c.closePath();
    c.strokeStyle = "white";
    c.stroke();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

const player = new Player({
  position: { x: canvas.width / 2, y: canvas.height / 2 },
  velocity: { x: 0, y: 0 },
});

player.draw();

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
};

const SPEED = 3;
const ROTATIONAL_SPEED = 0.05;
const FRICTION = 0.97;
const PROJECTILE_SPEED = 3;
const ASTEROID_MIN_SPEED = 1; // Minimum asteroid speed
const ASTEROID_MAX_SPEED = 4; // Maximum asteroid speed
let score = 0;

const projectiles = [];
const asteroids = [];

const intervalID = window.setInterval(() => {
  const index = Math.floor(Math.random() * 4);
  let x, y;
  let radius = 50 * Math.random() + 10;

  let ANGLE = Math.random() * Math.PI * 2; // Random angle in radians
  let ASTEROID_SPEED =
    ASTEROID_MIN_SPEED +
    Math.floor(Math.random() * (ASTEROID_MAX_SPEED - ASTEROID_MIN_SPEED)); // Random speed within the specified range

  switch (index) {
    case 0: //left side of the screen
      x = 0 - radius;
      y = Math.random() * canvas.height;
      vx = Math.cos(ANGLE) * ASTEROID_SPEED;
      vy = Math.sin(ANGLE) * ASTEROID_SPEED;

      break;
    case 1: //bottom side of the screen
      x = Math.random() * canvas.width;
      y = canvas.height + radius;
      vx = Math.cos(ANGLE) * ASTEROID_SPEED;
      vy = Math.sin(ANGLE) * ASTEROID_SPEED * -1;

      break;
    case 2: //right side of the screen
      x = canvas.width + radius;
      y = Math.random() * canvas.height;
      vx = Math.cos(ANGLE) * ASTEROID_SPEED * -1;
      vy = Math.sin(ANGLE) * ASTEROID_SPEED;

      break;
    case 3: //top side of the screen
      x = Math.random() * canvas.width;
      y = 0 - radius;
      vx = Math.cos(ANGLE) * ASTEROID_SPEED;
      vy = Math.sin(ANGLE) * ASTEROID_SPEED;

      break;
  }

  asteroids.push(
    new Asteroid({
      position: {
        x: x,
        y: y,
      },
      velocity: {
        x: vx,
        y: vy,
      },
      radius,
    })
  );
  console.log(asteroids);
}, 2000);

function circleCollision(circle1, circle2) {
  const xDifference = circle2.position.x - circle1.position.x;
  const yDifference = circle2.position.y - circle1.position.y;

  const distance = Math.sqrt(
    xDifference * xDifference + yDifference * yDifference
  );

  if (distance <= circle1.radius + circle2.radius) {
    return true;
  }
  return false;
}

// Function to break an asteroid into smaller pieces
function breakAsteroid(asteroid) {
  const numPieces = Math.floor(Math.random() * 3) + 2; // Random number of pieces (2 to 4)

  for (let i = 0; i < numPieces; i++) {
    const smallerRadius = asteroid.radius * (Math.random() * 0.4 + 0.2); // Random size for smaller pieces
    const smallerVelocity = {
      x: (Math.random() - 0.5) * 2, // Random x and y velocity between -1 and 1
      y: (Math.random() - 0.5) * 2,
    };

    if (smallerRadius >= 8) {
      // Only create smaller pieces above a certain size (e.g., 15)
      // Create a smaller asteroid
      const smallerAsteroid = new Asteroid({
        position: { x: asteroid.position.x, y: asteroid.position.y },
        velocity: smallerVelocity,
        radius: smallerRadius,
      });

      asteroids.push(smallerAsteroid); // Add the smaller asteroid to the asteroids array
    }
  }
}
const gameOverScreen = document.getElementById("gameOverScreen");

function showGameOverScreen() {
  // Show the game over screen by setting its display property to "block"
  gameOverScreen.style.display = "block";
  // Disable scrolling on the body when the game over screen is shown
  document.body.style.overflow = "hidden";
}
function circleTriangleCollision(circle, triangle) {
  // Check if the circle is colliding with any of the triangle's edges
  for (let i = 0; i < 3; i++) {
    let start = triangle[i];
    let end = triangle[(i + 1) % 3];

    let dx = end.x - start.x;
    let dy = end.y - start.y;
    let length = Math.sqrt(dx * dx + dy * dy);

    let dot =
      ((circle.position.x - start.x) * dx +
        (circle.position.y - start.y) * dy) /
      Math.pow(length, 2);

    let closestX = start.x + dot * dx;
    let closestY = start.y + dot * dy;

    if (!isPointOnLineSegment(closestX, closestY, start, end)) {
      closestX = closestX < start.x ? start.x : end.x;
      closestY = closestY < start.y ? start.y : end.y;
    }

    dx = closestX - circle.position.x;
    dy = closestY - circle.position.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= circle.radius) {
      return true;
    }
  }

  // No collision
  return false;
}

function isPointOnLineSegment(x, y, start, end) {
  return (
    x >= Math.min(start.x, end.x) &&
    x <= Math.max(start.x, end.x) &&
    y >= Math.min(start.y, end.y) &&
    y <= Math.max(start.y, end.y)
  );
}

function animate() {
  const animationID = window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);

  player.update();

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    projectile.update();

    //garbage collection
    if (
      projectile.position.x + projectile.radius < 0 ||
      projectile.position.x - projectile.radius > canvas.width ||
      projectile.position.y - projectile.radius > canvas.height ||
      projectile.position.y + projectile.radius < 0
    ) {
      projectiles.splice(i, 1);
    }
  }
  //   asteroid management
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];
    asteroid.update();

    if (circleTriangleCollision(asteroid, player.getVertices())) {
      console.log("game over");
      window.cancelAnimationFrame(animationID);
      clearInterval(intervalID);
      showGameOverScreen(); // Call the function to show the game over screen
    }
    if (
      asteroid.position.x + asteroid.radius < 0 ||
      asteroid.position.x - asteroid.radius > canvas.width ||
      asteroid.position.y - asteroid.radius > canvas.height ||
      asteroid.position.y + asteroid.radius < 0
    ) {
      // garbage
      asteroids.splice(i, 1);
    }
    // projectiles
    for (let j = projectiles.length - 1; j >= 0; j--) {
      const projectile = projectiles[j];

      for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];

        if (circleCollision(asteroid, projectile)) {
          // Play the collision sound
          const collisionSound = document.getElementById("collisionSound");
          collisionSound.currentTime = 0; // Reset the audio to the beginning
          collisionSound.play();

          breakAsteroid(asteroid); // Call the function to break the asteroid into smaller pieces
          asteroids.splice(i, 1); // Removed the original asteroid
          projectiles.splice(j, 1); // Removed the projectile
          // Calculate the score based on the size of the asteroid
          const asteroidSize = asteroid.radius;
          const asteroidMultiplier = Math.ceil(asteroidSize / 20); // adjusted the multiplier as desired
          const points = 5 * asteroidMultiplier; // Base score of 5 points per asteroid, multiplied by the size multiplier

          // Increment the score with the calculated points
          score += points;

          // Update the score on the screen
          const scoreElement = document.getElementById("scoreValue");
          scoreElement.innerText = score;

          break; // Exit the loop since the asteroid is already hit by a projectile
        }
      }
    }
  }

  if (keys.w.pressed) {
    player.velocity.x = Math.cos(player.rotation) * SPEED;
    player.velocity.y = Math.sin(player.rotation) * SPEED;
  } else if (!keys.w.pressed) {
    player.velocity.x *= FRICTION;
    player.velocity.y *= FRICTION;
  }

  if (keys.d.pressed) player.rotation += ROTATIONAL_SPEED;
  else if (keys.a.pressed) player.rotation -= ROTATIONAL_SPEED;
  if (keys.s.pressed) {
    player.velocity.x = -Math.cos(player.rotation) * SPEED;
    player.velocity.y = -Math.sin(player.rotation) * SPEED;
  }
}

animate();

window.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "KeyW":
      keys.w.pressed = true;
      break;
    case "KeyA":
      keys.a.pressed = true;

      break;
    case "KeyD":
      keys.d.pressed = true;

      break;
    case "KeyS":
      keys.s.pressed = true;

      break;
    case "Space":
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + Math.cos(player.rotation) * 30,
            y: player.position.y + Math.sin(player.rotation) * 30,
          },
          velocity: {
            x: Math.cos(player.rotation) * PROJECTILE_SPEED,
            y: Math.sin(player.rotation) * PROJECTILE_SPEED,
          },
        })
      );
      console.log(projectiles);

      break;
  }
});
window.addEventListener("keyup", (e) => {
  switch (e.code) {
    case "KeyW":
      keys.w.pressed = false;
      break;
    case "KeyA":
      keys.a.pressed = false;

      break;
    case "KeyD":
      keys.d.pressed = false;

      break;
    case "KeyS":
      keys.s.pressed = false;

      break;
  }
});
