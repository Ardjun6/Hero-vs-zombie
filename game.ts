type GameObject = {
    x: number;
    y: number;
    speed?: number;
    angle?: number;
    health?: number;
    same_rotation?: number;
    color?: string;
    damage?: number;
    bullets?: Bullet[];
    score?: number;
    barrels?: number;
    dashing?: boolean;
    sprinting?: boolean;
};

type Bullet = {
    x: number;
    y: number;
    angle: number;
    speed: number;
};

type Structure = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type Circle = {
    x: number;
    y: number;
};

type Particle = {
    x: number;
    y: number;
    angle: number;
    speed: number;
    life: number;
    color: string;
};

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const gameOverScreen = document.getElementById('gameOverScreen')!;
const scoreDisplay = document.getElementById('scoreDisplay')!;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let hero: GameObject = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 2,
    angle: 0,
    bullets: [],
    health: 100,
    score: 0,
    barrels: 0,
    dashing: false,
    sprinting: false,
};
let zombies: GameObject[] = [];
let barrels: Circle[] = [];
let blueCircles: Circle[] = [];
let particles: Particle[] = [];
let wave = 1;
let structures: Structure[] = [];
let keys: { [key: string]: boolean } = {};
let mouseX = 0;
let mouseY = 0;
let gameOver = false;

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'z') {
        hero.dashing = true;
    }
    if (e.key === 'Shift') {
        hero.sprinting = true;
    }
    if (e.key === '1' && hero.barrels! > 0) {
        placeBarrel();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    if (e.key.toLowerCase() === 'z') {
        hero.dashing = false;
    }
    if (e.key === 'Shift') {
        hero.sprinting = false;
    }
});

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

canvas.addEventListener('mousedown', (e) => {
    hero.bullets!.push({
        x: hero.x,
        y: hero.y,
        angle: Math.atan2(mouseY - hero.y, mouseX - hero.x),
        speed: 5,
    });
});

function spawnZombies() {
    for (let i = 0; i < wave * 5; i++) {
        let x: number, y: number;
        do {
            x = Math.random() * (canvas.width - 40) + 20;
            y = Math.random() * (canvas.height - 40) + 20;
        } while (detectCollision(x - 10, y - 10, 20, 20));
        zombies.push({
            x: x,
            y: y,
            speed: 1,
            angle: 0,
            health: 1,
            same_rotation: 0,
            color: 'green',
            damage: 0.1,
        });
    }
    for (let i = 0; i < wave * 2; i++) {
        let x: number, y: number;
        do {
            x = Math.random() * (canvas.width - 40) + 20;
            y = Math.random() * (canvas.height - 40) + 20;
        } while (detectCollision(x - 15, y - 15, 30, 30));
        zombies.push({
            x: x,
            y: y,
            speed: 0.5,
            angle: 0,
            health: 3,
            same_rotation: 0,
            color: 'red',
            damage: 0.2,
        });
    }
}

function spawnBlueCircle() {
    let x: number, y: number;
    do {
        x = Math.random() * (canvas.width - 40) + 20;
        y = Math.random() * (canvas.height - 40) + 20;
    } while (detectCollision(x - 10, y - 10, 20, 20));
    blueCircles.push({ x: x, y: y });
}

function createStructures() {
    structures = [];
    const numStructures = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < numStructures; i++) {
        let width = Math.random() * 150 + 50;
        let height = Math.random() * 150 + 50;
        let x: number, y: number;
        do {
            x = Math.random() * (canvas.width - width);
            y = Math.random() * (canvas.height - height);
        } while (detectCollision(x, y, width, height));
        structures.push({ x, y, width, height });
    }
}

function detectCollision(x: number, y: number, width: number, height: number): boolean {
    for (let structure of structures) {
        if (
            x < structure.x + structure.width &&
            x + width > structure.x &&
            y < structure.y + structure.height &&
            y + height > structure.y
        ) {
            return true;
        }
    }
    return false;
}

