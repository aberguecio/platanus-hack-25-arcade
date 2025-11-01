// Battle Arena - Cooperative Wave Survival
// Fight endless waves of enemies alone or with a friend!

// ===== DEBUG & SETTINGS =====
const DEBUG_MODE = true;           // Set to true for testing
const DEBUG_START_WAVE = 1;        // Which wave to start at (useful for testing bosses: 5, 10, 20)
const DEBUG_START_LEVEL = 1;       // Which level/map to start at (1, 2, 3)
const DEBUG_GODMODE = false;        // Set to true for invincibility

const DIFFICULTY = 1.0;            // Difficulty multiplier
// Examples:
// 0.1 = Very Easy (10% enemy health, 10% enemy count, faster shooting)
// 0.5 = Easy (50% enemy health, 50% enemy count)
// 1.0 = Normal (default)
// 2.0 = Hard (200% enemy health, 200% enemy count, slower shooting)

const COOP_DIFFICULTY = 1.5;       // Multiplier for 2-player mode (affects enemy count & spawn rate, NOT health)
// Applied on top of DIFFICULTY when playing with 2 players
// 1.0 = No extra difficulty
// 1.5 = 50% more enemies and faster spawns (default)
// 2.0 = Double enemies and spawn rate
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
    this.graphics = this.add.graphics();
    this.selectedOption = 0; // 0 = 1 player, 1 = 2 players

    // Title
    this.add.text(400, 120, 'OBSCURANTISM', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ff0000',
      stroke: '#000',
      strokeThickness: 8
    }).setOrigin(0.5);

    // Menu options text
    this.text1 = this.add.text(400, 240, '1 PLAYER', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.text2 = this.add.text(400, 310, '2 PLAYERS CO-OP', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#0099ff'
    }).setOrigin(0.5);

    // Controls infographic (bottom third)
    const controlsY = 400;
    this.add.text(400, controlsY, 'CONTROLS', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5);

    // Player 1 controls
    this.add.text(200, controlsY + 40, 'PLAYER 1', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.add.text(200, controlsY + 70, 'Move: W A S D', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaa'
    }).setOrigin(0.5);

    this.add.text(200, controlsY + 90, 'Shoot: Q', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaa'
    }).setOrigin(0.5);

    this.add.text(200, controlsY + 110, 'Special: E', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaa'
    }).setOrigin(0.5);

    // Player 2 controls
    this.add.text(600, controlsY + 40, 'PLAYER 2', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#0099ff'
    }).setOrigin(0.5);

    this.add.text(600, controlsY + 70, 'Move: Arrow Keys', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaa'
    }).setOrigin(0.5);

    this.add.text(600, controlsY + 90, 'Shoot: . (period)', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaa'
    }).setOrigin(0.5);

    this.add.text(600, controlsY + 110, 'Special: / (slash)', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaa'
    }).setOrigin(0.5);

    // Instructions for menu navigation
    this.add.text(400, 560, 'Press W/S or Arrow Keys to select, Enter to start', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888'
    }).setOrigin(0.5);

    // Keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER
    });

    // Prevent multiple rapid selections
    this.lastInput = 0;
  }

  update(time) {
    // Draw background
    this.graphics.clear();
    this.graphics.fillStyle(0x000000, 1);
    this.graphics.fillRect(0, 0, 800, 600);

    // Selection
    if (time - this.lastInput > 100) {
      if (this.keys.w.isDown || this.cursors.up.isDown) {
        this.selectedOption = 0;
        this.lastInput = time;
      } else if (this.keys.s.isDown || this.cursors.down.isDown) {
        this.selectedOption = 1;
        this.lastInput = time;
      } else if (this.keys.enter.isDown) {
        this.startGame();
        this.lastInput = time;
      }
    }

    // Visual update
    if (this.selectedOption === 0) {
      this.text1.setScale(1.2);
      this.text1.setColor('#ffff00');
      this.text2.setScale(1.0);
      this.text2.setColor('#0099ff');
    } else {
      this.text1.setScale(1.0);
      this.text1.setColor('#00ff00');
      this.text2.setScale(1.2);
      this.text2.setColor('#ffff00');
    }
  }

  startGame() {
    const players = this.selectedOption === 0 ? 1 : 2;
    this.scene.start('GameScene', { players });
  }
}

// ENEMY TYPE DEFINITIONS
const ENEMY_TYPES = {
  triangle: {
    health: 20,
    speed: 80,
    shootDelay: 2500,
    color: 0xff6600,
    points: 10,
    size: 30,
    rotates: true
  },
  square: {
    health: 30,
    speed: 60,
    shootDelay: 3500,
    color: 0xff00ff,
    points: 20,
    size: 30,
    rotates: false
  },
  pentagon: {
    health: 50,
    speed: 50,
    shootDelay: 5000,
    color: 0x00ffff,
    points: 50,
    size: 35,
    rotates: false
  },
  spinner: {
    health: 70,
    speed: 50,
    shootDelay: 1500,
    color: 0xff66aa,
    points: 150,
    size: 40,
    rotates: true
  },
  hexagon: {
    health: 60,
    speed: 30,
    shootDelay: 300,
    color: 0x00ff88,
    points: 80,
    size: 38,
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
    name: 'General Pattern'
  },
  twins: {
    health: 1200,
    speed: 40,
    shootDelay: 2000,
    color: 0xff0088,
    points: 1000,
    size: 70,
    name: 'Twins Shifter´s'
  },
  laser: {
    health: 2000,
    speed: 20,
    shootDelay: 800,
    color: 0x00ffaa,
    points: 2000,
    size: 80,
    name: 'ROTATING LASER'
  }
};

// POWERUP TYPE DEFINITIONS
const POWERUP_TYPES = {
  extraBullet: {
    name: 'Extra Bullet',
    color: 0xffff00,
    description: '+1 Special Bullet'
  },
  speedBoost: {
    name: 'Speed Boost',
    color: 0x00aaff,
    description: '+15% Speed'
  },
  fireRate: {
    name: 'Fire Rate Up',
    color: 0xff8800,
    description: 'Faster Shooting'
  },
  shield: {
    name: 'Shield',
    color: 0x00ffff,
    description: '1 Free Hit'
  },
  pierceShot: {
    name: 'Pierce Shot',
    color: 0xff00aa,
    description: 'Bullets Pierce +1'
  },
  moreDamage: {
    name: 'More Damage',
    color: 0xff0000,
    description: '+25% Damage'
  },
  backShot: {
    name: 'Back Shot',
    color: 0xffaa00,
    description: 'Shoot Backward on Special'
  },
  spreadShot: {
    name: 'Spread Shot',
    color: 0xaa00ff,
    description: '+2 Normal Bullets'
  },
  homingBullets: {
    name: 'Homing Bullets',
    color: 0xff66ff,
    description: 'Bullets Home In'
  },
  bounce: {
    name: 'Bounce',
    color: 0x66ff66,
    description: 'Bullets Bounce +1'
  },
  iceBullets: {
    name: 'Ice Bullets',
    color: 0x00ccff,
    description: 'Freeze Enemies'
  },
  fireBullets: {
    name: 'Fire Bullets',
    color: 0xff4400,
    description: 'Burn Enemies'
  },
  electricBullets: {
    name: 'Electric Bullets',
    color: 0xffff00,
    description: 'Stun Enemies'
  },
  heart: {
    name: 'Heart',
    color: 0xff0066,
    description: '+1 Heart'
  },
  maxHeart: {
    name: 'Max Heart',
    color: 0xff00ff,
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
    {x: 400, y: 300, w: 40, h: 40}
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
    {x: 400, y: 300, w: 40, h: 40},
    {x: 200, y: 100, w: 50, h: 50},
    {x: 600, y: 500, w: 50, h: 50},
    {x: 200, y: 500, w: 80, h: 80},
    {x: 600, y: 100, w: 80, h: 80},
    
  ]
];

