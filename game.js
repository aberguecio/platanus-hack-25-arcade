
// ===== DEBUG & SETTINGS =====
const DEBUG_MODE = false;           // Set to true for testing
const DEBUG_START_WAVE = 1;        // Which wave to start at (useful for testing bosses: 5, 10, 20)
const DEBUG_START_LEVEL = 1;       // Which level/map to start at (1, 2, 3)
const DEBUG_GODMODE = false;        // Set to true for invincibility
const DIFFICULTY = 1;            // Difficulty multiplier

const COOP_DIFFICULTY = 1.3;       // Multiplier for 2-player mode (affects enemy count & spawn rate and boss health)
const ARCADE_MODE = false;



if (ARCADE_MODE) {
  const ARCADE_CONTROLS = {
    // ===== PLAYER 1 CONTROLS =====
    // Joystick - Left hand on WASD
    'P1U': ['w'],
    'P1D': ['s'],
    'P1L': ['a'],
    'P1R': ['d'],

    // Action Buttons - Right hand on home row area (ergonomic!)
    // Top row (ABC): U, I, O  |  Bottom row (XYZ): J, K, L
    'P1A': ['q'],
    'P1B': ['e'],
    'P1X': ['q'],
    'P1Y': ['e'],

    // Start Button
    'START1': ['Enter'],

    // ===== PLAYER 2 CONTROLS =====
    // Joystick - Right hand on Arrow Keys
    'P2U': ['i'],
    'P2D': ['k'],
    'P2L': ['j'],
    'P2R': ['l'],

    // Action Buttons - Left hand (avoiding P1's WASD keys)
    // Top row (ABC): R, T, Y  |  Bottom row (XYZ): F, G, H
    'P2A': ['u'],
    'P2B': ['o'],
    'P2X': ['u'],
    'P2Y': ['o'],

    // Start Button
    'START2': ['Enter']
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
}

// High scores system
const getHighScores = () => {
  try {
    const scores = document.cookie.match('(^| )obs_highScores=([^;]+)');
    return scores ? JSON.parse(decodeURIComponent(scores[2])) : [];
  } catch(e) {
    return [];
  }
};

const setCookie = (name, value) => {
  try {
    const d = new Date();
    d.setTime(d.getTime() + 31536000000);
    const expires = 'expires=' + d.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
  } catch (e) {
  }
}

// MENU SCENE
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.graphics = this.add.graphics();
    this.selectedOption = 0; // 0 = 1 player, 1 = 2 players
    this.startBackgroundMusic();

    // Title with glow effect
    this.titleText = this.add.text(400, 120, 'OBSCURANTISM', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ff0000',
      stroke: '#000',
      strokeThickness: 8
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(400, 180, 'Wave Survival Arena', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#666',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // High scores section
    const scores = getHighScores();
    if (scores.length > 0) {
      this.add.text(400, 380, 'HIGH SCORES', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffcc00'
      }).setOrigin(0.5);

      scores.forEach((score, i) => {
        this.add.text(400, 410 + i * 25, `${i + 1}. ${score.name} - ${score.score}`, {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: i === 0 ? '#ffcc00' : '#cc9900'
        }).setOrigin(0.5);
      });
    }

    // Menu options text
    this.text1 = this.add.text(400, 240, '1 PLAYER', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.text2 = this.add.text(400, 310, '2 PLAYERS', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#0099ff'
    }).setOrigin(0.5);


    // Render player controls
    renderPlayerControls(this, 200, 430, CONTROLS_CONFIG.player1);
    renderPlayerControls(this, 600, 430, CONTROLS_CONFIG.player2);

    // Instructions for menu navigation
    this.add.text(400, 560, 'Press W/S to select, Enter to start', {
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
    // Draw animated background with diagonal movement
    this.graphics.clear();
    this.graphics.fillStyle(0x000000, 1);
    this.graphics.fillRect(0, 0, 800, 600);

    // Grid pattern with diagonal movement
    this.graphics.lineStyle(1, 0x2a2a2a, 1);
    const offsetX = (time * 0.02) % 40; // Horizontal movement
    const offsetY = (time * 0.02) % 40; // Vertical movement
    for (let i = -40; i < 840; i += 40) {
      const wave = Math.sin(time * 0.001 + i * 0.02) * 5;
      this.graphics.lineBetween(i + offsetX, 0, i + offsetX, 600 + wave);
    }
    for (let j = -40; j < 640; j += 40) {
      const wave = Math.cos(time * 0.001 + j * 0.02) * 5;
      this.graphics.lineBetween(0, j + offsetY, 800 + wave, j + offsetY);
    }

    // Selection
    if (time - this.lastInput > 100) {
      if (this.keys.w.isDown) {
        this.selectedOption = 0;
        this.lastInput = time;
      } else if (this.keys.s.isDown) {
        this.selectedOption = 1;
        this.lastInput = time;
      } else if (this.keys.enter.isDown) {
        this.startGame();
        this.lastInput = time;
      }
    }

    // Title pulse effect
    const pulse = 1 + Math.sin(time * 0.003) * 0.05;
    this.titleText.setScale(pulse);

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

  startBackgroundMusic() {
    if (this.musicPlaying) return;
    this.musicPlaying = true;

    const ctx = this.sound.context;
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.03;
    masterGain.connect(ctx.destination);

    const progression = [
      [220, 262, 330], [175, 220, 262], [262, 330, 392], [196, 247, 294]
    ];

    const beatDuration = 0.5;
    const loopLength = progression.length * 2 * beatDuration;

    // Helper to schedule a single note (oscillator + gain envelope)
    const scheduleNote = (freq, startTime, duration, type = 'triangle', peak = 0.3, attack = 0.05, endGain = 0.01) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(masterGain);
      osc.frequency.value = freq;
      osc.type = type;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(peak, startTime + attack);
      gain.gain.exponentialRampToValueAtTime(endGain, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const playChord = (chordNotes, startTime, duration) => {
      chordNotes.forEach(freq => scheduleNote(freq, startTime, duration, 'triangle', 0.3, 0.05, 0.01));
    };

    const melodyPattern = [0, 2, 1, 2];
    const playMelody = (chordNotes, startTime, totalDuration) => {
      melodyPattern.forEach((noteIndex, i) => {
        const noteStart = startTime + (i * totalDuration / melodyPattern.length);
        const noteDuration = totalDuration / melodyPattern.length;
        const freq = chordNotes[noteIndex] * 2;
        scheduleNote(freq, noteStart, noteDuration, 'square', 0.15, 0.01, 0.01);
      });
    };

    let nextLoopTime = ctx.currentTime;
    const scheduleMusic = () => {
      if (!this.musicPlaying) return;
      const currentTime = nextLoopTime;
      progression.forEach((chord, i) => {
        const chordStart = currentTime + (i * 2 * beatDuration);
        playChord(chord, chordStart, beatDuration * 2);
        playMelody(chord, chordStart, beatDuration * 2);
      });
      nextLoopTime += loopLength;
      const delay = (nextLoopTime - ctx.currentTime) * 1000;
      if (delay > 100) setTimeout(scheduleMusic, delay - 100);
    };
    scheduleMusic();
  }

  startGame() {
    const players = this.selectedOption === 0 ? 1 : 2;
    this.scene.start('StoryScene', { players });
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
    health: 45,
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
    shootDelay: 6000,
    color: 0x00ff88,
    points: 80,
    size: 38,
    rotates: false
  }
};

// BOSS TYPE DEFINITIONS
const BOSS_TYPES = {
  pattern: {health: 500, speed: 30, shootDelay: 1500, size: 50, name: 'Shooting Star', color: 0xffff00},
  twins: {health: 1200, speed: 40, shootDelay: 2000, size: 40, name: 'Twins Shifter´s', color: [0xff00ff, 0x00ffff]},
  laser: {health: 2000, speed: 50, shootDelay: 800, size: 50, name: 'Ultimate Laser', color: 0x00ffaa}
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
    description: '+25% Speed'
  },
  fireRate: {
    name: 'Fire Rate Up',
    color: 0xff8800,
    description: 'Faster Shooting'
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

// CONTROL CONFIGURATION
const CONTROLS_CONFIG = {
  player1: {
    title: 'PLAYER 1',
    color: '#00ff00',
    controls: ['Move: WASD', 'Shoot: Q/R', 'Special: E']
  },
  player2: {
    title: 'PLAYER 2',
    color: '#0099ff',
    controls: ['Move: IJKL', 'Shoot: U/P', 'Special: O']
  }
};

// Helper function to render player controls
function renderPlayerControls(scene, x, startY, playerConfig, options = {}) {
  const {
    titleSize = '18px',
    controlSize = '14px',
    spacing = 20,
    useStroke = false,
    textArray = null
  } = options;

  const texts = textArray || [];
  let y = startY;

  // Title style
  const titleStyle = {
    fontSize: titleSize,
    fontFamily: 'Arial',
    color: playerConfig.color
  };
  if (useStroke) {
    titleStyle.stroke = '#000';
    titleStyle.strokeThickness = 3;
  }

  const title = scene.add.text(x, y, playerConfig.title, titleStyle).setOrigin(0.5);
  if (textArray) texts.push(title);
  y += 30;

  // Controls
  playerConfig.controls.forEach(control => {
    const controlText = scene.add.text(x, y, control, {
      fontSize: controlSize,
      fontFamily: 'Arial',
      color: '#aaa'
    }).setOrigin(0.5);

    if (textArray) texts.push(controlText);
    y += spacing;
  });

  return texts;
}

// MAP LAYOUTS
const MAP_LAYOUTS = [
  // Map 1 (waves 1-5)
  [
    {x: 200, y: 150, w: 60, h: 60},
    {x: 600, y: 150, w: 60, h: 60},
    {x: 200, y: 450, w: 60, h: 60},
    {x: 600, y: 450, w: 60, h: 60},
    {x: 400, y: 300, w: 40, h: 40}
  ],
  // Map 2 (waves 6-10)
  [
    {x: 400, y: 150, w: 100, h: 40},
    {x: 400, y: 450, w: 100, h: 40},
    {x: 200, y: 300, w: 40, h: 100},
    {x: 600, y: 300, w: 40, h: 100}
  ],
  // Map 3 (waves 11-15)
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
    
  ],
  // Map 4 (waves 16-20)
    [
    {x: 200, y: 150, w: 50, h: 50},
    {x: 200, y: 300, w: 50, h: 50},
    {x: 200, y: 450, w: 50, h: 50},
    {x: 400, y: 150, w: 50, h: 50},
    {x: 400, y: 300, w: 50, h: 50},
    {x: 400, y: 450, w: 50, h: 50},
    {x: 600, y: 150, w: 50, h: 50},
    {x: 600, y: 300, w: 50, h: 50},
    {x: 600, y: 450, w: 50, h: 50},
    
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

    // Arena walls helper function
    this.createWallAndDoors = () => {
      this.walls = this.physics.add.staticGroup();
      this.doorWalls = this.physics.add.staticGroup();
      this.doorZones = this.physics.add.staticGroup();
      
      // Config for walls and doors
      const cfg = {
        top: {wall: [[190,10,380,20], [610,10,380,20]], door: [400,10,40,20]},
        bottom: {wall: [[190,590,380,20], [610,590,380,20]], door: [400,590,40,20]},
        left: {wall: [[10,140,20,280], [10,460,20,280]], door: [10,300,20,40]},
        right: {wall: [[790,140,20,280], [790,460,20,280]], door: [790,300,20,40]}
      };

      // Create walls and doors
      Object.entries(cfg).forEach(([side, data]) => {
        // Create walls
        data.wall.forEach(([x,y,w,h]) => {
          const wall = this.walls.create(x, y, null);
          wall.body.setSize(w, h);
          wall.setVisible(false);
        });

        // Create door wall
        const [x,y,w,h] = data.door;
        const doorWall = this.doorWalls.create(x, y, null);
        doorWall.body.setSize(w, h);
        doorWall.setVisible(false);
        this['doorWall' + side.charAt(0).toUpperCase() + side.slice(1)] = doorWall;

        // Create door zone
        const doorZone = this.doorZones.create(x, y, null);
        doorZone.body.setSize(w, h);
        doorZone.setVisible(false);
        this['door' + side.charAt(0).toUpperCase() + side.slice(1)] = doorZone;
      });

      // Array for easy door management
      this.doorWallArray = [this.doorWallTop, this.doorWallBottom, this.doorWallLeft, this.doorWallRight];
    };

    // Create walls and doors
    this.createWallAndDoors();

    // Obstacles (loaded dynamically)
    this.obstacles = this.physics.add.staticGroup();
    this.obstacleData = [];
    this.loadMap();

    // Players (sistema de hearts)
    this.p1 = this.initPlayer(300, 300, this.p1State);
    this.players = [this.p1];

    if (this.numPlayers === 2) {
      this.p2 = this.initPlayer(500, 300, this.p2State);
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

    // Bullet and enemy collisions with walls/obstacles
    const wallGroups = [this.walls, this.doorWalls, this.obstacles];
    const playerBulletGroups = [this.playerBullets, this.playerSpecialBullets];
    playerBulletGroups.forEach(bullets => {
      wallGroups.forEach(walls => {
        this.physics.add.overlap(bullets, walls, (b, wall) => this.handleBulletWallCollision(b, wall));
      });
    });
    wallGroups.forEach(walls => {
      this.physics.add.overlap(this.enemyBullets, walls, (b) => b.destroy());
      this.physics.add.collider(this.enemies, walls);
    });

    // Player bullets hit enemies
    this.physics.add.overlap(this.playerBullets, this.enemies, (b, e) => this.hitEnemy(e, b));
    this.physics.add.overlap(this.playerSpecialBullets, this.enemies, (b, e) => this.hitEnemy(e, b));

    // Special bullets destroy enemy bullets on contact but persist
    this.physics.add.overlap(this.playerSpecialBullets, this.enemyBullets, (special, enemyB) => {
      if (enemyB && enemyB.active) {
        // destroy the enemy bullet only
        enemyB.destroy();
        // optional feedback
        this.playSound && this.playSound(400, 0.06);
        this.createExplosionEffect && this.createExplosionEffect(enemyB.x, enemyB.y, 0xff0000, 6);
      }
    });

    // Player overlaps (bullets, doors, powerups)
    this.players.forEach(p => {
      this.physics.add.overlap(this.enemyBullets, p, (player, b) => this.hitPlayer(player, b));
      this.physics.add.overlap(p, this.doorZones, () => this.handleDoorOverlap());
      this.physics.add.overlap(p, this.powerups, (player, pow) => this.collectPowerup(player, pow));
    });

    // Controls
    this.keys = this.input.keyboard.addKeys({
      w: 'W', a: 'A', s: 'S', d: 'D',
      q: 'Q', e: 'E', r: 'R',
      up: 'I', down: 'K', left: 'J', right: 'L',
      shoot2: 'U', special2: 'O', p: 'P',
      restart: 'R'
    });

    // Pause system
    this.isPaused = false;
    this.pauseGraphics = this.add.graphics();
    this.pauseTexts = [];

    this.input.keyboard.on('keydown-ENTER', () => {
      this.togglePause();
    });

    // Debug controls (only included if DEBUG_MODE is true)
    if (DEBUG_MODE) {
      this.debugSkipToWave = (targetWave) => {
        this.enemies.clear(true, true);
        this.enemyBullets.clear(true, true);
        this.wave = targetWave - 1;
        this.bossActive = false;
        this.doorsOpen = false;
        this.startNextWave();
      };
      this.debugKillAllEnemies = () => {
        this.enemies.clear(true, true);
        this.bossActive = false;
      };
      this.input.keyboard.on('keydown-ONE', () => this.debugSkipToWave(5));
      this.input.keyboard.on('keydown-TWO', () => this.debugSkipToWave(10));
      this.input.keyboard.on('keydown-THREE', () => this.debugSkipToWave(15));
      this.input.keyboard.on('keydown-FOUR', () => this.debugSkipToWave(20));
      this.input.keyboard.on('keydown-FIVE', () => this.debugSkipToWave(25));
      this.input.keyboard.on('keydown-SIX', () => this.debugSkipToWave(30));
      this.input.keyboard.on('keydown-NINE', () => this.debugKillAllEnemies());
      this.input.keyboard.on('keydown-ZERO', () => this.trySpawnPowerup(true, { x: this.p1.x, y: this.p1.y }));
    }

    // UI
    this.hpText1 = this.add.text(20, 20, 'P1: 100 HP', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#0f0'
    });

    if (this.numPlayers === 2) {
      this.hpText2 = this.add.text(780, 20, 'P2: 100 HP', {
        fontSize: '20px',
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
    if (DEBUG_MODE || DEBUG_GODMODE || DIFFICULTY !== 1.0 ) {
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

    // Handle pause menu
    if (this.isPaused) {
      this.drawPauseMenu();
      return;
    }

    // Clear pause graphics when not paused
    this.pauseGraphics.clear();

    // Background grid
    this.graphics.lineStyle(1, 0x2a2a2a, 0.7);
    for (let i = 20; i < 780; i += 30) this.graphics.lineBetween(i, 20, i, 580);
    for (let j = 20; j < 580; j += 30) this.graphics.lineBetween(20, j, 780, j);

    // Brick texture helper with relief border
    const drawBricks = (x, y, w, h, color) => {
      this.graphics.fillStyle(color);
      this.graphics.fillRect(x, y, w, h);

      // Relief effect: light top-left, dark bottom-right
      this.graphics.lineStyle(6, 0x444444);
      this.graphics.lineBetween(x, y, x + w, y);
      this.graphics.lineBetween(x, y, x, y + h);
      this.graphics.lineStyle(6, 0x0a0a0a);
      this.graphics.lineBetween(x + w, y, x + w, y + h);
      this.graphics.lineBetween(x, y + h, x + w, y + h);

      // Brick pattern
      this.graphics.lineStyle(1, 0x1a1a1a);
      const bw = 14, bh = 7;
      for (let by = -bh; by < h + bh; by += bh) {
        const offset = (Math.floor(by / bh) % 2) * (bw / 2);
        for (let bx = -bw; bx < w + bw; bx += bw) {
          const rx = x + bx + offset, ry = y + by;
          const rw = Math.min(bw, x + w - rx), rh = Math.min(bh, y + h - ry);
          if (rx < x + w && ry < y + h && rx + rw > x && ry + rh > y) {
            this.graphics.strokeRect(Math.max(rx, x), Math.max(ry, y),
              Math.min(rx + bw, x + w) - Math.max(rx, x),
              Math.min(ry + bh, y + h) - Math.max(ry, y));
          }
        }
      }
    };

    // Draw walls
    drawBricks(0, 0, 800, 20, 0x2a2a2a);
    drawBricks(0, 580, 800, 20, 0x2a2a2a);
    drawBricks(0, 0, 20, 600, 0x2a2a2a);
    drawBricks(780, 0, 20, 600, 0x2a2a2a);

    // Draw doors
    this.graphics.fillStyle(this.doorsOpen ? 0x00ffff : 0x00ff00);
    this.graphics.fillRect(380, 0, 40, 20);
    this.graphics.fillRect(380, 580, 40, 20);
    this.graphics.fillRect(0, 280, 20, 40);
    this.graphics.fillRect(780, 280, 20, 40);

    // Draw obstacles
    this.obstacleData.forEach(obs => {
      drawBricks(obs.x - obs.w/2, obs.y - obs.h/2, obs.w, obs.h, 0x3a3a3a);
    });

    // Draw players
    this.drawPlayer(this.p1, 0x00ff00, time);
    this.drawCooldownBar(20, 45, this.p1.currentSpecialCooldown);

    if (this.numPlayers === 2) {
      this.drawPlayer(this.p2, 0x0099ff, time);
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
      // Trail effect
      if (b.body) {
        const angle = Math.atan2(b.body.velocity.y, b.body.velocity.x);
        for (let i = 1; i <= 3; i++) {
          const alpha = 0.3 - i * 0.1;
          this.graphics.fillStyle(b.color, alpha);
          this.graphics.fillCircle(b.x - Math.cos(angle) * i * 6, b.y - Math.sin(angle) * i * 6, 6 - i);
        }
      }
      this.graphics.fillStyle(b.color);
      this.graphics.fillCircle(b.x, b.y, 8);
      this.graphics.lineStyle(2, b.color, 0.5);
      this.graphics.strokeCircle(b.x, b.y, 12);
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

      if (e.isFrozen) this.drawIceEffect(e, time);
      if (e.isBurning) this.drawFireEffect(e, time);
      if (e.isElectrocuted) this.drawElectricEffect(e, time);
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
          this.updateTwin(e, time); // Twins have own update
        } else {
          this.updateBoss(e, time, delta);
        }
      } else {
        this.updateEnemy(e, time);
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
      if (this.wave === 1) {
        this.trySpawnPowerup(true, this.lastEnemyPosition); // this is not a boss but guaranteed powerup
      }
      else {
        this.trySpawnPowerup(false, this.lastEnemyPosition); // false = not boss
      }
      this.playSound(600, 0.25);

      // Pause de 2 segundos antes de la siguiente ronda
      this.time.delayedCall(2000, () => {
        this.waitingForNextWave = false;
        this.startNextWave();
      });
    }

    // Update UI with hearts 
    const hearts1 = this.p1Alive
      ? ('♥'.repeat(Math.max(0, this.p1.health)) + '♡'.repeat(Math.max(0, this.p1.maxHealth - this.p1.health)))
      : 'DEAD';
    this.hpText1.setText('P1: ' + hearts1);

    if (this.numPlayers === 2) {
      const hearts2 = this.p2Alive
        ? ('♥'.repeat(Math.max(0, this.p2.health)) + '♡'.repeat(Math.max(0, this.p2.maxHealth - this.p2.health)))
        : 'DEAD';
      this.hpText2.setText('P2: ' + hearts2);
    }

    // Update cooldowns for all players
    this.players.forEach(p => {
      if (p.currentSpecialCooldown > 0) {
        const wasCooling = true;
        p.currentSpecialCooldown -= delta;
        if (wasCooling && p.currentSpecialCooldown <= 0) {
          p.specialReadyEffect = 300;
        }
      }
      if (p.specialReadyEffect > 0) p.specialReadyEffect -= delta;
    });

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

  initPlayer(x, y, state) {
    const p = this.physics.add.sprite(x, y, null).setSize(30, 30).setVisible(false);
    const d = {health:5,maxHealth:5,baseSpeed:200,speed:200,angle:0,currentSpecialCooldown:0,invulnerable:false,lastHitTime:0,specialReadyEffect:0,specialBullets:1,specialCooldown:2000,normalShotCooldown:300,pierce:0,damageMultiplier:1.0,spreadBullets:1,homingStrength:0,bounceCount:0,hasBackShot:false,iceDuration:0,fireDuration:0,electricDuration:0};
    for(const k in d)p[k]=state?state[k]??d[k]:d[k];
    return p;
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

  darkenColor(color, factor = 0.6) {
    const r = ((color >> 16) & 0xff) * factor;
    const g = ((color >> 8) & 0xff) * factor;
    const b = (color & 0xff) * factor;
    return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
  }

  drawPlayer(player, color, time) {
    const flash = player.invulnerable ? Math.floor(time / 100) % 2 === 0 : true;
    if (flash) {
      const darkColor = this.darkenColor(color);

      // Base circle (darker)
      this.graphics.fillStyle(darkColor);
      this.graphics.fillCircle(player.x, player.y, 15);
      // Original color circle on top
      this.graphics.fillStyle(color);
      this.graphics.fillCircle(player.x - 1, player.y - 1, 12);

      // Direction line
      this.graphics.lineStyle(3, color);
      const angle = player.angle * Math.PI / 180;
      this.graphics.lineBetween(player.x, player.y,
        player.x + Math.cos(angle) * 20,
        player.y + Math.sin(angle) * 20);
    }
    // Special ready effect (short burst when charged)
    if (player.specialReadyEffect > 0) {
      const progress = 1 - (player.specialReadyEffect / 200);
      const radius = 15 + progress * 8; // Expands from 15 to 25
      const alpha = 1 - progress; // Fades out
      this.graphics.lineStyle(3, 0xffff00, alpha);
      this.graphics.strokeCircle(player.x, player.y, radius);
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

  // Helper: Move entity towards target (or away if reverse=true)
  moveTowards(entity, targetX, targetY, speed, reverse = false) {
    const dx = targetX - entity.x;
    const dy = targetY - entity.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 0) {
      const dir = reverse ? -1 : 1;
      entity.setVelocity(dx/dist * speed * dir, dy/dist * speed * dir);
    }
    return dist;
  }

  drawRotated(x, y, angle, drawFn) {
    this.graphics.save();
    this.graphics.translateCanvas(x, y);
    this.graphics.rotateCanvas(angle);
    drawFn();
    this.graphics.restore();
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

  drawIceEffect(e, t) {
    const g = this.graphics;
    g.fillStyle(0x00ccff, 0.5);
    g.save();
    g.translateCanvas(e.x, e.y);
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI / 2) + (t * 0.001);
      const r = 20 + Math.sin(t * 0.005 + i) * 5;
      const rx = Math.cos(a) * r, ry = Math.sin(a) * r;
      g.fillTriangle(rx, ry - 5, rx - 4, ry, rx, ry + 5);
      g.fillTriangle(rx, ry - 5, rx + 4, ry, rx, ry + 5);
    }
    g.restore();
  }

  drawFireEffect(e, t) {
    const g = this.graphics, p = t * 0.005;
    g.fillStyle(0xff4400, 0.8);
    for (let i = 0; i < 6; i++) {
      const y = ((p + i * 0.3) % 1.0) * -25;
      const x = Math.sin(p * 2 + i) * 8;
      g.fillCircle(e.x + x, e.y + 15 + y, 3 + Math.sin(p + i) * 2);
    }
    g.fillStyle(0xff8800, 0.6);
    for (let i = 0; i < 4; i++) {
      const y = ((p * 1.2 + i * 0.25) % 1.0) * -22;
      g.fillCircle(e.x + Math.cos(p * 2 + i) * 6, e.y + 12 + y, 2);
    }
  }

  drawElectricEffect(e, t) {
    const g = this.graphics, p = t * 0.02;
    g.lineStyle(2, 0xffff00, 0.9);
    for (let i = 0; i < 5; i++) {
      const a = (p + i * 0.4) * Math.PI * 2;
      const r = 18 + Math.sin(p * 3 + i) * 8;
      let px = e.x + Math.cos(a) * r, py = e.y + Math.sin(a) * r;
      for (let j = 1; j <= 3; j++) {
        const ta = a + Math.PI + (Math.random() - 0.5) * 0.5;
        const tr = r * (1 - j / 3);
        const nx = e.x + Math.cos(ta) * tr, ny = e.y + Math.sin(ta) * tr;
        g.lineBetween(px, py, nx, ny);
        px = nx; py = ny;
      }
    }
    g.fillStyle(0xffff00, 0.8);
    for (let i = 0; i < 8; i++) {
      const a = (p * 2 + i * 0.8) * Math.PI * 2;
      g.fillCircle(e.x + Math.cos(a) * 22, e.y + Math.sin(a) * 22, 2);
    }
  }

  // Helper: Create enemy bullet with auto-destroy
  createEnemyBullet(x, y, vx, vy, lifetime = 3000, playSound = false) {
    const b = this.enemyBullets.create(x, y);
    b.setSize(10, 10);
    b.setVisible(false);
    b.setVelocity(vx, vy);
    this.time.delayedCall(lifetime, () => {
      if (b && b.active) b.destroy();
    });

    if (playSound) this.playSound(500, 0.1);
    return b;
  }

  // Helper: Process elemental effects and return multipliers
  processElementalEffects(entity, time, onDeath) {
    // Electrocuted: fully paralyzed
    if (entity.isElectrocuted) {
      const elapsed = time - entity.electrocutedTime;
      if (elapsed < entity.electrocutedDuration) {
        entity.setVelocity(0);
        return null; // Signal to exit update
      } else {
        entity.isElectrocuted = false;
      }
    }

    let speedMultiplier = 1.0;
    let shootDelayMultiplier = 1.0;

    // Frozen: slow movement and shooting
    if (entity.isFrozen) {
      const elapsed = time - entity.frozenTime;
      if (elapsed < entity.frozenDuration) {
        speedMultiplier = 0.3;
        shootDelayMultiplier = 2.0;
      } else {
        entity.isFrozen = false;
      }
    }

    // Burning: periodic damage
    if (entity.isBurning) {
      const elapsed = time - entity.burnStartTime;
      if (elapsed < entity.burnDuration) {
        if (time - entity.burnTickTime > 490) {
          entity.health -= 5;
          entity.burnTickTime = time;
          this.playSound(200, 0.03);

          if (entity.health <= 0) {
            onDeath(entity);
            entity.destroy();
            return null; // Signal to exit update
          }
        }
      } else {
        entity.isBurning = false;
      }
    }

    return { speedMultiplier, shootDelayMultiplier };
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

  applyElementalProperties(bullet, elementalType, defaultColor) {
    if (elementalType) {
      bullet.elementalType = elementalType;
      if (elementalType === 'ice') bullet.color = 0x00ccff;
      else if (elementalType === 'fire') bullet.color = 0xff4400;
      else if (elementalType === 'electric') bullet.color = 0xffff00;
    } else {
      bullet.color = defaultColor;
    }
  }

  // Helper: spawn a player bullet at a position with common setup
  spawnPlayerBullet(group, x, y, vx, vy, size, damage, player, elementalType, color) {
    const b = group.create(x, y);
    b.setSize(size, size);
    b.setVisible(false);
    b.setVelocity(vx, vy);

    b.damage = damage;
    b.pierce = player.pierce;
    b.bounceCount = player.bounceCount;
    b.bounces = 0;
    b.homingStrength = player.homingStrength;
    b.owner = player;

    if (elementalType) this.applyElementalProperties(b, elementalType, color);
    else b.color = color;

    this.scheduleBulletDestroy(b, this.getBulletLifetime(player));
    return b;
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
        const posX = player.x + Math.cos(spreadAngle) * 25;
        const posY = player.y + Math.sin(spreadAngle) * 25;
        this.spawnPlayerBullet(
          group,
          posX,
          posY,
          Math.cos(spreadAngle) * speed,
          Math.sin(spreadAngle) * speed,
          16,
          damage,
          player,
          elementalType,
          color
        );
      }

      // BackShot
      if (player.hasBackShot) {
        const backAngle = angle + Math.PI; // 180 grados opuesto
        const posX = player.x + Math.cos(backAngle) * 25;
        const posY = player.y + Math.sin(backAngle) * 25;
        this.spawnPlayerBullet(
          group,
          posX,
          posY,
          Math.cos(backAngle) * speed,
          Math.sin(backAngle) * speed,
          16,
          damage,
          player,
          elementalType,
          color
        );
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
        const posX = player.x + Math.cos(spreadAngle) * 25;
        const posY = player.y + Math.sin(spreadAngle) * 25;
        this.spawnPlayerBullet(
          group,
          posX,
          posY,
          Math.cos(spreadAngle) * speed,
          Math.sin(spreadAngle) * speed,
          8,
          damage,
          player,
          null,
          color
        );
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

    // Introducir hexagon desde ronda 13
    if (this.wave >= 13) {
      weights.hexagon = Math.min(20, 5 + (this.wave - 13) * 2); // 5% en ronda 12, sube hasta 20%
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
    enemy.shootDelay = typeData.shootDelay;
    enemy.spawnTime = this.time.now;
    enemy.lastShot = 0;
    enemy.angle = 0;
  }

  updateEnemy(enemy, time) {
    // Process elemental effects
    const effects = this.processElementalEffects(enemy, time, (e) => {
      const deathPosition = { x: e.x, y: e.y };
      this.lastEnemyPosition = deathPosition;
      const typeData = ENEMY_TYPES[e.type];
      this.score += typeData.points;
      this.scoreText.setText('Score: ' + this.score);
      this.playSound(500, 0.1);
    });
    if (!effects) return; // Entity paralyzed or dead

    const { speedMultiplier, shootDelayMultiplier } = effects;

    // Move to nearest player
    const target = this.getNearestPlayer(enemy.x, enemy.y);

    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    // Separation force: push away from nearby enemies
    let sepX = 0, sepY = 0;
    const minSep = 20; // Minimum separation distance
    this.enemies.children.entries.forEach(other => {
      if (other !== enemy && other.active) {
        const odx = enemy.x - other.x;
        const ody = enemy.y - other.y;
        const odist = Math.sqrt(odx*odx + ody*ody);
        if (odist < minSep && odist > 0) {
          const force = (minSep - odist) / minSep;
          sepX += (odx / odist) * force;
          sepY += (ody / odist) * force;
        }
      }
    });

    // Update angle
    const typeData = ENEMY_TYPES[enemy.type];
    if (typeData.rotates) {
      enemy.angle = Math.atan2(dy, dx) * 180 / Math.PI;
    }

    if (dist > 150) {
      const effectiveSpeed = enemy.speed * speedMultiplier;
      const vx = (dx/dist * effectiveSpeed) + sepX * 100;
      const vy = (dy/dist * effectiveSpeed) + sepY * 100;
      enemy.setVelocity(vx, vy);
    } else {
      enemy.setVelocity(sepX * 100, sepY * 100);
    }

    // Normal shooting for all enemies (hexagon uses spiral which has built-in delay)
    const effectiveShootDelay = enemy.shootDelay * shootDelayMultiplier;
    // Wait 1s after spawn
    if (time - enemy.spawnTime > 1000 && time - enemy.lastShot > effectiveShootDelay) {
      this.shootEnemy(enemy, target, time);
      enemy.lastShot = time;
    }
  }

  // Helper: shoot N bullets in circle pattern (reused by square, pentagon, boss waves)
  shootCircle(src, count, offset = 0, spd = 200, rad = 20, lifetime = 3000) {
    for (let i = 0; i < count; i++) {
      const a = offset + i * Math.PI * 2 / count;
      this.createEnemyBullet(src.x + Math.cos(a) * rad, src.y + Math.sin(a) * rad, Math.cos(a) * spd, Math.sin(a) * spd, lifetime);
      this.playSound(400, 0.1)
    }
  }

  // Helper: shoot single aimed bullet (reused by triangle, laser boss)
  shootAimed(src, tgt, spd, lifetime = 3000, isBoss = false) {
    const a = Math.atan2(tgt.y - src.y, tgt.x - src.x);
    const offset = isBoss ? 0 : 20;
    this.createEnemyBullet(
      src.x + Math.cos(a) * offset,
      src.y + Math.sin(a) * offset,
      Math.cos(a) * spd,
      Math.sin(a) * spd,
      lifetime,
      isBoss
    );
  }

  // Helper: shoot thick laser (3 parallel lines)
  shootThickLaser(src, tgt, spd, lifetime = 2000) {
    const dx = tgt.x - src.x;
    const dy = tgt.y - src.y;
    const angle = Math.atan2(dy, dx);
    const perpAngle = angle + Math.PI / 2;
    const offset = 10;
    for (let i = -1; i <= 1; i++) {
      const offsetX = Math.cos(perpAngle) * offset * i;
      const offsetY = Math.sin(perpAngle) * offset * i;
      this.shootAimed({x: src.x + offsetX, y: src.y + offsetY}, {x: tgt.x + offsetX, y: tgt.y + offsetY}, spd, lifetime, true);
    }
  }

  shootSpiral(source, bulletCount, arms, rotation, angleOffset, speed, lifetime, delayBetween = 100) {
    for (let i = 0; i < bulletCount; i++) {
      const delay = i * delayBetween;
      this.time.delayedCall(delay, () => {
        if (!source.active) return; // If boss died, don't shoot
        const progress = i / bulletCount;
        const angle = angleOffset + (progress * rotation);

        for (let arm = 0; arm < arms; arm++) {
          const armAngle = angle + (arm * Math.PI * 2 / arms);
          this.createEnemyBullet(source.x, source.y, Math.cos(armAngle) * speed, Math.sin(armAngle) * speed, lifetime, true);
        }
      });
    }
  }

  shootEnemy(e, t) {
    const s = 200;
    const p = {
      triangle: () => { this.shootAimed(e, t, s); this.playSound(400, 0.1); },
      square: () => { this.shootCircle(e, 4, 0, s); this.playSound(400, 0.1); },
      pentagon: () => {
        this.shootCircle(e, 5, 0, s); this.playSound(450, 0.12);
        this.time.delayedCall(250, () => { if (e.active) { this.shootCircle(e, 5, Math.PI / 5, s); this.playSound(450, 0.12); } });
        this.time.delayedCall(500, () => { if (e.active) { this.shootCircle(e, 5, 0, s); this.playSound(450, 0.12); } });
      },
      hexagon: () => { this.shootSpiral(e, 8, 2, Math.PI*2, 0, s, 3000, 200); this.playSound(500, 0.1); },
      spinner: () => {
        const a = Math.atan2(t.y - e.y, t.x - e.x);
        for (let i = 0; i < 3; i++) {
          const oa = a + (i - 1) * 0.15;
          this.createEnemyBullet(e.x + Math.cos(oa) * 20, e.y + Math.sin(oa) * 20, Math.cos(oa) * s, Math.sin(oa) * s, 3000);
        }
        this.playSound(600, 0.1);
      }
    };
    if (p[e.type]) p[e.type]();
  }

  drawRot(x, y, a, fn) {
    this.graphics.save();
    this.graphics.translateCanvas(x, y);
    this.graphics.rotateCanvas(a * Math.PI / 180);
    fn();
    this.graphics.restore();
  }

  drawEnemy(e) {
    const g = this.graphics, c = ENEMY_TYPES[e.type].color, d = this.darkenColor(c);
    const r = {
      triangle: () => {
        g.fillStyle(d);
        this.drawRot(e.x, e.y, e.angle, () => g.fillTriangle(15, 0, -10, -12, -10, 12));
        g.fillStyle(c);
        this.drawRot(e.x - 2, e.y - 2, e.angle, () => g.fillTriangle(12, 0, -8, -10, -8, 10));
      },
      square: () => { g.fillStyle(d); g.fillRect(e.x - 15, e.y - 15, 30, 30); g.fillStyle(c); g.fillRect(e.x - 13, e.y - 13, 24, 24); },
      pentagon: () => { g.fillStyle(d); this.drawPolygon(e.x, e.y, 5, 17, null, -Math.PI / 2); g.fillStyle(c); this.drawPolygon(e.x - 1, e.y - 1, 5, 14, null, -Math.PI / 2); },
      hexagon: () => { g.fillStyle(d); this.drawPolygon(e.x, e.y, 6, 19, null, -Math.PI / 2); g.fillStyle(c); this.drawPolygon(e.x - 1, e.y - 1, 6, 15, null, -Math.PI / 2); },
      spinner: () => {
        g.fillStyle(d);
        this.drawRot(e.x, e.y, e.angle, () => { g.fillTriangle(0, -15, -10, 5, 10, 5); g.fillTriangle(0, 15, -10, -5, 10, -5); });
        g.fillStyle(c);
        this.drawRot(e.x - 2, e.y - 2, e.angle, () => { g.fillTriangle(0, -12, -8, 4, 8, 4); g.fillTriangle(0, 12, -8, -4, 8, -4); });
      }
    };
    if (r[e.type]) r[e.type]();
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

        // Calculate new velocity - unified logic for X/Y
        const isX = normalizedDx > normalizedDy;
        const d = isX ? dx : dy;
        const prev = bullet.prevVelocity;
        const newVelX = isX ? (prev ? -prev.x : (dx > 0 ? speed : -speed)) : (prev ? prev.x : 0);
        const newVelY = isX ? (prev ? prev.y : 0) : (prev ? -prev.y : (dy > 0 ? speed : -speed));

        // Push bullet away from wall
        const offset = (isX ? wall.body.halfWidth : wall.body.halfHeight) + bullet.body.halfWidth + 10;
        if (isX) bullet.x = wall.x + (dx < 0 ? -offset : offset);
        else bullet.y = wall.y + (d < 0 ? -offset : offset);

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
    if (bullet.elementalType && bullet.owner) {
      const dur = (enemy.isBoss ? 0.5 : 1.0);
      const t = this.time.now;
      const effects = {
        ice: () => {enemy.isFrozen = true; enemy.frozenTime = t; enemy.frozenDuration = bullet.owner.iceDuration * dur;},
        fire: () => {enemy.isBurning = true; enemy.burnStartTime = t; enemy.burnDuration = bullet.owner.fireDuration * dur; enemy.burnTickTime = t;},
        electric: () => {enemy.isElectrocuted = true; enemy.electrocutedTime = t; enemy.electrocutedDuration = bullet.owner.electricDuration * dur;}
      };
      if (effects[bullet.elementalType]) effects[bullet.elementalType]();
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

        // up to 10% chance to drop a heart
        if (Math.random() < (Math.min(0.1, (this.wave / 10) * this.getSpawnDifficulty()))) {
          this.spawnPowerup({ x: deathPosition.x, y: deathPosition.y }, 'heart');
        }
      }
      enemy.destroy();
    }
  }

  hitPlayer(player, bullet) {
    bullet.destroy();

    if (!DEBUG_GODMODE) {
      // Check invulnerability
      if (player.invulnerable) return;


      player.health -= 1; // 1 heart damage
      this.damageTakenThisWave = true;
      this.playSound(200, 0.1);

      // Damage flash
      this.createExplosionEffect(player.x, player.y, 0xff0000, 8);

      // Screen shake
      this.cameras.main.shake(200, 0.005);

      // Set invulnerability for 1 second
      player.invulnerable = true;
      player.lastHitTime = this.time.now;
      this.time.delayedCall(600, () => {
        player.invulnerable = false;
      });

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
    if (this.wave % 5 === 0) {
      this.spawnBoss();
      this.enemiesPerWave = 1;
    } else {
      this.enemiesPerWave = Math.max(1, Math.ceil((3 + (this.wave - 1) * 2) * this.getSpawnDifficulty()));
    }
  }

  reviveDeadPlayers() {
    // Only revive in 2P mode
    if (this.numPlayers !== 2) return false;

    const revive = (p, x, alive) => {
      if (!alive) {
        p.health = p.maxHealth;
        p.x = x; p.y = 300;
        p.setVelocity(0, 0);
        this.createExplosionEffect(x, 300, 0x00ff00, 15);
        this.playSound(800, 0.25);
        return true;
      }
      return false;
    };
    const r1 = revive(this.p1, 250, this.p1Alive);
    const r2 = revive(this.p2, 550, this.p2Alive);
    if (r1) this.p1Alive = true;
    if (r2) this.p2Alive = true;
    if (r1 || r2) {
      const m = this.add.text(400, 200, 'PLAYER REVIVED!', {fontSize: '36px', fontFamily: 'Arial', color: '#0f0', stroke: '#000', strokeThickness: 6}).setOrigin(0.5);
      this.time.delayedCall(2000, () => m.destroy());
    }
    return r1 || r2;
  }

  togglePause() {
    if (this.gameOver) return;

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.pause();
    } else {
      this.physics.resume();
      // Clear pause texts and graphics
      this.pauseTexts.forEach(t => t.destroy());
      this.pauseTexts = [];
      this.pauseGraphics.clear();
    }
  }

  drawPauseMenu() {
    // Semi-transparent overlay
    this.pauseGraphics.clear();
    this.pauseGraphics.fillStyle(0x000000, 0.7);
    this.pauseGraphics.fillRect(0, 0, 800, 600);

    // Create texts if not exist
    if (this.pauseTexts.length === 0) {
      // Title
      this.pauseTexts.push(this.add.text(400, 100, 'PAUSED', {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#ffff00',
        stroke: '#000',
        strokeThickness: 6
      }).setOrigin(0.5));

      // Controls title
      this.pauseTexts.push(this.add.text(400, 180, 'CONTROLS', {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#00ff00'
      }).setOrigin(0.5));

      // Render player controls with stroke
      renderPlayerControls(this, 200, 240, CONTROLS_CONFIG.player1, {
        titleSize: '20px',
        controlSize: '16px',
        spacing: 25,
        useStroke: true,
        textArray: this.pauseTexts
      });

      renderPlayerControls(this, 600, 240, CONTROLS_CONFIG.player2, {
        titleSize: '20px',
        controlSize: '16px',
        spacing: 25,
        useStroke: true,
        textArray: this.pauseTexts
      });

      // Resume instruction
      this.pauseTexts.push(this.add.text(400, 520, 'Press ENTER to resume', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffff00'
      }).setOrigin(0.5));
    }
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
    this.add.text(400, 75, 'SILENCED', {
      fontSize: '56px',
      fontFamily: 'Arial',
      color: '#f00',
      stroke: '#000',
      strokeThickness: 8
    }).setOrigin(0.5);

    // Main stats
    this.add.text(400, 140, 'Wave Reached: ' + this.stats.highestWave, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ff0'
    }).setOrigin(0.5);

    this.add.text(400, 170, 'Final Score: ' + this.score, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#fff'
    }).setOrigin(0.5);

    const isHighScore = (score) => {
      const scores = getHighScores();
      return scores.length < 5 || score > scores[scores.length - 1].score;
    };

    const saveHighScore = (name, score) => {
      let scores = getHighScores();
      scores.push({name, score});
      scores.sort((a, b) => b.score - a.score);
      scores = scores.slice(0, 5); // Keep only top 5
      setCookie('obs_highScores', JSON.stringify(scores));
    };

    // High score entry
    if (isHighScore(this.score)) {
      let n=['A','A','A','A','A'], p=0;
      const nm = n.map((c,i)=>i===p ? `[${c}]` : c).join('');
      this.add.text(400,430,'NEW HIGH SCORE!',{
        fontSize:'32px',
        fontFamily:'Arial',
        color:'#ece000ff',
        align: 'center'
      }).setOrigin(0.5);
      const tn=this.add.text(400,470,'NAME: '+nm,{
        fontSize:'32px',
        fontFamily:'Arial',
        color:'#b800c2ff',
        align: 'center'
      }).setOrigin(0.5);
      
      const h=(e)=>{
        const k=e.key.toLowerCase();
        if(k==='w')n[p]=String.fromCharCode((n[p].charCodeAt(0)-65+1)%26+65);
        else if(k==='s')n[p]=String.fromCharCode((n[p].charCodeAt(0)-65+25)%26+65);
        else if(k==='a')p=Math.max(0,p-1);
        else if(k==='d')p=Math.min(4,p+1);
        else if(k==='enter'){
          saveHighScore(n.join(''), this.score);
          this.input.keyboard.off('keydown',h);
          tn.setText('SAVED!\n'+n.join('')+' - '+this.score);
          return;
        }
        tn.setText('NAME: '+n.map((c,i)=>i===p ? `[${c}]` : c).join(''));
      };
      this.input.keyboard.on('keydown',h);
    }

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
    this.add.text(400, 560, 'Press ENTER to return to menu', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#888'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => {
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

    // Get map layout: 4 predefined, then random every 10 waves
    let layout;
    if (this.level <= MAP_LAYOUTS.length) {
      layout = MAP_LAYOUTS[this.level - 1];
    } else {
      // Generate random map (4-8 blocks)
      const blockCount = 4 + Math.floor(Math.random() * 5);
      layout = [];
      for (let i = 0; i < blockCount; i++) {
        layout.push({
          x: 150 + Math.random() * 500,
          y: 150 + Math.random() * 300,
          w: 40 + Math.random() * 100,
          h: 40 + Math.random() * 100
        });
      }
    }

    // Create obstacles from layout
    layout.forEach(obs => {
      const obstacle = this.obstacles.create(obs.x, obs.y, null);
      obstacle.body.setSize(obs.w, obs.h);
      obstacle.setVisible(false);
      this.obstacleData.push(obs);
    });
  }

  // ===== BOSS METHODS =====

  spawnBoss() {
    this.bossActive = true;
    this.enemiesThisWave = 1;
    const starPoints = 3 + Math.floor(this.wave / 5);

    // Determine boss type
    let bossType, typeData, bossName;
    if (this.wave === 5) bossType = 'pattern';
    else if (this.wave === 10) bossType = 'twins';
    else if (this.wave === 15) bossType = 'laser';
    else {
      // Generate random boss (wave 30+)
      bossType = 'random';
      const waveScale = (this.wave - 20) / 10;
      typeData = {
        health: 500 + waveScale * 500,
        speed: 30,
        shootDelay: Math.max(100, 1500 - waveScale * 200),
        color: Math.random() * 0xffffff,
        points: 500 + waveScale * 500,
        size: Math.max(50 + Math.random() * 40 - this.wave, 30)
      };
      bossName = starPoints + '-STAR BOSS';
    }

    if (bossType !== 'random') {
      typeData = BOSS_TYPES[bossType];
      bossName = typeData.name;
    }


    // Show boss intro message
    const msg = this.add.text(400, 250, 'WARNING!\n' + bossName, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#f00',
      align: 'center',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.playSound(200, 0.5);

    // Delay boss creation until message disappears
    this.time.delayedCall(2000, () => {
      msg.destroy();
      this.cameras.main.shake(800, 0.01);
      this.cameras.main.flash(800, 255, 0, 0);
      this.createExplosionEffect(400, 300, 0xff0000, 20);

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
      boss.spawnTime = this.time.now;
      boss.angle = 0;
      boss.patternIndex = 0;
      boss.hasChildren = false;
      boss.starPoints = starPoints;
      boss.size = typeData.size;

      // Random boss properties
      if (bossType === 'random') {
        boss.points = typeData.points;
        const allPatterns = ['wave', 'spiral', 'laser'];
        const count = 2 + Math.floor(Math.random() * 2); // 2-3 patterns
        boss.attackPatterns = [];
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * allPatterns.length);
          boss.attackPatterns.push(allPatterns[idx]);
          allPatterns.splice(idx, 1); // Remove to avoid duplicates
        }
        boss.currentPattern = 0;
        boss.patternShots = 0;
      }

      // Pattern boss vars
      boss.attackPhase = 0;
      boss.phaseStartTime = 0;
      boss.spiralFired = false;
      boss.wave1Fired = false;
      boss.wave2Fired = false;

      this.currentBoss = boss;
    });
  }

  updateBoss(boss, time, delta) {
    const effects = this.processElementalEffects(boss, time, (b) => {
      const deathPosition = { x: b.x, y: b.y };
      this.handleBossDeath(b, deathPosition);
    });
    if (!effects) return;
    const { speedMultiplier, shootDelayMultiplier } = effects;

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
            this.shootCircle(boss, 50, 0, 200, 20, 3000);
            boss.wave1Fired = true;
          } else if (!boss.wave2Fired && phaseTime >= 500) {
            this.shootCircle(boss, 50, 0, 200, 20, 3000);
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
      const slowSpeed = boss.speed * speedMultiplier;
      this.moveTowards(boss, target.x, target.y, slowSpeed);
      const dx = target.x - boss.x;
      const dy = target.y - boss.y;

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
              this.shootThickLaser(boss, target, 500);
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

      boss.hasChildren = true;
      const hp = Math.ceil(150 * this.getSpawnDifficulty());
      const mkTwin = (x, y, type, atk) => {
        const t = this.enemies.create(x, y, null);
        t.setSize(boss.size, boss.size).setVisible(false);
        t.isBoss = true;
        t.bossType = type;
        t.health = t.maxHealth = hp;
        t.speed = 120;
        t.spawnTime = this.time.now;
        t.lastShot = 0;
        t.phaseStartTime = time;
        t.isAttacking = atk;
        t.size = boss.size;
        return t;
      };
      const t1 = mkTwin(300, 200, 'twin1', true);
      const t2 = mkTwin(500, 400, 'twin2', false);
      boss.twin1 = t1;
      boss.twin2 = t2;
      t1.sibling = t2;
      t2.sibling = t1;
      boss.destroy();
    } else if (boss.bossType === 'random') {
      // RANDOM BOSS: Star with multiple patterns
      const target = this.getNearestPlayer(boss.x, boss.y);
      const moveSpeed = boss.speed * speedMultiplier;
      const dist = this.moveTowards(boss, target.x, target.y, moveSpeed);

      // Circular movement
      if (dist > 200) {
        // Already moving towards player
      } else if (dist < 150) {
        this.moveTowards(boss, target.x, target.y, moveSpeed, true);
      } else {
        const angle = time * 0.001;
        boss.setVelocity(Math.cos(angle) * moveSpeed, Math.sin(angle) * moveSpeed);
      }

      boss.angle += delta * 0.05; // Rotate

      // Attack patterns using shootDelay
      if (time - boss.spawnTime > 1000 && time - boss.lastShot > boss.shootDelay * shootDelayMultiplier) {
        const pattern = boss.attackPatterns[boss.currentPattern];

        if (pattern === 'wave') {
          this.shootCircle(boss, boss.starPoints * 2, 0, 200, 0, 3000);
          boss.lastShot = time;
          boss.patternShots = (boss.patternShots || 0) + 1;
        } else if (pattern === 'spiral') {
          if (!boss.spiralFired) {
            const bulletCount = 30;
            const delayBetween = 80;
            this.shootSpiral(boss, bulletCount, boss.starPoints, Math.PI * 2, 0, 250, 3000, delayBetween);
            boss.spiralFired = true;
            // Switch pattern after spiral completes
            this.time.delayedCall(bulletCount * delayBetween + boss.shootDelay * shootDelayMultiplier, () => {
              if (boss.active) {
                boss.currentPattern = (boss.currentPattern + 1) % boss.attackPatterns.length;
                boss.spiralFired = false;
                boss.patternShots = 0;
                boss.lastShot = time;
              }
            });
          }
        } else if (pattern === 'laser') {
          // Laser: thick beam
          for (let i = 0; i < boss.starPoints; i++) {
            this.time.delayedCall(i * 50, () => {
              if (boss.active) this.shootThickLaser(boss, target, 300);;
            });
          }
          boss.lastShot = time;
          boss.patternShots = (boss.patternShots || 0) + 1;
        }

        // Auto-switch for wave/laser after 3 shots
        if (pattern !== 'spiral' && (boss.patternShots || 0) >= 3) {
          boss.currentPattern = (boss.currentPattern + 1) % boss.attackPatterns.length;
          boss.patternShots = 0;
          boss.lastShot = time;
        }
      }
    }
  }

  drawBoss(boss) {
    // Calculate star radii from hitbox size
    const outerR = boss.size * 0.7; // Outer radius ~70% of hitbox
    const innerR = boss.size * 0.35; // Inner radius ~35% of hitbox

    if (boss.bossType === 'twin1' || boss.bossType === 'twin2') {
      const c = BOSS_TYPES.twins.color;
      this.graphics.fillStyle(boss.bossType === 'twin1' ? c[0] : c[1]);
      this.drawPolygon(boss.x, boss.y, 5, outerR * 1.2, innerR * 0.8, -Math.PI / 2);
    } else if (boss.bossType === 'random') {
      this.graphics.fillStyle(Math.floor(boss.health / boss.maxHealth * 0xffffff));
      this.drawRotated(boss.x, boss.y, boss.angle * Math.PI / 180, () => {
        this.drawPolygon(0, 0, boss.starPoints, outerR, innerR, 0);
      });
    } else {
      this.graphics.fillStyle(BOSS_TYPES[boss.bossType].color);
      if (boss.bossType === 'pattern') {
        this.drawPolygon(boss.x, boss.y, boss.starPoints, outerR * 1.2, innerR * 0.8, -Math.PI / 2);
      } else if (boss.bossType === 'laser') {
        this.drawRotated(boss.x, boss.y, boss.angle * Math.PI / 180, () => {
          this.drawPolygon(0, 0, boss.starPoints, outerR, innerR, 0);
        });
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

  updateTwin(twin, time) {
    const effects = this.processElementalEffects(twin, time, (t) => {
      const deathPosition = { x: t.x, y: t.y };
      this.handleBossDeath(t, deathPosition);
    });
    if (!effects) return;
    const { speedMultiplier, shootDelayMultiplier } = effects;
    const target = this.getNearestPlayer(twin.x, twin.y);

    let repulsionX = 0;
    let repulsionY = 0;
    if (twin.sibling && twin.sibling.active) {
      const siblingDx = twin.sibling.x - twin.x;
      const siblingDy = twin.sibling.y - twin.y;
      const siblingDist = Math.sqrt(siblingDx*siblingDx + siblingDy*siblingDy);
      if (siblingDist < 100 && siblingDist > 0) {
        const repulsionStrength = (100 - siblingDist) * 2;
        repulsionX = -(siblingDx / siblingDist) * repulsionStrength;
        repulsionY = -(siblingDy / siblingDist) * repulsionStrength;
      }
    }

    const effectiveSpeed = twin.speed * speedMultiplier;
    const dist = this.moveTowards(twin, target.x, target.y, effectiveSpeed);

    let velocityX = twin.body.velocity.x;
    let velocityY = twin.body.velocity.y;
    if (dist > 150) {
      // Already moving towards player
    } else if (dist < 100) {
      // Move away from player
      this.moveTowards(twin, target.x, target.y, effectiveSpeed, true);
      velocityX = twin.body.velocity.x;
      velocityY = twin.body.velocity.y;
    } else {
      const angle = time * 0.002;
      velocityX = Math.cos(angle) * effectiveSpeed;
      velocityY = Math.sin(angle) * effectiveSpeed;
    }

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
            this.shootCircle(twin, 10, 0, 200, 0, 3000);
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
        if (phaseTime >= 2000) {
          // Si el hermano murió, este twin debe volver a atacar
          if (!twin.sibling || !twin.sibling.active) {
            twin.isAttacking = true;
            twin.spiralFired = false;
            twin.phaseStartTime = time;
          }
        }
      }
    }
  }

  handleBossDeath(boss, deathPosition) {
    // Centralized boss death handling
    this.lastEnemyPosition = deathPosition;
    const points = Math.max(500, ((this.wave / 5) * 500));

    // Handle twins special case
    if (boss.bossType === 'twin1' || boss.bossType === 'twin2') {
      const twinPts = points / 2;
      const otherTwin = boss.sibling;
      if (otherTwin && otherTwin.active && otherTwin.health > 0) {
        // Other twin still alive - partial reward only
        this.score += twinPts;
        this.scoreText.setText('Score: ' + this.score);
        this.playSound(600, 0.3);
        // Ensure the surviving twin keeps attacking immediately
        try {
          otherTwin.isAttacking = true;
          otherTwin.phaseStartTime = this.time.now;
          otherTwin.spiralFired = false;
        } catch (e) {
          // defensive: ignore if otherTwin state not writable
        }
        return; // Don't end boss fight yet
      } else {
        // Both twins dead
        this.score += twinPts;
        this.scoreText.setText('Score: ' + this.score);

        // Track boss defeat
        if (!this.stats.bossesDefeated.includes(BOSS_TYPES.twins.name)) {
          this.stats.bossesDefeated.push(BOSS_TYPES.twins.name);
        }
      }
    } else {
      // Normal or random boss
      let bossName;
      if (boss.bossType === 'random') {
        // Random boss uses stored points
        bossName = boss.starPoints + '-STAR BOSS';
      } else {
        const typeData = BOSS_TYPES[boss.bossType];
        bossName = typeData.name;
      }

      this.score += points;
      this.scoreText.setText('Score: ' + this.score);

      // Track boss defeat
      if (!this.stats.bossesDefeated.includes(bossName)) {
        this.stats.bossesDefeated.push(bossName);
      }
    }

    // Common boss death logic
    this.bossActive = false;
    this.openDoors();
    this.playSound(600, 0.3);
    if (!this.reviveDeadPlayers()) {
      this.trySpawnPowerup(true, deathPosition); // just give a power-up if no revival
    }

    // Spawn 2-4 hearts slightly offset from boss death position
    const numHearts = this.numPlayers + Math.floor(Math.random() * 3); // 2 a 4 corazones
    for (let i = 0; i < numHearts; i++) {
      const offsetX = (Math.random() - 0.5) * 80; // -40 a +40 pixels X
      const offsetY = (Math.random() - 0.5) * 80; // -40 a +40 pixels Y
      this.spawnPowerup({
        x: deathPosition.x + offsetX,
        y: deathPosition.y + offsetY
      }, 'heart');
    }

    // Show message
    this.add.text(400, 300, 'BOSS DEFEATED!\nGo through the doors!', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#0ff',
      align: 'center'
    }).setOrigin(0.5);
    // this.time.delayedCall(3000, () => msg.destroy());
  }

  // ===== SISTEMA DE POWERUPS =====

  trySpawnPowerup(isBoss, position) {
    if (isBoss) {
      const bossDrops = ['extraBullet', 'backShot', 'iceBullets', 'fireBullets', 'electricBullets','spreadShot', 'homingBullets', 'bounce', 'maxHeart', 'pierceShot']; // 'speedBoost', 'fireRate', and 'moreDamage' are left out
      const randomDrop = bossDrops[Math.floor(Math.random() * bossDrops.length)];
      this.spawnPowerup(position, randomDrop);
      return;
    }

    // Waves normales: SIN DAÑO primero
    const commonPowerups = ['extraBullet', 'speedBoost', 'fireRate', 'moreDamage', 'backShot', 'iceBullets', 'fireBullets', 'electricBullets'];
    const rarePowerups = ['spreadShot', 'homingBullets', 'bounce', 'maxHeart', 'pierceShot'];
    const chance = Math.random() / this.getSpawnDifficulty(); // Adjust chance by difficulty

    if (!this.damageTakenThisWave) {
      // NO DAMAGE: 15% rare, 20% common, 15% heart
      if (chance < 0.20) {
        const randomRare = rarePowerups[Math.floor(Math.random() * rarePowerups.length)];
        this.spawnPowerup(position, randomRare);
        return;
      }
      if (chance < 0.45) {
        const randomCommon = commonPowerups[Math.floor(Math.random() * commonPowerups.length)];
        this.spawnPowerup(position, randomCommon);
        return;
      }
      if (chance < 0.70) {
        this.spawnPowerup(position, 'heart');
        return;
      }
    } else {
      // WITH DAMAGE: 5% rare, 15% common, 15% heart
      if (chance < 0.1) {
        const randomRare = rarePowerups[Math.floor(Math.random() * rarePowerups.length)];
        this.spawnPowerup(position, randomRare);
        return;
      }
      if (chance < 0.30) {
        const randomCommon = commonPowerups[Math.floor(Math.random() * commonPowerups.length)];
        this.spawnPowerup(position, randomCommon);
        return;
      }
      if (chance < 0.50) {
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

    const h = {
      extraBullet: p => { p.specialBullets++; return `${powerupData.description} (${p.specialBullets})`; },
      speedBoost: p => { p.speed += p.baseSpeed * 0.25; return powerupData.description; },
      fireRate: p => { p.normalShotCooldown = Math.max(50, p.normalShotCooldown * 0.75); p.specialCooldown = Math.max(300, p.specialCooldown * 0.75); return powerupData.description; },
      pierceShot: p => { p.pierce++; return `${powerupData.description} (${p.pierce})`; },
      moreDamage: p => { p.damageMultiplier += 0.25; return `${powerupData.description} (x${p.damageMultiplier.toFixed(2)})`; },
      backShot: p => { p.hasBackShot = true; return powerupData.description; },
      spreadShot: p => { p.spreadBullets += 2; return `${powerupData.description} (${p.spreadBullets})`; },
      homingBullets: p => { p.homingStrength = Math.min(1.0, p.homingStrength + 0.15); return `${powerupData.description} (${Math.floor(p.homingStrength * 100)}%)`; },
      bounce: p => { p.bounceCount++; return `${powerupData.description} (${p.bounceCount})`; },
      iceBullets: p => { p.iceDuration = p.iceDuration === 0 ? 8000 : p.iceDuration + 4000; return `${powerupData.description} (${p.iceDuration / 1000}s)`; },
      fireBullets: p => { p.fireDuration = p.fireDuration === 0 ? 5000 : p.fireDuration + 3000; return `${powerupData.description} (${p.fireDuration / 1000}s)`; },
      electricBullets: p => { p.electricDuration = p.electricDuration === 0 ? 3000 : p.electricDuration + 2000; return `${powerupData.description} (${p.electricDuration / 1000}s)`; },
      heart: p => { if (p.health < p.maxHealth) { p.health++; return `+1 HEART! (${p.health}/${p.maxHealth})`; } return 'Already at max health!'; },
      maxHeart: p => { p.maxHealth++; p.health++; return `MAX HEART UP! (${p.health}/${p.maxHealth})`; }
    };
    message = h[type] ? h[type](player) : '';

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

    // Draw circle background for all powerups except hearts
    if (powerup.type !== 'heart') {
      this.graphics.fillCircle(x, y, 12);
      this.graphics.lineStyle(2, 0xffffff, p);
      this.graphics.strokeCircle(x, y, 12);
    }
    this.graphics.fillStyle(d.color, p);
    this.graphics.save();
    this.graphics.translateCanvas(x, y);
    // this.graphics.fillStyle(0xffffff, p);

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

  openDoors() {
    this.doorsOpen = true;
    this.doorWallArray.forEach(door => door.body.enable = false);
  }

  closeDoors() {
    this.doorsOpen = false;
    this.doorWallArray.forEach(door => door.body.enable = true);
  }

  handleDoorOverlap() {
    if (!this.doorsOpen || this.transitioning) return;
    this.nextLevel();
  }

  savePlayerState(player) {
    return {
      health: player.health,
      maxHealth: player.maxHealth,
      speed: player.speed,
      specialBullets: player.specialBullets,
      specialCooldown: player.specialCooldown,
      normalShotCooldown: player.normalShotCooldown,
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

    // Go to story scene then game scene
    this.time.delayedCall(500, () => {
      this.scene.start('StoryScene', {
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

}

// STORY SCENE
class StoryScene extends Phaser.Scene {
  constructor() {
    super('StoryScene');
  }

  init(data) {
    this.nextSceneData = data;
  }

  create() {
    const panels = [
      'In the world of polygons, status was measured\nby the number of sides.',
      'You, a circle, were nothing,\na servant among shapes.',
      'Until you proved, with pure math,\nthat you have infinite sides.',
      'The world trembled...\nso they tried to silence you.'
    ];

    const level = this.nextSceneData.level || 1;
    const panelIndex = level - 1;

    // Skip if no panel for this level
    if (panelIndex >= panels.length) {
      this.scene.start('GameScene', this.nextSceneData);
      return;
    }

    const text = this.add.text(400, 280, panels[panelIndex], {
      fontSize: '28px',
      fontFamily: 'Arial',
      fill: '#fff',
      align: 'center',
      wordWrap: { width: 700 }
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: text,
      alpha: 1,
      duration: 500,
      onComplete: () => {
        this.time.delayedCall(2000, () => {
          this.tweens.add({
            targets: text,
            alpha: 0,
            duration: 500,
            onComplete: () => {
              this.scene.start('GameScene', this.nextSceneData);
            }
          });
        });
      }
    });
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
  scene: [MenuScene, StoryScene, GameScene]
};

const game = new Phaser.Game(config);