function updateHero() {
    let xspeed = 0;
    let yspeed = 0;
    let currentSpeed = hero.speed!;

    if (hero.dashing) {
        currentSpeed *= 3;
    } else if (hero.sprinting) {
        currentSpeed *= 2;
    }

    if (keys['a']) {
        xspeed -= currentSpeed;
    }
    if (keys['d']) {
        xspeed += currentSpeed;
    }
    if (keys['w']) {
        yspeed -= currentSpeed;
    }
    if (keys['s']) {
        yspeed += currentSpeed;
    }

    if (xspeed !== 0 && yspeed !== 0) {
        xspeed *= 0.707;
        yspeed *= 0.707;
    }

    let newX = hero.x + xspeed;
    let newY = hero.y + yspeed;

    if (!detectCollision(newX - 10, newY - 20, 20, 40)) {
        hero.x = newX;
        hero.y = newY;
    }

    if (hero.x < 0) hero.x = 0;
    if (hero.y < 0) hero.y = 0;
    if (hero.x > canvas.width) hero.x = canvas.width;
    if (hero.y > canvas.height) hero.y = canvas.height;
}

function updateBullets() {
    hero.bullets!.forEach((bullet) => {
        bullet.x += bullet.speed * Math.cos(bullet.angle);
        bullet.y += bullet.speed * Math.sin(bullet.angle);
    });
    hero.bullets = hero.bullets!.filter(
        (bullet) =>
            bullet.x > 0 &&
            bullet.x < canvas.width &&
            bullet.y > 0 &&
            bullet.y < canvas.height &&
            !detectCollision(bullet.x - 5, bullet.y - 5, 10, 10)
    );
}

function updateZombies() {
    zombies.forEach((zombie) => {
        zombie.same_rotation!++;
        const dist_x = hero.x - zombie.x;
        const dist_y = hero.y - zombie.y;
        let angle = Math.atan2(dist_y, dist_x);

        // Adjust angle to avoid structures
        const avoidanceStrength = 0.5;
        structures.forEach((structure) => {
            const structureCenterX = structure.x + structure.width / 2;
            const structureCenterY = structure.y + structure.height / 2;
            const dist_to_structure_x = structureCenterX - zombie.x;
            const dist_to_structure_y = structureCenterY - zombie.y;
            const dist_to_structure = Math.hypot(dist_to_structure_x, dist_to_structure_y);

            if (dist_to_structure < 100) {
                const avoidAngle = Math.atan2(dist_to_structure_y, dist_to_structure_x) + Math.PI;
                angle += avoidanceStrength / dist_to_structure * avoidAngle;
            }
        });

        zombie.x += zombie.speed! * Math.cos(angle);
        zombie.y += zombie.speed! * Math.sin(angle);

        // Prevent zombies from going out of canvas
        if (zombie.x < 0) zombie.x = 0;
        if (zombie.y < 0) zombie.y = 0;
        if (zombie.x > canvas.width) zombie.x = canvas.width;
        if (zombie.y > canvas.height) zombie.y = canvas.height;

        // Prevent zombies from passing through structures
        if (detectCollision(zombie.x - 10, zombie.y - 10, 20, 20)) {
            zombie.x -= zombie.speed! * Math.cos(angle);
            zombie.y -= zombie.speed! * Math.sin(angle);
        }

        // Check for collision with hero
        if (Math.hypot(zombie.x - hero.x, zombie.y - hero.y) < 20) {
            hero.health! -= zombie.damage!; // Decrease hero's health
            if (hero.health! <= 0 && !gameOver) {
                endGame();
            }
        }
    });
}

function updateParticles() {
    particles = particles.filter((particle) => {
        particle.x += particle.speed * Math.cos(particle.angle);
        particle.y += particle.speed * Math.sin(particle.angle);
        particle.life -= 0.1;
        return particle.life > 0;
    });
}

function drawHero() {
    ctx.save();
    ctx.translate(hero.x, hero.y);
    ctx.rotate(hero.angle! * Math.PI / 180);
    ctx.fillStyle = 'blue';
    ctx.fillRect(-10, -20, 20, 40);
    ctx.restore();

    // Draw hero's health bar
    ctx.fillStyle = 'red';
    ctx.fillRect(hero.x - 20, hero.y - 30, 40, 5);
    ctx.fillStyle = 'green';
    ctx.fillRect(hero.x - 20, hero.y - 30, hero.health! * 0.4, 5);
}

function drawZombies() {
    zombies.forEach((zombie) => {
        ctx.save();
        ctx.translate(zombie.x, zombie.y);
        ctx.rotate(zombie.angle! * Math.PI / 180);
        ctx.fillStyle = zombie.color!;
        if (zombie.color === 'red') {
            ctx.fillRect(-15, -15, 30, 30);
        } else {
            ctx.fillRect(-10, -10, 20, 20);
        }
        ctx.restore();
    });
}

