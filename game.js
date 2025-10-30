// Battle Arena - Top-Down Shooter
// Choose 1 or 2 players and battle in the arena!

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
    this.add.text(400, 400, '2 PLAYERS', {
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

// GAME SCENE
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.numPlayers = data.players || 1;
  }

  create() {
    this.gameOver = false;

    // Graphics object (create once, reuse every frame)
    this.graphics = this.add.graphics();

    // Arena walls (invisible physics bodies) - centered
    this.walls = this.physics.add.staticGroup();
    const wallTop = this.walls.create(400, 10, null);
    wallTop.body.setSize(800, 20);
    wallTop.setVisible(false);

    const wallBottom = this.walls.create(400, 590, null);
    wallBottom.body.setSize(800, 20);
    wallBottom.setVisible(false);

    const wallLeft = this.walls.create(10, 300, null);
    wallLeft.body.setSize(20, 600);
    wallLeft.setVisible(false);

    const wallRight = this.walls.create(790, 300, null);
    wallRight.body.setSize(20, 600);
    wallRight.setVisible(false);

    // Obstacles (invisible physics bodies) - centered
    this.obstacles = this.physics.add.staticGroup();
    const obs1 = this.obstacles.create(200, 150, null);
    obs1.body.setSize(60, 60);
    obs1.setVisible(false);

    const obs2 = this.obstacles.create(600, 150, null);
    obs2.body.setSize(60, 60);
    obs2.setVisible(false);

    const obs3 = this.obstacles.create(200, 450, null);
    obs3.body.setSize(60, 60);
    obs3.setVisible(false);

    const obs4 = this.obstacles.create(600, 450, null);
    obs4.body.setSize(60, 60);
    obs4.setVisible(false);

    const obs5 = this.obstacles.create(400, 300, null);
    obs5.body.setSize(80, 80);
    obs5.setVisible(false);

    // Player 1 (invisible physics body)
    this.p1 = this.physics.add.sprite(150, 300, null);
    this.p1.setSize(30, 30);
    this.p1.setVisible(false);
    this.p1.health = 100;
    this.p1.speed = 200;
    this.p1.angle = 0;

    // Player 2 (or AI) (invisible physics body)
    this.p2 = this.physics.add.sprite(650, 300, null);
    this.p2.setSize(30, 30);
    this.p2.setVisible(false);
    this.p2.health = 100;
    this.p2.speed = 200;
    this.p2.angle = 180;

    // Bullets
    this.bullets = this.physics.add.group();
    this.specialBullets = this.physics.add.group();

    // Collisions
    this.physics.add.collider(this.p1, this.walls);
    this.physics.add.collider(this.p2, this.walls);
    this.physics.add.collider(this.p1, this.obstacles);
    this.physics.add.collider(this.p2, this.obstacles);
    this.physics.add.collider(this.bullets, this.walls, (b) => b.destroy());
    this.physics.add.collider(this.bullets, this.obstacles, (b) => b.destroy());
    this.physics.add.collider(this.specialBullets, this.walls, (b) => b.destroy());
    this.physics.add.collider(this.specialBullets, this.obstacles, (b) => b.destroy());

    // Bullet hits
    this.physics.add.overlap(this.bullets, this.p1, (p, b) => {
      if (b.owner !== 1) this.hitPlayer(p, b, 1);
    });
    this.physics.add.overlap(this.bullets, this.p2, (p, b) => {
      if (b.owner !== 2) this.hitPlayer(p, b, 2);
    });
    this.physics.add.overlap(this.specialBullets, this.p1, (p, b) => {
      if (b.owner !== 1) this.hitPlayer(p, b, 1, true);
    });
    this.physics.add.overlap(this.specialBullets, this.p2, (p, b) => {
      if (b.owner !== 2) this.hitPlayer(p, b, 2, true);
    });

    // Controls
    this.keys = this.input.keyboard.addKeys({
      w: 'W', a: 'A', s: 'S', d: 'D',
      q: 'Q', e: 'E',
      up: 'I', down: 'K', left: 'J', right: 'L',
      shoot2: 'U', special2: 'O',
      r: 'R'
    });

    // UI
    this.hpText1 = this.add.text(20, 20, 'P1: 100 HP', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#0f0'
    });

    this.hpText2 = this.add.text(780, 20, 'P2: 100 HP', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: this.numPlayers === 2 ? '#09f' : '#f00'
    }).setOrigin(1, 0);

    // Cooldowns
    this.lastShot1 = 0;
    this.lastSpecial1 = 0;
    this.lastShot2 = 0;
    this.lastSpecial2 = 0;

    // AI timer
    this.aiTimer = 0;
  }

  update(time, delta) {
    if (this.gameOver) return;

    // Clear and redraw graphics every frame
    this.graphics.clear();

    // Draw walls
    this.graphics.fillStyle(0x444444);
    this.graphics.fillRect(0, 0, 800, 20);
    this.graphics.fillRect(0, 580, 800, 20);
    this.graphics.fillRect(0, 0, 20, 600);
    this.graphics.fillRect(780, 0, 20, 600);

    // Draw obstacles (draw from center to match physics bodies)
    this.graphics.fillStyle(0x666666);
    this.graphics.fillRect(200 - 30, 150 - 30, 60, 60);  // centered at 200, 150
    this.graphics.fillRect(600 - 30, 150 - 30, 60, 60);  // centered at 600, 150
    this.graphics.fillRect(200 - 30, 450 - 30, 60, 60);  // centered at 200, 450
    this.graphics.fillRect(600 - 30, 450 - 30, 60, 60);  // centered at 600, 450
    this.graphics.fillRect(400 - 40, 300 - 40, 80, 80);  // centered at 400, 300

    // Draw players
    this.graphics.fillStyle(0x00ff00);
    this.graphics.fillCircle(this.p1.x, this.p1.y, 15);
    this.graphics.lineStyle(3, 0x00ff00);
    const angle1 = this.p1.angle * Math.PI / 180;
    this.graphics.lineBetween(this.p1.x, this.p1.y,
      this.p1.x + Math.cos(angle1) * 20,
      this.p1.y + Math.sin(angle1) * 20);

    this.graphics.fillStyle(this.numPlayers === 2 ? 0x0099ff : 0xff0000);
    this.graphics.fillCircle(this.p2.x, this.p2.y, 15);
    this.graphics.lineStyle(3, this.numPlayers === 2 ? 0x0099ff : 0xff0000);
    const angle2 = this.p2.angle * Math.PI / 180;
    this.graphics.lineBetween(this.p2.x, this.p2.y,
      this.p2.x + Math.cos(angle2) * 20,
      this.p2.y + Math.sin(angle2) * 20);

    // Draw bullets
    this.bullets.children.entries.forEach(b => {
      this.graphics.fillStyle(b.color);
      this.graphics.fillCircle(b.x, b.y, 4);
    });

    this.specialBullets.children.entries.forEach(b => {
      this.graphics.fillStyle(b.color);
      this.graphics.fillCircle(b.x, b.y, 8);
      this.graphics.lineStyle(2, b.color, 0.5);
      this.graphics.strokeCircle(b.x, b.y, 12);
    });

    // Player 1 movement
    this.p1.setVelocity(0);
    let moveX1 = 0, moveY1 = 0;
    if (this.keys.w.isDown) moveY1 = -1;
    if (this.keys.s.isDown) moveY1 = 1;
    if (this.keys.a.isDown) moveX1 = -1;
    if (this.keys.d.isDown) moveX1 = 1;

    if (moveX1 !== 0 || moveY1 !== 0) {
      this.p1.angle = Math.atan2(moveY1, moveX1) * 180 / Math.PI;
      const len = Math.sqrt(moveX1*moveX1 + moveY1*moveY1);
      this.p1.setVelocity(moveX1/len * this.p1.speed, moveY1/len * this.p1.speed);
    }

    // Player 1 shooting
    if (Phaser.Input.Keyboard.JustDown(this.keys.q) && time - this.lastShot1 > 300) {
      this.shoot(this.p1, 1, false);
      this.lastShot1 = time;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.e) && time - this.lastSpecial1 > 2000) {
      this.shoot(this.p1, 1, true);
      this.lastSpecial1 = time;
    }

    // Player 2 or AI
    if (this.numPlayers === 2) {
      this.p2.setVelocity(0);
      let moveX2 = 0, moveY2 = 0;
      if (this.keys.up.isDown) moveY2 = -1;
      if (this.keys.down.isDown) moveY2 = 1;
      if (this.keys.left.isDown) moveX2 = -1;
      if (this.keys.right.isDown) moveX2 = 1;

      if (moveX2 !== 0 || moveY2 !== 0) {
        this.p2.angle = Math.atan2(moveY2, moveX2) * 180 / Math.PI;
        const len = Math.sqrt(moveX2*moveX2 + moveY2*moveY2);
        this.p2.setVelocity(moveX2/len * this.p2.speed, moveY2/len * this.p2.speed);
      }

      if (Phaser.Input.Keyboard.JustDown(this.keys.shoot2) && time - this.lastShot2 > 300) {
        this.shoot(this.p2, 2, false);
        this.lastShot2 = time;
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.special2) && time - this.lastSpecial2 > 2000) {
        this.shoot(this.p2, 2, true);
        this.lastSpecial2 = time;
      }
    } else {
      // Simple AI
      this.aiTimer += delta;

      if (this.aiTimer > 500) {
        this.aiTimer = 0;
        const dx = this.p1.x - this.p2.x;
        const dy = this.p1.y - this.p2.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        this.p2.angle = Math.atan2(dy, dx) * 180 / Math.PI;

        if (dist > 200) {
          this.p2.setVelocity(dx/dist * this.p2.speed, dy/dist * this.p2.speed);
        } else if (dist < 150) {
          this.p2.setVelocity(-dx/dist * this.p2.speed, -dy/dist * this.p2.speed);
        } else {
          this.p2.setVelocity(0);
        }

        if (Math.random() > 0.3 && time - this.lastShot2 > 800) {
          this.shoot(this.p2, 2, false);
          this.lastShot2 = time;
        }
        if (Math.random() > 0.9 && time - this.lastSpecial2 > 3000) {
          this.shoot(this.p2, 2, true);
          this.lastSpecial2 = time;
        }
      }
    }

    // Update UI
    this.hpText1.setText('P1: ' + Math.max(0, Math.floor(this.p1.health)) + ' HP');
    this.hpText2.setText('P2: ' + Math.max(0, Math.floor(this.p2.health)) + ' HP');
  }

  shoot(player, owner, special) {
    const angle = player.angle * Math.PI / 180;
    const speed = special ? 250 : 400;
    const group = special ? this.specialBullets : this.bullets;

    if (special) {
      // Special: 3 bullets in spread
      for (let i = -1; i <= 1; i++) {
        const spreadAngle = angle + i * 0.3;
        const b = group.create(
          player.x + Math.cos(spreadAngle) * 25,
          player.y + Math.sin(spreadAngle) * 25
        );
        b.setSize(16, 16);
        b.setVisible(false);
        b.setVelocity(Math.cos(spreadAngle) * speed, Math.sin(spreadAngle) * speed);
        b.owner = owner;
        b.color = owner === 1 ? 0x00ff00 : (this.numPlayers === 2 ? 0x0099ff : 0xff0000);

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
      b.owner = owner;
      b.color = owner === 1 ? 0x00ff00 : (this.numPlayers === 2 ? 0x0099ff : 0xff0000);

      this.time.delayedCall(2000, () => {
        if (b && b.active) b.destroy();
      });
      this.playSound(800, 0.08);
    }
  }

  hitPlayer(player, bullet, playerNum, special) {
    bullet.destroy();
    const damage = special ? 25 : 10;
    player.health -= damage;

    this.playSound(200, 0.1);

    if (player.health <= 0) {
      this.endGame(playerNum === 1 ? 2 : 1);
    }
  }

  endGame(winner) {
    this.gameOver = true;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, 800, 600);

    const winText = winner === 1 ? 'PLAYER 1 WINS!' :
                    (this.numPlayers === 2 ? 'PLAYER 2 WINS!' : 'YOU LOSE!');
    const color = winner === 1 ? '#0f0' : (this.numPlayers === 2 ? '#09f' : '#f00');

    this.add.text(400, 250, winText, {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: color,
      stroke: '#000',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(400, 350, 'Press R to return to menu', {
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
