var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var gameOverScreen = document.getElementById('gameOverScreen');
var scoreDisplay = document.getElementById('scoreDisplay');
var hotbar = document.getElementById('hotbar');
var itemCounts = {
    1: document.getElementById('item1-count'),
    2: document.getElementById('item2-count'),
    3: document.getElementById('item3-count'),
    4: document.getElementById('item4-count'),
};
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
var hero = {
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
var zombies = [];
var barrels = [];
var itemCircles = [];
var particles = [];
var wave = 1;
var structures = [];
var keys = {};
var mouseX = 0;
var mouseY = 0;
var gameOver = false;
var selectedItem = 1;
var machineGunActive = false;
var machineGunBullets = 100;
var phantomBulletsActive = false;
var phantomBullets = 100;
var minigunActive = false;
var minigunBullets = 500;
var waveInProgress = false;
var itemActions = {
    1: function () { return placeBarrel(); },
    2: function () { return toggleMachineGun(); },
    3: function () { return togglePhantomBullets(); },
    4: function () { return toggleMinigun(); },
};
function toggleMachineGun() {
    machineGunActive = !machineGunActive;
    phantomBulletsActive = false;
    minigunActive = false;
    updateHotbar();
    console.log("Machine Gun ".concat(machineGunActive ? 'activated' : 'deactivated'));
}
function togglePhantomBullets() {
    phantomBulletsActive = !phantomBulletsActive;
    machineGunActive = false;
    minigunActive = false;
    updateHotbar();
    console.log("Phantom Bullets ".concat(phantomBulletsActive ? 'activated' : 'deactivated'));
}
function toggleMinigun() {
    minigunActive = !minigunActive;
    machineGunActive = false;
    phantomBulletsActive = false;
    updateHotbar();
    console.log("Minigun ".concat(minigunActive ? 'activated' : 'deactivated'));
}
function updateHotbar() {
    itemCounts[1].textContent = hero.barrels.toString();
    itemCounts[1].style.color = hero.barrels > 0 ? 'green' : 'red';
    itemCounts[2].textContent = machineGunActive ? "Bullets: ".concat(machineGunBullets) : 'Inactive';
    itemCounts[2].style.color = machineGunActive ? 'green' : 'red';
    itemCounts[3].textContent = phantomBulletsActive ? "Bullets: ".concat(phantomBullets) : 'Inactive';
    itemCounts[3].style.color = phantomBulletsActive ? 'green' : 'red';
    itemCounts[4].textContent = minigunActive ? "Bullets: ".concat(minigunBullets) : 'Inactive';
    itemCounts[4].style.color = minigunActive ? 'green' : 'red';
}
window.addEventListener('keydown', function (e) {
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'z') {
        hero.dashing = true;
    }
    if (e.key === 'Shift') {
        hero.sprinting = true;
    }
    if (e.key >= '1' && e.key <= '4') {
        selectedItem = parseInt(e.key);
        if (itemActions[selectedItem]) {
            itemActions[selectedItem]();
        }
    }
});
window.addEventListener('keyup', function (e) {
    keys[e.key.toLowerCase()] = false;
    if (e.key.toLowerCase() === 'z') {
        hero.dashing = false;
    }
    if (e.key === 'Shift') {
        hero.sprinting = false;
    }
});
canvas.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
});
canvas.addEventListener('mousedown', function (e) {
    if (machineGunActive && machineGunBullets > 0) {
        hero.bullets.push({
            x: hero.x,
            y: hero.y,
            angle: Math.atan2(mouseY - hero.y, mouseX - hero.x),
            speed: 10,
        });
        machineGunBullets--;
        updateHotbar();
    }
    else if (phantomBulletsActive && phantomBullets > 0) {
        hero.bullets.push({
            x: hero.x,
            y: hero.y,
            angle: Math.atan2(mouseY - hero.y, mouseX - hero.x),
            speed: 10,
            isPhantom: true,
        });
        phantomBullets--;
        updateHotbar();
    }
    else if (minigunActive && minigunBullets > 0) {
        hero.bullets.push({
            x: hero.x,
            y: hero.y,
            angle: Math.atan2(mouseY - hero.y, mouseX - hero.x),
            speed: 10,
        });
        minigunBullets--;
        updateHotbar();
    }
});
function spawnZombies() {
    var totalZombies = wave * 5;
    var redZombies = Math.floor(wave * 2);
    var blueZombies = wave;
    var yellowZombies = Math.floor(wave / 2);
    var phantomZombies = wave % 10 === 0 ? 20 : wave;
    for (var i = 0; i < totalZombies; i++) {
        var x = void 0, y = void 0;
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
    for (var i = 0; i < redZombies; i++) {
        var x = void 0, y = void 0;
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
    for (var i = 0; i < blueZombies; i++) {
        var x = void 0, y = void 0;
        do {
            x = Math.random() * (canvas.width - 40) + 20;
            y = Math.random() * (canvas.height - 40) + 20;
        } while (detectCollision(x - 20, y - 20, 40, 40));
        zombies.push({
            x: x,
            y: y,
            speed: 1.5,
            angle: 0,
            health: 2,
            same_rotation: 0,
            color: 'blue',
            damage: 0.15,
        });
    }
    for (var i = 0; i < yellowZombies; i++) {
        var x = void 0, y = void 0;
        do {
            x = Math.random() * (canvas.width - 40) + 20;
            y = Math.random() * (canvas.height - 40) + 20;
        } while (detectCollision(x - 25, y - 25, 50, 50));
        zombies.push({
            x: x,
            y: y,
            speed: 0.75,
            angle: 0,
            health: 5,
            same_rotation: 0,
            color: 'yellow',
            damage: 0.25,
        });
    }
    for (var i = 0; i < phantomZombies; i++) {
        var x = void 0, y = void 0;
        do {
            x = Math.random() * (canvas.width - 40) + 20;
            y = Math.random() * (canvas.height - 40) + 20;
        } while (hypot(x - hero.x, y - hero.y) < 50);
        zombies.push({
            x: x,
            y: y,
            speed: 1,
            angle: 0,
            health: 4,
            same_rotation: 0,
            color: 'purple',
            damage: 0.2,
        });
    }
}
function spawnItemCircle(itemType) {
    var x, y;
    do {
        x = Math.random() * (canvas.width - 40) + 20;
        y = Math.random() * (canvas.height - 40) + 20;
    } while (detectCollision(x - 10, y - 10, 20, 20));
    var color = itemType === 1 ? 'brown' : itemType === 2 ? 'blue' : itemType === 3 ? 'purple' : 'green';
    itemCircles.push({ x: x, y: y, color: color, itemType: itemType });
}
function createStructures() {
    structures = [];
    var numStructures = Math.floor(Math.random() * 5) + 3;
    for (var i = 0; i < numStructures; i++) {
        var width = Math.random() * 150 + 50;
        var height = Math.random() * 150 + 50;
        var x = void 0, y = void 0;
        do {
            x = Math.random() * (canvas.width - width);
            y = Math.random() * (canvas.height - height);
        } while (detectCollision(x, y, width, height) || hypot(x + width / 2 - hero.x, y + height / 2 - hero.y) < 50);
        structures.push({ x: x, y: y, width: width, height: height });
    }
}
function detectCollision(x, y, width, height) {
    for (var _i = 0, structures_1 = structures; _i < structures_1.length; _i++) {
        var structure = structures_1[_i];
        if (x < structure.x + structure.width &&
            x + width > structure.x &&
            y < structure.y + structure.height &&
            y + height > structure.y) {
            return true;
        }
    }
    return false;
}
function hypot(x, y) {
    return Math.sqrt(x * x + y * y);
}
function updateHero() {
    var xspeed = 0;
    var yspeed = 0;
    var currentSpeed = hero.speed;
    if (hero.dashing) {
        currentSpeed *= 3;
    }
    else if (hero.sprinting) {
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
    var newX = hero.x + xspeed;
    var newY = hero.y + yspeed;
    if (!detectCollision(newX - 10, newY - 20, 20, 40)) {
        hero.x = newX;
        hero.y = newY;
    }
    if (hero.x < 0)
        hero.x = 0;
    if (hero.y < 0)
        hero.y = 0;
    if (hero.x > canvas.width)
        hero.x = canvas.width;
    if (hero.y > canvas.height)
        hero.y = canvas.height;
}
function updateBullets() {
    hero.bullets.forEach(function (bullet) {
        bullet.x += bullet.speed * Math.cos(bullet.angle);
        bullet.y += bullet.speed * Math.sin(bullet.angle);
    });
    hero.bullets = hero.bullets.filter(function (bullet) {
        return bullet.x > 0 &&
            bullet.x < canvas.width &&
            bullet.y > 0 &&
            bullet.y < canvas.height &&
            (bullet.isPhantom || !detectCollision(bullet.x - 5, bullet.y - 5, 10, 10));
    });
}
function updateZombies() {
    zombies.forEach(function (zombie) {
        zombie.same_rotation++;
        var dist_x = hero.x - zombie.x;
        var dist_y = hero.y - zombie.y;
        var angle = Math.atan2(dist_y, dist_x);
        // Adjust angle to avoid structures for non-phantom zombies
        if (zombie.color !== 'purple') {
            var avoidanceStrength_1 = 0.5;
            structures.forEach(function (structure) {
                var structureCenterX = structure.x + structure.width / 2;
                var structureCenterY = structure.y + structure.height / 2;
                var dist_to_structure_x = structureCenterX - zombie.x;
                var dist_to_structure_y = structureCenterY - zombie.y;
                var dist_to_structure = hypot(dist_to_structure_x, dist_to_structure_y);
                if (dist_to_structure < 100) {
                    var avoidAngle = Math.atan2(dist_to_structure_y, dist_to_structure_x) + Math.PI;
                    angle += avoidanceStrength_1 / dist_to_structure * avoidAngle;
                }
            });
        }
        zombie.x += zombie.speed * Math.cos(angle);
        zombie.y += zombie.speed * Math.sin(angle);
        // Prevent zombies from going out of canvas
        if (zombie.x < 0)
            zombie.x = 0;
        if (zombie.y < 0)
            zombie.y = 0;
        if (zombie.x > canvas.width)
            zombie.x = canvas.width;
        if (zombie.y > canvas.height)
            zombie.y = canvas.height;
        // Prevent zombies from passing through structures for non-phantom zombies
        if (zombie.color !== 'purple' && detectCollision(zombie.x - 10, zombie.y - 10, 20, 20)) {
            zombie.x -= zombie.speed * Math.cos(angle);
            zombie.y -= zombie.speed * Math.sin(angle);
        }
        // Check for collision with hero
        if (hypot(zombie.x - hero.x, zombie.y - hero.y) < 20) {
            hero.health -= zombie.damage; // Decrease hero's health
            if (hero.health <= 0 && !gameOver) {
                endGame();
            }
        }
    });
}
function updateParticles() {
    particles = particles.filter(function (particle) {
        particle.x += particle.speed * Math.cos(particle.angle);
        particle.y += particle.speed * Math.sin(particle.angle);
        particle.life -= 0.1;
        return particle.life > 0;
    });
}
function drawHero() {
    ctx.save();
    ctx.translate(hero.x, hero.y);
    ctx.rotate(hero.angle * Math.PI / 180);
    ctx.fillStyle = 'blue';
    ctx.fillRect(-10, -20, 20, 40);
    ctx.restore();
    // Draw hero's health bar
    ctx.fillStyle = 'red';
    ctx.fillRect(hero.x - 20, hero.y - 30, 40, 5);
    ctx.fillStyle = 'green';
    ctx.fillRect(hero.x - 20, hero.y - 30, hero.health * 0.4, 5);
}
function drawZombies() {
    zombies.forEach(function (zombie) {
        ctx.save();
        ctx.translate(zombie.x, zombie.y);
        ctx.rotate(zombie.angle * Math.PI / 180);
        ctx.fillStyle = zombie.color;
        if (zombie.color === 'red') {
            ctx.fillRect(-15, -15, 30, 30);
        }
        else if (zombie.color === 'blue') {
            ctx.fillRect(-20, -20, 40, 40);
        }
        else if (zombie.color === 'yellow') {
            ctx.fillRect(-25, -25, 50, 50);
        }
        else if (zombie.color === 'purple') {
            ctx.fillRect(-10, -10, 20, 20);
            ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
            ctx.strokeRect(-10, -10, 20, 20);
        }
        else {
            ctx.fillRect(-10, -10, 20, 20);
        }
        ctx.restore();
    });
}
function drawBullets() {
    hero.bullets.forEach(function (bullet) {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = bullet.isPhantom ? 'purple' : 'red';
        ctx.fill();
    });
}
function drawStructures() {
    structures.forEach(function (structure) {
        ctx.fillStyle = 'gray';
        ctx.fillRect(structure.x, structure.y, structure.width, structure.height);
    });
}
function drawItemCircles() {
    itemCircles.forEach(function (circle) {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = circle.color;
        ctx.fill();
    });
}
function drawBarrels() {
    barrels.forEach(function (barrel) {
        ctx.fillStyle = 'brown';
        ctx.fillRect(barrel.x - 10, barrel.y - 10, 20, 20);
    });
}
function drawParticles() {
    particles.forEach(function (particle) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = particle.color;
        ctx.fill();
    });
}
function drawWaveText(wave) {
    ctx.save();
    ctx.font = "48px 'Creepster', cursive";
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.fillText("Wave ".concat(wave), canvas.width / 2, canvas.height / 2);
    ctx.restore();
}
function checkCollisions() {
    zombies = zombies.filter(function (zombie) {
        var hit = false;
        hero.bullets = hero.bullets.filter(function (bullet) {
            if (hypot(zombie.x - bullet.x, zombie.y - bullet.y) < 10) {
                zombie.health--;
                if (zombie.health <= 0) {
                    hit = true;
                    hero.score++;
                }
                return false;
            }
            return true;
        });
        return !hit;
    });
}
function checkBarrelCollisions() {
    barrels = barrels.filter(function (barrel) {
        var exploded = false;
        hero.bullets = hero.bullets.filter(function (bullet) {
            if (hypot(barrel.x - bullet.x, barrel.y - bullet.y) < 15) {
                explodeBarrel(barrel.x, barrel.y);
                exploded = true;
                return false;
            }
            return true;
        });
        return !exploded;
    });
}
function checkItemCircleCollisions() {
    itemCircles = itemCircles.filter(function (circle) {
        if (hypot(circle.x - hero.x, circle.y - hero.y) < 20) {
            if (circle.itemType === 1) {
                hero.barrels++;
            }
            else if (circle.itemType === 2) {
                machineGunBullets = 100;
            }
            else if (circle.itemType === 3) {
                phantomBullets = 100;
            }
            else if (circle.itemType === 4) {
                minigunBullets = 500;
            }
            updateHotbar();
            return false;
        }
        return true;
    });
}
function explodeBarrel(x, y) {
    // Create particles for the explosion
    for (var i = 0; i < 20; i++) {
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
    var explosionRadius = 75;
    zombies = zombies.filter(function (zombie) {
        if (hypot(zombie.x - x, zombie.y - y) < explosionRadius) {
            hero.score++;
            return false;
        }
        return true;
    });
}
function placeBarrel() {
    if (hero.barrels > 0) {
        var barrelX = hero.x + 20 * Math.cos(hero.angle * Math.PI / 180);
        var barrelY = hero.y + 20 * Math.sin(hero.angle * Math.PI / 180);
        if (!detectCollision(barrelX - 10, barrelY - 10, 20, 20)) {
            barrels.push({ x: barrelX, y: barrelY, color: 'brown', itemType: 1 });
            hero.barrels--;
            updateHotbar();
        }
    }
}
function endGame() {
    gameOver = true;
    scoreDisplay.textContent = 'Score: ' + hero.score;
    gameOverScreen.style.display = 'block';
}
window.tryAgain = function () {
    gameOver = false;
    gameOverScreen.style.display = 'none';
    hero.health = 100;
    hero.score = 0;
    hero.barrels = 0;
    zombies = [];
    barrels = [];
    itemCircles = [];
    particles = [];
    machineGunBullets = 100;
    phantomBullets = 100;
    minigunBullets = 500;
    machineGunActive = false;
    phantomBulletsActive = false;
    minigunActive = false;
    updateHotbar();
    wave = 1;
    waveInProgress = false;
    createStructures();
    startNewWave();
    gameLoop();
};
window.goHome = function () {
    window.location.href = 'home.html'; // Replace 'home.html' with the actual home page URL
};
function startNewWave() {
    waveInProgress = true;
    drawWaveText(wave);
    setTimeout(function () {
        spawnZombies();
        spawnItemCircle(1);
        spawnItemCircle(2);
        spawnItemCircle(3);
        spawnItemCircle(4);
        waveInProgress = false;
    }, 2000); // Delay before starting next wave
}
function gameLoop() {
    if (gameOver)
        return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateHero();
    updateBullets();
    updateZombies();
    updateParticles();
    checkCollisions();
    checkBarrelCollisions();
    checkItemCircleCollisions();
    drawStructures();
    drawHero();
    drawZombies();
    drawBullets();
    drawItemCircles();
    drawBarrels();
    drawParticles();
    if (!waveInProgress && zombies.length === 0) {
        wave++;
        startNewWave();
    }
    requestAnimationFrame(gameLoop);
}
createStructures();
startNewWave();
gameLoop();
