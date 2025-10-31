// Battle Arena - Cooperative Wave Survival
// Fight endless waves of enemies alone or with a friend!

// ===== DEBUG & DIFFICULTY SETTINGS =====
const DEBUG_MODE = true;           // Set to true for testing
const DEBUG_START_WAVE = 1;        // Which wave to start at (useful for testing bosses: 5, 10, 20)
const DEBUG_START_LEVEL = 1;       // Which level/map to start at (1, 2, 3)
const DEBUG_GODMODE = false;        // Set to true for invincibility

const DIFFICULTY = 0.5;            // Difficulty multiplier
// Examples:
// 0.1 = Very Easy (10% enemy health, 10% enemy count, faster shooting)
// 0.5 = Easy (50% enemy health, 50% enemy count)
// 1.0 = Normal (default)
// 2.0 = Hard (200% enemy health, 200% enemy count, slower shooting)
//
// DEBUG CONTROLS (when DEBUG_MODE = true):
// Press 1: Skip to Wave 5 (Bullet Pattern Boss)
// Press 2: Skip to Wave 10 (Phase Shifter Boss)
// Press 3: Skip to Wave 20 (Rotating Laser Boss)
// Press 9: Kill all enemies instantly

// =============================================================================
// ARCADE BUTTON MAPPING - COMPLETE TEMPLATE
// =============================================================================
// Reference: See button-layout.webp at hack.platan.us/assets/images/arcade/
//
// Maps arcade button codes to keyboard keys for local testing.
// Each arcade code can map to multiple keyboard keys (array values).
// The arcade cabinet sends codes like 'P1U', 'P1A', etc. when buttons are pressed.
//
// To use in your game:
//   if (key === 'P1U') { ... }  // Works on both arcade and local (via keyboard)
//
// CURRENT GAME USAGE (Snake):
//   - P1U/P1D/P1L/P1R (Joystick) → Snake Direction
//   - P1A (Button A) or START1 (Start Button) → Restart Game
// =============================================================================

const ARCADE_CONTROLS = {
  // ===== PLAYER 1 CONTROLS =====
  // Joystick - Left hand on WASD
  'P1U': ['w'],
  'P1D': ['s'],
  'P1L': ['a'],
  'P1R': ['d'],
  'P1DL': null,  // Diagonal down-left (no keyboard default)
  'P1DR': null,  // Diagonal down-right (no keyboard default)

  // Action Buttons - Right hand on home row area (ergonomic!)
  // Top row (ABC): U, I, O  |  Bottom row (XYZ): J, K, L
  'P1A': ['u'],
  'P1B': ['i'],
  'P1C': ['o'],
  'P1X': ['j'],
  'P1Y': ['k'],
  'P1Z': ['l'],

  // Start Button
  'START1': ['1', 'Enter'],

  // ===== PLAYER 2 CONTROLS =====
  // Joystick - Right hand on Arrow Keys
  'P2U': ['ArrowUp'],
  'P2D': ['ArrowDown'],
  'P2L': ['ArrowLeft'],
  'P2R': ['ArrowRight'],
  'P2DL': null,  // Diagonal down-left (no keyboard default)
  'P2DR': null,  // Diagonal down-right (no keyboard default)

  // Action Buttons - Left hand (avoiding P1's WASD keys)
  // Top row (ABC): R, T, Y  |  Bottom row (XYZ): F, G, H
  'P2A': ['r'],
  'P2B': ['t'],
  'P2C': ['y'],
  'P2X': ['f'],
  'P2Y': ['g'],
  'P2Z': ['h'],

  // Start Button
  'START2': ['2']
};

// Build reverse lookup: keyboard key → arcade button code
const KEYBOARD_TO_ARCADE = {};
for (const [arcadeCode, keyboardKeys] of Object.entries(ARCADE_CONTROLS)) {
  if (keyboardKeys) {
    // Handle both array and single value
    const keys = Array.isArray(keyboardKeys) ? keyboardKeys : [keyboardKeys];
    keys.forEach(key => {
      KEYBOARD_TO_ARCADE[key] = arcadeCode;
    });
  }
}


// MENU SCENE
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Title
    this.add.text(400, 100, 'BATTLE ARENA', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ff0000',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(400, 160, 'COOPERATIVE SURVIVAL', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 1 Player button
    const btn1 = this.add.rectangle(400, 280, 300, 80, 0x00ff00);
    this.add.text(400, 280, '1 PLAYER', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#000'
    }).setOrigin(0.5);

    btn1.setInteractive({ useHandCursor: true });
    btn1.on('pointerover', () => btn1.setFillStyle(0x00dd00));
    btn1.on('pointerout', () => btn1.setFillStyle(0x00ff00));
    btn1.on('pointerdown', () => {
      this.scene.start('GameScene', { players: 1 });
    });

    // 2 Players button
    const btn2 = this.add.rectangle(400, 400, 300, 80, 0x0099ff);
    this.add.text(400, 400, '2 PLAYERS CO-OP', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#fff'
    }).setOrigin(0.5);

    btn2.setInteractive({ useHandCursor: true });
    btn2.on('pointerover', () => btn2.setFillStyle(0x0077dd));
    btn2.on('pointerout', () => btn2.setFillStyle(0x0099ff));
    btn2.on('pointerdown', () => {
      this.scene.start('GameScene', { players: 2 });
    });

    // Instructions
    this.add.text(400, 520, 'P1: WASD + Q + E | P2: IJKL + U + O', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#888'
    }).setOrigin(0.5);
  }
}

// ENEMY TYPE DEFINITIONS
const ENEMY_TYPES = {
  triangle: {
    health: 30,
    speed: 80,
    shootDelay: 2000,
    color: 0xff6600,
    points: 10,
    size: 30,
    rotates: true
  },
  square: {
    health: 50,
    speed: 60,
    shootDelay: 3000,
    color: 0xff00ff,
    points: 20,
    size: 30,
    rotates: false
  },
  pentagon: {
    health: 80,
    speed: 50,
    shootDelay: 5000,
    color: 0x00ffff,
    points: 50,
    size: 35,
    rotates: false
  }
};