// GAME SCENE
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.numPlayers = data.players || 1;

    // Calculate effective difficulty (COOP_DIFFICULTY applied only to spawn/count, not health)
    this.getSpawnDifficulty = () => {
      return this.numPlayers === 2 ? DIFFICULTY * COOP_DIFFICULTY : DIFFICULTY;
    };

    // Debug settings
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
    this.particles = []; // Init particles
    this.doorsOpen = false;
    this.transitioning = false;
    this.waitingForNextWave = false; // Prevent multiple calls
    this.lastEnemyPosition = null;

    // Player alive tracking (2P mode)
    this.p1Alive = true;
    this.p2Alive = true;

    // Save player state for later restoration
    this.p1State = data.p1State || null;
    this.p2State = data.p2State || null;

    // Match statistics
    this.stats = data.stats || {
      powerupsCollected: [],
      bossesDefeated: [],
      mapsExplored: [1], // Start with map 1
      enemiesKilled: 0,
      highestWave: 0
    };
  }

  create() {
    // Graphics object
    this.graphics = this.add.graphics();

    // Start background music
    this.startBackgroundMusic();

    // Arena walls
    this.walls = this.physics.add.staticGroup();

    // Top wall segments
    // Door at x: 380-420
    const wallTopLeft = this.walls.create(190, 10, null); // x: 0-380
    wallTopLeft.body.setSize(380, 20);
    wallTopLeft.setVisible(false);

    const wallTopRight = this.walls.create(610, 10, null); // x: 420-800
    wallTopRight.body.setSize(380, 20);
    wallTopRight.setVisible(false);

    // Bottom wall segments
    const wallBottomLeft = this.walls.create(190, 590, null); // x: 0-380
    wallBottomLeft.body.setSize(380, 20);
    wallBottomLeft.setVisible(false);

    const wallBottomRight = this.walls.create(610, 590, null); // x: 420-800
    wallBottomRight.body.setSize(380, 20);
    wallBottomRight.setVisible(false);

    // Left wall segments
    // Door at y: 280-320
    const wallLeftTop = this.walls.create(10, 140, null); // y: 0-280
    wallLeftTop.body.setSize(20, 280);
    wallLeftTop.setVisible(false);

    const wallLeftBottom = this.walls.create(10, 460, null); // y: 320-600
    wallLeftBottom.body.setSize(20, 280);
    wallLeftBottom.setVisible(false);

    // Right wall segments
    const wallRightTop = this.walls.create(790, 140, null); // y: 0-280
    wallRightTop.body.setSize(20, 280);
    wallRightTop.setVisible(false);

    const wallRightBottom = this.walls.create(790, 460, null); // y: 320-600
    wallRightBottom.body.setSize(20, 280);
    wallRightBottom.setVisible(false);

    // Door walls (dynamically enabled/disabled)
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

    // Door zones (overlap detection when open)
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

    // Players (sistema de hearts)
    this.p1 = this.physics.add.sprite(300, 300, null);
    this.p1.setSize(30, 30);
    this.p1.setVisible(false);
    this.p1.health = this.p1State ? this.p1State.health : 5;
    this.p1.maxHealth = this.p1State ? this.p1State.maxHealth : 5;
    this.p1.baseSpeed = 200;
    this.p1.speed = this.p1State ? this.p1State.speed : 200;
    this.p1.angle = 0;
    this.p1.currentSpecialCooldown = 0;

    // Powerup stats
    this.p1.specialBullets = this.p1State ? this.p1State.specialBullets : 1;
    this.p1.specialCooldown = this.p1State ? this.p1State.specialCooldown : 2000;
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
      this.p2.currentSpecialCooldown = 0;

      // Powerup stats
      this.p2.specialBullets = this.p2State ? this.p2State.specialBullets : 1;
      this.p2.specialCooldown = this.p2State ? this.p2State.specialCooldown : 2000;
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
      q: 'Q', e: 'E', r: 'R',
      up: 'I', down: 'K', left: 'J', right: 'L',
      shoot2: 'U', special2: 'O', p: 'P',
      restart: 'R'
    });

    // Debug controls
    if (DEBUG_MODE) {
      this.input.keyboard.on('keydown-ONE', () => this.debugSkipToWave(5));
      this.input.keyboard.on('keydown-TWO', () => this.debugSkipToWave(10));
      this.input.keyboard.on('keydown-THREE', () => this.debugSkipToWave(20));
      this.input.keyboard.on('keydown-NINE', () => this.debugKillAllEnemies());
      this.input.keyboard.on('keydown-ZERO', () => this.trySpawnPowerup(true, { x: this.p1.x, y: this.p1.y }));
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
    if (DEBUG_MODE || DEBUG_GODMODE || DIFFICULTY !== 1.0 || (this.numPlayers === 2 && COOP_DIFFICULTY !== 1.0)) {
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
    this.drawCooldownBar(20, 45, this.p1.currentSpecialCooldown);

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
      this.drawCooldownBar(680, 45, this.p2.currentSpecialCooldown);
    }

    // Draw bullets
    this.playerBullets.children.entries.forEach(b => {
      this.graphics.fillStyle(b.color);
      this.graphics.fillCircle(b.x, b.y, 4);
      // Save previous velocity for bounces
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

      // Draw elemental status effects
      if (e.isFrozen) {
        // Ice effect: transparent cyan diamonds
        this.graphics.fillStyle(0x00ccff, 0.5);
        this.graphics.save();
        this.graphics.translateCanvas(e.x, e.y);

        // Diamonds at different positions
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
        // Fire effect: rising red particles
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
        // Electric effect: yellow lightning
        const sparkPhase = time * 0.02;
        this.graphics.lineStyle(2, 0xffff00, 0.9);

        // Lightning around enemy
        for (let i = 0; i < 5; i++) {
          const angle = (sparkPhase + i * 0.4) * Math.PI * 2;
          const radius = 18 + Math.sin(sparkPhase * 3 + i) * 8;
          const x1 = e.x + Math.cos(angle) * radius;
          const y1 = e.y + Math.sin(angle) * radius;

          // Zigzag lightning
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

        // Small sparks
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
    this.updatePlayer(this.p1, this.keys.w, this.keys.s, this.keys.a, this.keys.d, time, 1, this.keys.q, this.keys.e, this.keys.r);

    // Player 2 movement
    if (this.numPlayers === 2) {
      this.updatePlayer(this.p2, this.keys.up, this.keys.down, this.keys.left, this.keys.right, time, 2, this.keys.shoot2, this.keys.special2, this.keys.p);
    }

    // Update homing bullets
    this.updateHomingBullets(this.playerBullets);
    this.updateHomingBullets(this.playerSpecialBullets);

    // Update enemies
    this.enemies.children.entries.forEach(e => {
      if (e.isBoss) {
        if (e.bossType === 'twin1' || e.bossType === 'twin2') {
          this.updateTwin(e, time, 1.0, 1.0); // Twins have own update
        } else {
          this.updateBoss(e, time, delta);
        }
      } else {
        this.updateEnemy(e, time, delta);
      }
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

    // Check wave complete
    if (this.enemiesThisWave >= this.enemiesPerWave && this.enemies.children.size === 0 && !this.bossActive && !this.doorsOpen && !this.waitingForNextWave) {
      this.waitingForNextWave = true; // Prevent multiple calls
      this.trySpawnPowerup(false, this.lastEnemyPosition); // false = not boss
      this.playSound(600, 0.25);

      // Pause de 2 segundos antes de la siguiente ronda
      this.time.delayedCall(2000, () => {
        this.waitingForNextWave = false;
        this.startNextWave();
      });
    }

    // Update UI
    const hearts1 = this.p1Alive ? ('♥'.repeat(Math.max(0, this.p1.health)) + '♡'.repeat(Math.max(0, this.p1.maxHealth - this.p1.health))) : 'DEAD';
    this.hpText1.setText('P1: ' + hearts1);
    if (this.numPlayers === 2) {
      const hearts2 = this.p2Alive ? ('♥'.repeat(Math.max(0, this.p2.health)) + '♡'.repeat(Math.max(0, this.p2.maxHealth - this.p2.health))) : 'DEAD';
      this.hpText2.setText('P2: ' + hearts2);
    }

    // Update cooldowns
    if (this.p1.currentSpecialCooldown > 0) {
      this.p1.currentSpecialCooldown -= delta;
    }
    if (this.numPlayers === 2 && this.p2.currentSpecialCooldown > 0) {
      this.p2.currentSpecialCooldown -= delta;
    }

    // Update and draw particles
    if (this.particles) {
      this.particles = this.particles.filter(p => {
        const age = time - p.startTime;
        if (age > p.life) return false;

        // Update position
        p.x += p.vx * delta / 1000;
        p.y += p.vy * delta / 1000;

        // Slow down
        p.vx *= 0.95;
        p.vy *= 0.95;

        // Draw
        const alpha = 1 - (age / p.life);
        this.graphics.fillStyle(p.color, alpha);
        this.graphics.fillCircle(p.x, p.y, p.size * alpha);

        return true;
      });
    }
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

  updatePlayer(player, upKey, downKey, leftKey, rightKey, time, playerNum, shootKey, specialKey, altShootKey) {
    // Ensure player exists
    if (!player || !player.body) return;

    // Skip dead players
    if (playerNum === 1 && !this.p1Alive) return;
    if (playerNum === 2 && !this.p2Alive) return;

    // Always reset velocity
    player.setVelocity(0, 0);

    let moveX = 0, moveY = 0;
    if (upKey && upKey.isDown) moveY = -1;
    if (downKey && downKey.isDown) moveY = 1;
    if (leftKey && leftKey.isDown) moveX = -1;
    if (rightKey && rightKey.isDown) moveX = 1;

    if (moveX !== 0 || moveY !== 0) {
      player.angle = Math.atan2(moveY, moveX) * 180 / Math.PI;
      const len = Math.sqrt(moveX*moveX + moveY*moveY);
      player.setVelocity(moveX/len * player.speed, moveY/len * player.speed);
    }

    // Shooting (Q or R for P1, U or P for P2)
    const lastShot = playerNum === 1 ? this.lastShot1 : this.lastShot2;
    const shootCooldown = player.normalShotCooldown || 300;
    if ((Phaser.Input.Keyboard.JustDown(shootKey) || (altShootKey && Phaser.Input.Keyboard.JustDown(altShootKey))) && time - lastShot > shootCooldown) {
      this.shootPlayer(player, false);
      if (playerNum === 1) this.lastShot1 = time;
      else this.lastShot2 = time;
    }

    if (Phaser.Input.Keyboard.JustDown(specialKey) && player.currentSpecialCooldown <= 0) {
      this.shootPlayer(player, true);
      player.currentSpecialCooldown = player.specialCooldown;
    }
  }

  // Helper: Calculate bullet lifetime
  getBulletLifetime(player) {
    return 2000 + (player.pierce * 300) + (player.bounceCount * 300);
  }

  // Helper: Find nearest player
  getNearestPlayer(x, y) {
    if (this.numPlayers === 1) return this.p1;
    // Only consider alive players
    if (!this.p1Alive) return this.p2;
    if (!this.p2Alive) return this.p1;
    const d1 = Phaser.Math.Distance.Between(x, y, this.p1.x, this.p1.y);
    const d2 = Phaser.Math.Distance.Between(x, y, this.p2.x, this.p2.y);
    return d2 < d1 ? this.p2 : this.p1;
  }

  // Helper: Schedule bullet destroy
  scheduleBulletDestroy(bullet, lifetime) {
    this.time.delayedCall(lifetime, () => {
      if (bullet && bullet.active) bullet.destroy();
    });
  }

  // Helper: Update homing bullets
  updateHomingBullets(bulletGroup) {
    bulletGroup.children.entries.forEach(b => {
      if (b.homingStrength && b.homingStrength > 0 && this.enemies.children.size > 0) {
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
          const angle = Math.atan2(nearest.y - b.y, nearest.x - b.x);
          const currentAngle = Math.atan2(b.body.velocity.y, b.body.velocity.x);
          const speed = Math.sqrt(b.body.velocity.x ** 2 + b.body.velocity.y ** 2);
          const turnRate = 0.025 * b.homingStrength;
          const newAngle = currentAngle + Math.atan2(Math.sin(angle - currentAngle), Math.cos(angle - currentAngle)) * turnRate;
          b.setVelocity(Math.cos(newAngle) * speed, Math.sin(newAngle) * speed);
        }
      }
    });
  }

  // Helper: Create enemy bullet with auto-destroy
  createEnemyBullet(x, y, vx, vy, lifetime = 3000) {
    const b = this.enemyBullets.create(x, y);
    b.setSize(10, 10);
    b.setVisible(false);
    b.setVelocity(vx, vy);
    this.time.delayedCall(lifetime, () => {
      if (b && b.active) b.destroy();
    });
    return b;
  }

  // Helper: Apply elemental status effects (electrocute, freeze, burn)
  applyStatusEffect(entity, time) {
    if (entity.isElectrocuted) {
      const elapsed = time - entity.electrocutedTime;
      if (elapsed < entity.electrocutedDuration) {
        entity.setVelocity(0);
        return true;
      } else {
        entity.isElectrocuted = false;
      }
    }

    if (entity.isFrozen) {
      const elapsed = time - entity.frozenTime;
      if (elapsed >= entity.frozenDuration) {
        entity.isFrozen = false;
      }
      return false;
    }

    if (entity.isBurning) {
      const elapsed = time - entity.burningTime;
      if (elapsed >= entity.burningDuration) {
        entity.isBurning = false;
      } else {
        if (!entity.lastBurnDamage) entity.lastBurnDamage = time;
        if (time - entity.lastBurnDamage >= 500) {
          entity.health -= 5;
          entity.lastBurnDamage = time;
          if (entity.health <= 0) {
            const pos = { x: entity.x, y: entity.y };
            if (entity.isBoss) {
              // Note: This is from burning in applyStatusEffect, not a normal boss death
              // We still need to call handleBossDeath but the boss is already destroyed here
              // So we create a fake boss object with necessary data
              this.handleBossDeath({ bossType: entity.bossType, sibling: entity.sibling }, pos);
            } else {
              this.lastEnemyPosition = pos;
              const typeData = ENEMY_TYPES[entity.type];
              this.score += typeData.points;
              this.scoreText.setText('Score: ' + this.score);
              this.stats.enemiesKilled++;
              this.createExplosionEffect(pos.x, pos.y, 0xff8800, 10);
            }
            entity.destroy();
            return true;
          }
        }
      }
    }
    return false;
  }

  // Helper: Draw polygon (supports regular polygons and stars)
  drawPolygon(x, y, sides, outerRadius, innerRadius = null, rotation = 0) {
    this.graphics.beginPath();
    const vertices = innerRadius ? sides * 2 : sides;
    for (let i = 0; i < vertices; i++) {
      const angle = (i * Math.PI * 2 / vertices) + rotation;
      const radius = innerRadius && i % 2 === 1 ? innerRadius : outerRadius;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) this.graphics.moveTo(px, py);
      else this.graphics.lineTo(px, py);
    }
    this.graphics.closePath();
    this.graphics.fillPath();
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
      const baseDamage = 30;
      const damage = Math.floor(baseDamage * player.damageMultiplier);

      // Determine element
      let elementalType = null;
      const elementals = [];
      if (player.iceDuration > 0) elementals.push('ice');
      if (player.fireDuration > 0) elementals.push('fire');
      if (player.electricDuration > 0) elementals.push('electric');

      if (elementals.length > 0) {
        // Pick random if multiple
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

        this.scheduleBulletDestroy(b, this.getBulletLifetime(player));
      }

      // BackShot
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

        // Apply same element
        if (elementalType) {
          b.elementalType = elementalType;
          if (elementalType === 'ice') b.color = 0x00ccff;
          else if (elementalType === 'fire') b.color = 0xff4400;
          else if (elementalType === 'electric') b.color = 0xffff00;
        } else {
          b.color = color;
        }

        this.scheduleBulletDestroy(b, this.getBulletLifetime(player));
      }

      this.playSound(600, 0.2);
      // Larger visual effect
      this.createMuzzleFlash(player.x, player.y, angle, color, 12);
      this.cameras.main.shake(100, 0.002); // Small shake
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

        this.scheduleBulletDestroy(b, this.getBulletLifetime(player));
      }
      this.playSound(800, 0.08);
      // Small muzzle flash
      this.createMuzzleFlash(player.x, player.y, angle, color);
    }
  }

  spawnEnemy() {
    const side = Phaser.Math.Between(0, 3);
    let x, y;

    if (side === 0) { x = 400; y = 30; }          // Top
    else if (side === 1) { x = 400; y = 570; }    // Bottom
    else if (side === 2) { x = 30; y = 300; }     // Left
    else { x = 770; y = 300; }                     // Right

    // Evolving weight system
    let typeName;
    const weights = {
      triangle: 100, // Siempre presente
      square: 0,
      pentagon: 0,
      hexagon: 0,
      spinner: 0
    };

    // Introducir square gradualmente desde ronda 2
    if (this.wave >= 2) {
      weights.square = Math.min(30, 10 + (this.wave - 2) * 3); // 10% en ronda 2, sube gradualmente hasta 30%
      weights.triangle = Math.max(40, 100 - weights.square); // Triangle baja gradualmente pero nunca menos de 40%
    }

    // Introducir pentagon desde ronda 4
    if (this.wave >= 4) {
      weights.pentagon = Math.min(25, 5 + (this.wave - 4) * 2); // 5% en ronda 4, sube hasta 25%
      // Redistribuir triangle y square proporcionalmente
      weights.triangle = Math.max(40, 100 - weights.square - weights.pentagon);
      weights.square = Math.max(15, weights.square - (weights.pentagon / 2));
    }

    // Introducir spinner desde ronda 7
    if (this.wave >= 7) {
      weights.spinner = Math.min(15, 3 + (this.wave - 7) * 1.5); // 3% en ronda 7, sube hasta 15%
      weights.triangle = Math.max(40, weights.triangle - weights.spinner / 2);
      weights.square = Math.max(15, weights.square - weights.spinner / 4);
    }

    // Introducir hexagon desde ronda 12
    if (this.wave >= 13) {
      weights.hexagon = Math.min(20, 5 + (this.wave - 12) * 2); // 5% en ronda 12, sube hasta 20%
      weights.triangle = Math.max(30, weights.triangle - weights.hexagon / 2);
    }

    // Weighted selection
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (const [type, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) {
        typeName = type;
        break;
      }
    }

    const typeData = ENEMY_TYPES[typeName];
    const enemy = this.enemies.create(x, y, null);
    enemy.setSize(typeData.size, typeData.size);
    enemy.setVisible(false);
    enemy.type = typeName;
    enemy.health = Math.ceil(typeData.health * DIFFICULTY);
    enemy.speed = typeData.speed;
    enemy.shootDelay = typeData.shootDelay / this.getSpawnDifficulty();
    enemy.spawnTime = this.time.now;
    enemy.lastShot = 0;
    enemy.angle = 0;
  }

  updateEnemy(enemy, time, delta) {
    // Electrocuted: fully paralyzed
    if (enemy.isElectrocuted) {
      const elapsed = time - enemy.electrocutedTime;
      if (elapsed < enemy.electrocutedDuration) {
        // Paralyzed
        enemy.setVelocity(0);
        return; // Salir completamente de updateEnemy
      } else {
        enemy.isElectrocuted = false; // Effect ends
      }
    }

    // Manejo de estados elementales
    // Frozen: reduce speed
    let speedMultiplier = 1.0;
    let shootDelayMultiplier = 1.0;

    if (enemy.isFrozen) {
      const elapsed = time - enemy.frozenTime;
      if (elapsed < enemy.frozenDuration) {
        speedMultiplier = 0.3; // 70% slower
        shootDelayMultiplier = 2.0; // Shoot 2x slower
      } else {
        enemy.isFrozen = false; // Effect ends
      }
    }

    // Burning: periodic damage
    if (enemy.isBurning) {
      const elapsed = time - enemy.burnStartTime;
      if (elapsed < enemy.burnDuration) {
        // Apply damage every 500ms
        if (time - enemy.burnTickTime > 500) {
          enemy.health -= 2; // 2 damage per tick
          enemy.burnTickTime = time;
          this.playSound(200, 0.03);

          if (enemy.health <= 0) {
            // Save position before destroy
            const deathPosition = { x: enemy.x, y: enemy.y };

            if (enemy.isBoss) {
              this.handleBossDeath(enemy, deathPosition);
            } else {
              this.lastEnemyPosition = deathPosition;
              const typeData = ENEMY_TYPES[enemy.type];
              this.score += typeData.points;
              this.scoreText.setText('Score: ' + this.score);
              this.playSound(500, 0.1);
            }
            enemy.destroy();
            return; // Exit updateEnemy
          }
        }
      } else {
        enemy.isBurning = false; // Effect ends
      }
    }

    // Move to nearest player
    const target = this.getNearestPlayer(enemy.x, enemy.y);

    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    // Update angle
    const typeData = ENEMY_TYPES[enemy.type];
    if (typeData.rotates) {
      enemy.angle = Math.atan2(dy, dx) * 180 / Math.PI;
    }

    // Spinner: constant rotation
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

      const cycleTime = 6000; // 4s shooting + 2s pause
      const shootingDuration = 4000;
      const cyclePosition = enemy.shootingCycle % cycleTime;

      if (cyclePosition < shootingDuration) {
        // Shooting phase
        const effectiveShootDelay = enemy.shootDelay * shootDelayMultiplier;
        // Wait 1s after spawn
        if (time - enemy.spawnTime > 1000 && time - enemy.lastShot > effectiveShootDelay) {
          this.shootEnemy(enemy, target, time);
          enemy.lastShot = time;
        }
      }
      // Otherwise, pause phase - don't shoot
    } else {
      // Normal shooting for other enemies
      const effectiveShootDelay = enemy.shootDelay * shootDelayMultiplier;
      // Wait 1s after spawn
      if (time - enemy.spawnTime > 1000 && time - enemy.lastShot > effectiveShootDelay) {
        this.shootEnemy(enemy, target, time);
        enemy.lastShot = time;
      }
    }
  }

  // Helper: shoot N bullets in circle pattern (reused by square, pentagon, hexagon, boss waves)
  shootCircle(src, count, offset = 0, spd = 200, rad = 20) {
    for (let i = 0; i < count; i++) {
      const a = offset + i * Math.PI * 2 / count;
      this.createEnemyBullet(src.x + Math.cos(a) * rad, src.y + Math.sin(a) * rad, Math.cos(a) * spd, Math.sin(a) * spd);
    }
  }

  // Helper: shoot single aimed bullet (reused by triangle, laser boss)
  shootAimed(src, tgt, spd, lifetime, isBoss = false) {
    const a = Math.atan2(tgt.y - src.y, tgt.x - src.x);
    if (isBoss) {
      this.shootBossBullet(src.x, src.y, a, spd, lifetime);
    } else {
      this.createEnemyBullet(src.x + Math.cos(a) * 20, src.y + Math.sin(a) * 20, Math.cos(a) * spd, Math.sin(a) * spd);
    }
  }

  shootEnemy(enemy, target) {
    const s = 200;
    if (enemy.type === 'triangle') {
      this.shootAimed(enemy, target, s);
      this.playSound(400, 0.1);
      this.createMuzzleFlash(enemy.x, enemy.y, Math.atan2(target.y - enemy.y, target.x - enemy.x), 0xff0000, 4);
    } else if (enemy.type === 'square') {
      this.shootCircle(enemy, 4, 0, s);
      for (let i = 0; i < 4; i++) this.createMuzzleFlash(enemy.x, enemy.y, i * Math.PI / 2, 0xff0000, 3);
      this.playSound(400, 0.1);
    } else if (enemy.type === 'pentagon') {
      this.shootCircle(enemy, 5, 0, s);
      this.playSound(450, 0.12);
      this.time.delayedCall(250, () => { if (enemy.active) { this.shootCircle(enemy, 5, Math.PI / 5, s); this.playSound(450, 0.12); } });
      this.time.delayedCall(500, () => { if (enemy.active) { this.shootCircle(enemy, 5, 0, s); this.playSound(450, 0.12); } });
    } else if (enemy.type === 'hexagon') {
      this.shootCircle(enemy, 6, 0, s);
      this.playSound(500, 0.1);
    } else if (enemy.type === 'spinner') {
      const a = Math.atan2(target.y - enemy.y, target.x - enemy.x);
      for (let i = 0; i < 3; i++) {
        const oa = a + (i - 1) * 0.15;
        this.createEnemyBullet(enemy.x + Math.cos(oa) * 20, enemy.y + Math.sin(oa) * 20, Math.cos(oa) * s, Math.sin(oa) * s);
      }
      this.playSound(600, 0.1);
    }
  }

  drawEnemy(enemy) {
    this.graphics.fillStyle(ENEMY_TYPES[enemy.type].color);
    if (enemy.type === 'triangle') {
      this.graphics.save();
      this.graphics.translateCanvas(enemy.x, enemy.y);
      this.graphics.rotateCanvas(enemy.angle * Math.PI / 180);
      this.graphics.fillTriangle(15, 0, -10, -12, -10, 12);
      this.graphics.restore();
    } else if (enemy.type === 'square') {
      this.graphics.fillRect(enemy.x - 15, enemy.y - 15, 30, 30);
    } else if (enemy.type === 'pentagon') {
      this.drawPolygon(enemy.x, enemy.y, 5, 17, null, -Math.PI / 2);
    } else if (enemy.type === 'hexagon') {
      this.drawPolygon(enemy.x, enemy.y, 6, 19, null, -Math.PI / 2);
    } else if (enemy.type === 'spinner') {
      this.graphics.save();
      this.graphics.translateCanvas(enemy.x, enemy.y);
      this.graphics.rotateCanvas(enemy.angle * Math.PI / 180);
      this.graphics.fillTriangle(0, -15, -10, 5, 10, 5);
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

        // Use previous velocity
        // Guardar velocidad previa si existe, sino usar un valor por defecto
        let speed = 400; // velocidad por defecto de las balas
        if (bullet.prevVelocity) {
          speed = Math.sqrt(bullet.prevVelocity.x ** 2 + bullet.prevVelocity.y ** 2);
        }

        // Determine bounce direction
        const dx = bullet.x - wall.x;
        const dy = bullet.y - wall.y;

        // Normalizar por las dimensiones de la pared
        const normalizedDx = Math.abs(dx) / (wall.body.halfWidth + bullet.body.halfWidth);
        const normalizedDy = Math.abs(dy) / (wall.body.halfHeight + bullet.body.halfHeight);

        // Calculate new velocity
        let newVelX, newVelY;

        if (normalizedDx > normalizedDy) {
          // Side collision
          newVelX = bullet.prevVelocity ? -bullet.prevVelocity.x : (dx > 0 ? speed : -speed);
          newVelY = bullet.prevVelocity ? bullet.prevVelocity.y : 0;

          // Empujar la bala lejos de la pared
          if (dx < 0) {
            bullet.x = wall.x - wall.body.halfWidth - bullet.body.halfWidth - 10;
          } else {
            bullet.x = wall.x + wall.body.halfWidth + bullet.body.halfWidth + 10;
          }
        } else {
          // Vertical collision
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
    // Pierce: track hit enemies
    if (!bullet.hitEnemies) {
      bullet.hitEnemies = new Set();
    }

    // Already hit check
    if (bullet.hitEnemies.has(enemy)) {
      return;
    }

    // Marcar este enemigo como golpeado por esta bala
    bullet.hitEnemies.add(enemy);
    const damage = bullet.damage || 10;

    // Apply elemental effects
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

    // Pierce check
    if (bullet.pierce && bullet.pierce > 0) {
      bullet.pierce--;
    } else {
      bullet.destroy();
    }

    enemy.health -= damage;

    // Damage visual
    this.createExplosionEffect(enemy.x, enemy.y, bullet.color || 0xffffff, 4);
    this.playSound(300, 0.05);

    if (enemy.health <= 0) {
      // Save position before destroy
      const deathPosition = { x: enemy.x, y: enemy.y };
      this.lastEnemyPosition = deathPosition;

      if (enemy.isBoss) {
        // Boss death effect
        this.createExplosionEffect(deathPosition.x, deathPosition.y, 0xff00ff, 30);
        this.cameras.main.shake(400, 0.008);
        this.cameras.main.flash(400, 255, 255, 0);

        // Centralized boss death handling
        this.handleBossDeath(enemy, deathPosition);
      } else {
        const typeData = ENEMY_TYPES[enemy.type];
        this.score += typeData.points;
        this.scoreText.setText('Score: ' + this.score);
        this.playSound(500, 0.1);

        // Track enemy kill
        this.stats.enemiesKilled++;

        // Efecto visual de muerte de enemigo normal
        this.createExplosionEffect(deathPosition.x, deathPosition.y, 0xff8800, 10);
      }
      enemy.destroy();
    }
  }

  hitPlayer(player, bullet) {
    bullet.destroy();

    if (!DEBUG_GODMODE) {
      // Shield absorbs hit
      if (player.hasShield) {
        player.hasShield = false;
        this.playSound(400, 0.2); // Sonido de shield roto
        // Efecto visual de shield roto
        this.createExplosionEffect(player.x, player.y, 0x00ffff, 12);
        return;
      }

      player.health -= 1; // 1 heart damage
      this.damageTakenThisWave = true;
      this.playSound(200, 0.1);

      // Damage flash
      this.createExplosionEffect(player.x, player.y, 0xff0000, 8);

      // Screen shake
      this.cameras.main.shake(200, 0.005);

      if (player.health <= 0) {
        // Mark player as dead
        if (player === this.p1) this.p1Alive = false;
        else if (player === this.p2) this.p2Alive = false;

        // Death effects
        this.createExplosionEffect(player.x, player.y, 0xff0000, 20);
        this.cameras.main.shake(300, 0.008);

        // Hide dead player
        player.x = -100;
        player.y = -100;
        player.setVelocity(0, 0);

        // Check if all players are dead
        if (this.numPlayers === 1 || (!this.p1Alive && !this.p2Alive)) {
          this.endGame();
        }
      }
    }
  }

  startNextWave() {
    this.wave++;
    this.waveText.setText('Wave: ' + this.wave);
    this.enemiesThisWave = 0;
    this.spawnDelay = Math.max(800, (2000 - (this.wave - 1) * 100) / this.getSpawnDifficulty());

    // Track highest wave reached
    if (this.wave > this.stats.highestWave) {
      this.stats.highestWave = this.wave;
    }

    // Reset damage tracking
    this.damageTakenThisWave = false;

    // Show wave message
    const waveMsg = this.add.text(400, 100, 'WAVE ' + this.wave, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#0f0',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);
    this.time.delayedCall(2000, () => waveMsg.destroy());

    // Check if this is a boss wave
    if (this.wave === 5 || this.wave === 10 || this.wave === 20) {
      this.spawnBoss();
      this.enemiesPerWave = 1;
    } else {
      this.enemiesPerWave = Math.max(1, Math.ceil((5 + (this.wave - 1) * 2) * this.getSpawnDifficulty()));
    }
  }

  handleBossDeath(boss, deathPosition) {
    // Centralized boss death handling
    this.lastEnemyPosition = deathPosition;

    // Handle twins special case
    if (boss.bossType === 'twin1' || boss.bossType === 'twin2') {
      const otherTwin = boss.sibling;
      if (otherTwin && otherTwin.active && otherTwin.health > 0) {
        // Other twin still alive - partial reward only
        this.score += 250;
        this.scoreText.setText('Score: ' + this.score);
        this.playSound(600, 0.3);
        return; // Don't end boss fight yet
      } else {
        // Both twins dead
        this.score += 250;
        this.scoreText.setText('Score: ' + this.score);

        // Track boss defeat
        if (!this.stats.bossesDefeated.includes(BOSS_TYPES.twins.name)) {
          this.stats.bossesDefeated.push(BOSS_TYPES.twins.name);
        }
      }
    } else {
      // Normal boss
      const typeData = BOSS_TYPES[boss.bossType];
      this.score += typeData.points;
      this.scoreText.setText('Score: ' + this.score);

      // Track boss defeat
      if (!this.stats.bossesDefeated.includes(typeData.name)) {
        this.stats.bossesDefeated.push(typeData.name);
      }
    }

    // Common boss death logic
    this.bossActive = false;
    this.openDoors();
    this.playSound(600, 0.3);
    if (!this.reviveDeadPlayers()) {
      this.trySpawnPowerup(true, deathPosition); // just give a power-up if no revival
    }

    // Show message
    const msg = this.add.text(400, 300, 'BOSS DEFEATED!\nGo through the doors!', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#0ff',
      align: 'center'
    }).setOrigin(0.5);
    // this.time.delayedCall(3000, () => msg.destroy());
  }

  reviveDeadPlayers() {
    // Only revive in 2P mode
    if (this.numPlayers !== 2) return false;

    let revivedAny = false;

    // Revive P1 if dead
    if (!this.p1Alive) {
      this.p1Alive = true;
      this.p1.health = this.p1.maxHealth;
      this.p1.x = 250;
      this.p1.y = 300;
      this.p1.setVelocity(0, 0);

      // Revival effects
      this.createExplosionEffect(this.p1.x, this.p1.y, 0x00ff00, 15);
      this.playSound(800, 0.25);

      revivedAny = true;
    }

    // Revive P2 if dead
    if (!this.p2Alive) {
      this.p2Alive = true;
      this.p2.health = this.p2.maxHealth;
      this.p2.x = 550;
      this.p2.y = 300;
      this.p2.setVelocity(0, 0);

      // Revival effects
      this.createExplosionEffect(this.p2.x, this.p2.y, 0x00ff00, 15);
      this.playSound(800, 0.25);

      revivedAny = true;
    }

    // Show revival message
    if (revivedAny) {
      const msg = this.add.text(400, 200, 'PLAYER REVIVED!', {
        fontSize: '36px',
        fontFamily: 'Arial',
        color: '#0f0',
        stroke: '#000',
        strokeThickness: 6
      }).setOrigin(0.5);
      this.time.delayedCall(2000, () => msg.destroy());
    }
    return revivedAny;
  }

  endGame() {
    this.gameOver = true;

    // Death effects
    this.createExplosionEffect(this.p1.x, this.p1.y, 0xff0000, 20);
    this.cameras.main.shake(500, 0.01);
    this.cameras.main.flash(500, 255, 0, 0);
    this.playSound(150, 0.5);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.9);
    overlay.fillRect(0, 0, 800, 600);

    // Title
    this.add.text(400, 60, 'GAME OVER', {
      fontSize: '56px',
      fontFamily: 'Arial',
      color: '#f00',
      stroke: '#000',
      strokeThickness: 8
    }).setOrigin(0.5);

    // Main stats
    this.add.text(400, 130, 'Wave Reached: ' + this.stats.highestWave, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ff0'
    }).setOrigin(0.5);

    this.add.text(400, 165, 'Final Score: ' + this.score, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#fff'
    }).setOrigin(0.5);

    // Match statistics section
    this.add.text(400, 210, 'MATCH STATISTICS', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#0ff'
    }).setOrigin(0.5);

    let yPos = 250;

    // Enemies killed
    this.add.text(200, yPos, 'Enemies Defeated:', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaa'
    }).setOrigin(0, 0.5);
    this.add.text(600, yPos, this.stats.enemiesKilled.toString(), {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#fff'
    }).setOrigin(1, 0.5);
    yPos += 30;

    // Bosses defeated
    this.add.text(200, yPos, 'Bosses Defeated:', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaa'
    }).setOrigin(0, 0.5);
    const bossesText = this.stats.bossesDefeated.length > 0
      ? this.stats.bossesDefeated.join(', ')
      : 'None';
    this.add.text(600, yPos, bossesText, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#fff'
    }).setOrigin(1, 0.5);
    yPos += 30;

    // Maps explored
    this.add.text(200, yPos, 'Maps Explored:', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaa'
    }).setOrigin(0, 0.5);
    this.add.text(600, yPos, this.stats.mapsExplored.length.toString(), {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#fff'
    }).setOrigin(1, 0.5);
    yPos += 30;

    // Powerups collected
    this.add.text(200, yPos, 'Powerups Collected:', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaa'
    }).setOrigin(0, 0.5);
    yPos += 25;

    if (this.stats.powerupsCollected.length > 0) {
      const powerupsList = this.stats.powerupsCollected.join(', ');
      const wrappedText = this.wrapText(powerupsList, 45); // 45 chars per line
      wrappedText.forEach((line, i) => {
        this.add.text(400, yPos + (i * 18), line, {
          fontSize: '13px',
          fontFamily: 'Arial',
          color: '#fff'
        }).setOrigin(0.5);
      });
      yPos += wrappedText.length * 18 + 15;
    } else {
      this.add.text(400, yPos, 'None', {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#fff'
      }).setOrigin(0.5);
      yPos += 35;
    }

    // Return to menu
    this.add.text(400, 560, 'Press R to return to menu', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#888'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-R', () => {
      this.scene.start('MenuScene');
    });

    this.playSound(300, 0.3);
  }

  wrapText(text, maxChars) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length > maxChars) {
        if (currentLine) lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });

    if (currentLine) lines.push(currentLine.trim());
    return lines;
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

  startBackgroundMusic() {
    if (this.musicPlaying) return;
    this.musicPlaying = true;

    const ctx = this.sound.context;
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.03; // Volumen bajo para no ser molesto
    masterGain.connect(ctx.destination);

    // Chord progression: Am - F - C - G
    const progression = [
      [220, 262, 330], // Am (A C E)
      [175, 220, 262], // F (F A C)
      [262, 330, 392], // C (C E G)
      [196, 247, 294]  // G (G B D)
    ];

    const beatDuration = 0.5; // 120 BPM
    const loopLength = progression.length * 2 * beatDuration; // 4 acordes, 2 beats cada uno

    const playChord = (chordNotes, startTime, duration) => {
      chordNotes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(masterGain);

        osc.frequency.value = freq;
        osc.type = 'triangle'; // Softer sound

        // Melodic envelope
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    };

    // Main melody (arpeggios)
    const melodyPattern = [0, 2, 1, 2]; // Índices dentro del acorde
    const playMelody = (chordNotes, startTime, totalDuration) => {
      melodyPattern.forEach((noteIndex, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(masterGain);

        osc.frequency.value = chordNotes[noteIndex] * 2; // Una octava arriba
        osc.type = 'square';

        const noteStart = startTime + (i * totalDuration / melodyPattern.length);
        const noteDuration = totalDuration / melodyPattern.length;

        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.15, noteStart + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, noteStart + noteDuration);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);
      });
    };

    let nextLoopTime = ctx.currentTime;

    const scheduleMusic = () => {
      if (!this.musicPlaying) return;

      const currentTime = nextLoopTime;

      progression.forEach((chord, i) => {
        const chordStart = currentTime + (i * 2 * beatDuration);

        // Tocar acorde (2 beats)
        playChord(chord, chordStart, beatDuration * 2);

        // Melody (fast arpeggio)
        playMelody(chord, chordStart, beatDuration * 2);
      });

      // Schedule next loop
      nextLoopTime += loopLength;
      const delay = (nextLoopTime - ctx.currentTime) * 1000;

      if (delay > 100) {
        setTimeout(scheduleMusic, delay - 100); // Schedule 100ms early
      }
    };

    scheduleMusic();
  }

  stopBackgroundMusic() {
    this.musicPlaying = false;
  }

  createExplosionEffect(x, y, color, particleCount = 8) {
    // Explosion particles
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 100 + Math.random() * 100;
      const particle = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 300 + Math.random() * 200,
        startTime: this.time.now,
        color: color,
        size: 3 + Math.random() * 3
      };

      if (!this.particles) this.particles = [];
      this.particles.push(particle);
    }
  }

  createMuzzleFlash(x, y, angle, color, particleCount = 6) {
    // Muzzle flash particles
    for (let i = 0; i < particleCount; i++) {
      const spread = (Math.random() - 0.5) * 0.5; // Small spread
      const shotAngle = angle + spread;
      const speed = 150 + Math.random() * 100;
      const particle = {
        x: x + Math.cos(angle) * 20,
        y: y + Math.sin(angle) * 20,
        vx: Math.cos(shotAngle) * speed,
        vy: Math.sin(shotAngle) * speed,
        life: 150 + Math.random() * 100,
        startTime: this.time.now,
        color: color,
        size: 2 + Math.random() * 2
      };

      if (!this.particles) this.particles = [];
      this.particles.push(particle);
    }
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
    else if (this.wave === 10) bossType = 'twins';
    else bossType = 'laser';

    const typeData = BOSS_TYPES[bossType];
    const boss = this.enemies.create(400, 300, null);
    boss.setSize(typeData.size, typeData.size);
    boss.setVisible(false);
    boss.isBoss = true;
    boss.bossType = bossType;
    boss.health = Math.ceil(typeData.health * this.getSpawnDifficulty());
    boss.maxHealth = Math.ceil(typeData.health * this.getSpawnDifficulty());
    boss.speed = typeData.speed;
    boss.shootDelay = typeData.shootDelay / this.getSpawnDifficulty();
    boss.lastShot = 0;
    boss.spawnTime = this.time.now; // Spawn time
    boss.angle = 0;
    boss.patternIndex = 0;
    boss.hasChildren = false;

    // Pattern boss vars
    boss.attackPhase = 0; // 0: spiral, 1: pause, 2: waves, 3: pause
    boss.phaseStartTime = 0;
    boss.spiralFired = false;
    boss.wave1Fired = false;
    boss.wave2Fired = false;

    this.currentBoss = boss;

    // Boss spawn effects
    this.cameras.main.shake(800, 0.01);
    this.cameras.main.flash(800, 255, 0, 0);
    this.createExplosionEffect(400, 300, 0xff0000, 20);

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
    // Electrocuted: fully paralyzed
    if (boss.isElectrocuted) {
      const elapsed = time - boss.electrocutedTime;
      if (elapsed < boss.electrocutedDuration) {
        // Paralyzed
        boss.setVelocity(0);
        return; // Salir completamente de updateBoss
      } else {
        boss.isElectrocuted = false; // Effect ends
      }
    }

    // Manejo de estados elementales
    let speedMultiplier = 1.0;
    let shootDelayMultiplier = 1.0;

    if (boss.isFrozen) {
      const elapsed = time - boss.frozenTime;
      if (elapsed < boss.frozenDuration) {
        speedMultiplier = 0.3; // 70% slower
        shootDelayMultiplier = 2.0; // Shoot 2x slower
      } else {
        boss.isFrozen = false; // Effect ends
      }
    }

    // Burning: periodic damage
    if (boss.isBurning) {
      const elapsed = time - boss.burnStartTime;
      if (elapsed < boss.burnDuration) {
        // Apply damage every 500ms
        if (time - boss.burnTickTime > 500) {
          boss.health -= 2; // 2 damage per tick
          boss.burnTickTime = time;
          this.playSound(200, 0.03);

          if (boss.health <= 0) {
            const deathPosition = { x: boss.x, y: boss.y };
            this.handleBossDeath(boss, deathPosition);
            boss.destroy();
            return; // Exit updateBoss
          }
        }
      } else {
        boss.isBurning = false; // Effect ends
      }
    }

    if (boss.bossType === 'pattern') {
      // BOSS 1: Circular movement
      const angle = time * 0.0005;
      const radius = 100;
      const centerX = 400;
      const centerY = 300;
      const baseSpeed = 2 * speedMultiplier;
      boss.setVelocity(
        (Math.cos(angle) * radius - (boss.x - centerX)) * baseSpeed,
        (Math.sin(angle) * radius - (boss.y - centerY)) * baseSpeed
      );

      // Wait 1s before attacks
      if (time - boss.spawnTime > 1000) {
        if (boss.phaseStartTime === 0) boss.phaseStartTime = time;
        const phaseTime = time - boss.phaseStartTime;

        if (boss.attackPhase === 0) {
          // Spiral phase
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
          // Pause 1: 2 segundos
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
          // Pause 2: 2 segundos
          if (phaseTime >= 2000) {
            boss.attackPhase = 0;
            boss.phaseStartTime = time;
          }
        }
      }
    } else if (boss.bossType === 'laser') {
      // BOSS 2: Slow movement, laser bursts

      // Find nearest player
      const target = this.getNearestPlayer(boss.x, boss.y);

      // Slow movement to player
      const dx = target.x - boss.x;
      const dy = target.y - boss.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const slowSpeed = 40 * speedMultiplier; // Muy lento
      if (dist > 0) {
        boss.setVelocity(dx/dist * slowSpeed, dy/dist * slowSpeed);
      }

      // Ángulo siempre apuntando al jugador
      boss.angle = Math.atan2(dy, dx) * 180 / Math.PI;

      // Burst system
      if (time - boss.spawnTime > 1000) {
        // Init burst state
        if (boss.burstActive === undefined) {
          boss.burstActive = false;
          boss.nextBurstTime = time;
        }

        if (!boss.burstActive) {
          // Waiting for next burst
          if (time >= boss.nextBurstTime) {
            // Start new burst
            boss.burstActive = true;
            boss.burstStartTime = time;
            boss.burstDuration = 1000 + Math.random() * 3000; // 1-4 segundos
            boss.burstShotInterval = 50; // Shoot every 50ms
            boss.lastBurstShot = time;
          }
        } else {
          // Active burst
          const burstElapsed = time - boss.burstStartTime;

          if (burstElapsed < boss.burstDuration) {
            // Shoot in burst
            if (time - boss.lastBurstShot > boss.burstShotInterval) {
              this.shootAimed(boss, target, 250, 2000, true);
              boss.lastBurstShot = time;
            }
          } else {
            // End burst
            boss.burstActive = false;
            boss.nextBurstTime = time + 500 + Math.random() * 2500; // 0.5-3 segundos de descanso
          }
        }
      }
    } else if (boss.bossType === 'twins' && !boss.hasChildren) {
      // BOSS 3: TWO TWINS alternating

      // Crear mellizos si no existen
      boss.hasChildren = true;

      // Create twin 1
      const twin1 = this.enemies.create(300, 200, null);
      twin1.setSize(35, 35);
      twin1.setVisible(false);
      twin1.isBoss = true;
      twin1.bossType = 'twin1';
      twin1.health = Math.ceil(150 * this.getSpawnDifficulty());
      twin1.maxHealth = Math.ceil(150 * this.getSpawnDifficulty());
      twin1.speed = 120; // Faster
      twin1.spawnTime = this.time.now;
      twin1.lastShot = 0;
      twin1.phaseStartTime = time;
      twin1.isAttacking = true; // Twin1 empieza atacando

      // Create twin 2
      const twin2 = this.enemies.create(500, 400, null);
      twin2.setSize(35, 35);
      twin2.setVisible(false);
      twin2.isBoss = true;
      twin2.bossType = 'twin2';
      twin2.health = Math.ceil(150 * this.getSpawnDifficulty());
      twin2.maxHealth = Math.ceil(150 * this.getSpawnDifficulty());
      twin2.speed = 120; // Faster
      twin2.spawnTime = this.time.now;
      twin2.lastShot = 0;
      twin2.phaseStartTime = time;
      twin2.isAttacking = false; // Twin2 empieza esperando

      // Guardar referencias
      boss.twin1 = twin1;
      boss.twin2 = twin2;
      twin1.sibling = twin2;
      twin2.sibling = twin1;

      // Destruir el boss original (ya no se usa)
      boss.destroy();
    }
  }

  updateTwin(twin, time, speedMultiplier, shootDelayMultiplier) {
    // Find nearest player
    const target = this.getNearestPlayer(twin.x, twin.y);

    // Twin repulsion
    let repulsionX = 0;
    let repulsionY = 0;
    if (twin.sibling && twin.sibling.active) {
      const siblingDx = twin.sibling.x - twin.x;
      const siblingDy = twin.sibling.y - twin.y;
      const siblingDist = Math.sqrt(siblingDx*siblingDx + siblingDy*siblingDy);

      // Apply repulsion if too close
      if (siblingDist < 100 && siblingDist > 0) {
        const repulsionStrength = (100 - siblingDist) * 2; // Closer = stronger repulsion
        repulsionX = -(siblingDx / siblingDist) * repulsionStrength;
        repulsionY = -(siblingDy / siblingDist) * repulsionStrength;
      }
    }

    // Fast erratic movement
    const dx = target.x - twin.x;
    const dy = target.y - twin.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const effectiveSpeed = twin.speed * speedMultiplier;

    let velocityX = 0;
    let velocityY = 0;

    if (dist > 150) {
      velocityX = (dx/dist * effectiveSpeed);
      velocityY = (dy/dist * effectiveSpeed);
    } else if (dist < 100) {
      velocityX = (-dx/dist * effectiveSpeed);
      velocityY = (-dy/dist * effectiveSpeed);
    } else {
      // Circle around player
      const angle = time * 0.002;
      velocityX = Math.cos(angle) * effectiveSpeed;
      velocityY = Math.sin(angle) * effectiveSpeed;
    }

    // Apply velocity + repulsion
    twin.setVelocity(velocityX + repulsionX, velocityY + repulsionY);

    // Wait 1s after spawn
    if (time - twin.spawnTime > 1000) {
      if (twin.phaseStartTime === 0) twin.phaseStartTime = time;
      const phaseTime = time - twin.phaseStartTime;

      if (twin.isAttacking) {
        // Atacando durante 5 segundos
        if (twin.bossType === 'twin1') {
          // Twin 1: circular waves
          if (time - twin.lastShot > 300 * shootDelayMultiplier) {
            this.shootWave(twin, 10, 0, 200, 3000, 0);
            twin.lastShot = time;
          }
        } else {
          // Twin 2: spiral
          if (!twin.spiralFired) {
            // Longer spiral
            this.shootSpiral(twin, 50, 4, Math.PI * 2, 0, 400, 3000, 100);
            twin.spiralFired = true;
          }
        }

        if (phaseTime >= 5000) {
          // Terminar ataque, cambiar turno
          twin.isAttacking = false;
          twin.spiralFired = false;
          twin.phaseStartTime = time;
          if (twin.sibling && twin.sibling.active) {
            twin.sibling.isAttacking = true;
            twin.sibling.phaseStartTime = time;
          }
        }
      } else {
        // No atacando, esperando 5 segundos
        if (phaseTime >= 5000) {
          // No hace nada, espera que el hermano termine
        }
      }
    }
  }

  // ===== SISTEMA DE POWERUPS =====

  trySpawnPowerup(isBoss, position) {
    if (isBoss) {
      const bossDrops = ['extraBullet', 'backShot', 'iceBullets', 'fireBullets', 'electricBullets','spreadShot', 'homingBullets', 'bounce', 'maxHeart', 'pierceShot']; // 'speedBoost', 'fireRate', 'shield' and 'moreDamage' are left out
      const randomDrop = bossDrops[Math.floor(Math.random() * bossDrops.length)];
      this.spawnPowerup(position, randomDrop);
      return;
    }

    // Waves normales: SIN DAÑO primero
    const commonPowerups = ['extraBullet', 'speedBoost', 'fireRate', 'shield', 'moreDamage', 'backShot', 'iceBullets', 'fireBullets', 'electricBullets'];
        const rarePowerups = ['spreadShot', 'homingBullets', 'bounce', 'maxHeart', 'pierceShot']; //['spreadShot', 'homingBullets', 'bounce', 'maxHeart', 'pierceShot', 'iceBullets', 'fireBullets', 'electricBullets'];
    if (!this.damageTakenThisWave) {
      // 1. Primero: 10% chance de powerup RARO
      if (Math.random() < 0.12 * this.getSpawnDifficulty()) {
        const randomRare = rarePowerups[Math.floor(Math.random() * rarePowerups.length)];
        this.spawnPowerup(position, randomRare);
        return;
      }

      // 2. Segundo: 15% chance de powerup COMÚN
      if (Math.random() < 0.18 * this.getSpawnDifficulty()) {
        const randomCommon = commonPowerups[Math.floor(Math.random() * commonPowerups.length)];
        this.spawnPowerup(position, randomCommon);
        return;
      }

      // 3. Tercero: 5% chance de CORAZÓN
      if (Math.random() < 0.05 * this.getSpawnDifficulty()) {
        this.spawnPowerup(position, 'heart');
        return;
      }
    } else {
      // WITH DAMAGE: 10% common, 5% rare
      if (Math.random() < 0.05 * this.getSpawnDifficulty()) {
        const randomRare = rarePowerups[Math.floor(Math.random() * rarePowerups.length)];
        this.spawnPowerup(position, randomRare);
        return;
      }
      if (Math.random() < 0.10 * this.getSpawnDifficulty()) {
        const randomCommon = commonPowerups[Math.floor(Math.random() * commonPowerups.length)];
        this.spawnPowerup(position, randomCommon);
        return;
      }

      // 10% chance heart
      if (Math.random() < 0.1 * this.getSpawnDifficulty()) {
        this.spawnPowerup(position, 'heart');
        return;
      }
    }
  }

  spawnPowerup(position, type) {
    // Use dead enemy position or center
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
    const px = powerup.x;
    const py = powerup.y;
    const powerupData = POWERUP_TYPES[type];

    powerup.destroy();
    this.playSound(800, 0.3);

    // Track powerup collection
    if (!this.stats.powerupsCollected.includes(powerupData.name)) {
      this.stats.powerupsCollected.push(powerupData.name);
    }

    // Powerup collect effect
    this.createExplosionEffect(px, py, powerupData.color, 6);

    let message = '';
    const color = '#' + powerupData.color.toString(16).padStart(6, '0');

    // Apply effects by type
    switch(type) {
      case 'extraBullet':
        player.specialBullets++;
        player.specialCooldown += 300; // +300ms solo para extraBullet
        message = `${powerupData.description} (${player.specialBullets})`;
        break;

      case 'speedBoost':
        player.speed += player.baseSpeed * 0.25; // +25% velocidad
        message = powerupData.description;
        break;

      case 'fireRate':
        player.normalShotCooldown = Math.max(50, player.normalShotCooldown * 0.8); // -20% cooldown
        player.specialShotCooldown = Math.max(300, player.specialShotCooldown * 0.8);
        message = `${powerupData.description}`;
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
        player.damageMultiplier += 0.25; // +25% damage
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
          player.iceDuration += 2000; // +1s por cada powerup adicional
        }
        message = `${powerupData.description} (${player.iceDuration / 1000}s)`;
        break;

      case 'fireBullets':
        if (player.fireDuration === 0) {
          player.fireDuration = 3000; // 3s base
        } else {
          player.fireDuration += 1500; // +1s por cada powerup adicional
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
    const p = Math.sin(this.time.now * 0.005) * 0.2 + 0.8;
    const d = POWERUP_TYPES[powerup.type];
    const x = powerup.x, y = powerup.y;

    this.graphics.fillStyle(d.color, p);
    this.graphics.fillCircle(x, y, 12);
    this.graphics.lineStyle(2, 0xffffff, p);
    this.graphics.strokeCircle(x, y, 12);

    this.graphics.save();
    this.graphics.translateCanvas(x, y);
    this.graphics.fillStyle(0xffffff, p);

    // Simple icon overlays
    if (powerup.type === 'extraBullet') {
      this.graphics.fillCircle(0, -4, 3);
      this.graphics.fillCircle(0, 4, 3);
    } else if (powerup.type === 'heart' || powerup.type === 'maxHeart') {
      this.graphics.fillCircle(-4, -3, 5);
      this.graphics.fillCircle(4, -3, 5);
      this.graphics.fillTriangle(-7, 0, 7, 0, 0, 9);
    } else if (powerup.type === 'speedBoost') {
      this.graphics.fillTriangle(-3, -5, -3, 5, 6, 0);
    } else if (powerup.type === 'fireRate') {
      this.graphics.lineStyle(2, 0xffffff, p);
      this.graphics.lineBetween(0, 0, 0, -6);
      this.graphics.lineBetween(0, 0, 4, 4);
    } else if (powerup.type === 'shield') {
      this.graphics.strokeCircle(0, 0, 6);
    } else if (powerup.type === 'pierceShot') {
      this.graphics.lineStyle(2, 0xffffff, p);
      this.graphics.lineBetween(-6, 0, 6, 0);
    } else if (powerup.type === 'moreDamage') {
      this.drawPolygon(0, 0, 4, 6, 2, 0);
    } else if (powerup.type === 'spreadShot') {
      this.graphics.fillCircle(0, -5, 2);
      this.graphics.fillCircle(-4, 3, 2);
      this.graphics.fillCircle(4, 3, 2);
    } else if (powerup.type === 'homingBullets') {
      this.graphics.lineStyle(2, 0xffffff, p);
      this.graphics.strokeCircle(0, 0, 4);
      this.graphics.fillCircle(0, -6, 2);
    } else if (powerup.type === 'bounce') {
      this.graphics.lineStyle(2, 0xffffff, p);
      this.graphics.lineBetween(-6, -4, 0, 4);
      this.graphics.lineBetween(0, 4, 6, -4);
    } else if (powerup.type === 'backShot') {
      this.graphics.fillTriangle(5, 0, -2, -3, -2, 3);
      this.graphics.fillTriangle(-5, 0, 2, -3, 2, 3);
    } else if (powerup.type === 'iceBullets') {
      this.graphics.fillTriangle(0, -6, -4, 0, 4, 0);
      this.graphics.fillTriangle(0, 6, -4, 0, 4, 0);
    } else if (powerup.type === 'fireBullets') {
      this.graphics.fillTriangle(-4, 2, 4, 2, 0, -7);
      this.graphics.fillCircle(0, 3, 4);
    } else if (powerup.type === 'electricBullets') {
      this.graphics.lineStyle(2, 0xffffff, p);
      this.graphics.lineBetween(0, -6, -2, -2);
      this.graphics.lineBetween(-2, -2, 2, 2);
      this.graphics.lineBetween(2, 2, 0, 6);
    }

    this.graphics.restore();
  }

  // ===== SISTEMA MODULAR DE DISPAROS DE BOSSES =====

  // Generic bullet creator
  shootBossBullet(x, y, angle, speed, lifetime, playSound = true) {
    const b = this.enemyBullets.create(x, y);
    b.setSize(10, 10);
    b.setVisible(false);
    b.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.time.delayedCall(lifetime, () => { if (b && b.active) b.destroy(); });

    // Auto sound per bullet
    if (playSound) {
      this.playSound(500, 0.1);
    }

    return b;
  }

  // Pattern: Circular wave
  // bulletCount: bullets in circle
  // angleOffset: initial angle offset (rad)
  // spawnRadius: spawn radius
  shootWave(source, bulletCount, angleOffset, speed, lifetime, spawnRadius = 0) {
    for (let i = 0; i < bulletCount; i++) {
      const angle = angleOffset + (i * Math.PI * 2 / bulletCount);
      const x = source.x + Math.cos(angle) * spawnRadius;
      const y = source.y + Math.sin(angle) * spawnRadius;
      this.shootBossBullet(x, y, angle, speed, lifetime);
    }
  }

  // Pattern: Complete spiral
  // bulletCount: bullets per arm
  // arms: spiral arms
  // rotation: total rotation (rad)
  // angleOffset: initial angle (rad)
  // delayBetween: milisegundos entre cada bala (para efecto visual)
  shootSpiral(source, bulletCount, arms, rotation, angleOffset, speed, lifetime, delayBetween = 100) {
    for (let i = 0; i < bulletCount; i++) {
      const delay = i * delayBetween;
      this.time.delayedCall(delay, () => {
        if (!source.active) return; // If boss died, don't shoot
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
    if (boss.bossType === 'twin1' || boss.bossType === 'twin2') {
      this.graphics.fillStyle(boss.bossType === 'twin1' ? 0xff00ff : 0x00ffff);
      this.drawPolygon(boss.x, boss.y, 5, 30, 12, -Math.PI / 2);
    } else {
      this.graphics.fillStyle(BOSS_TYPES[boss.bossType].color);
      if (boss.bossType === 'pattern') {
        this.drawPolygon(boss.x, boss.y, 6, 35, 15, -Math.PI / 2);
      } else if (boss.bossType === 'laser') {
        this.graphics.save();
        this.graphics.translateCanvas(boss.x, boss.y);
        this.graphics.rotateCanvas(boss.angle * Math.PI / 180);
        this.drawPolygon(0, 0, 10, 45, 20, 0);
        this.graphics.restore();
      }
    }
    const barW = 100, barH = 8, barX = boss.x - 50, barY = boss.y - 50;
    const hp = boss.health / boss.maxHealth;
    this.graphics.fillStyle(0x000000);
    this.graphics.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
    this.graphics.fillStyle(0xff0000);
    this.graphics.fillRect(barX, barY, barW, barH);
    this.graphics.fillStyle(0x00ff00);
    this.graphics.fillRect(barX, barY, barW * hp, barH);
  }

  openDoors() {
    this.doorsOpen = true;

    // Disable door collision
    this.doorWallTop.body.enable = false;
    this.doorWallBottom.body.enable = false;
    this.doorWallLeft.body.enable = false;
    this.doorWallRight.body.enable = false;

  }

  closeDoors() {
    this.doorsOpen = false;

    // Reactivate door collision
    this.doorWallTop.body.enable = true;
    this.doorWallBottom.body.enable = true;
    this.doorWallLeft.body.enable = true;
    this.doorWallRight.body.enable = true;
  }

  handleDoorOverlap(player, door) {
    if (!this.doorsOpen || this.transitioning) return;

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
      specialCooldown: player.specialCooldown,
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

    // Track map
    if (!this.stats.mapsExplored.includes(this.level)) {
      this.stats.mapsExplored.push(this.level);
    }


    // Transition effects
    this.cameras.main.fade(500, 0, 0, 0);
    this.playSound(900, 0.3);
    this.createExplosionEffect(this.p1.x, this.p1.y, 0x00ffff, 15);

    // Save player state
    const p1State = this.savePlayerState(this.p1);
    const p2State = this.numPlayers === 2 ? this.savePlayerState(this.p2) : null;

    // Restart scene
    this.time.delayedCall(500, () => {
      this.scene.restart({
        players: this.numPlayers,
        level: this.level,
        wave: this.wave,
        score: this.score,
        p1State: p1State,
        p2State: p2State,
        stats: this.stats
      });
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
