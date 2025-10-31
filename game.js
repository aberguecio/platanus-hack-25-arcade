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
    rotates: false,
    minWave: 3 // Aparece desde wave 3
  },
  hexagon: {
    health: 120,
    speed: 30,
    shootDelay: 300, // Dispara cada 300ms durante 6 segundos
    color: 0x00ff88,
    points: 80,
    size: 38,
    rotates: false,
    minWave: 7
  },
  octagon: {
    health: 150,
    speed: 55,
    shootDelay: 3000,
    color: 0xaa00ff,
    points: 120,
    size: 40,
    rotates: false,
    minWave: 12
  },
  spinner: {
    health: 180,
    speed: 50,
    shootDelay: 500, // Dispara cada 500ms
    color: 0xff66aa,
    points: 150,
    size: 35,
    rotates: true, // Rota constantemente
    minWave: 16
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

// POWERUP TYPE DEFINITIONS
const POWERUP_TYPES = {
  extraBullet: {
    name: 'Extra Bullet',
    rarity: 'common',
    color: 0xffff00,
    cooldownPenalty: 500, // Solo afecta a este powerup específico
    description: '+1 Special Bullet'
  },
  speedBoost: {
    name: 'Speed Boost',
    rarity: 'common',
    color: 0x00aaff,
    cooldownPenalty: 0,
    description: '+10% Speed'
  },
  fireRate: {
    name: 'Fire Rate Up',
    rarity: 'common',
    color: 0xff8800,
    cooldownPenalty: -100, // Reduce cooldown del disparo normal
    description: 'Faster Shooting'
  },
  shield: {
    name: 'Shield',
    rarity: 'common',
    color: 0x00ffff,
    cooldownPenalty: 0,
    description: '1 Free Hit'
  },
  pierceShot: {
    name: 'Pierce Shot',
    rarity: 'common',
    color: 0xff00aa,
    cooldownPenalty: 50,
    description: 'Bullets Pierce +1'
  },
  moreDamage: {
    name: 'More Damage',
    rarity: 'common',
    color: 0xff0000,
    cooldownPenalty: 50,
    description: '+25% Damage'
  },
  backShot: {
    name: 'Back Shot',
    rarity: 'common',
    color: 0xffaa00,
    cooldownPenalty: 0,
    description: 'Shoot Backward on Special'
  },

  // RAROS (5% sin daño primero, luego común)
  spreadShot: {
    name: 'Spread Shot',
    rarity: 'rare',
    color: 0xaa00ff,
    cooldownPenalty: 50,
    description: '+2 Normal Bullets'
  },
  homingBullets: {
    name: 'Homing Bullets',
    rarity: 'rare',
    color: 0xff66ff,
    cooldownPenalty: 0,
    description: 'Bullets Home In'
  },
  bounce: {
    name: 'Bounce',
    rarity: 'rare',
    color: 0x66ff66,
    cooldownPenalty: 0,
    description: 'Bullets Bounce +1'
  },
  iceBullets: {
    name: 'Ice Bullets',
    rarity: 'rare',
    color: 0x00ccff,
    cooldownPenalty: 0,
    description: 'Freeze Enemies'
  },
  fireBullets: {
    name: 'Fire Bullets',
    rarity: 'rare',
    color: 0xff4400,
    cooldownPenalty: 0,
    description: 'Burn Enemies'
  },
  electricBullets: {
    name: 'Electric Bullets',
    rarity: 'rare',
    color: 0xffff00,
    cooldownPenalty: 0,
    description: 'Stun Enemies'
  },

  // ESPECIALES
  heart: {
    name: 'Heart',
    rarity: 'special',
    color: 0xff0066,
    cooldownPenalty: 0,
    description: '+1 Heart'
  },
  maxHeart: {
    name: 'Max Heart',
    rarity: 'rare',
    color: 0xff00ff,
    cooldownPenalty: 0,
    description: 'Max Hearts +1'
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
    this.lastEnemyPosition = null;

    // Guardar estado de jugadores para restaurar después
    this.p1State = data.p1State || null;
    this.p2State = data.p2State || null;
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

    // Players (sistema de corazones)
    this.p1 = this.physics.add.sprite(300, 300, null);
    this.p1.setSize(30, 30);
    this.p1.setVisible(false);
    this.p1.health = this.p1State ? this.p1State.health : 5;
    this.p1.maxHealth = this.p1State ? this.p1State.maxHealth : 5;
    this.p1.baseSpeed = 200;
    this.p1.speed = this.p1State ? this.p1State.speed : 200;
    this.p1.angle = 0;
    this.p1.specialCooldown = 0;

    // Powerup stats
    this.p1.specialBullets = this.p1State ? this.p1State.specialBullets : 1;
    this.p1.specialCooldownPenalty = this.p1State ? this.p1State.specialCooldownPenalty : 0;
    this.p1.normalShotCooldown = this.p1State ? this.p1State.normalShotCooldown : 300;
    this.p1.hasShield = this.p1State ? this.p1State.hasShield : false;
    this.p1.pierce = this.p1State ? this.p1State.pierce : 0;
    this.p1.damageMultiplier = this.p1State ? this.p1State.damageMultiplier : 1.0;
    this.p1.spreadBullets = this.p1State ? this.p1State.spreadBullets : 1;
    this.p1.homingStrength = this.p1State ? this.p1State.homingStrength : 0;
    this.p1.bounceCount = this.p1State ? this.p1State.bounceCount : 0;
    this.p1.hasBackShot = this.p1State ? this.p1State.hasBackShot : false;
    // Sistema elemental: duraciones (cada powerup suma 1s)
    this.p1.iceDuration = this.p1State ? this.p1State.iceDuration : 0; // 4s base + 1s por powerup
    this.p1.fireDuration = this.p1State ? this.p1State.fireDuration : 0; // 3s base + 1s por powerup
    this.p1.electricDuration = this.p1State ? this.p1State.electricDuration : 0; // 2s base + 1s por powerup

    this.players = [this.p1];

    if (this.numPlayers === 2) {
      this.p2 = this.physics.add.sprite(500, 300, null);
      this.p2.setSize(30, 30);
      this.p2.setVisible(false);
      this.p2.health = this.p2State ? this.p2State.health : 5;
      this.p2.maxHealth = this.p2State ? this.p2State.maxHealth : 5;
      this.p2.baseSpeed = 200;
      this.p2.speed = this.p2State ? this.p2State.speed : 200;
      this.p2.angle = 0;
      this.p2.specialCooldown = 0;

      // Powerup stats
      this.p2.specialBullets = this.p2State ? this.p2State.specialBullets : 1;
      this.p2.specialCooldownPenalty = this.p2State ? this.p2State.specialCooldownPenalty : 0;
      this.p2.normalShotCooldown = this.p2State ? this.p2State.normalShotCooldown : 300;
      this.p2.hasShield = this.p2State ? this.p2State.hasShield : false;
      this.p2.pierce = this.p2State ? this.p2State.pierce : 0;
      this.p2.damageMultiplier = this.p2State ? this.p2State.damageMultiplier : 1.0;
      this.p2.spreadBullets = this.p2State ? this.p2State.spreadBullets : 1;
      this.p2.homingStrength = this.p2State ? this.p2State.homingStrength : 0;
      this.p2.bounceCount = this.p2State ? this.p2State.bounceCount : 0;
      this.p2.hasBackShot = this.p2State ? this.p2State.hasBackShot : false;
      // Sistema elemental: duraciones (cada powerup suma 1s)
      this.p2.iceDuration = this.p2State ? this.p2State.iceDuration : 0;
      this.p2.fireDuration = this.p2State ? this.p2State.fireDuration : 0;
      this.p2.electricDuration = this.p2State ? this.p2State.electricDuration : 0;

      this.players.push(this.p2);
    }

    // Bullets
    this.playerBullets = this.physics.add.group();
    this.playerSpecialBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();

    // Enemies
    this.enemies = this.physics.add.group();

    // Powerups
    this.powerups = this.physics.add.group();

    // Track damage this wave
    this.damageTakenThisWave = false;

    // Collisions
    this.players.forEach(p => {
      this.physics.add.collider(p, this.walls);
      this.physics.add.collider(p, this.doorWalls);
      this.physics.add.collider(p, this.obstacles);
    });

    this.physics.add.collider(this.playerBullets, this.walls, (b, wall) => this.handleBulletWallCollision(b, wall));
    this.physics.add.collider(this.playerBullets, this.doorWalls, (b, wall) => this.handleBulletWallCollision(b, wall));
    this.physics.add.collider(this.playerBullets, this.obstacles, (b, wall) => this.handleBulletWallCollision(b, wall));
    this.physics.add.collider(this.playerSpecialBullets, this.walls, (b, wall) => this.handleBulletWallCollision(b, wall));
    this.physics.add.collider(this.playerSpecialBullets, this.doorWalls, (b, wall) => this.handleBulletWallCollision(b, wall));
    this.physics.add.collider(this.playerSpecialBullets, this.obstacles, (b, wall) => this.handleBulletWallCollision(b, wall));
    this.physics.add.collider(this.enemyBullets, this.walls, (b) => b.destroy());
    this.physics.add.collider(this.enemyBullets, this.doorWalls, (b) => b.destroy());
    this.physics.add.collider(this.enemyBullets, this.obstacles, (b) => b.destroy());
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.enemies, this.doorWalls);
    this.physics.add.collider(this.enemies, this.obstacles);

    // Player bullets hit enemies
    this.physics.add.overlap(this.playerBullets, this.enemies, (b, e) => this.hitEnemy(e, b));
    this.physics.add.overlap(this.playerSpecialBullets, this.enemies, (b, e) => this.hitEnemy(e, b));

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

    // Powerup collision detection
    this.physics.add.overlap(this.p1, this.powerups, (p, pow) => this.collectPowerup(p, pow));
    if (this.numPlayers === 2) {
      this.physics.add.overlap(this.p2, this.powerups, (p, pow) => this.collectPowerup(p, pow));
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

    // Shield visual P1
    if (this.p1.hasShield) {
      const pulse = Math.sin(time * 0.01) * 0.3 + 0.7;
      this.graphics.lineStyle(3, 0x00ffff, pulse);
      this.graphics.strokeCircle(this.p1.x, this.p1.y, 22);
    }

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

      // Shield visual P2
      if (this.p2.hasShield) {
        const pulse = Math.sin(time * 0.01) * 0.3 + 0.7;
        this.graphics.lineStyle(3, 0x00ffff, pulse);
        this.graphics.strokeCircle(this.p2.x, this.p2.y, 22);
      }

      // Special cooldown bar P2
      this.drawCooldownBar(680, 45, this.p2.specialCooldown);
    }

    // Draw bullets
    this.playerBullets.children.entries.forEach(b => {
      this.graphics.fillStyle(b.color);
      this.graphics.fillCircle(b.x, b.y, 4);
      // Guardar velocidad previa para rebotes (Phaser pone velocidad en 0 durante colisión)
      if (b.body && (b.body.velocity.x !== 0 || b.body.velocity.y !== 0)) {
        b.prevVelocity = { x: b.body.velocity.x, y: b.body.velocity.y };
      }
    });

    this.playerSpecialBullets.children.entries.forEach(b => {
      this.graphics.fillStyle(b.color);
      this.graphics.fillCircle(b.x, b.y, 8);
      this.graphics.lineStyle(2, b.color, 0.5);
      this.graphics.strokeCircle(b.x, b.y, 12);
      // Guardar velocidad previa para rebotes
      if (b.body && (b.body.velocity.x !== 0 || b.body.velocity.y !== 0)) {
        b.prevVelocity = { x: b.body.velocity.x, y: b.body.velocity.y };
      }
    });

    this.enemyBullets.children.entries.forEach(b => {
      this.graphics.fillStyle(0xff0000);
      this.graphics.fillCircle(b.x, b.y, 5);
    });

    // Draw enemies
    this.enemies.children.entries.forEach(e => {
      if (e.isBoss) this.drawBoss(e);
      else this.drawEnemy(e);

      // Dibujar efectos visuales de estados elementales
      if (e.isFrozen) {
        // Efecto visual de hielo: rombos celestes transparentes
        this.graphics.fillStyle(0x00ccff, 0.5);
        this.graphics.save();
        this.graphics.translateCanvas(e.x, e.y);

        // Rombos en diferentes posiciones
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI / 2) + (time * 0.001);
          const radius = 20 + Math.sin(time * 0.005 + i) * 5;
          const rx = Math.cos(angle) * radius;
          const ry = Math.sin(angle) * radius;

          this.graphics.fillTriangle(rx, ry - 5, rx - 4, ry, rx, ry + 5);
          this.graphics.fillTriangle(rx, ry - 5, rx + 4, ry, rx, ry + 5);
        }

        this.graphics.restore();
      }

      if (e.isBurning) {
        // Efecto visual de fuego: partículas rojas que suben
        const burnPhase = time * 0.005;
        this.graphics.fillStyle(0xff4400, 0.8);

        for (let i = 0; i < 6; i++) {
          const yOffset = ((burnPhase + i * 0.3) % 1.0) * -25;
          const xOffset = Math.sin(burnPhase * 2 + i) * 8;
          const size = 3 + Math.sin(burnPhase + i) * 2;
          this.graphics.fillCircle(e.x + xOffset, e.y + 15 + yOffset, size);
        }

        this.graphics.fillStyle(0xff8800, 0.6);
        for (let i = 0; i < 4; i++) {
          const yOffset = ((burnPhase * 1.2 + i * 0.25) % 1.0) * -22;
          const xOffset = Math.cos(burnPhase * 2 + i) * 6;
          this.graphics.fillCircle(e.x + xOffset, e.y + 12 + yOffset, 2);
        }
      }

      if (e.isElectrocuted) {
        // Efecto visual eléctrico: rayos amarillos
        const sparkPhase = time * 0.02;
        this.graphics.lineStyle(2, 0xffff00, 0.9);

        // Rayos que rodean al enemigo
        for (let i = 0; i < 5; i++) {
          const angle = (sparkPhase + i * 0.4) * Math.PI * 2;
          const radius = 18 + Math.sin(sparkPhase * 3 + i) * 8;
          const x1 = e.x + Math.cos(angle) * radius;
          const y1 = e.y + Math.sin(angle) * radius;

          // Rayos zigzag
          const segments = 3;
          let prevX = x1;
          let prevY = y1;
          for (let j = 1; j <= segments; j++) {
            const targetAngle = angle + Math.PI + (Math.random() - 0.5) * 0.5;
            const targetRadius = radius * (1 - j / segments);
            const newX = e.x + Math.cos(targetAngle) * targetRadius;
            const newY = e.y + Math.sin(targetAngle) * targetRadius;
            this.graphics.lineBetween(prevX, prevY, newX, newY);
            prevX = newX;
            prevY = newY;
          }
        }

        // Chispas pequeñas
        this.graphics.fillStyle(0xffff00, 0.8);
        for (let i = 0; i < 8; i++) {
          const angle = (sparkPhase * 2 + i * 0.8) * Math.PI * 2;
          const radius = 22;
          this.graphics.fillCircle(
            e.x + Math.cos(angle) * radius,
            e.y + Math.sin(angle) * radius,
            2
          );
        }
      }
    });

    // Draw powerups
    this.powerups.children.entries.forEach(p => {
      this.drawPowerup(p);
    });

    // Player 1 movement
    this.updatePlayer(this.p1, this.keys.w, this.keys.s, this.keys.a, this.keys.d, time, 1, this.keys.q, this.keys.e);

    // Player 2 movement
    if (this.numPlayers === 2) {
      this.updatePlayer(this.p2, this.keys.up, this.keys.down, this.keys.left, this.keys.right, time, 2, this.keys.shoot2, this.keys.special2);
    }

    // Update homing bullets
    this.playerBullets.children.entries.forEach(b => {
      if (b.homingStrength && b.homingStrength > 0 && this.enemies.children.size > 0) {
        // Find nearest enemy
        let nearest = null;
        let minDist = Infinity;
        this.enemies.children.entries.forEach(e => {
          const dist = Phaser.Math.Distance.Between(b.x, b.y, e.x, e.y);
          if (dist < minDist) {
            minDist = dist;
            nearest = e;
          }
        });

        if (nearest) {
          // Adjust velocity toward enemy
          const angle = Math.atan2(nearest.y - b.y, nearest.x - b.x);
          const currentAngle = Math.atan2(b.body.velocity.y, b.body.velocity.x);
          const speed = Math.sqrt(b.body.velocity.x ** 2 + b.body.velocity.y ** 2);

          // Blend between current direction and target direction based on homing strength
          const turnRate = 0.05 * b.homingStrength; // More strength = faster turning
          const newAngle = currentAngle + Math.atan2(Math.sin(angle - currentAngle), Math.cos(angle - currentAngle)) * turnRate;

          b.setVelocity(Math.cos(newAngle) * speed, Math.sin(newAngle) * speed);
        }
      }
    });

    this.playerSpecialBullets.children.entries.forEach(b => {
      if (b.homingStrength && b.homingStrength > 0 && this.enemies.children.size > 0) {
        // Find nearest enemy
        let nearest = null;
        let minDist = Infinity;
        this.enemies.children.entries.forEach(e => {
          const dist = Phaser.Math.Distance.Between(b.x, b.y, e.x, e.y);
          if (dist < minDist) {
            minDist = dist;
            nearest = e;
          }
        });

        if (nearest) {
          // Adjust velocity toward enemy
          const angle = Math.atan2(nearest.y - b.y, nearest.x - b.x);
          const currentAngle = Math.atan2(b.body.velocity.y, b.body.velocity.x);
          const speed = Math.sqrt(b.body.velocity.x ** 2 + b.body.velocity.y ** 2);

          // Blend between current direction and target direction based on homing strength
          const turnRate = 0.05 * b.homingStrength; // More strength = faster turning
          const newAngle = currentAngle + Math.atan2(Math.sin(angle - currentAngle), Math.cos(angle - currentAngle)) * turnRate;

          b.setVelocity(Math.cos(newAngle) * speed, Math.sin(newAngle) * speed);
        }
      }
    });

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
      this.trySpawnPowerup(false, this.lastEnemyPosition); // false = no es boss
      this.startNextWave();
    }

    // Update UI (corazones)
    const hearts1 = '♥'.repeat(Math.max(0, this.p1.health)) + '♡'.repeat(Math.max(0, this.p1.maxHealth - this.p1.health));
    this.hpText1.setText('P1: ' + hearts1);
    if (this.numPlayers === 2) {
      const hearts2 = '♥'.repeat(Math.max(0, this.p2.health)) + '♡'.repeat(Math.max(0, this.p2.maxHealth - this.p2.health));
      this.hpText2.setText('P2: ' + hearts2);
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
    const shootCooldown = player.normalShotCooldown || 300;
    if (Phaser.Input.Keyboard.JustDown(shootKey) && time - lastShot > shootCooldown) {
      this.shootPlayer(player, false);
      if (playerNum === 1) this.lastShot1 = time;
      else this.lastShot2 = time;
    }

    if (Phaser.Input.Keyboard.JustDown(specialKey) && player.specialCooldown <= 0) {
      this.shootPlayer(player, true);
      player.specialCooldown = 2000 + (player.specialCooldownPenalty || 0);
    }
  }

  shootPlayer(player, special) {
    const angle = player.angle * Math.PI / 180;
    const speed = special ? 250 : 400;
    const group = special ? this.playerSpecialBullets : this.playerBullets;
    const color = player === this.p1 ? 0x00ff00 : 0x0099ff;

    if (special) {
      // Balas especiales
      const bulletCount = player.specialBullets || 1;
      const spread = bulletCount > 1 ? 0.3 : 0;
      const baseDamage = 25;
      const damage = Math.floor(baseDamage * player.damageMultiplier);

      // Determinar elemento si tiene algún powerup elemental
      let elementalType = null;
      const elementals = [];
      if (player.iceDuration > 0) elementals.push('ice');
      if (player.fireDuration > 0) elementals.push('fire');
      if (player.electricDuration > 0) elementals.push('electric');

      if (elementals.length > 0) {
        // Elegir uno al azar si tiene múltiples
        elementalType = elementals[Math.floor(Math.random() * elementals.length)];
      }

      for (let i = 0; i < bulletCount; i++) {
        const offset = (i - (bulletCount - 1) / 2) * spread;
        const spreadAngle = angle + offset;
        const b = group.create(
          player.x + Math.cos(spreadAngle) * 25,
          player.y + Math.sin(spreadAngle) * 25
        );
        b.setSize(16, 16);
        b.setVisible(false);
        b.setVelocity(Math.cos(spreadAngle) * speed, Math.sin(spreadAngle) * speed);
        b.damage = damage;
        b.pierce = player.pierce;
        b.bounceCount = player.bounceCount;
        b.bounces = 0;
        b.homingStrength = player.homingStrength;
        b.owner = player;

        // Aplicar elemento y color
        if (elementalType) {
          b.elementalType = elementalType;
          if (elementalType === 'ice') b.color = 0x00ccff;
          else if (elementalType === 'fire') b.color = 0xff4400;
          else if (elementalType === 'electric') b.color = 0xffff00;
        } else {
          b.color = color;
        }

        this.time.delayedCall(3000, () => {
          if (b && b.active) b.destroy();
        });
      }

      // BackShot: dispara una bala hacia atrás con el poder especial
      if (player.hasBackShot) {
        const backAngle = angle + Math.PI; // 180 grados opuesto
        const b = group.create(
          player.x + Math.cos(backAngle) * 25,
          player.y + Math.sin(backAngle) * 25
        );
        b.setSize(16, 16);
        b.setVisible(false);
        b.setVelocity(Math.cos(backAngle) * speed, Math.sin(backAngle) * speed);
        b.damage = damage;
        b.pierce = player.pierce;
        b.bounceCount = player.bounceCount;
        b.bounces = 0;
        b.homingStrength = player.homingStrength;
        b.owner = player;

        // Aplicar mismo elemento que las balas frontales
        if (elementalType) {
          b.elementalType = elementalType;
          if (elementalType === 'ice') b.color = 0x00ccff;
          else if (elementalType === 'fire') b.color = 0xff4400;
          else if (elementalType === 'electric') b.color = 0xffff00;
        } else {
          b.color = color;
        }

        this.time.delayedCall(3000, () => {
          if (b && b.active) b.destroy();
        });
      }

      this.playSound(600, 0.2);
    } else {
      // Balas normales con spread
      const bulletCount = player.spreadBullets || 1;
      const spread = bulletCount > 1 ? 0.25 : 0;
      const baseDamage = 10;
      const damage = Math.floor(baseDamage * player.damageMultiplier);

      for (let i = 0; i < bulletCount; i++) {
        const offset = (i - (bulletCount - 1) / 2) * spread;
        const spreadAngle = angle + offset;
        const b = group.create(
          player.x + Math.cos(spreadAngle) * 25,
          player.y + Math.sin(spreadAngle) * 25
        );
        b.setSize(8, 8);
        b.setVisible(false);
        b.setVelocity(Math.cos(spreadAngle) * speed, Math.sin(spreadAngle) * speed);
        b.color = color;
        b.damage = damage;
        b.pierce = player.pierce;
        b.bounceCount = player.bounceCount;
        b.bounces = 0;
        b.homingStrength = player.homingStrength;
        b.owner = player;

        this.time.delayedCall(2000, () => {
          if (b && b.active) b.destroy();
        });
      }
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

    // Choose enemy type based on wave progression
    let typeName;
    const availableTypes = ['triangle']; // Always available

    // Wave 3+: Add square and pentagon
    if (this.wave >= 3) {
      availableTypes.push('square');
      availableTypes.push('pentagon');
    }

    // Wave 7+: Add hexagon
    if (this.wave >= 7) {
      availableTypes.push('hexagon');
    }

    // Wave 12+: Add octagon
    if (this.wave >= 12) {
      availableTypes.push('octagon');
    }

    // Wave 16+: Add spinner
    if (this.wave >= 16) {
      availableTypes.push('spinner');
    }

    // Random selection from available types
    typeName = availableTypes[Math.floor(Math.random() * availableTypes.length)];

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
    // Electrocuted: paralizado completamente
    if (enemy.isElectrocuted) {
      const elapsed = time - enemy.electrocutedTime;
      if (elapsed < enemy.electrocutedDuration) {
        // Paralizado: no movimiento, no disparo
        enemy.setVelocity(0);
        return; // Salir completamente de updateEnemy
      } else {
        enemy.isElectrocuted = false; // Termina efecto
      }
    }

    // Manejo de estados elementales
    // Frozen: reducir velocidad y cadencia de disparo
    let speedMultiplier = 1.0;
    let shootDelayMultiplier = 1.0;

    if (enemy.isFrozen) {
      const elapsed = time - enemy.frozenTime;
      if (elapsed < enemy.frozenDuration) {
        speedMultiplier = 0.3; // 70% más lento
        shootDelayMultiplier = 2.0; // Dispara 2x más lento
      } else {
        enemy.isFrozen = false; // Termina efecto
      }
    }

    // Burning: daño periódico
    if (enemy.isBurning) {
      const elapsed = time - enemy.burnStartTime;
      if (elapsed < enemy.burnDuration) {
        // Aplicar daño cada 500ms
        if (time - enemy.burnTickTime > 500) {
          enemy.health -= 2; // 2 daño por tick
          enemy.burnTickTime = time;
          this.playSound(200, 0.03);

          if (enemy.health <= 0) {
            // Guardar posición antes de destruir
            const deathPosition = { x: enemy.x, y: enemy.y };
            this.lastEnemyPosition = deathPosition;

            if (enemy.isBoss) {
              const typeData = BOSS_TYPES[enemy.bossType];
              this.score += typeData.points;
              this.scoreText.setText('Score: ' + this.score);
              this.bossActive = false;
              this.openDoors();
              this.playSound(600, 0.3);
              this.trySpawnPowerup(true, deathPosition);
            } else {
              const typeData = ENEMY_TYPES[enemy.type];
              this.score += typeData.points;
              this.scoreText.setText('Score: ' + this.score);
              this.playSound(500, 0.1);
            }
            enemy.destroy();
            return; // Importante: salir de updateEnemy
          }
        }
      } else {
        enemy.isBurning = false; // Termina efecto
      }
    }

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

    // Spinner: constant rotation (reducido si congelado)
    if (enemy.type === 'spinner') {
      enemy.angle += 3 * speedMultiplier; // Rotate slower if frozen
      if (enemy.angle >= 360) enemy.angle -= 360;
    }

    if (dist > 150) {
      const effectiveSpeed = enemy.speed * speedMultiplier;
      enemy.setVelocity(dx/dist * effectiveSpeed, dy/dist * effectiveSpeed);
    } else {
      enemy.setVelocity(0);
    }

    // Hexagon: special shooting pattern (6s rapid fire, 2s pause)
    if (enemy.type === 'hexagon') {
      if (!enemy.shootingCycle) {
        enemy.shootingCycle = 0; // Track time in current cycle
      }
      enemy.shootingCycle += delta;

      const cycleTime = 8000; // 6s shooting + 2s pause
      const shootingDuration = 6000;
      const cyclePosition = enemy.shootingCycle % cycleTime;

      if (cyclePosition < shootingDuration) {
        // Shooting phase
        const effectiveShootDelay = enemy.shootDelay * shootDelayMultiplier;
        if (time - enemy.lastShot > effectiveShootDelay) {
          this.shootEnemy(enemy, target, time);
          enemy.lastShot = time;
        }
      }
      // Otherwise, pause phase - don't shoot
    } else {
      // Normal shooting for other enemies
      const effectiveShootDelay = enemy.shootDelay * shootDelayMultiplier;
      if (time - enemy.lastShot > effectiveShootDelay) {
        this.shootEnemy(enemy, target, time);
        enemy.lastShot = time;
      }
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

      // Third burst: 5 bullets nuevamente desde los lados (mismo patrón que el primero)
      this.time.delayedCall(500, () => {
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
      });
    } else if (enemy.type === 'hexagon') {
      // Dispara 6 direcciones
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2 / 6);
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
      this.playSound(500, 0.1);
    } else if (enemy.type === 'octagon') {
      // Dispara 8 direcciones
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2 / 8);
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
      this.playSound(550, 0.12);
    } else if (enemy.type === 'spinner') {
      // Dispara 2 balas hacia el jugador
      const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
      for (let i = 0; i < 2; i++) {
        const offsetAngle = angle + (i === 0 ? -0.1 : 0.1);
        const b = this.enemyBullets.create(
          enemy.x + Math.cos(offsetAngle) * 20,
          enemy.y + Math.sin(offsetAngle) * 20
        );
        b.setSize(10, 10);
        b.setVisible(false);
        b.setVelocity(Math.cos(offsetAngle) * speed, Math.sin(offsetAngle) * speed);

        this.time.delayedCall(3000, () => {
          if (b && b.active) b.destroy();
        });
      }
      this.playSound(600, 0.1);
    }
  }

  drawEnemy(enemy) {
    const typeData = ENEMY_TYPES[enemy.type];
    this.graphics.fillStyle(typeData.color);

    if (enemy.type === 'triangle') {
      this.graphics.save();
      this.graphics.translateCanvas(enemy.x, enemy.y);
      this.graphics.rotateCanvas(enemy.angle * Math.PI / 180);
      this.graphics.fillTriangle(15, 0, -10, -12, -10, 12);
      this.graphics.restore();
    } else if (enemy.type === 'square') {
      this.graphics.fillRect(enemy.x - 15, enemy.y - 15, 30, 30);
    } else if (enemy.type === 'pentagon') {
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
    } else if (enemy.type === 'hexagon') {
      const radius = 19;
      this.graphics.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2 / 6) - Math.PI / 2;
        const x = enemy.x + Math.cos(angle) * radius;
        const y = enemy.y + Math.sin(angle) * radius;
        if (i === 0) this.graphics.moveTo(x, y);
        else this.graphics.lineTo(x, y);
      }
      this.graphics.closePath();
      this.graphics.fillPath();
    } else if (enemy.type === 'octagon') {
      const radius = 20;
      this.graphics.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2 / 8) - Math.PI / 2;
        const x = enemy.x + Math.cos(angle) * radius;
        const y = enemy.y + Math.sin(angle) * radius;
        if (i === 0) this.graphics.moveTo(x, y);
        else this.graphics.lineTo(x, y);
      }
      this.graphics.closePath();
      this.graphics.fillPath();
    } else if (enemy.type === 'spinner') {
      // Dos triángulos rotando
      this.graphics.save();
      this.graphics.translateCanvas(enemy.x, enemy.y);
      this.graphics.rotateCanvas(enemy.angle * Math.PI / 180);

      // Triángulo 1 (apuntando hacia arriba)
      this.graphics.fillTriangle(0, -15, -10, 5, 10, 5);

      // Triángulo 2 (apuntando hacia abajo, rotado 180°)
      this.graphics.fillTriangle(0, 15, -10, -5, 10, -5);

      this.graphics.restore();
    }
  }

  handleBulletWallCollision(bullet, wall) {
    // If bullet is in ignore collision state, don't process
    if (bullet.ignoreWallCollision) {
      return false; // Return false to prevent collision
    }

    // Check if bullet has bounce capability
    if (bullet.bounceCount && bullet.bounceCount > 0) {
      // Track how many times this bullet has bounced
      if (!bullet.bounces) bullet.bounces = 0;

      if (bullet.bounces < bullet.bounceCount) {
        bullet.bounces++;

        // Phaser pone la velocidad en 0 durante colisión, usar velocidad previa
        // Guardar velocidad previa si existe, sino usar un valor por defecto
        let speed = 400; // velocidad por defecto de las balas
        if (bullet.prevVelocity) {
          speed = Math.sqrt(bullet.prevVelocity.x ** 2 + bullet.prevVelocity.y ** 2);
        }

        // Determinar la dirección del rebote basándose en la posición relativa
        const dx = bullet.x - wall.x;
        const dy = bullet.y - wall.y;

        // Normalizar por las dimensiones de la pared
        const normalizedDx = Math.abs(dx) / (wall.body.halfWidth + bullet.body.halfWidth);
        const normalizedDy = Math.abs(dy) / (wall.body.halfHeight + bullet.body.halfHeight);

        // Calcular nueva velocidad basada en la dirección de colisión
        let newVelX, newVelY;

        if (normalizedDx > normalizedDy) {
          // Colisión lateral (izquierda/derecha) - reflejar X
          newVelX = bullet.prevVelocity ? -bullet.prevVelocity.x : (dx > 0 ? speed : -speed);
          newVelY = bullet.prevVelocity ? bullet.prevVelocity.y : 0;

          // Empujar la bala lejos de la pared
          if (dx < 0) {
            bullet.x = wall.x - wall.body.halfWidth - bullet.body.halfWidth - 10;
          } else {
            bullet.x = wall.x + wall.body.halfWidth + bullet.body.halfWidth + 10;
          }
        } else {
          // Colisión vertical (arriba/abajo) - reflejar Y
          newVelX = bullet.prevVelocity ? bullet.prevVelocity.x : 0;
          newVelY = bullet.prevVelocity ? -bullet.prevVelocity.y : (dy > 0 ? speed : -speed);

          // Empujar la bala lejos de la pared
          if (dy < 0) {
            bullet.y = wall.y - wall.body.halfHeight - bullet.body.halfHeight - 10;
          } else {
            bullet.y = wall.y + wall.body.halfHeight + bullet.body.halfHeight + 10;
          }
        }

        // Aplicar la nueva velocidad con setVelocity para asegurar que se aplique
        bullet.body.setVelocity(newVelX, newVelY);

        // CRITICAL: Mark bullet to ignore wall collisions temporarily
        bullet.ignoreWallCollision = true;

        // Re-enable collision after bullet has moved away (150ms should be enough)
        this.time.delayedCall(150, () => {
          if (bullet && bullet.active) {
            bullet.ignoreWallCollision = false;
          }
        });

        // Reset hitEnemies on bounce
        if (bullet.hitEnemies) {
          bullet.hitEnemies.clear();
        }

        this.playSound(300, 0.05);

        return; // Don't destroy
      }
    }

    // No bounces left or no bounce capability - destroy
    bullet.destroy();
  }

  hitEnemy(enemy, bullet) {
    // Pierce: rastrear enemigos golpeados para evitar hits múltiples
    if (!bullet.hitEnemies) {
      bullet.hitEnemies = new Set();
    }

    // Si esta bala ya golpeó a este enemigo, ignorar
    if (bullet.hitEnemies.has(enemy)) {
      return;
    }

    // Marcar este enemigo como golpeado por esta bala
    bullet.hitEnemies.add(enemy);

    const damage = bullet.damage || 10;

    // Aplicar efectos elementales (obtener duración del dueño de la bala)
    // Los jefes tienen duraciones reducidas a la mitad
    if (bullet.elementalType && bullet.owner) {
      const durationMultiplier = enemy.isBoss ? 0.5 : 1.0;

      if (bullet.elementalType === 'ice') {
        // Congelar enemigo
        enemy.isFrozen = true;
        enemy.frozenTime = this.time.now;
        enemy.frozenDuration = bullet.owner.iceDuration * durationMultiplier;
      } else if (bullet.elementalType === 'fire') {
        // Quemar enemigo
        enemy.isBurning = true;
        enemy.burnStartTime = this.time.now;
        enemy.burnDuration = bullet.owner.fireDuration * durationMultiplier;
        enemy.burnTickTime = this.time.now;
      } else if (bullet.elementalType === 'electric') {
        // Electrocutar enemigo (paralizar completamente)
        enemy.isElectrocuted = true;
        enemy.electrocutedTime = this.time.now;
        enemy.electrocutedDuration = bullet.owner.electricDuration * durationMultiplier;
      }
    }

    // Pierce: solo destruir si ya penetró suficientes enemigos
    if (bullet.pierce && bullet.pierce > 0) {
      bullet.pierce--;
    } else {
      bullet.destroy();
    }

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
      // Guardar posición antes de destruir
      const deathPosition = { x: enemy.x, y: enemy.y };
      this.lastEnemyPosition = deathPosition;

      if (enemy.isBoss) {
        const typeData = BOSS_TYPES[enemy.bossType];
        this.score += typeData.points;
        this.scoreText.setText('Score: ' + this.score);
        this.bossActive = false;
        this.openDoors();
        this.playSound(600, 0.3);

        // Spawn powerup (100% chance on boss)
        // 50% maxHeart, 50% extraBullet
        const bossType = Math.random() < 0.5 ? 'maxHeart' : 'extraBullet';
        this.spawnPowerup(deathPosition, bossType);

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
      // Shield absorbe el golpe
      if (player.hasShield) {
        player.hasShield = false;
        this.playSound(400, 0.2); // Sonido de shield roto
        return;
      }

      player.health -= 1; // 1 corazón de daño
      this.damageTakenThisWave = true;
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

    // Reset damage tracking for new wave
    this.damageTakenThisWave = false;

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
    boss.spiralFired = false;
    boss.wave1Fired = false;
    boss.wave2Fired = false;

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
    // Electrocuted: paralizado completamente
    if (boss.isElectrocuted) {
      const elapsed = time - boss.electrocutedTime;
      if (elapsed < boss.electrocutedDuration) {
        // Paralizado: no movimiento, no disparo
        boss.setVelocity(0);
        return; // Salir completamente de updateBoss
      } else {
        boss.isElectrocuted = false; // Termina efecto
      }
    }

    // Manejo de estados elementales
    let speedMultiplier = 1.0;
    let shootDelayMultiplier = 1.0;

    if (boss.isFrozen) {
      const elapsed = time - boss.frozenTime;
      if (elapsed < boss.frozenDuration) {
        speedMultiplier = 0.3; // 70% más lento
        shootDelayMultiplier = 2.0; // Dispara 2x más lento
      } else {
        boss.isFrozen = false; // Termina efecto
      }
    }

    // Burning: daño periódico
    if (boss.isBurning) {
      const elapsed = time - boss.burnStartTime;
      if (elapsed < boss.burnDuration) {
        // Aplicar daño cada 500ms
        if (time - boss.burnTickTime > 500) {
          boss.health -= 2; // 2 daño por tick
          boss.burnTickTime = time;
          this.playSound(200, 0.03);

          if (boss.health <= 0) {
            const deathPosition = { x: boss.x, y: boss.y };
            this.lastEnemyPosition = deathPosition;
            const typeData = BOSS_TYPES[boss.bossType];
            this.score += typeData.points;
            this.scoreText.setText('Score: ' + this.score);
            this.bossActive = false;
            this.openDoors();
            this.playSound(600, 0.3);
            this.trySpawnPowerup(true, deathPosition);
            boss.destroy();
            return; // Importante: salir de updateBoss
          }
        }
      } else {
        boss.isBurning = false; // Termina efecto
      }
    }

    if (boss.bossType === 'pattern') {
      // Slow circular movement (afectado por frozen)
      const angle = time * 0.0005;
      const radius = 100;
      const centerX = 400;
      const centerY = 300;
      const baseSpeed = 2 * speedMultiplier; // Aplicar multiplicador de velocidad
      boss.setVelocity(
        (Math.cos(angle) * radius - (boss.x - centerX)) * baseSpeed,
        (Math.sin(angle) * radius - (boss.y - centerY)) * baseSpeed
      );

      // Manejar fases del ataque
      if (boss.phaseStartTime === 0) boss.phaseStartTime = time;
      const phaseTime = time - boss.phaseStartTime;

      if (boss.attackPhase === 0) {
        // Fase espiral: disparar toda la espiral de una vez (2 segundos de duración)
        if (!boss.spiralFired) {
          this.shootSpiral(boss, 20, 3, Math.PI, 0, 200, 3000, 100);
          boss.spiralFired = true;
        }
        if (phaseTime >= 2000) {
          boss.attackPhase = 1;
          boss.phaseStartTime = time;
          boss.spiralFired = false;
        }
      } else if (boss.attackPhase === 1) {
        // Pausa 1: 2 segundos
        if (phaseTime >= 2000) {
          boss.attackPhase = 2;
          boss.phaseStartTime = time;
        }
      } else if (boss.attackPhase === 2) {
        // Fase ondas: disparar 2 ondas de balas
        if (!boss.wave1Fired && phaseTime >= 0) {
          this.shootWave(boss, 50, 0, 200, 3000, 20);
          boss.wave1Fired = true;
        } else if (!boss.wave2Fired && phaseTime >= 500) {
          this.shootWave(boss, 50, 0, 200, 3000, 20);
          boss.wave2Fired = true;
        } else if (phaseTime >= 2000) {
          boss.attackPhase = 3;
          boss.phaseStartTime = time;
          boss.wave1Fired = false;
          boss.wave2Fired = false;
        }
      } else if (boss.attackPhase === 3) {
        // Pausa 2: 2 segundos
        if (phaseTime >= 2000) {
          boss.attackPhase = 0;
          boss.phaseStartTime = time;
        }
      }
    } else if (boss.bossType === 'laser') {
      // Rotate constantly (afectado por frozen)
      boss.angle += delta * 0.05 * speedMultiplier;
      // Stay in center
      boss.setVelocity((400 - boss.x) * 2, (300 - boss.y) * 2);

      // Shoot: 4 líneas rotatorias (afectado por frozen)
      const effectiveShootDelay = boss.shootDelay * shootDelayMultiplier;
      if (time - boss.lastShot > effectiveShootDelay) {
        this.shootRotatingLines(boss, 4, 7, 100, boss.angle * Math.PI / 180, 200, 2000);
        boss.lastShot = time;
      }
    } else if (boss.bossType === 'phase' && !boss.hasChildren) {
      // Move towards nearest player (afectado por frozen)
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
        const effectiveSpeed = boss.speed * speedMultiplier;
        boss.setVelocity(dx/dist * effectiveSpeed, dy/dist * effectiveSpeed);
      } else {
        boss.setVelocity(0);
      }

      // Shoot: onda circular de 6 direcciones desde el borde del boss (afectado por frozen)
      const effectiveShootDelay = boss.shootDelay * shootDelayMultiplier;
      if (time - boss.lastShot > effectiveShootDelay) {
        this.shootWave(boss, 6, 0, 200, 3000, 25);
        boss.lastShot = time;
      }
    }
  }

  // ===== SISTEMA DE POWERUPS =====

  trySpawnPowerup(isBoss, position) {
    if (isBoss) {
      // Boss: 50% maxHeart, 50% powerup raro aleatorio
      const bossDrops = ['maxHeart', 'spreadShot', 'homingBullets', 'bounce', 'iceBullets', 'fireBullets', 'electricBullets'];
      const randomDrop = bossDrops[Math.floor(Math.random() * bossDrops.length)];
      this.spawnPowerup(position, randomDrop);
      return;
    }

    // Waves normales: SIN DAÑO primero
    const commonPowerups = ['extraBullet', 'speedBoost', 'fireRate', 'shield', 'moreDamage', 'backShot'];
        const rarePowerups = ['spreadShot', 'homingBullets', 'bounce', 'maxHeart', 'pierceShot', 'iceBullets', 'fireBullets']; //['spreadShot', 'homingBullets', 'bounce', 'maxHeart', 'pierceShot', 'iceBullets', 'fireBullets'];
    if (!this.damageTakenThisWave) {
      // 1. Primero: 10% chance de powerup RARO
      if (Math.random() < 1) {
        const randomRare = rarePowerups[Math.floor(Math.random() * rarePowerups.length)];
        this.spawnPowerup(position, randomRare);
        return;
      }

      // 2. Segundo: 15% chance de powerup COMÚN
      if (Math.random() < 0.15) {
        const randomCommon = commonPowerups[Math.floor(Math.random() * commonPowerups.length)];
        this.spawnPowerup(position, randomCommon);
        return;
      }

      // 3. Tercero: 10% chance de CORAZÓN
      if (Math.random() < 0.05) {
        this.spawnPowerup(position, 'heart');
        return;
      }
    } else {
      // CON DAÑO: Solo 10% de powerup común
      if (Math.random() < 1) {
        const randomCommon = commonPowerups[Math.floor(Math.random() * commonPowerups.length)];
        this.spawnPowerup(position, randomCommon);
        return;
      }

      // Si no salió común: 10% chance de corazón
      if (Math.random() < 0.10) {
        this.spawnPowerup(position, 'heart');
        return;
      }
    }
  }

  spawnPowerup(position, type) {
    // Usar posición del enemigo muerto, o centro si no hay
    const x = position ? position.x : 400;
    const y = position ? position.y : 300;

    const powerup = this.powerups.create(x, y, null);
    powerup.setSize(30, 30);
    powerup.setVisible(false);
    powerup.type = type;

    this.playSound(700, 0.2);
  }

  collectPowerup(player, powerup) {
    const type = powerup.type;
    powerup.destroy();
    this.playSound(800, 0.3);

    let message = '';
    const powerupData = POWERUP_TYPES[type];
    const color = '#' + powerupData.color.toString(16).padStart(6, '0');

    // Aplicar efectos según el tipo
    switch(type) {
      case 'extraBullet':
        player.specialBullets++;
        player.specialCooldownPenalty += 500; // +500ms solo para extraBullet
        message = `${powerupData.description} (${player.specialBullets})`;
        break;

      case 'speedBoost':
        player.speed += player.baseSpeed * 0.1; // +10% velocidad
        message = powerupData.description;
        break;

      case 'fireRate':
        player.normalShotCooldown = Math.max(100, player.normalShotCooldown - 100);
        message = `${powerupData.description} (${player.normalShotCooldown}ms)`;
        break;

      case 'shield':
        player.hasShield = true;
        message = powerupData.description;
        break;

      case 'pierceShot':
        player.pierce++;
        message = `${powerupData.description} (${player.pierce})`;
        break;

      case 'moreDamage':
        player.damageMultiplier += 0.25; // +25% daño
        message = `${powerupData.description} (x${player.damageMultiplier.toFixed(2)})`;
        break;

      case 'backShot':
        player.hasBackShot = true;
        message = powerupData.description;
        break;

      case 'spreadShot':
        player.spreadBullets += 2; // +2 balas normales
        message = `${powerupData.description} (${player.spreadBullets})`;
        break;

      case 'homingBullets':
        player.homingStrength = Math.min(1.0, player.homingStrength + 0.2); // Incrementa homing
        message = `${powerupData.description} (${Math.floor(player.homingStrength * 100)}%)`;
        break;

      case 'bounce':
        player.bounceCount++;
        message = `${powerupData.description} (${player.bounceCount})`;
        break;

      case 'iceBullets':
        if (player.iceDuration === 0) {
          player.iceDuration = 4000; // 4s base
        } else {
          player.iceDuration += 1000; // +1s por cada powerup adicional
        }
        message = `${powerupData.description} (${player.iceDuration / 1000}s)`;
        break;

      case 'fireBullets':
        if (player.fireDuration === 0) {
          player.fireDuration = 3000; // 3s base
        } else {
          player.fireDuration += 1000; // +1s por cada powerup adicional
        }
        message = `${powerupData.description} (${player.fireDuration / 1000}s)`;
        break;

      case 'electricBullets':
        if (player.electricDuration === 0) {
          player.electricDuration = 2000; // 2s base
        } else {
          player.electricDuration += 1000; // +1s por cada powerup adicional
        }
        message = `${powerupData.description} (${player.electricDuration / 1000}s)`;
        break;

      case 'heart':
        if (player.health < player.maxHealth) {
          player.health++;
          message = `+1 HEART! (${player.health}/${player.maxHealth})`;
        } else {
          message = 'Already at max health!';
        }
        break;

      case 'maxHeart':
        player.maxHealth++;
        player.health++;
        message = `MAX HEART UP! (${player.health}/${player.maxHealth})`;
        break;
    }

    // Mostrar mensaje
    const msg = this.add.text(400, 350, message, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: color
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => msg.destroy());
  }

  drawPowerup(powerup) {
    const time = this.time.now;
    const pulse = Math.sin(time * 0.005) * 0.2 + 0.8;

    if (powerup.type === 'extraBullet') {
      // Dos óvalos cruzados (amarillo)
      this.graphics.fillStyle(0xffff00, pulse);

      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.fillEllipse(0, 0, 30, 15);
      this.graphics.fillEllipse(0, 0, 15, 30);
      this.graphics.restore();

      this.graphics.lineStyle(2, 0xffffff, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.strokeEllipse(0, 0, 30, 15);
      this.graphics.strokeEllipse(0, 0, 15, 30);
      this.graphics.restore();
    } else if (powerup.type === 'heart') {
      // Corazón simple (rojo/rosa)
      this.graphics.fillStyle(0xff0066, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);

      // Dibujar corazón con dos círculos y un triángulo
      this.graphics.fillCircle(-7, -5, 10);
      this.graphics.fillCircle(7, -5, 10);
      this.graphics.fillTriangle(-15, 0, 15, 0, 0, 18);

      this.graphics.restore();

      this.graphics.lineStyle(2, 0xffffff, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.strokeCircle(-7, -5, 10);
      this.graphics.strokeCircle(7, -5, 10);
      this.graphics.restore();
    } else if (powerup.type === 'maxHeart') {
      // Corazón con brillo especial (magenta)
      this.graphics.fillStyle(0xff00ff, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);

      // Corazón más grande
      this.graphics.fillCircle(-9, -6, 12);
      this.graphics.fillCircle(9, -6, 12);
      this.graphics.fillTriangle(-18, 0, 18, 0, 0, 22);

      this.graphics.restore();

      // Estrella brillante en el centro
      this.graphics.fillStyle(0xffffff, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y + 2);
      this.graphics.fillCircle(0, 0, 4);
      this.graphics.restore();
    } else if (powerup.type === 'speedBoost') {
      // Flechas hacia adelante (verde lima)
      this.graphics.fillStyle(0x00ff00, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.fillTriangle(-5, -10, -5, 10, 10, 0);
      this.graphics.fillTriangle(-15, -10, -15, 10, 0, 0);
      this.graphics.restore();
    } else if (powerup.type === 'fireRate') {
      // Reloj/cronómetro (naranja)
      this.graphics.fillStyle(0xff8800, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.fillCircle(0, 0, 12);
      this.graphics.restore();

      this.graphics.lineStyle(3, 0xffffff, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.lineBetween(0, 0, 0, -8);
      this.graphics.lineBetween(0, 0, 5, 5);
      this.graphics.restore();
    } else if (powerup.type === 'shield') {
      // Escudo (cian)
      this.graphics.lineStyle(3, 0x00ffff, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.strokeCircle(0, 0, 12);
      this.graphics.strokeCircle(0, 0, 8);
      this.graphics.restore();

      this.graphics.fillStyle(0x00ffff, pulse * 0.5);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.fillCircle(0, 0, 8);
      this.graphics.restore();
    } else if (powerup.type === 'pierceShot') {
      // Flecha atravesando (púrpura)
      this.graphics.fillStyle(0xaa00ff, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.fillTriangle(10, 0, -5, -8, -5, 8);
      this.graphics.fillRect(-8, -2, 10, 4);
      this.graphics.restore();

      this.graphics.lineStyle(2, 0xffffff, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.lineBetween(-10, -10, 10, 10);
      this.graphics.restore();
    } else if (powerup.type === 'moreDamage') {
      // Estrella de explosión (rojo)
      this.graphics.fillStyle(0xff0000, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI / 4);
        const x = Math.cos(angle) * 12;
        const y = Math.sin(angle) * 12;
        this.graphics.fillCircle(x, y, 3);
      }
      this.graphics.fillCircle(0, 0, 6);
      this.graphics.restore();
    } else if (powerup.type === 'spreadShot') {
      // Tres balas en abanico (amarillo brillante)
      this.graphics.fillStyle(0xffff00, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.fillCircle(0, -8, 5);
      this.graphics.fillCircle(-7, 4, 5);
      this.graphics.fillCircle(7, 4, 5);
      this.graphics.restore();

      this.graphics.lineStyle(2, 0xffffff, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.lineBetween(0, 0, 0, -12);
      this.graphics.lineBetween(0, 0, -10, 8);
      this.graphics.lineBetween(0, 0, 10, 8);
      this.graphics.restore();
    } else if (powerup.type === 'homingBullets') {
      // Espiral de búsqueda (verde brillante)
      this.graphics.lineStyle(3, 0x00ff88, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);

      this.graphics.beginPath();
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 4;
        const radius = (i / 20) * 12;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) this.graphics.moveTo(x, y);
        else this.graphics.lineTo(x, y);
      }
      this.graphics.strokePath();
      this.graphics.restore();

      this.graphics.fillStyle(0x00ff88, pulse);
      this.graphics.fillCircle(powerup.x, powerup.y - 12, 4);
    } else if (powerup.type === 'bounce') {
      // Zigzag rebotando (azul claro)
      this.graphics.lineStyle(3, 0x00aaff, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.lineBetween(-12, -8, -4, 8);
      this.graphics.lineBetween(-4, 8, 4, -8);
      this.graphics.lineBetween(4, -8, 12, 8);
      this.graphics.restore();

      this.graphics.fillStyle(0xffffff, pulse);
      this.graphics.fillCircle(powerup.x - 12, powerup.y - 8, 3);
      this.graphics.fillCircle(powerup.x + 12, powerup.y + 8, 3);
    } else if (powerup.type === 'backShot') {
      // Doble flecha (una adelante, una atrás) naranja
      this.graphics.fillStyle(0xffaa00, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      // Flecha adelante
      this.graphics.fillTriangle(10, 0, -5, -6, -5, 6);
      // Flecha atrás
      this.graphics.fillTriangle(-10, 0, 5, -6, 5, 6);
      this.graphics.restore();

      this.graphics.lineStyle(2, 0xffffff, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.strokeCircle(0, 0, 14);
      this.graphics.restore();
    } else if (powerup.type === 'iceBullets') {
      // Cristal de hielo (azul brillante)
      this.graphics.fillStyle(0x00ccff, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);

      // Forma de diamante/cristal
      this.graphics.fillTriangle(0, -12, -8, 0, 0, 4);
      this.graphics.fillTriangle(0, -12, 8, 0, 0, 4);
      this.graphics.fillTriangle(-8, 0, 0, 12, 0, 4);
      this.graphics.fillTriangle(8, 0, 0, 12, 0, 4);

      this.graphics.restore();

      this.graphics.lineStyle(2, 0xffffff, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.strokeCircle(0, 0, 14);
      this.graphics.restore();
    } else if (powerup.type === 'fireBullets') {
      // Llama de fuego (rojo/naranja)
      this.graphics.fillStyle(0xff4400, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);

      // Forma de llama
      this.graphics.fillCircle(0, 2, 10);
      this.graphics.fillTriangle(-8, 0, 8, 0, 0, -14);

      this.graphics.restore();

      this.graphics.fillStyle(0xff8800, pulse * 0.7);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.fillCircle(0, 2, 6);
      this.graphics.fillTriangle(-5, 0, 5, 0, 0, -10);
      this.graphics.restore();

      this.graphics.lineStyle(2, 0xffff00, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.strokeCircle(0, 0, 14);
      this.graphics.restore();
    } else if (powerup.type === 'electricBullets') {
      // Rayo eléctrico (amarillo brillante)
      this.graphics.lineStyle(3, 0xffff00, pulse);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);

      // Rayo zigzag vertical
      this.graphics.lineBetween(0, -12, -4, -4);
      this.graphics.lineBetween(-4, -4, 4, 2);
      this.graphics.lineBetween(4, 2, -2, 8);
      this.graphics.lineBetween(-2, 8, 0, 12);

      this.graphics.restore();

      // Chispas alrededor
      this.graphics.fillStyle(0xffff00, pulse);
      const sparkCount = 6;
      for (let i = 0; i < sparkCount; i++) {
        const angle = (i / sparkCount) * Math.PI * 2 + (time * 0.005);
        const radius = 16;
        this.graphics.fillCircle(
          powerup.x + Math.cos(angle) * radius,
          powerup.y + Math.sin(angle) * radius,
          2
        );
      }

      this.graphics.lineStyle(2, 0xffffff, pulse * 0.7);
      this.graphics.save();
      this.graphics.translateCanvas(powerup.x, powerup.y);
      this.graphics.strokeCircle(0, 0, 14);
      this.graphics.restore();
    }
  }

  // ===== SISTEMA MODULAR DE DISPAROS DE BOSSES =====
  // Este sistema permite crear patrones de disparo reutilizables.
  // Cada función maneja todo el patrón completo, solo llama UNA VEZ por ataque.
  //
  // Ejemplos de uso:
  // - Espiral 2 brazos, 20 balas: shootSpiral(boss, 20, 2, Math.PI, 0, 200, 3000, 100)
  // - Onda circular 50 balas: shootWave(boss, 50, 0, 200, 3000, 20)
  // - Onda con delay: shootWaveDelayed(boss, 12, 0, 200, 2000, 50)
  // - Líneas rotatorias: shootRotatingLines(boss, 4, 7, 100, angle, 200, 2000)

  // Función genérica para crear una bala desde una posición y ángulo
  shootBossBullet(x, y, angle, speed, lifetime, playSound = true) {
    const b = this.enemyBullets.create(x, y);
    b.setSize(10, 10);
    b.setVisible(false);
    b.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.time.delayedCall(lifetime, () => { if (b && b.active) b.destroy(); });

    // Sonido automático por cada bala
    if (playSound) {
      this.playSound(500, 0.1);
    }

    return b;
  }

  // Patrón: Onda circular (explosión radial)
  // bulletCount: número de balas en el círculo
  // angleOffset: ángulo inicial de rotación (en radianes)
  // spawnRadius: radio desde el cual aparecen las balas (0 = centro, >0 = círculo)
  shootWave(source, bulletCount, angleOffset, speed, lifetime, spawnRadius = 0) {
    for (let i = 0; i < bulletCount; i++) {
      const angle = angleOffset + (i * Math.PI * 2 / bulletCount);
      const x = source.x + Math.cos(angle) * spawnRadius;
      const y = source.y + Math.sin(angle) * spawnRadius;
      this.shootBossBullet(x, y, angle, speed, lifetime);
    }
  }

  // Patrón: Onda circular con delay entre balas (más visual)
  // bulletCount: número de balas en el círculo
  // angleOffset: ángulo inicial de rotación (en radianes)
  // delayBetween: milisegundos entre cada bala
  shootWaveDelayed(source, bulletCount, angleOffset, speed, lifetime, delayBetween = 50) {
    for (let i = 0; i < bulletCount; i++) {
      this.time.delayedCall(i * delayBetween, () => {
        const angle = angleOffset + (i * Math.PI * 2 / bulletCount);
        this.shootBossBullet(source.x, source.y, angle, speed, lifetime);
      });
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

  // Patrón: Espiral completa (maneja todo el disparo de una vez)
  // bulletCount: número total de balas a disparar por brazo
  // arms: número de brazos de la espiral
  // rotation: ángulo total de rotación (en radianes)
  // angleOffset: ángulo inicial (en radianes)
  // delayBetween: milisegundos entre cada bala (para efecto visual)
  shootSpiral(source, bulletCount, arms, rotation, angleOffset, speed, lifetime, delayBetween = 100) {
    for (let i = 0; i < bulletCount; i++) {
      const delay = i * delayBetween;
      this.time.delayedCall(delay, () => {
        if (!source.active) return; // Si el boss murió, no disparar
        const progress = i / bulletCount;
        const angle = angleOffset + (progress * rotation);

        for (let arm = 0; arm < arms; arm++) {
          const armAngle = angle + (arm * Math.PI * 2 / arms);
          this.shootBossBullet(source.x, source.y, armAngle, speed, lifetime);
        }
      });
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

  savePlayerState(player) {
    // Regenerar shield al cambiar de mapa
    const regeneratedShield = player.hasShield || player.shield > 0;

    return {
      health: player.health,
      maxHealth: player.maxHealth,
      speed: player.speed,
      specialBullets: player.specialBullets,
      specialCooldownPenalty: player.specialCooldownPenalty,
      normalShotCooldown: player.normalShotCooldown,
      hasShield: regeneratedShield, // Shield se regenera
      pierce: player.pierce,
      damageMultiplier: player.damageMultiplier,
      spreadBullets: player.spreadBullets,
      homingStrength: player.homingStrength,
      bounceCount: player.bounceCount,
      hasBackShot: player.hasBackShot,
      iceDuration: player.iceDuration,
      fireDuration: player.fireDuration,
      electricDuration: player.electricDuration
    };
  }

  nextLevel() {
    if (this.transitioning) return;
    this.transitioning = true;

    this.level++;
    this.closeDoors();

    console.log('Avanzando al nivel:', this.level, 'Wave actual:', this.wave);

    // Guardar estado completo de jugadores
    const p1State = this.savePlayerState(this.p1);
    const p2State = this.numPlayers === 2 ? this.savePlayerState(this.p2) : null;

    // Restart scene preservando todo
    this.scene.restart({
      players: this.numPlayers,
      level: this.level,
      wave: this.wave,
      score: this.score,
      p1State: p1State,
      p2State: p2State
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
