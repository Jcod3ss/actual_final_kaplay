nn.on("load", () => {
  kaplay({
    // Keyboard button setup
    buttons: {
      moveUp: {
        keyboard: ["up", "w"],
      },
      moveDown: {
        keyboard: ["down", "s"],
      },
      moveLeft: {
        keyboard: ["left", "a"],
      },
      moveRight: {
        keyboard: ["right", "d"],
      },
    },
  });

  //Global Variables
  const SPEED = 200;
  const BOOST_SPEED = 430;
  const JUMP_FORCE = 500;
  let playerSpeed = SPEED;
  let boostActive = false;
  let soundEffect, bgm;
  let isPlaying = false;
  let timeLeft = 300;
  let healthText = 0;
  let energyText = 0;
  let hth = 0;
  let ene = 0;
  let spawnSide = "left";
  let hPoint;
  let player;
  let tDamage = true;

  //Loading Sprites
  //Player
  loadSprite("wizard", "assets/wizardsprite.png", {
    sliceX: 2,
    sliceY: 2,
    anims: {
      run: {
        from: 0,
        to: 3,
        loop: true,
      }
    }
  });
  //Enemy
  loadSprite("enemy", "assets/monsterspritesheet.png", {
    sliceX: 2,
    sliceY: 2,
    anims: {
      idle: {
        from: 0,
        to: 2,
        loop: true,
      }
    }
  });
  //Collectible Pots
  loadSprite("pot", "assets/Potion.png", {
    sliceX: 2,
    sliceY: 3,
    anims: {
      idle: {
        from: 0,
        to: 4,
        loop: true,
      }
    }
  });
  loadSprite("Bpot", "assets/B_Potion.png", {
    sliceX: 2,
    sliceY: 3,
    anims: {
      idle: {
        from: 0,
        to: 4,
        loop: true,
      }
    }
  });
  //Platform
  loadSprite("ground", "assets/platform.png");
  //Backgrounds
  loadSprite("bg", "assets/game_bg.png");
  loadSprite("bg2", "assets/cave_bg.png");
  loadSprite("bg3", "assets/forest.png");
  loadSprite("death", "assets/ls.gif");
  //Projectile
  loadSprite("knife", "assets/spell.png");
  //portal
  loadSprite("portal", "assets/portal.png");
  //spawn
  loadSprite("eSpawn", "assets/monstercannon.png");
  //cannon
  loadSprite("cannon", "media/cannon.png");
  //projectile
  loadSprite("star", "media/starprojectile.png", {
    sliceX: 2,
    sliceY: 3
  });

  //Audio
  loadSound(
    "dead", "assets/dead.mp3"
  );
  loadSound(
    "step", "assets/step.mp3"
  );
  loadSound(
    "drink", "assets/drink.mp3"
  );
  loadMusic(
    "bgm", "assets/bgmusic.mp3"
  );

  //Sound effect logic
  function playSoundEffect () {
    // sound logic
    if (!isPlaying) {
      isPlaying = true;
      soundEffect = play("step", {
        volume: 0.5,
      });
      soundEffect.onEnd(() => {
        isPlaying = false;
      })
    }
  }

  //Making Platforms with the sprite
  function makePlatform (x, y, w = 200) {
    add([
      sprite("ground"),
      //rect(w, 40),
      outline(6),
      scale(2),
      area(),
      pos(x, y),
      body({
        isStatic: true
      }),
      color(YELLOW),
      "platform"
    ]);
  }

  //Spawns the red pot
  function spawnPot (x, y) {
    const pot = add([
      sprite("pot"),
      pos(x, y),
      scale(2),
      area(),
      //body(), this is what caused the pot to fall
      anchor("center"),
      "pot"
    ]);
    pot.play("idle");
  }


  //Spawns the blue pot
  function spawnBPot (x, y) {
    const Bpot = add([
      sprite("Bpot"),
      pos(x, y),
      scale(2),
      area(),
      //body(), this is what caused the pot to fall
      anchor("center"),
      "Bpot"
    ]);
    Bpot.play("idle");
  }


  //Spawns the enemy
  function spawnEnemy () {
    const enemy = add([ //Later change this to where the platforms are actually placed
      sprite("enemy"),
      scale(2),
      pos(rand(1500, 3000), height() - 160),
      area(),
      anchor("center"),
      "enemy"
    ]);
    enemy.play("idle");

    //updates the enemy to go for the player. If the player passes wave 1, the code checks if there are two players and moves to the one where the player actually exists
    enemy.onUpdate(() => {
      if (player && player.exists()) {
        enemy.moveTo(player.pos, 170);
      }
    });

  }

  //Spawns in the enemies in a set wave; will later get rid of
  function spawnEnemyWave () {
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
  }

  //1st level
  scene("level1", () => {
    setGravity(640);
    tDamage = true;
    let facing = RIGHT;

    //adds background
    add([
      sprite("bg"),
      pos(0, 0),
      scale(20),
      fixed(),
    ]);

    //Adds player sprite to the game
    player = add([
      sprite("wizard"),
      pos(100, height() - 160),
      anchor("center"),
      area(),
      scale(2),
      body({
        jumpForce: JUMP_FORCE,
      }),
      doubleJump(),
      health(3)
    ]);
    player.play("run");
    //shows how much health you have
    /** const heatlhText = add([
      text(hth.toString(), {
        size: 24,
      }),
      pos(24, 24),
      color(RED),
      fixed(),
      z(100),//makes it so things dont overlap eachother
    ]); **/

    //Shows how much energy you have
    const energyText = add([
      text("Energy: " + ene.toString(), {
        size: 24,
      }),
      pos(24, 55),
      color(BLUE),
      fixed(),
      z(100),
    ]);

    const timer = add([
      text(timeLeft.toFixed(0)),
      pos(width() - 24, 24),
      anchor("topright"),
      color(GREEN),
      fixed(),
      z(100),
    ]);



    //added this over here instead of the health section because this is where player is actually defined
    const hPoint = add([
      text("Health: " + player.hp(), {
        size: 24,
      }),
      pos(24, 25),
      color(RED),
      fixed(),
      z(10)
    ]);


    //Lvl Exit
    const levelExit = add([
      sprite("portal"),
      // rect(30, 140),
      pos(3970, height() - 500),
      area(),
      scale(10),
      //color(GREEN),
      "levelExit"
    ]);

    //Platform Setting
    makePlatform(0, height() - 80, 350);
    makePlatform(420, height() - 170, 180);
    makePlatform(880, height() - 260, 160);
    makePlatform(1220, height() - 170, 180);
    makePlatform(1470, height() - 280, 180);
    makePlatform(1930, height() - 190, 180);
    makePlatform(2390, height() - 300, 180);
    makePlatform(2850, height() - 200, 180);
    makePlatform(3300, height() - 290, 200);
    makePlatform(3770, height() - 200, 250);


    //Collectibles
    //Health pots
    spawnPot(1360, height() - 180);
    spawnPot(1550, height() - 330);

    //Energy pots
    spawnBPot(600, height() - 220);
    spawnBPot(1300, height() - 220);
    spawnBPot(2000, height() - 240);
    spawnBPot(2900, height() - 250);

    // ENEMIES get rid of later
    spawnEnemyWave();

    //Player Controls
    onButtonDown("moveRight", () => {
      // move right
      player.move(playerSpeed, 0);
      facing = RIGHT;
      player.flipX = true;
      playSoundEffect();
      player.play("run");
    });

    onButtonDown("moveLeft", () => {
      // move left
      player.move(-playerSpeed, 0);
      facing = LEFT;
      player.flipX = false;
      playSoundEffect();
      player.play("run");
    });

    onButtonDown("moveUp", () => {
      // jump logic
      player.doubleJump();
      player.play("run")
    });

    //Projectile
    function shoot () {
      add([
        sprite("knife"),
        pos(player.pos),
        anchor("center"),
        area(),
        move(facing, 500),
        offscreen({
          destroy: true
        }),
        "bullet",
      ]);
    }
    onKeyPress("f", shoot);

    function exAtk () {
      if (ene >= 3) {
        ene -= 3;
        energyText.text = "Energy: " + ene.toString();

        add([
          sprite("knife"),
          pos(player.pos),
          anchor("center"),
          area(),
          move(facing, 500),
          scale(5),
          offscreen({
            destroy: true
          }),
          "exbullet",
        ]);
      }
    }
    onKeyPress("r", exAtk);


    // CAMERA
    setCamScale(1);
    // camera follow
    player.onUpdate(() => {
      setCamPos(player.pos);
    })

    //Updates the timer and if the player doesn't get to the end at a certain time, they lose
    onUpdate(() => {
      // timer logic
      timeLeft -= dt();
      timer.text = timeLeft.toFixed(1);
      // lose check
      if (timeLeft <= 0) {
        go("lose");
      }

      //if player falls beyond this limit, the game will go to lose
      if (player.pos.y > height() + 250) {
        go("lose");
      }
    });


    //Collectables
    player.onCollide("pot", (item) => {
      // collect logic
      destroy(item);
      play("drink");
      //Allows the player to heal until they reach 3 health
      if (player.hp() < 3) {
        player.heal(1);
      }
      hPoint.text = "Health: " + player.hp();
    });

    player.onCollide("Bpot", (item) => {
      // collect logic
      destroy(item);
      play("drink");
      ene++;
      energyText.text = "Energy: " + ene.toString();

      //speed boost
      playerSpeed = BOOST_SPEED;
      boostActive = true;
      //boost timer
      wait(6, () => {
        playerSpeed = SPEED;
        boostActive = false;
      });
    });


    //Added a collision to the enemy sprite where if the player touches it, it gets hurt and loses 1 health. 
    player.onCollide("enemy", () => {
      if (tDamage) {
        tDamage = false;
        player.hurt(1);
        hPoint.text = "Health: " + player.hp();
        if (player.hp() <= 0) {
          go("lose");
        }
        wait(1, () => {
          tDamage = true;
        })
      }
    });

    //Bullet and enemy collision
    onCollide("bullet", "enemy", (bullet, enemy) => {
      // projectile collision
      destroy(bullet);
      destroy(enemy);
    });
    onCollide("exbullet", "enemy", (bullet, enemy) => {
      destroy(enemy);
    });

    //Transition
    const fade = add([
      rect(width(), height()),
      pos(0, 0),
      color(BLACK),
      opacity(0),
      fixed(),
    ]);

    //Lvl Exit; change later
    player.onCollide("levelExit", () => {
      // level transition
      tween(
        0,
        1,
        0.5,
        (value) => {
          fade.opacity = value;
        },
        easings.linear);
      wait(0.5, () => {
        spawnSide = "left";
        go("level2")
      });
    });
  });

  //Start of Scene 2
  scene("level2", () => {
    setGravity(640);
    tDamage = true;
    let facing = RIGHT;

    //adds background
    add([
      sprite("bg2"),
      pos(0, 0),
      scale(15),
      fixed(),
    ]);

    //shows how much health you have
    /**
    const heatlhText = add([
      text(hth.toString(), {
        size: 24,
      }),
      pos(24, 24),
      color(RED),
      fixed(),
      z(100),
    ]); **/

    //Shows how much energy you have
    const energyText = add([
      text("Energy: " + ene.toString(), {
        size: 24,
      }),
      pos(24, 55),
      color(BLUE),
      fixed(),
      z(100, )
    ]);

    const timer = add([
      text(timeLeft.toFixed(0)),
      pos(width() - 24, 24),
      anchor("topright"),
      color(GREEN),
      fixed(),
      z(100),
    ]);

    //Adds player sprite to the game
    player = add([
      sprite("wizard"),
      pos(100, height() - 160),
      anchor("center"),
      area(),
      scale(2),
      body({
        jumpForce: JUMP_FORCE,
      }),
      doubleJump(),
      health(3),
    ]);
    const hPoint = add([
      text("Health: " + player.hp(), {
        size: 24,
      }),
      pos(24, 25),
      color(RED),
      fixed(),
      z(10)
    ]);
    player.play("run");

    //Lvl Exit
    const levelExit = add([
      sprite("portal"),
      // rect(30, 140),
      pos(4500, height() - 500),
      area(),
      scale(10),
      //color(GREEN),
      "levelExit"
    ]);

    //Platform Setting
    makePlatform(0, height() - 80, 220);
    makePlatform(450, height() - 220, 140);
    makePlatform(900, height() - 340, 110);
    makePlatform(1300, height() - 280, 150);
    makePlatform(1750, height() - 430, 110);
    makePlatform(2150, height() - 500, 160);
    makePlatform(2600, height() - 430, 120);
    makePlatform(3050, height() - 330, 140);
    makePlatform(3500, height() - 400, 110);
    makePlatform(3900, height() - 260, 150);
    makePlatform(4350, height() - 150, 250);


    //Collectibles
    //Health pots
    spawnPot(200, height() - 140);
    spawnPot(950, height() - 400);
    spawnPot(1800, height() - 490);
    spawnPot(2650, height() - 420);
    spawnPot(3950, height() - 240);

    //Energy pots
    spawnBPot(500, height() - 280);
    spawnBPot(1350, height() - 340);
    spawnBPot(2200, height() - 540);
    spawnBPot(3100, height() - 370);
    spawnBPot(4400, height() - 210);

    //ENEMIES get rid of later
    spawnEnemyWave();

    //Player Controls
    onButtonDown("moveRight", () => {
      // move right
      player.move(playerSpeed, 0);
      facing = RIGHT;
      player.flipX = true;
      playSoundEffect();
      player.play("run");
    });

    onButtonDown("moveLeft", () => {
      // move left
      player.move(-playerSpeed, 0);
      facing = LEFT;
      player.flipX = false;
      playSoundEffect();
      player.play("run");
    });

    onButtonDown("moveUp", () => {
      // jump logic
      player.doubleJump();
      player.play("run")
    });

    //Projectile
    function shoot () {
      add([
        sprite("knife"),
        pos(player.pos),
        anchor("center"),
        area(),
        move(facing, 500),
        offscreen({
          destroy: true
        }),
        "bullet",
      ]);
    }
    onKeyPress("f", shoot);

    function exAtk () {
      if (ene >= 3) {
        ene -= 3;
        energyText.text = "Energy: " + ene.toString();

        add([
          sprite("knife"),
          pos(player.pos),
          anchor("center"),
          area(),
          move(facing, 500),
          scale(5),
          offscreen({
            destroy: true
          }),
          "exbullet",
        ]);
      }
    }
    onKeyPress("r", exAtk);


    // CAMERA
    setCamScale(1);
    // camera follow
    player.onUpdate(() => {
      setCamPos(player.pos);
    })

    //Updates the timer and if the player doesn't get to the end at a certain time, they lose
    onUpdate(() => {
      // timer logic
      timeLeft -= dt();
      timer.text = timeLeft.toFixed(1);
      // lose check
      if (timeLeft <= 0) {
        go("lose");
      }
      //copied and pasted from above
      if (player.pos.y > height() + 250) {
        go("lose");
      }
    });

    //Collectables
    player.onCollide("pot", (item) => {
      destroy(item);
      play("drink");

      if (player.hp() < 3) {
        player.heal(1);
      }

      hPoint.text = "Health: " + player.hp();
    });

    player.onCollide("Bpot", (item) => {
      // collect logic
      destroy(item);
      play("drink");
      ene++;
      energyText.text = "Energy: " + ene.toString();
      //speed boost
      playerSpeed = BOOST_SPEED;
      boostActive = true;
      //boost timer
      wait(6, () => {
        playerSpeed = SPEED;
        boostActive = false;
      });
    });

    player.onCollide("enemy", () => {
      if (tDamage) {
        tDamage = false;
        player.hurt(1);
        hPoint.text = "Health: " + player.hp();
        if (player.hp() <= 0) {
          go("lose");
        }
        wait(1, () => {
          tDamage = true;
        });
      }
    });

    //Bullet and enemy collision
    onCollide("bullet", "enemy", (bullet, enemy) => {
      // projectile collision
      destroy(bullet);
      destroy(enemy);
    });
    onCollide("exbullet", "enemy", (bullet, enemy) => {
      destroy(enemy);
    });

    //Transition
    const fade = add([
      rect(width(), height()),
      pos(0, 0),
      color(BLACK),
      opacity(0),
      fixed(),
    ]);

    //Lvl Exit; change later
    player.onCollide("levelExit", () => {
      // level transition
      tween(
        0,
        1,
        0.5,
        (value) => {
          fade.opacity = value;
        },
        easings.linear);
      wait(0.5, () => {
        spawnSide = "left";
        go("level3")
      });
    });
  });

  //Start of Scene 3
  scene("level3", () => {
    setGravity(640);
    tDamage = true;
    let cannonX = 4250;
    let cannonY = height() - 320 - 100;
    let facing = RIGHT;

    //adds background
    add([
      sprite("bg3"),
      pos(0, 0),
      scale(15),
      fixed(),
    ]);

    //Shows how much energy you have
    const energyText = add([
      text("Energy: " + ene.toString(), {
        size: 24,
      }),
      pos(24, 55),
      color(BLUE),
      fixed(),
      z(100, )
    ]);

    const timer = add([
      text(timeLeft.toFixed(0)),
      pos(width() - 24, 24),
      anchor("topright"),
      color(GREEN),
      fixed(),
      z(100),
    ]);

    //Adds player sprite to the game
    player = add([
      sprite("wizard"),
      pos(100, height() - 160),
      anchor("center"),
      area(),
      scale(2),
      body({
        jumpForce: JUMP_FORCE,
      }),
      doubleJump(),
      health(3),
    ]);
    const hPoint = add([
      text("Health: " + player.hp(), {
        size: 24,
      }),
      pos(24, 25),
      color(RED),
      fixed(),
      z(10)
    ]);
    player.play("run");

    //Lvl Exit
    const levelExit = add([
      sprite("portal"),
      // rect(30, 140),
      pos(4800, height() - 500),
      area(),
      scale(10),
      //color(GREEN),
      "levelExit"
    ]);

    //Platform Setting
    makePlatform(0, height() - 80, 220);
    makePlatform(350, height() - 180, 120);
    makePlatform(700, height() - 280, 120);
    makePlatform(1050, height() - 200, 120);
    makePlatform(1400, height() - 320, 120);
    makePlatform(1750, height() - 240, 120);
    makePlatform(2100, height() - 350, 120);
    makePlatform(2450, height() - 250, 120);
    makePlatform(2800, height() - 350, 120);
    makePlatform(3150, height() - 230, 120);
    makePlatform(3500, height() - 330, 120);
    makePlatform(3850, height() - 220, 120);
    makePlatform(4200, height() - 320, 120);
    makePlatform(4550, height() - 180, 250);


    //Collectibles
    //Health pots
    spawnPot(1050, height() - 460);
    spawnPot(3800, height() - 540);

    //Energy pots
    spawnBPot(1950, height() - 540);
    spawnBPot(4250, height() - 310);

    //ENEMIES get rid of later
    spawnEnemyWave();

    //Player Controls
    onButtonDown("moveRight", () => {
      // move right
      player.move(playerSpeed, 0);
      facing = RIGHT;
      player.flipX = true;
      playSoundEffect();
      player.play("run");
    });

    onButtonDown("moveLeft", () => {
      // move left
      player.move(-playerSpeed, 0);
      facing = LEFT;
      player.flipX = false;
      playSoundEffect();
      player.play("run");
    });

    onButtonDown("moveUp", () => {
      // jump logic
      player.doubleJump();
      player.play("run")
    });

    //Projectile
    function shoot () {
      add([
        sprite("knife"),
        pos(player.pos),
        anchor("center"),
        area(),
        move(facing, 500),
        offscreen({
          destroy: true
        }),
        "bullet",
      ]);
    }
    onKeyPress("f", shoot);

    function exAtk () {
      if (ene >= 3) {
        ene -= 3;
        energyText.text = "Energy: " + ene.toString();

        add([
          sprite("knife"),
          pos(player.pos),
          anchor("center"),
          area(),
          move(facing, 500),
          scale(5),
          offscreen({
            destroy: true
          }),
          "exbullet",
        ]);
      }
    }
    onKeyPress("r", exAtk);

    //Create cannon
    add([
      sprite("cannon"),
      pos(cannonX, cannonY),
      scale(10),
      anchor("center"),
    ]);

    //Shoot stars every 2 seconds
    loop(2, () => {
      const star = add([
        sprite("star"),
        pos(cannonX - 50, cannonY),
        scale(1.5),
        anchor("center"),
        area(),
        "star"
      ]);

      star.move(LEFT, 300);
    });

    player.onCollide("star", (star) => {
      destroy(star);

      if (tDamage) {
        tDamage = false;

        player.hurt(1);
        hPoint.text = "Health: " + player.hp();

        if (player.hp() <= 0) {
          go("lose");
        }

        wait(1, () => {
          tDamage = true;
        });
      }
    });

    // CAMERA
    setCamScale(1);
    // camera follow
    player.onUpdate(() => {
      setCamPos(player.pos);
    })

    //Updates the timer and if the player doesn't get to the end at a certain time, they lose
    onUpdate(() => {
      // timer logic
      timeLeft -= dt();
      timer.text = timeLeft.toFixed(1);
      // lose check
      if (timeLeft <= 0) {
        go("lose");
      }
      //copied and pasted from above
      if (player.pos.y > height() + 250) {
        go("lose");
      }
    });

    //Collectables
    player.onCollide("pot", (item) => {
      destroy(item);
      play("drink");

      if (player.hp() < 3) {
        player.heal(1);
      }

      hPoint.text = "Health: " + player.hp();
    });

    player.onCollide("Bpot", (item) => {
      // collect logic
      destroy(item);
      play("drink");
      ene++;
      energyText.text = "Energy: " + ene.toString();
      //speed boost
      playerSpeed = BOOST_SPEED;
      boostActive = true;
      //boost timer
      wait(6, () => {
        playerSpeed = SPEED;
        boostActive = false;
      });
    });

    player.onCollide("enemy", () => {
      if (tDamage) {
        tDamage = false;
        player.hurt(1);
        hPoint.text = "Health: " + player.hp();
        if (player.hp() <= 0) {
          go("lose");
        }
        wait(1, () => {
          tDamage = true;
        });
      }
    });

    //Bullet and enemy collision
    onCollide("bullet", "enemy", (bullet, enemy) => {
      // projectile collision
      destroy(bullet);
      destroy(enemy);
    });
    onCollide("exbullet", "enemy", (bullet, enemy) => {
      destroy(enemy);
    });

    //Transition
    const fade = add([
      rect(width(), height()),
      pos(0, 0),
      color(BLACK),
      opacity(0),
      fixed(),
    ]);

    //Lvl Exit; change later
    player.onCollide("levelExit", () => {
      // level transition
      tween(
        0,
        1,
        0.5,
        (value) => {
          fade.opacity = value;
        },
        easings.linear);
      wait(0.5, () => {
        spawnSide = "left";
        go("level1")
      });
    });
  });


  //Win Scene
  scene("win", (finalScore) => {
    add([
      text("You WIN!", {
        size: 32,
      }),
      pos(center()),
      anchor("center"),
      color(BLACK)
    ]);
    add([
      text("Press ENTER to play again"),
      pos(center().add(0, 120)),
      anchor("center"),
      color(BLACK),
    ]);
    onKeyPress("enter", () => {
      gameScore = 0;
      timeLeft = 30;
      go("level1");
    });
  });

  //Lose scene
  scene("lose", () => {
    add([
      sprite("death", {
        width: width(),
        height: height(),
      }),
      pos(0, 0),
      fixed(),

    ]);

    add([
      text("YOU LOSE", {
        size: 48,
      }),
      pos(center()),
      anchor("center"),
      color(YELLOW),
    ]);
    add([
      text("Press ENTER to play again"),
      pos(center().add(0, 120)),
      anchor("center"),
      color(YELLOW),
    ]);
    onKeyPress("enter", () => {
      gameScore = 0;
      timeLeft = 300;
      ene = 0;
      hth = 0;
      go("level1");
    });
  });

  go("level1");

  play("bgm", {
    volume: 0.4,
    loop: true
  });
});