// BOSS TYPE DEFINITIONS
const BOSS_TYPES = {
  pattern: {
    health: 500,
    speed: 30,
    shootDelay: 1500,
    color: 0xffff00,
    points: 500,
    size: 60,
    wave: 5,
    name: 'BULLET PATTERN'
  },
  phase: {
    health: 1200,
    speed: 40,
    shootDelay: 2000,
    color: 0xff0088,
    points: 1000,
    size: 70,
    wave: 10,
    name: 'PHASE SHIFTER'
  },
  laser: {
    health: 2000,
    speed: 20,
    shootDelay: 800,
    color: 0x00ffaa,
    points: 2000,
    size: 80,
    wave: 20,
    name: 'ROTATING LASER'
  }
};

// MAP LAYOUTS
const MAP_LAYOUTS = [
  // Map 1 (waves 1-9)
  [
    {x: 200, y: 150, w: 60, h: 60},
    {x: 600, y: 150, w: 60, h: 60},
    {x: 200, y: 450, w: 60, h: 60},
    {x: 600, y: 450, w: 60, h: 60},
    {x: 400, y: 300, w: 80, h: 80}
  ],
  // Map 2 (waves 11-19)
  [
    {x: 400, y: 150, w: 100, h: 40},
    {x: 400, y: 450, w: 100, h: 40},
    {x: 200, y: 300, w: 40, h: 100},
    {x: 600, y: 300, w: 40, h: 100}
  ],
  // Map 3 (waves 21+)
  [
    {x: 300, y: 200, w: 80, h: 80},
    {x: 500, y: 400, w: 80, h: 80},
    {x: 300, y: 400, w: 50, h: 50},
    {x: 500, y: 200, w: 50, h: 50},
    {x: 400, y: 300, w: 60, h: 60}
  ]
];

