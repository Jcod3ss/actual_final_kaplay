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
  const JUMP_FORCE = 500;
  let soundEffect, bgm;
  let isPlaying = false;
  let timeLeft = 300;
  let healthText = 0;
  let energyText = 0;
  let health = 0;
  let energy = 0;
  let spawnSide = "left";
  
  //Loading Sprites
  //Player
  loadSprite("wizard", "assets/wizardsprite.png", {
    sliceX:2,
    sliceY:2,
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
    sliceX:2,
    sliceY:2,
    anims: {
      idle: {
        from: 0,
        to: 2,
        loop: true,
      }
    }
  });
  //Collectible Pots
  loadSprite("pot", "assets/Potion.png",{
    sliceX: 2,
    sliceY: 3,
    anims: {
      idle: {
        from:0, 
        to: 4,
        loop: true,
      }
    }
  });
  loadSprite("Bpot", "assets/B_Potion.png",{
    sliceX: 2,
    sliceY: 3,
    anims: {
      idle: {
        from:0, 
        to: 4,
        loop: true,
      }
    }
  });
  //Platform
  loadSprite("ground", "assets/platform-1.png");
  //Background
  loadSprite("bg", "assets/game_bg.png");
  //Projectile
  loadSprite("knife", "assets/spell.png");
  
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
  function makePlatform (x, y) {
    add([
      //sprite("ground"),
      rect(250, 40),
      outline(6),
      scale(1),
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
  function spawnPot () {
    const pot = add([
      sprite("pot"),
      pos(rand(0, width()), rand(0, height())),
      scale(2),
      area(),
      body(),
      anchor("center"),
      "pot"
    ]);
    pot.play("idle");
  }  
  
  
  //Spawns the blue pot
  function spawnBPot () {
    const Bpot = add([
      sprite("Bpot"),
      pos(rand(0, width()), rand(0, height())),
      scale(2),
      area(),
      body(),
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
      pos(rand(100, width() - 100), rand(100, height() - 100)),
      area(),
      anchor("center"),
      "enemy"
    ]);
    enemy.play("idle");
    //Enemy timer spawn
    wait(rand(2, 10), () => {
      if (enemy.exists()) {
        destroy(enemy);
      }
    })
    // enemy timer
  }

  //Spawns in the enemies in a set wave; will later get rid of
  function spawnEnemyWave () {
    const amount = 5
    for (let i = 0; i < amount; i++) {
      spawnEnemy();
    }
  }
  
  //1st level
  scene("level1", () => {
    setGravity(640);
    let facing = RIGHT;
    
    //adds background
    add([
    sprite("bg"),
    pos(0, 0),
    scale(20),
    fixed(),
    ]);
    
    //shows how much health you have
    const heatlhText = add([
      text(health.toString(), {
        size: 24,
      }),
      pos(24, 24),
      color(BLACK),
    ]);
    
    //Shows how much energy you have
    const energyText = add([
      text(energy.toString(), {
        size: 24,
      }),
      pos(24, 35),
      color(BLACK),
    ]);
    
    const timer = add([
    text(timeLeft.toFixed(0)),
    pos(width() - 24, 24),
    anchor("topright"),
    color(BLACK)
    ]);
    
    //Adds player sprite to the game
    const player = add([
      sprite("wizard"),
      pos(center()),
      anchor("center"),
      area(),
      scale(2),
      body({
        jumpForce: JUMP_FORCE,
      }),
      doubleJump(),
    ]);
    player.play("run");

    //Lvl Exit
    const levelExit = add([
      rect(10, height()),
      pos(width() - 10, 0),
      area(),
      color(GREEN),
      "levelExit"
    ]);

    //Platform Setting
    makePlatform(0, height() - 80);
    makePlatform(100, height() - 200);
    makePlatform(450, height() - 350);
    makePlatform(200, height() - 500);
    makePlatform(300, height() - 500);
    makePlatform(990, height() - 400);
    makePlatform(1200, height() - 450);
    makePlatform(1150, height() - 650);
    makePlatform(350, height() - 800);
    makePlatform(1500, height() - 450);
    makePlatform(1800, height() - 450);
    makePlatform(2100, height() - 450);

    //Collectibles
    for (let i = 0; i < 5; i++) {
      spawnPot();
      spawnBPot();
    }
    loop(5, spawnPot);
    loop(5, spawnBPot);

    // ENEMIES get rid of later
    spawnEnemyWave();

    //Player Controls
    onButtonDown("moveRight", () => {
      // move right
      player.move(SPEED, 0);
      facing = RIGHT;
      playSoundEffect();
      player.play("run");
    });

    onButtonDown("moveLeft", () => {
      // move left
      player.move(-SPEED, 0);
      facing = LEFT;
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


    // CAMERA
    setCamScale(1.5);
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
    });


    //Collectables
    player.onCollide("pot", (item) => {
      // collect logic
      destroy(item);
      play("drink");
      health++;
      healthText.text = health.toString();
    });
    
    player.onCollide("Bpot", (item) => {
      // collect logic
      destroy(item);
      play("drink");
      energy++;
      energyText.text = energy.toString();
    });


    player.onCollide("enemy", () => {
      // lose logic
      go("lose");
      play("dead");

    });

    //Bullet and enemy collision
    onCollide("bullet", "enemy", (bullet, enemy) => {
      // projectile collision
      destroy(bullet);
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
    let facing = RIGHT;
    
    //adds background
    add([
    sprite("bg"),
    pos(0, 0),
    scale(20),
    fixed(),
    ]);
    
    //shows how much health you have
    const heatlhText = add([
      text(health.toString(), {
        size: 24,
      }),
      pos(24, 24),
      color(BLACK),
    ]);
    
    //Shows how much energy you have
    const energyText = add([
      text(energy.toString(), {
        size: 24,
      }),
      pos(24, 35),
      color(BLACK),
    ]);
    
    const timer = add([
    text(timeLeft.toFixed(0)),
    pos(width() - 24, 24),
    anchor("topright"),
    color(WHITE)
    ]);
    
    //Adds player sprite to the game
    const player = add([
      sprite("wizard"),
      pos(spawnSide === "left" ? 150 : width() - 150,  height() / 2),
      anchor("center"),
      area(),
      scale(2),
      body({
        jumpForce: JUMP_FORCE,
      }),
      doubleJump(),
    ]);
    player.play("run");

    //Lvl Exit
    const levelExit = add([
      rect(10, height()),
      pos(width() - 10, 0),
      area(),
      color(GREEN),
      "levelExit"
    ]);

    //Platform Setting
    makePlatform(0, height() - 80);
    makePlatform(40, height() - 80);
    makePlatform(80, height() - 80);
    makePlatform(120, height() - 80);
    makePlatform(100, height() - 200);
    makePlatform(450, height() - 350);
    makePlatform(200, height() - 500);
    makePlatform(550, height() - 650);
    makePlatform(350, height() - 800);
    makePlatform(900, height() - 650);
    makePlatform(1200, height() - 650);
    makePlatform(1500, height() - 650);
    makePlatform(1800, height() - 650);
    makePlatform(2100, height() - 650);

    //Collectibles
    for (let i = 0; i < 1; i++) {
      spawnPot();
      spawnBPot();
    }
    loop(2, spawnPot);
    loop(2, spawnBPot);

    // ENEMIES get rid of later
    spawnEnemyWave();

    //Player Controls
    onButtonDown("moveRight", () => {
      // move right
      player.move(SPEED, 0);
      facing = RIGHT;
      playSoundEffect();
      player.play("run");
    });

    onButtonDown("moveLeft", () => {
      // move left
      player.move(-SPEED, 0);
      facing = LEFT;
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


    // CAMERA
    setCamScale(1.5);
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
    });

    //Collectables
    player.onCollide("pot", (item) => {
      // collect logic
      destroy(item);
      play("drink");
      health++;
      healthText.text = health.toString();
    });
    
    player.onCollide("Bpot", (item) => {
      // collect logic
      destroy(item);
      play("drink");
      energy++;
      energyText.text = energy.toString();
    });

    player.onCollide("enemy", () => {
      // lose logic
      go("lose");
      play("dead");
    });

    //Bullet and enemy collision
    onCollide("bullet", "enemy", (bullet, enemy) => {
      // projectile collision
      destroy(bullet);
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
    text("YOU LOSE", {
      size: 48,
    }),
    pos(center()),
    anchor("center"),
    color(BLACK),
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
  
  go("level1");
});  