function drawBullets() {
    hero.bullets!.forEach((bullet) => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
    });
}

function drawStructures() {
    structures.forEach((structure) => {
        ctx.fillStyle = 'gray';
        ctx.fillRect(structure.x, structure.y, structure.width, structure.height);
    });
}

function drawBlueCircles() {
    blueCircles.forEach((circle) => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();
    });
}

function drawBarrels() {
    barrels.forEach((barrel) => {
        ctx.fillStyle = 'brown';
        ctx.fillRect(barrel.x - 10, barrel.y - 10, 20, 20);
    });
}

function drawParticles() {
    particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = particle.color;
        ctx.fill();
    });
}

function checkCollisions() {
    zombies = zombies.filter((zombie) => {
        let hit = false;
        hero.bullets = hero.bullets!.filter((bullet) => {
            if (Math.hypot(zombie.x - bullet.x, zombie.y - bullet.y) < 10) {
                zombie.health!--;
                if (zombie.health! <= 0) {
                    hit = true;
                    hero.score!++;
                }
                return false;
            }
            return true;
        });
        return !hit;
    });
}

function checkBarrelCollisions() {
    barrels = barrels.filter((barrel) => {
        let exploded = false;
        hero.bullets = hero.bullets!.filter((bullet) => {
            if (Math.hypot(barrel.x - bullet.x, barrel.y - bullet.y) < 15) {
                explodeBarrel(barrel.x, barrel.y);
                exploded = true;
                return false;
            }
            return true;
        });
        return !exploded;
    });
}

function checkBlueCircleCollisions() {
    blueCircles = blueCircles.filter((circle) => {
        if (Math.hypot(circle.x - hero.x, circle.y - hero.y) < 20) {
            hero.barrels = Math.min(hero.barrels! + 1, 10);
            return false;
        }
        return true;
    });
}

function explodeBarrel(x: number, y: number) {
    // Create particles for the explosion
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            angle: Math.random() * 2 * Math.PI,
            speed: Math.random() * 2 + 1,
            life: Math.random() * 2 + 1,
            color: Math.random() < 0.5 ? 'red' : 'orange',
        });
    }

    // Increase the explosion radius to 1.5x
    const explosionRadius = 75;
    zombies = zombies.filter((zombie) => {
        if (Math.hypot(zombie.x - x, zombie.y - y) < explosionRadius) {
            hero.score!++;
            return false;
        }
        return true;
    });
}

function placeBarrel() {
    if (hero.barrels! > 0) {
        let barrelX = hero.x + 20 * Math.cos(hero.angle! * Math.PI / 180);
        let barrelY = hero.y + 20 * Math.sin(hero.angle! * Math.PI / 180);
        if (!detectCollision(barrelX - 10, barrelY - 10, 20, 20)) {
            barrels.push({ x: barrelX, y: barrelY });
            hero.barrels!--;
        }
    }
}

function endGame() {
    gameOver = true;
    scoreDisplay.textContent = 'Score: ' + hero.score;
    gameOverScreen.style.display = 'block';
}

(window as any).tryAgain = function () {
    gameOver = false;
    gameOverScreen.style.display = 'none';
    hero.health = 100;
    hero.score = 0;
    hero.barrels = 0;
    zombies = [];
    barrels = [];
    blueCircles = [];
    particles = [];
    wave = 1;
    spawnZombies();
    createStructures();
    spawnBlueCircle();
    gameLoop();
};

(window as any).goHome = function () {
    window.location.href = 'home.html'; // Replace 'home.html' with the actual home page URL
};

function gameLoop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateHero();
    updateBullets();
    updateZombies();
    updateParticles();
    checkCollisions();
    checkBarrelCollisions();
    checkBlueCircleCollisions();
    drawStructures();
    drawHero();
    drawZombies();
    drawBullets();
    drawBlueCircles();
    drawBarrels();
    drawParticles();

    if (zombies.length === 0) {
        wave++;
        createStructures();
        spawnZombies();
        spawnBlueCircle();
    }

    requestAnimationFrame(gameLoop);
}

createStructures();
spawnZombies();
spawnBlueCircle();
gameLoop();