// GAME SCENE
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.numPlayers = data.players || 1;

    // Apply debug settings
    if (DEBUG_MODE && data.wave === undefined) {
      this.wave = DEBUG_START_WAVE - 1;
      this.level = DEBUG_START_LEVEL;
    } else {
      this.wave = data.wave || 0;
      this.level = data.level || 1;
    }

    this.score = data.score || 0;
    this.gameOver = false;
    this.currentBoss = null;
    this.bossActive = false;
    this.doorsOpen = false;
    this.transitioning = false;
  }

  create() {
    // Graphics object
    this.graphics = this.add.graphics();

    // Arena walls (divididos con espacios para puertas)
    this.walls = this.physics.add.staticGroup();

    // Muro superior: dividido en 2 segmentos (izquierda y derecha de puerta)
    // Puerta en x: 380-420
    const wallTopLeft = this.walls.create(190, 10, null); // x: 0-380
    wallTopLeft.body.setSize(380, 20);
    wallTopLeft.setVisible(false);

    const wallTopRight = this.walls.create(610, 10, null); // x: 420-800
    wallTopRight.body.setSize(380, 20);
    wallTopRight.setVisible(false);

    // Muro inferior: dividido en 2 segmentos
    const wallBottomLeft = this.walls.create(190, 590, null); // x: 0-380
    wallBottomLeft.body.setSize(380, 20);
    wallBottomLeft.setVisible(false);

    const wallBottomRight = this.walls.create(610, 590, null); // x: 420-800
    wallBottomRight.body.setSize(380, 20);
    wallBottomRight.setVisible(false);

    // Muro izquierdo: dividido en 2 segmentos (arriba y abajo de puerta)
    // Puerta en y: 280-320
    const wallLeftTop = this.walls.create(10, 140, null); // y: 0-280
    wallLeftTop.body.setSize(20, 280);
    wallLeftTop.setVisible(false);

    const wallLeftBottom = this.walls.create(10, 460, null); // y: 320-600
    wallLeftBottom.body.setSize(20, 280);
    wallLeftBottom.setVisible(false);

    // Muro derecho: dividido en 2 segmentos
    const wallRightTop = this.walls.create(790, 140, null); // y: 0-280
    wallRightTop.body.setSize(20, 280);
    wallRightTop.setVisible(false);

    const wallRightBottom = this.walls.create(790, 460, null); // y: 320-600
    wallRightBottom.body.setSize(20, 280);
    wallRightBottom.setVisible(false);

    // Muros de puertas (se activan/desactivan dinámicamente)
    this.doorWalls = this.physics.add.staticGroup();
    this.doorWallTop = this.doorWalls.create(400, 10, null);
    this.doorWallTop.body.setSize(40, 20);
    this.doorWallTop.setVisible(false);

    this.doorWallBottom = this.doorWalls.create(400, 590, null);
    this.doorWallBottom.body.setSize(40, 20);
    this.doorWallBottom.setVisible(false);

    this.doorWallLeft = this.doorWalls.create(10, 300, null);
    this.doorWallLeft.body.setSize(20, 40);
    this.doorWallLeft.setVisible(false);

    this.doorWallRight = this.doorWalls.create(790, 300, null);
    this.doorWallRight.body.setSize(20, 40);
    this.doorWallRight.setVisible(false);

    // Door zones (overlap para detección cuando están abiertas)
    this.doorZones = this.physics.add.staticGroup();
    this.doorTop = this.doorZones.create(400, 10, null);
    this.doorTop.body.setSize(40, 20);
    this.doorTop.setVisible(false);

    this.doorBottom = this.doorZones.create(400, 590, null);
    this.doorBottom.body.setSize(40, 20);
    this.doorBottom.setVisible(false);

    this.doorLeft = this.doorZones.create(10, 300, null);
    this.doorLeft.body.setSize(20, 40);
    this.doorLeft.setVisible(false);

    this.doorRight = this.doorZones.create(790, 300, null);
    this.doorRight.body.setSize(20, 40);
    this.doorRight.setVisible(false);

    // Obstacles (loaded dynamically)
    this.obstacles = this.physics.add.staticGroup();
    this.obstacleData = [];
    this.loadMap();

    // Players
    this.p1 = this.physics.add.sprite(300, 300, null);
    this.p1.setSize(30, 30);
    this.p1.setVisible(false);
    this.p1.health = 100;
    this.p1.speed = 200;
    this.p1.angle = 0;
    this.p1.specialCooldown = 0;

    this.players = [this.p1];

    if (this.numPlayers === 2) {
      this.p2 = this.physics.add.sprite(500, 300, null);
      this.p2.setSize(30, 30);
      this.p2.setVisible(false);
      this.p2.health = 100;
      this.p2.speed = 200;
      this.p2.angle = 0;
      this.p2.specialCooldown = 0;
      this.players.push(this.p2);
    }

    // Bullets
    this.playerBullets = this.physics.add.group();
    this.playerSpecialBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();

    // Enemies
    this.enemies = this.physics.add.group();

    // Collisions
    this.players.forEach(p => {
      this.physics.add.collider(p, this.walls);
      this.physics.add.collider(p, this.doorWalls);
      this.physics.add.collider(p, this.obstacles);
    });

    this.physics.add.collider(this.playerBullets, this.walls, (b) => b.destroy());
    this.physics.add.collider(this.playerBullets, this.doorWalls, (b) => b.destroy());
    this.physics.add.collider(this.playerBullets, this.obstacles, (b) => b.destroy());
    this.physics.add.collider(this.playerSpecialBullets, this.walls, (b) => b.destroy());
    this.physics.add.collider(this.playerSpecialBullets, this.doorWalls, (b) => b.destroy());
    this.physics.add.collider(this.playerSpecialBullets, this.obstacles, (b) => b.destroy());
    this.physics.add.collider(this.enemyBullets, this.walls, (b) => b.destroy());
    this.physics.add.collider(this.enemyBullets, this.doorWalls, (b) => b.destroy());
    this.physics.add.collider(this.enemyBullets, this.obstacles, (b) => b.destroy());
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.enemies, this.doorWalls);
    this.physics.add.collider(this.enemies, this.obstacles);

    // Player bullets hit enemies
    this.physics.add.overlap(this.playerBullets, this.enemies, (b, e) => this.hitEnemy(e, b, 10));
    this.physics.add.overlap(this.playerSpecialBullets, this.enemies, (b, e) => this.hitEnemy(e, b, 25));

    // Enemy bullets hit players
    this.physics.add.overlap(this.enemyBullets, this.p1, (p, b) => this.hitPlayer(p, b));
    if (this.numPlayers === 2) {
      this.physics.add.overlap(this.enemyBullets, this.p2, (p, b) => this.hitPlayer(p, b));
    }

    // Door collision detection (overlap, no blocking)
    this.physics.add.overlap(this.p1, this.doorZones, (p, d) => this.handleDoorOverlap(p, d));
    if (this.numPlayers === 2) {
      this.physics.add.overlap(this.p2, this.doorZones, (p, d) => this.handleDoorOverlap(p, d));
    }

    // Controls
    this.keys = this.input.keyboard.addKeys({
      w: 'W', a: 'A', s: 'S', d: 'D',
      q: 'Q', e: 'E',
      up: 'I', down: 'K', left: 'J', right: 'L',
      shoot2: 'U', special2: 'O',
      r: 'R'
    });

    // Debug controls
    if (DEBUG_MODE) {
      this.input.keyboard.on('keydown-ONE', () => this.debugSkipToWave(5));
      this.input.keyboard.on('keydown-TWO', () => this.debugSkipToWave(10));
      this.input.keyboard.on('keydown-THREE', () => this.debugSkipToWave(20));
      this.input.keyboard.on('keydown-NINE', () => this.debugKillAllEnemies());
    }

    // UI
    this.hpText1 = this.add.text(20, 20, 'P1: 100 HP', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#0f0'
    });

    if (this.numPlayers === 2) {
      this.hpText2 = this.add.text(780, 20, 'P2: 100 HP', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#09f'
      }).setOrigin(1, 0);
    }

    this.waveText = this.add.text(400, 20, 'Wave: 1', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ff0'
    }).setOrigin(0.5, 0);

    this.scoreText = this.add.text(400, 45, 'Score: 0', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#fff'
    }).setOrigin(0.5, 0);

    // Debug info
    if (DEBUG_MODE || DEBUG_GODMODE || DIFFICULTY !== 1.0) {
      let debugText = '';
      if (DEBUG_MODE) debugText += 'DEBUG MODE | ';
      if (DEBUG_GODMODE) debugText += 'GODMODE | ';
      if (DIFFICULTY !== 1.0) debugText += 'Difficulty: ' + DIFFICULTY + 'x';

      this.add.text(400, 580, debugText, {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#f0f'
      }).setOrigin(0.5, 1);
    }

    // Cooldowns
    this.lastShot1 = 0;
    this.lastShot2 = 0;

    // Wave system
    this.spawnTimer = 0;
    this.spawnDelay = 2000;
    this.enemiesThisWave = 0;
    this.enemiesPerWave = 5;
    this.startNextWave();
  }

  update(time, delta) {
    if (this.gameOver) return;

    // Clear and redraw
    this.graphics.clear();

    // Draw walls
    this.graphics.fillStyle(0x444444);
    this.graphics.fillRect(0, 0, 800, 20);
    this.graphics.fillRect(0, 580, 800, 20);
    this.graphics.fillRect(0, 0, 20, 600);
    this.graphics.fillRect(780, 0, 20, 600);

    // Draw doors
    this.graphics.fillStyle(this.doorsOpen ? 0x00ffff : 0x00ff00);
    this.graphics.fillRect(380, 0, 40, 20);    // Top
    this.graphics.fillRect(380, 580, 40, 20);  // Bottom
    this.graphics.fillRect(0, 280, 20, 40);    // Left
    this.graphics.fillRect(780, 280, 20, 40);  // Right

    // Draw obstacles
    this.graphics.fillStyle(0x666666);
    this.obstacleData.forEach(obs => {
      this.graphics.fillRect(obs.x - obs.w/2, obs.y - obs.h/2, obs.w, obs.h);
    });

    // Draw players
    this.graphics.fillStyle(0x00ff00);
    this.graphics.fillCircle(this.p1.x, this.p1.y, 15);
    this.graphics.lineStyle(3, 0x00ff00);
    const angle1 = this.p1.angle * Math.PI / 180;
    this.graphics.lineBetween(this.p1.x, this.p1.y,
      this.p1.x + Math.cos(angle1) * 20,
      this.p1.y + Math.sin(angle1) * 20);

    // Special cooldown bar P1
    this.drawCooldownBar(20, 45, this.p1.specialCooldown);

    if (this.numPlayers === 2) {
      this.graphics.fillStyle(0x0099ff);
      this.graphics.fillCircle(this.p2.x, this.p2.y, 15);
      this.graphics.lineStyle(3, 0x0099ff);
      const angle2 = this.p2.angle * Math.PI / 180;
      this.graphics.lineBetween(this.p2.x, this.p2.y,
        this.p2.x + Math.cos(angle2) * 20,
        this.p2.y + Math.sin(angle2) * 20);

      // Special cooldown bar P2
      this.drawCooldownBar(680, 45, this.p2.specialCooldown);
    }

    // Draw bullets
    this.playerBullets.children.entries.forEach(b => {
      this.graphics.fillStyle(b.color);
      this.graphics.fillCircle(b.x, b.y, 4);
    });

    this.playerSpecialBullets.children.entries.forEach(b => {
      this.graphics.fillStyle(b.color);
      this.graphics.fillCircle(b.x, b.y, 8);
      this.graphics.lineStyle(2, b.color, 0.5);
      this.graphics.strokeCircle(b.x, b.y, 12);
    });

    this.enemyBullets.children.entries.forEach(b => {
      this.graphics.fillStyle(0xff0000);
      this.graphics.fillCircle(b.x, b.y, 5);
    });

    // Draw enemies
    this.enemies.children.entries.forEach(e => {
      if (e.isBoss) this.drawBoss(e);
      else this.drawEnemy(e);
    });

    // Player 1 movement
    this.updatePlayer(this.p1, this.keys.w, this.keys.s, this.keys.a, this.keys.d, time, 1, this.keys.q, this.keys.e);

    // Player 2 movement
    if (this.numPlayers === 2) {
      this.updatePlayer(this.p2, this.keys.up, this.keys.down, this.keys.left, this.keys.right, time, 2, this.keys.shoot2, this.keys.special2);
    }

    // Update enemies
    this.enemies.children.entries.forEach(e => {
      if (e.isBoss) this.updateBoss(e, time, delta);
      else this.updateEnemy(e, time, delta);
    });

    // Spawn enemies or boss
    if (!this.bossActive) {
      this.spawnTimer += delta;
      if (this.spawnTimer >= this.spawnDelay && this.enemiesThisWave < this.enemiesPerWave) {
        this.spawnTimer = 0;
        this.spawnEnemy();
        this.enemiesThisWave++;
      }
    }

    // Check wave complete (pero no si las puertas están abiertas esperando transición)
    if (this.enemiesThisWave >= this.enemiesPerWave && this.enemies.children.size === 0 && !this.bossActive && !this.doorsOpen) {
      this.startNextWave();
    }

    // Update UI
    this.hpText1.setText('P1: ' + Math.max(0, Math.floor(this.p1.health)) + ' HP');
    if (this.numPlayers === 2) {
      this.hpText2.setText('P2: ' + Math.max(0, Math.floor(this.p2.health)) + ' HP');
    }

    // Update cooldowns
    if (this.p1.specialCooldown > 0) this.p1.specialCooldown -= delta;
    if (this.numPlayers === 2 && this.p2.specialCooldown > 0) this.p2.specialCooldown -= delta;
  }

  drawCooldownBar(x, y, cooldown) {
    const barWidth = 100;
    const barHeight = 8;
    const percent = Math.max(0, 1 - (cooldown / 2000));

    this.graphics.fillStyle(0x333333);
    this.graphics.fillRect(x, y, barWidth, barHeight);

    if (percent > 0) {
      this.graphics.fillStyle(percent >= 1 ? 0x00ff00 : 0xffaa00);
      this.graphics.fillRect(x, y, barWidth * percent, barHeight);
    }
  }

  updatePlayer(player, upKey, downKey, leftKey, rightKey, time, playerNum, shootKey, specialKey) {
    player.setVelocity(0);
    let moveX = 0, moveY = 0;
    if (upKey.isDown) moveY = -1;
    if (downKey.isDown) moveY = 1;
    if (leftKey.isDown) moveX = -1;
    if (rightKey.isDown) moveX = 1;

    if (moveX !== 0 || moveY !== 0) {
      player.angle = Math.atan2(moveY, moveX) * 180 / Math.PI;
      const len = Math.sqrt(moveX*moveX + moveY*moveY);
      player.setVelocity(moveX/len * player.speed, moveY/len * player.speed);
    }

    // Shooting
    const lastShot = playerNum === 1 ? this.lastShot1 : this.lastShot2;
    if (Phaser.Input.Keyboard.JustDown(shootKey) && time - lastShot > 300) {
      this.shootPlayer(player, false);
      if (playerNum === 1) this.lastShot1 = time;
      else this.lastShot2 = time;
    }

    if (Phaser.Input.Keyboard.JustDown(specialKey) && player.specialCooldown <= 0) {
      this.shootPlayer(player, true);
      player.specialCooldown = 2000;
    }
  }

  shootPlayer(player, special) {
    const angle = player.angle * Math.PI / 180;
    const speed = special ? 250 : 400;
    const group = special ? this.playerSpecialBullets : this.playerBullets;
    const color = player === this.p1 ? 0x00ff00 : 0x0099ff;

    if (special) {
      for (let i = -1; i <= 1; i++) {
        const spreadAngle = angle + i * 0.3;
        const b = group.create(
          player.x + Math.cos(spreadAngle) * 25,
          player.y + Math.sin(spreadAngle) * 25
        );
        b.setSize(16, 16);
        b.setVisible(false);
        b.setVelocity(Math.cos(spreadAngle) * speed, Math.sin(spreadAngle) * speed);
        b.color = color;

        this.time.delayedCall(3000, () => {
          if (b && b.active) b.destroy();
        });
      }
      this.playSound(600, 0.15);
    } else {
      const b = group.create(
        player.x + Math.cos(angle) * 25,
        player.y + Math.sin(angle) * 25
      );
      b.setSize(8, 8);
      b.setVisible(false);
      b.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      b.color = color;

      this.time.delayedCall(2000, () => {
        if (b && b.active) b.destroy();
      });
      this.playSound(800, 0.08);
    }
  }

  spawnEnemy() {
    const side = Phaser.Math.Between(0, 3);
    let x, y;

    if (side === 0) { x = 400; y = 30; }          // Top
    else if (side === 1) { x = 400; y = 570; }    // Bottom
    else if (side === 2) { x = 30; y = 300; }     // Left
    else { x = 770; y = 300; }                     // Right

    // Choose enemy type based on wave
    let typeName;
    const rand = Math.random();
    if (this.wave >= 3 && rand < 0.2) {
      typeName = 'pentagon';
    } else if (rand < 0.5) {
      typeName = 'triangle';
    } else {
      typeName = 'square';
    }

    const typeData = ENEMY_TYPES[typeName];
    const enemy = this.enemies.create(x, y, null);
    enemy.setSize(typeData.size, typeData.size);
    enemy.setVisible(false);
    enemy.type = typeName;
    enemy.health = Math.ceil(typeData.health * DIFFICULTY);
    enemy.speed = typeData.speed;
    enemy.shootDelay = typeData.shootDelay / DIFFICULTY;
    enemy.lastShot = 0;
    enemy.angle = 0;
    enemy.burstPhase = 0;
  }

  updateEnemy(enemy, time, delta) {
    // Move towards nearest player
    let target = this.p1;
    if (this.numPlayers === 2) {
      const d1 = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.p1.x, this.p1.y);
      const d2 = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.p2.x, this.p2.y);
      if (d2 < d1) target = this.p2;
    }

    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    // Update angle if enemy rotates
    const typeData = ENEMY_TYPES[enemy.type];
    if (typeData.rotates) {
      enemy.angle = Math.atan2(dy, dx) * 180 / Math.PI;
    }

    if (dist > 150) {
      enemy.setVelocity(dx/dist * enemy.speed, dy/dist * enemy.speed);
    } else {
      enemy.setVelocity(0);
    }

    // Shoot
    if (time - enemy.lastShot > enemy.shootDelay) {
      this.shootEnemy(enemy, target, time);
      enemy.lastShot = time;
    }
  }

  shootEnemy(enemy, target) {
    const speed = 200;

    if (enemy.type === 'triangle') {
      // Shoot from one corner
      const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
      const b = this.enemyBullets.create(
        enemy.x + Math.cos(angle) * 20,
        enemy.y + Math.sin(angle) * 20
      );
      b.setSize(10, 10);
      b.setVisible(false);
      b.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

      this.time.delayedCall(3000, () => {
        if (b && b.active) b.destroy();
      });
      this.playSound(400, 0.1);
    } else if (enemy.type === 'square') {
      // Shoot from 4 corners
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI / 2);
        const b = this.enemyBullets.create(
          enemy.x + Math.cos(angle) * 20,
          enemy.y + Math.sin(angle) * 20
        );
        b.setSize(10, 10);
        b.setVisible(false);
        b.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

        this.time.delayedCall(3000, () => {
          if (b && b.active) b.destroy();
        });
      }
      this.playSound(400, 0.1);
    } else if (enemy.type === 'pentagon') {
      // First burst: 5 bullets from sides (evenly spaced)
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2 / 5);
        const b = this.enemyBullets.create(
          enemy.x + Math.cos(angle) * 20,
          enemy.y + Math.sin(angle) * 20
        );
        b.setSize(10, 10);
        b.setVisible(false);
        b.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

        this.time.delayedCall(3000, () => {
          if (b && b.active) b.destroy();
        });
      }
      this.playSound(450, 0.12);

      // Second burst: 5 bullets from corners (offset by half angle)
      this.time.delayedCall(250, () => {
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2 / 5) + (Math.PI / 5);
          const b = this.enemyBullets.create(
            enemy.x + Math.cos(angle) * 20,
            enemy.y + Math.sin(angle) * 20
          );
          b.setSize(10, 10);
          b.setVisible(false);
          b.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

          this.time.delayedCall(3000, () => {
            if (b && b.active) b.destroy();
          });
        }
        this.playSound(450, 0.12);
      });
    }
  }

  drawEnemy(enemy) {
    const typeData = ENEMY_TYPES[enemy.type];
    this.graphics.fillStyle(typeData.color);

    if (enemy.type === 'triangle') {
      // Save the graphics state
      this.graphics.save();

      // Translate to enemy position and rotate
      this.graphics.translateCanvas(enemy.x, enemy.y);
      this.graphics.rotateCanvas(enemy.angle * Math.PI / 180);

      // Draw triangle pointing right (default direction at 0 degrees)
      this.graphics.fillTriangle(
        15, 0,      // Right point (tip)
        -10, -12,   // Top-left
        -10, 12     // Bottom-left
      );

      // Restore graphics state
      this.graphics.restore();
    } else if (enemy.type === 'square') {
      this.graphics.fillRect(enemy.x - 15, enemy.y - 15, 30, 30);
    } else if (enemy.type === 'pentagon') {
      // Draw pentagon using 5 vertices
      const radius = 17;
      this.graphics.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2 / 5) - Math.PI / 2;
        const x = enemy.x + Math.cos(angle) * radius;
        const y = enemy.y + Math.sin(angle) * radius;
        if (i === 0) this.graphics.moveTo(x, y);
        else this.graphics.lineTo(x, y);
      }
      this.graphics.closePath();
      this.graphics.fillPath();
    }
  }

  hitEnemy(enemy, bullet, damage) {
    bullet.destroy();

    // Handle phase boss splitting
    if (enemy.isBoss && enemy.bossType === 'phase' && !enemy.hasChildren) {
      const health = enemy.health;
      if (health > enemy.maxHealth * 0.66 && health - damage <= enemy.maxHealth * 0.66) {
        this.splitPhaseBoss(enemy, 'square', 2);
      } else if (health > enemy.maxHealth * 0.33 && health - damage <= enemy.maxHealth * 0.33) {
        this.splitPhaseBoss(enemy, 'triangle', 2);
      }
    }

    enemy.health -= damage;

    if (enemy.health <= 0) {
      if (enemy.isBoss) {
        const typeData = BOSS_TYPES[enemy.bossType];
        this.score += typeData.points;
        this.scoreText.setText('Score: ' + this.score);
        this.bossActive = false;
        this.openDoors();
        this.playSound(600, 0.3);

        // Show message
        const msg = this.add.text(400, 300, 'BOSS DEFEATED!\nGo through the doors!', {
          fontSize: '32px',
          fontFamily: 'Arial',
          color: '#0ff',
          align: 'center'
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => msg.destroy());
      } else {
        const typeData = ENEMY_TYPES[enemy.type];
        this.score += typeData.points;
        this.scoreText.setText('Score: ' + this.score);
        this.playSound(500, 0.1);
      }
      enemy.destroy();
    } else {
      this.playSound(300, 0.05);
    }
  }

  hitPlayer(player, bullet) {
    bullet.destroy();

    if (!DEBUG_GODMODE) {
      player.health -= 10;
      this.playSound(200, 0.1);

      if (player.health <= 0) {
        this.endGame();
      }
    }
  }

  startNextWave() {
    this.wave++;
    this.waveText.setText('Wave: ' + this.wave);
    this.enemiesThisWave = 0;
    this.spawnDelay = Math.max(800, (2000 - (this.wave - 1) * 100) / DIFFICULTY);

    // Check if this is a boss wave
    if (this.wave === 5 || this.wave === 10 || this.wave === 20) {
      this.spawnBoss();
      this.enemiesPerWave = 1;
    } else {
      this.enemiesPerWave = Math.max(1, Math.ceil((5 + (this.wave - 1) * 2) * DIFFICULTY));
    }
  }

  endGame() {
    this.gameOver = true;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, 800, 600);

    this.add.text(400, 200, 'GAME OVER', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#f00',
      stroke: '#000',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(400, 280, 'Wave: ' + this.wave, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ff0'
    }).setOrigin(0.5);

    this.add.text(400, 320, 'Score: ' + this.score, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#fff'
    }).setOrigin(0.5);

    this.add.text(400, 400, 'Press R to return to menu', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#fff'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-R', () => {
      this.scene.start('MenuScene');
    });

    this.playSound(300, 0.3);
  }

  playSound(freq, dur) {
    const ctx = this.sound.context;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = freq;
    osc.type = 'square';

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  }

  loadMap() {
    // Clear existing obstacles
    this.obstacles.clear(true, true);
    this.obstacleData = [];

    // Get map layout based on level
    const mapIndex = Math.min(this.level - 1, MAP_LAYOUTS.length - 1);
    const layout = MAP_LAYOUTS[mapIndex];

    // Create obstacles from layout
    layout.forEach(obs => {
      const obstacle = this.obstacles.create(obs.x, obs.y, null);
      obstacle.body.setSize(obs.w, obs.h);
      obstacle.setVisible(false);
      this.obstacleData.push(obs);
    });
  }

  spawnBoss() {
    this.bossActive = true;
    this.enemiesThisWave = 1;

    // Determine boss type
    let bossType;
    if (this.wave === 5) bossType = 'pattern';
    else if (this.wave === 10) bossType = 'phase';
    else bossType = 'laser';

    const typeData = BOSS_TYPES[bossType];
    const boss = this.enemies.create(400, 300, null);
    boss.setSize(typeData.size, typeData.size);
    boss.setVisible(false);
    boss.isBoss = true;
    boss.bossType = bossType;
    boss.health = Math.ceil(typeData.health * DIFFICULTY);
    boss.maxHealth = Math.ceil(typeData.health * DIFFICULTY);
    boss.speed = typeData.speed;
    boss.shootDelay = typeData.shootDelay / DIFFICULTY;
    boss.lastShot = 0;
    boss.angle = 0;
    boss.patternIndex = 0;
    boss.hasChildren = false;

    // Variables para el pattern boss (espiral)
    boss.attackPhase = 0; // 0: espiral, 1: pausa, 2: ondas, 3: pausa
    boss.phaseStartTime = 0;
    boss.spiralBulletCount = 0;

    this.currentBoss = boss;

    // Show boss intro message
    const msg = this.add.text(400, 250, 'WARNING!\n' + typeData.name, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#f00',
      align: 'center',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => msg.destroy());
    this.playSound(200, 0.5);
  }

  updateBoss(boss, time, delta) {
    if (boss.bossType === 'pattern') {
      // Slow circular movement
      const angle = time * 0.0005;
      const radius = 100;
      const centerX = 400;
      const centerY = 300;
      boss.setVelocity(
        (Math.cos(angle) * radius - (boss.x - centerX)) * 2,
        (Math.sin(angle) * radius - (boss.y - centerY)) * 2
      );

      // Manejar fases del ataque
      if (boss.phaseStartTime === 0) boss.phaseStartTime = time;
      const phaseTime = time - boss.phaseStartTime;

      if (boss.attackPhase === 0) {
        // Fase espiral: 2 segundos disparando
        if (phaseTime < 2000) {
          // Disparar cada 100ms
          if (time - boss.lastShot > 100) {
            const progress = boss.spiralBulletCount / 20;
            this.shootSpiralAnimated(boss, progress, 2, Math.PI, 200, 3000);
            this.playSound(500, 0.05);
            boss.lastShot = time;
            boss.spiralBulletCount++;
          }
        } else {
          boss.attackPhase = 1;
          boss.phaseStartTime = time;
        }
      } else if (boss.attackPhase === 1) {
        // Pausa 1: 2 segundos
        if (phaseTime >= 2000) {
          boss.attackPhase = 2;
          boss.phaseStartTime = time;
        }
      } else if (boss.attackPhase === 2) {
        // Fase ondas: disparar 2 ondas de balas
        if (phaseTime < 100) {
          this.shootWave(boss, 50, 0, 200, 3000);
          this.playSound(600, 0.2);
        } else if (phaseTime >= 500 && phaseTime < 600) {
          this.shootWave(boss, 50, 0, 200, 3000);
          this.playSound(600, 0.2);
        } else if (phaseTime >= 2000) {
          boss.attackPhase = 3;
          boss.phaseStartTime = time;
        }
      } else if (boss.attackPhase === 3) {
        // Pausa 2: 2 segundos
        if (phaseTime >= 2000) {
          boss.attackPhase = 0;
          boss.phaseStartTime = time;
          boss.spiralBulletCount = 0;
        }
      }
    } else if (boss.bossType === 'laser') {
      // Rotate constantly
      boss.angle += delta * 0.05;
      // Stay in center
      boss.setVelocity((400 - boss.x) * 2, (300 - boss.y) * 2);

      // Shoot: 4 líneas rotatorias
      if (time - boss.lastShot > boss.shootDelay) {
        this.shootRotatingLines(boss, 4, 7, 100, boss.angle * Math.PI / 180, 200, 2000);
        this.playSound(400, 0.12);
        boss.lastShot = time;
      }
    } else if (boss.bossType === 'phase' && !boss.hasChildren) {
      // Move towards nearest player
      let target = this.p1;
      if (this.numPlayers === 2) {
        const d1 = Phaser.Math.Distance.Between(boss.x, boss.y, this.p1.x, this.p1.y);
        const d2 = Phaser.Math.Distance.Between(boss.x, boss.y, this.p2.x, this.p2.y);
        if (d2 < d1) target = this.p2;
      }
      const dx = target.x - boss.x;
      const dy = target.y - boss.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > 100) {
        boss.setVelocity(dx/dist * boss.speed, dy/dist * boss.speed);
      } else {
        boss.setVelocity(0);
      }

      // Shoot: onda circular de 6 direcciones
      if (time - boss.lastShot > boss.shootDelay) {
        this.shootWave(boss, 6, 0, 200, 3000);
        this.playSound(450, 0.12);
        boss.lastShot = time;
      }
    }
  }

  // ===== SISTEMA MODULAR DE DISPAROS DE BOSSES =====
  // Este sistema permite crear patrones de disparo reutilizables.
  // Para crear un nuevo boss o enemigo, simplemente llama a estas funciones
  // con diferentes parámetros desde updateBoss() o updateEnemy().
  //
  // Ejemplos de uso:
  // - Boss con espiral de 3 brazos: shootSpiralAnimated(boss, progress, 3, Math.PI*2, 250, 2500)
  // - Enemigo con 8 direcciones: shootWave(enemy, 8, 0, 180, 2000)
  // - Boss con 6 líneas: shootRotatingLines(boss, 6, 5, 120, 0, 220, 1800)
  // - Espiral completa: shootSpiral(boss, 40, 4, Math.PI*4, 0, 200, 3000)

  // Función genérica para crear una bala desde una posición y ángulo
  shootBossBullet(x, y, angle, speed, lifetime) {
    const b = this.enemyBullets.create(x, y);
    b.setSize(10, 10);
    b.setVisible(false);
    b.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.time.delayedCall(lifetime, () => { if (b && b.active) b.destroy(); });
    return b;
  }

  // Patrón: Disparo en espiral
  // bulletCount: número de balas a disparar
  // arms: número de brazos de la espiral
  // rotation: ángulo total de rotación (en radianes)
  // angleOffset: ángulo inicial (en radianes)
  shootSpiral(source, bulletCount, arms, rotation, angleOffset, speed, lifetime) {
    for (let i = 0; i < bulletCount; i++) {
      const progress = i / bulletCount;
      const baseAngle = angleOffset + (progress * rotation);

      for (let arm = 0; arm < arms; arm++) {
        const angle = baseAngle + (arm * Math.PI * 2 / arms);
        this.shootBossBullet(source.x, source.y, angle, speed, lifetime);
      }
    }
  }

  // Patrón: Onda circular (explosión radial)
  // bulletCount: número de balas en el círculo
  // angleOffset: ángulo inicial de rotación (en radianes)
  shootWave(source, bulletCount, angleOffset, speed, lifetime) {
    for (let i = 0; i < bulletCount; i++) {
      const angle = angleOffset + (i * Math.PI * 2 / bulletCount);
      this.shootBossBullet(source.x, source.y, angle, speed, lifetime);
    }
  }

  // Patrón: Líneas rotatorias
  // lineCount: número de líneas
  // bulletPerLine: balas por línea
  // lineLength: longitud de cada línea
  // angleOffset: ángulo inicial (en radianes)
  shootRotatingLines(source, lineCount, bulletPerLine, lineLength, angleOffset, speed, lifetime) {
    for (let i = 0; i < lineCount; i++) {
      const angle = angleOffset + (i * Math.PI * 2 / lineCount);
      for (let dist = 20; dist < lineLength; dist += (lineLength - 20) / bulletPerLine) {
        const x = source.x + Math.cos(angle) * dist;
        const y = source.y + Math.sin(angle) * dist;
        this.shootBossBullet(x, y, angle, speed, lifetime);
      }
    }
  }

  // Patrón: Espiral animada (para usar con tiempo)
  // progress: valor entre 0 y 1 que indica el avance de la espiral
  // arms: número de brazos de la espiral
  // maxRotation: rotación máxima (en radianes)
  shootSpiralAnimated(source, progress, arms, maxRotation, speed, lifetime) {
    const angle = progress * maxRotation;
    for (let arm = 0; arm < arms; arm++) {
      const armAngle = angle + (arm * Math.PI * 2 / arms);
      this.shootBossBullet(source.x, source.y, armAngle, speed, lifetime);
    }
  }


  drawBoss(boss) {
    const typeData = BOSS_TYPES[boss.bossType];
    this.graphics.fillStyle(typeData.color);

    if (boss.bossType === 'pattern') {
      // Estrella de 6 puntas
      this.graphics.beginPath();
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI / 6) - Math.PI / 2;
        const radius = i % 2 === 0 ? 35 : 15;
        const x = boss.x + Math.cos(angle) * radius;
        const y = boss.y + Math.sin(angle) * radius;
        if (i === 0) this.graphics.moveTo(x, y);
        else this.graphics.lineTo(x, y);
      }
      this.graphics.closePath();
      this.graphics.fillPath();
    } else if (boss.bossType === 'phase' && !boss.hasChildren) {
      // Estrella de 8 puntas
      this.graphics.beginPath();
      for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI / 8) - Math.PI / 2;
        const radius = i % 2 === 0 ? 40 : 18;
        const x = boss.x + Math.cos(angle) * radius;
        const y = boss.y + Math.sin(angle) * radius;
        if (i === 0) this.graphics.moveTo(x, y);
        else this.graphics.lineTo(x, y);
      }
      this.graphics.closePath();
      this.graphics.fillPath();
    } else if (boss.bossType === 'laser') {
      // Estrella de 10 puntas rotando
      this.graphics.save();
      this.graphics.translateCanvas(boss.x, boss.y);
      this.graphics.rotateCanvas(boss.angle * Math.PI / 180);
      this.graphics.beginPath();
      for (let i = 0; i < 20; i++) {
        const angle = (i * Math.PI / 10);
        const radius = i % 2 === 0 ? 45 : 20;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) this.graphics.moveTo(x, y);
        else this.graphics.lineTo(x, y);
      }
      this.graphics.closePath();
      this.graphics.fillPath();
      this.graphics.restore();
    }

    // Draw health bar
    const barW = 100;
    const barH = 8;
    const barX = boss.x - barW / 2;
    const barY = boss.y - 50;
    const healthPercent = boss.health / boss.maxHealth;

    this.graphics.fillStyle(0x000000);
    this.graphics.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
    this.graphics.fillStyle(0xff0000);
    this.graphics.fillRect(barX, barY, barW, barH);
    this.graphics.fillStyle(0x00ff00);
    this.graphics.fillRect(barX, barY, barW * healthPercent, barH);
  }

  splitPhaseBoss(boss, childType, count) {
    boss.hasChildren = true;
    const typeData = ENEMY_TYPES[childType];

    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2 / count);
      const enemy = this.enemies.create(
        boss.x + Math.cos(angle) * 50,
        boss.y + Math.sin(angle) * 50,
        null
      );
      enemy.setSize(typeData.size, typeData.size);
      enemy.setVisible(false);
      enemy.type = childType;
      enemy.health = typeData.health * 2;
      enemy.speed = typeData.speed;
      enemy.shootDelay = typeData.shootDelay;
      enemy.lastShot = 0;
      enemy.angle = 0;
      enemy.isBoss = false;
    }
    this.playSound(400, 0.2);
  }

  openDoors() {
    this.doorsOpen = true;

    // Desactivar colisión de los muros de las puertas
    this.doorWallTop.body.enable = false;
    this.doorWallBottom.body.enable = false;
    this.doorWallLeft.body.enable = false;
    this.doorWallRight.body.enable = false;

    console.log('¡Puertas abiertas!');
  }

  closeDoors() {
    this.doorsOpen = false;

    // Reactivar colisión de los muros de las puertas
    this.doorWallTop.body.enable = true;
    this.doorWallBottom.body.enable = true;
    this.doorWallLeft.body.enable = true;
    this.doorWallRight.body.enable = true;
  }

  handleDoorOverlap(player, door) {
    if (!this.doorsOpen || this.transitioning) return;

    console.log('¡Jugador tocando puerta! Door:', door.x, door.y, 'Player:', player.x, player.y);
    this.nextLevel();
  }

  nextLevel() {
    if (this.transitioning) return; // Evitar múltiples llamadas
    this.transitioning = true;

    this.level++;
    this.closeDoors(); // Cerrar puertas para el nuevo nivel

    console.log('Avanzando al nivel:', this.level, 'Wave actual:', this.wave);

    // Restart scene with new level, manteniendo el wave actual
    this.scene.restart({
      players: this.numPlayers,
      level: this.level,
      wave: this.wave, // Mantener el wave donde estábamos
      score: this.score
    });
  }

  // Debug functions
  debugSkipToWave(targetWave) {
    this.enemies.clear(true, true);
    this.enemyBullets.clear(true, true);
    this.wave = targetWave - 1;
    this.bossActive = false;
    this.doorsOpen = false;
    this.startNextWave();
  }

  debugKillAllEnemies() {
    this.enemies.clear(true, true);
    this.bossActive = false;
  }
}

// GAME CONFIG
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#0a0a0a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(config);
