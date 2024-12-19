import kaplay from "kaplay";
import "kaplay/global"; // uncomment if you want to use without the k. prefix

const k = kaplay();

// Load assets
k.loadRoot("./");
k.loadSprite("bike", "sprites/bike.png");
k.loadSprite("head", "sprites/head.png");
k.loadSprite("torso", "sprites/torso.png");
k.loadSprite("arm", "sprites/arm.png");
k.loadSprite("background", "sprites/background.jpg");
k.loadSprite("car", "sprites/car.png");
k.loadSprite("car2", "sprites/car2.png");
k.loadSprite("car3", "sprites/car3.png");
k.loadSprite("airship", "sprites/airship.png");
k.loadSprite("plane", "sprites/plane.png");

loadSound("menuMusic", "sounds/menuMusic.mp3");
loadSound("bikeLoop", "sounds/bikeLoop.wav");
loadSound("bikeLoop2", "sounds/bikeLoop2.wav");
loadSound("scoreLoop", "sounds/scoreLoop.mp3");
loadSound("crash", "sounds/crash.mp3");

scene("menu", () => {
  let music = play("menuMusic", { loop: true, volume: 0.1 });
  k.add([
    pos(0, 0), // Starting position of first background layer
    rect(k.width(), k.height()), // Replace with your sprite or background
    color("#000000"),
    area(),
  ]);

  k.add([
    pos(k.width() / 2, k.height() / 4), // Corrected position (center of the screen)
    text("Cinder Fall", { size: 40, color: rgb(255, 255, 255) }),
    layer("ui"), // Place in a UI layer
    {
      anchor: "center", // Ensures the text is centered on the given position
    },
  ]);

  k.add([
    pos(k.width() / 2, k.height() / 3 - 50), // Corrected position (center of the screen)
    text("-Score as many points as you can by doing back flips/front flips", {
      size: 20,
      color: rgb(255, 255, 255),
    }),
    layer("ui"), // Place in a UI layer
    {
      anchor: "center", // Ensures the text is centered on the given position
    },
  ]);
  k.add([
    pos(k.width() / 2, k.height() / 3), // Corrected position (center of the screen)
    text("- Use the arrow keys (<-) and (->) to accelerate or decelerate", {
      size: 20,
      color: rgb(255, 255, 255),
    }),
    layer("ui"), // Place in a UI layer
    {
      anchor: "center", // Ensures the text is centered on the given position
    },
  ]);
  k.add([
    pos(k.width() / 2, k.height() / 3 + 50), // Corrected position (center of the screen)
    text("- Use the (A) and (D) keys to control the tilt of your bike", {
      size: 20,
      color: rgb(255, 255, 255),
    }),
    layer("ui"), // Place in a UI layer
    {
      anchor: "center", // Ensures the text is centered on the given position
    },
  ]);
  k.add([
    pos(k.width() / 2, k.height() / 3 + 100), // Corrected position (center of the screen)
    text("- Use (Space Bar) to jump ", {
      size: 20,
      color: rgb(255, 255, 255),
    }),
    layer("ui"), // Place in a UI layer
    {
      anchor: "center", // Ensures the text is centered on the given position
    },
  ]);
  k.add([
    pos(k.width() / 2, k.height() / 3 + 150), // Corrected position (center of the screen)
    text("- Your speed will effect your rotation", {
      size: 20,
      color: rgb(255, 255, 255),
    }),
    layer("ui"), // Place in a UI layer
    {
      anchor: "center", // Ensures the text is centered on the given position
    },
  ]);
  k.add([
    pos(k.width() / 2, k.height() / 3 + 200), // Corrected position (center of the screen)
    text("- Max speed increases gradually over time", {
      size: 20,
      color: rgb(255, 255, 255),
    }),
    layer("ui"), // Place in a UI layer
    {
      anchor: "center", // Ensures the text is centered on the given position
    },
  ]);
  k.add([
    pos(k.width() / 2, k.height() / 3 + 250), // Corrected position (center of the screen)
    text("- Have Fun! 🎉😁", {
      size: 20,
      color: rgb(255, 255, 255),
    }),
    layer("ui"), // Place in a UI layer
    {
      anchor: "center", // Ensures the text is centered on the given position
    },
  ]);

  let startButton = k.add([
    pos(k.width() / 2, k.height() - k.height() / 4),
    // rect(160, 50),
    text("Start"),
    color("#ffffff"),
    area(),
    layer("ui"),
    {
      label: "Start",
    },
  ]);

  // Define the behavior when the button is clicked
  startButton.onClick(() => {
    music.stop();
    go("game"); // Reload the "game" scene
  });
});

scene("game", () => {
  setGravity(200);

  // Variables
  let jumpForce = 270; // Jumping force

  let currentSpeed = 0; // Current speed of the bike
  let maxSpeed = 1000; // Maximum speed the bike can reach

  let rotation = 0; // Variable to store the bike's current rotation

  let dead = false;
  let onRamp = false;
  let doingOli = false;
  let score = 0;
  let scoreVariable = 0;
  let scoreMultiplier = 0;

  let bikeLoop = null;
  let bikeLoop2 = null;
  let scoreLoop = null;

  let background1 = k.add([
    pos(1613, k.height()), // Starting position of first background layer
    sprite("background"),
    color("#d6d6d6"),
    area(),
    "background1",
    anchor("bot"), // Set the anchor point to the bottom center
  ]);

  let background2 = k.add([
    pos(4839, k.height()), // Start second background layer at the right
    sprite("background"),
    color("#d6d6d6"),
    area(),
    "background2",
    anchor("bot"), // Set the anchor point to the bottom center
  ]);

  add([
    pos(0, k.height() - 20),
    rect(k.width(), 20),
    color("#6B6B6B"),
    area(),
    body({ isStatic: true }),
    "floor",
  ]);

  // Create the bike
  let bike = k.add([
    pos(k.width() / 4 + 100, k.height() - 80), // Start above the floor
    sprite("bike"),
    scale(0.4), // Scale applied after setting origin
    anchor("center"),
    area(),
    body(),
    "bike",
  ]);

  add([
    pos(0, 0),
    rect(300, 80),
    color(rgb(0, 0, 0), 0.5),
    area(),
    body({ isStatic: true }),
    "floor",
  ]);

  let speedText = k.add([
    pos(10, 10), // Position at top-left corner
    text(`Speed : 0`, { size: 27, color: rgb(255, 255, 255) }),
    layer("ui"), // Place in a UI layer
    {
      update: () => {
        // Update the text with the current speed
        speedText.text = `Speed: ${
          currentSpeed < 20 ? 0 : Math.round(currentSpeed / 7)
        } Km/h`;
      },
    },
  ]);

  let scoreText = k.add([
    pos(10, 45), // Position at top-left corner
    text("Score : 0", { size: 27, color: rgb(255, 255, 255) }),
    layer("ui"), // Place in a UI layer
    {
      update: () => {
        scoreText.text = `Score: ${Math.round(score)}`;
      },
    },
  ]);

  let scoreVariableText = k.add([
    pos(k.width() / 2 - 100, k.height() / 2 - 80), // Position it in the center
    text("", { size: 40, color: rgb(255, 255, 255), weight: 400 }), // Initial text style
    layer("ui"),
    {
      update: () => {
        // Check if scoreVariable and scoreMultiplier are greater than 0
        if (scoreVariable > 0 && scoreMultiplier > 0) {
          // Update the scoreVariableText based on the multiplier
          scoreVariableText.text = `${Math.round(
            scoreVariable * scoreMultiplier
          )}`;

          if (scoreMultiplier <= 2) {
            scoreVariableText.color = rgb(255, 255, 255);
          } else if (scoreMultiplier <= 4) {
            scoreVariableText.color = rgb(255, 255, 0);
          } else if (scoreMultiplier <= 6) {
            scoreVariableText.color = rgb(255, 165, 0);
          } else {
            scoreVariableText.color = rgb(255, 0, 0);
          }
        } else {
          scoreVariableText.text = "";
        }
      },
    },
  ]);

  // Function to activate ragdoll effect
  function onDeath() {
    dead = true;
	let music2 = play("menuMusic", { loop: true, volume: 0.1 });
    if (bikeLoop) {
      bikeLoop.stop();
      bikeLoop = null;
    }
    if (bikeLoop2) {
      bikeLoop2.stop();
      bikeLoop2 = null;
    }
    if (scoreLoop) {
      scoreLoop.stop();
      scoreLoop = null;
    }
    if (scoreLoop) {
      scoreLoop.stop();
      scoreLoop = null;
    }
    play("crash", { volume: 0.1 });

    // Create ragdoll body parts
    let head = k.add([
      pos(bike.pos.x, bike.pos.y - 50), // Position above the bike
      sprite("head"),
      area(),
      body({ restitution: 0.5 }), // Add bounciness to the body part
      scale(0.4),
    ]);

    let torso = k.add([
      pos(bike.pos.x, bike.pos.y), // Position at the bike's center
      sprite("torso"),
      area(),
      body(),
      scale(0.4),
    ]);

    let leftArm = k.add([
      pos(bike.pos.x - 100, bike.pos.y + 25), // Position to the left of torso
      sprite("arm"),
      area(),
      body(),
      scale(0.4),
    ]);

    let rightArm = k.add([
      pos(bike.pos.x + 100, bike.pos.y + 25), // Position to the right of torso
      sprite("arm"),
      area(),
      body(),
      scale(0.4),
    ]);

    let leftLeg = k.add([
      pos(bike.pos.x - 100, bike.pos.y + 25), // Position to the left of torso
      sprite("arm"),
      area(),
      body(),
      scale(0.4),
    ]);

    let rightLeg = k.add([
      pos(bike.pos.x + 100, bike.pos.y + 25), // Position to the right of torso
      sprite("arm"),
      area(),
      body(),
      scale(0.4),
    ]);

    addKaboom(vec2(bike.pos.x, bike.pos.y));

    applyBounce(head);
    applyBounce(torso);
    applyBounce(leftArm);
    applyBounce(rightArm);
    applyBounce(leftLeg);
    applyBounce(rightLeg);

    bike.destroy();
    head.vel = vec2(currentSpeed / 4, -(Math.random() * 1000)); // Apply a random velocity
    torso.vel = vec2(currentSpeed / 4 - 60, -(Math.random() * 1000)); // Apply a random velocity
    leftArm.vel = vec2(currentSpeed / 4 - 20, -(Math.random() * 1000)); // Apply a random velocity
    rightArm.vel = vec2(currentSpeed / 4 + 20, -(Math.random() * 1000)); // Apply a random velocity
    leftLeg.vel = vec2(currentSpeed / 4 - 40, -(Math.random() * 1000)); // Apply a random velocity
    rightLeg.vel = vec2(currentSpeed / 4 + 40, -(Math.random() * 1000)); // Apply a random velocity

    k.add([
      pos(k.width() / 2, k.height() / 2),
      rect(300, 200),
      color("#000000"),
      {
        anchor: "center", // Ensures the text is centered on the given position
      },
    ]);

    // k.add([
    //   pos(k.width() / 2, k.height() / 2 - 70),
    //   text(`Game Over`, {
    //     size: 20,
    //     color: rgb(255, 255, 255),
    //   }),
    //   {
    //     anchor: "center", // Ensures the text is centered on the given position
    //   },
    // ]);

    k.add([
      pos(k.width() / 2, k.height() / 2 - 20), // Starting position of first background layer
      text(`Final ${scoreText.text}`, {
        size: 20,
        color: rgb(255, 255, 255),
      }),
      {
        anchor: "center", // Ensures the text is centered on the given position
      },
    ]);

    k.add([
      pos(k.width() / 2, k.height() / 2 + 10), // Starting position of first background layer
      text(`Top Speed : ${Math.round(currentSpeed / 7)} Km/h`, {
        size: 20,
        color: rgb(255, 255, 255),
      }),
      layer("ui"), // Place in a UI layer
      {
        anchor: "center", // Ensures the text is centered on the given position
      },
    ]);

    const startButton = k.add([
      pos(k.width() / 2, k.height() / 2 + 70), // Starting position of first background layer
      text("Start Over", { size: 24, color: rgb(0, 238, 255) }),
      area(), // Make it interactive
      layer("ui"), // Place in a UI layer
      {
        anchor: "center", // Ensures the text is centered on the given position
      },
      "startButton",
    ]);

    // Define the click behavior
    startButton.onClick(() => {
	  music2.stop();
      go("game"); // Reload the "game" scene
    });

    currentSpeed = 0;
  }

  function applyBounce(bodyPart) {
    bodyPart.onCollide("floor", (f) => {
      bodyPart.vel.y = -Math.abs(bodyPart.vel.y) * 0.6; // Simulate bounce with reduced speed
      bodyPart.vel.x *= 0.9; // Slightly reduce horizontal velocity
    });
  }

  // Update function
  onUpdate(() => {
    if (dead) return;

    if (bike.isGrounded() && Math.abs(bike.angle) > 90) {
      onDeath();
      return;
    }

    // Handle background movement
    background1.pos.x -= currentSpeed * dt();
    background2.pos.x -= currentSpeed * dt();

    // Reset background positions when they go off-screen
    if (background1.pos.x + 1633 < 0) {
      background1.pos.x = background2.pos.x + 3226; // Place background1 after background2
    }
    if (background2.pos.x + 1633 < 0) {
      background2.pos.x = background1.pos.x + 3226; // Place background2 after background1
    }

    if (bike.pos.x < k.width() / 4 + 100) {
      bike.pos.x += 80 * dt();
    }

    // Bike movement control
    if (bike.isGrounded()) {
      if (Math.abs(bike.angle) > 10 && !onRamp) {
        if (scoreMultiplier > 1) {
          score += scoreVariable * scoreMultiplier;
          scoreVariable = 0;
        }
        doingOli = true;
        scoreVariable += Math.max(currentSpeed / 25, 1) * dt();
        scoreMultiplier = 1;
      } else {
        doingOli = false;
        score += scoreVariable * scoreMultiplier;
        scoreMultiplier = 0;
        scoreVariable = 0;
      }

      if (isKeyDown("left")) {
        if (currentSpeed > 200) {
          currentSpeed = Math.max(currentSpeed - maxSpeed * dt(), -maxSpeed);
        }
      }

      if (isKeyDown("right")) {
        currentSpeed = Math.min(currentSpeed + (maxSpeed / 3) * dt(), maxSpeed);
      }

      if (
        !(
          isKeyDown("space") ||
          isKeyDown("a") ||
          isKeyDown("right") ||
          isKeyDown("d")
        )
      ) {
        if (currentSpeed > 200) {
          currentSpeed =
            currentSpeed > 0
              ? currentSpeed - (maxSpeed / 4) * dt()
              : currentSpeed + (maxSpeed / 4) * dt();
        }
      }

      if (isKeyDown("space")) {
        if (!onRamp) {
          bike.jump(jumpForce);
        }
      }

      if (!onRamp) rotation = rotation * 0.95; // Smoothly reduce the tilt over time
    } else {
      if (isKeyDown("left")) {
        if (currentSpeed > 200) {
          currentSpeed = Math.max(currentSpeed - maxSpeed * dt(), -maxSpeed);
        }
      }
      if (isKeyDown("right"))
        currentSpeed = Math.min(currentSpeed + (maxSpeed / 5) * dt(), maxSpeed);

      if (doingOli && bike.pos.y < k.height() - 100) {
        doingOli = false;
        score += scoreVariable * scoreMultiplier;
        scoreMultiplier = 0;
        scoreVariable = 0;
      } else {
        scoreVariable += Math.max(currentSpeed / 25, 1) * dt();
      }
    }

    if (bike.isGrounded() && isKeyDown("right")) {
      if (!bikeLoop) {
        bikeLoop = play("bikeLoop", { loop: true, volume: 0.1 });
      }

      if (bikeLoop2) {
        bikeLoop2.stop();
        bikeLoop2 = null;
      }
    }

    if (bike.pos.y > k.height() - 100 && !isKeyDown("right")) {
      if (bikeLoop) {
        bikeLoop.stop();
        bikeLoop = null;
      }
      if (!bikeLoop2) {
        bikeLoop2 = play("bikeLoop2", { loop: true, volume: 0.1 });
      }
    }

    if (bike.pos.y < k.height() - 100 && !onRamp) {
      if (bikeLoop) {
        bikeLoop.stop();
        bikeLoop = null;
      }

      if (!bikeLoop2) {
        bikeLoop2 = play("bikeLoop2", { loop: true, volume: 0.1 });
      }
    }

    if (isKeyDown("a"))
      rotation -= currentSpeed > 500 ? (currentSpeed / 5) * dt() : 100 * dt(); // Rotate left
    if (isKeyDown("d"))
      rotation += currentSpeed > 500 ? (currentSpeed / 5) * dt() : 100 * dt(); // Rotate left

    // Wrap rotation angle to avoid it exceeding ±180 degrees
    if (rotation > 180) {
      scoreMultiplier += 1;
      rotation -= 360;
    }
    if (rotation < -180) {
      rotation += 360;
      scoreMultiplier += 1;
    }

    if (scoreMultiplier > 0 && !scoreLoop) {
      scoreLoop = play("scoreLoop", { loop: true, volume: 0.1 });
    }
    if (scoreMultiplier === 0 && scoreLoop) {
      scoreLoop.stop();
      scoreLoop = null;
    }

    bike.angle = rotation;
  });

  bike.onCollide("ramp", (r) => {
    onRamp = true;
  });

  bike.onCollideEnd("ramp", (r) => {
    onRamp = false;
    bike.jump((r.angleRadius + 1) * jumpForce);
  });

  loop(15, () => {
    let rampHeight = getRandomIntBetween(100, 600);
    let rampWidth = getRandomIntBetween(500, 800);
    let rampAngle = Math.atan2(rampHeight, rampWidth); // Get the angle in radians

    k.add([
      pos(k.width() + 500, k.height() - 20), // Position of the ramp
      polygon([
        vec2(-rampWidth, 0), // Bottom left corner
        vec2(0, 0), // Bottom right corner
        vec2(0, -rampHeight), // Peak of the triangle (height of the ramp)
      ]),
      color("#969595"), // Color of the ramp
      area(),
      body({ isStatic: true }),
      "ramp",
      "floor",
      { angleRadius: rampAngle },
    ]);
  });

  loop(11, () => {
    if (!dead) {
      // let obstacleType = 5;
      let obstacleType = getRandomIntBetween(1, 5);

      //play warning sound
      if (obstacleType == 1) {
        k.add([
          pos(k.width() * 2, k.height() - 90),
          sprite("car3"),
          scale(0.55),
          area(),
          body({ isStatic: true }),
          "obstacle",
          { speedMultiplier: 0.7 },
        ]);
      } else if (obstacleType == 2) {
        k.add([
          pos(k.width() * 2, k.height() - 80),
          sprite("car2"),
          scale(0.55),
          area(),
          body({ isStatic: true }),
          "obstacle",
          { speedMultiplier: 0.5 },
        ]);
      } else if (obstacleType == 3) {
        k.add([
          pos(k.width() * 2, k.height() - 80),
          sprite("car"),
          area(),
          body({ isStatic: true }),
          "obstacle",
          { speedMultiplier: 0.3 },
        ]);
      } else if (obstacleType == 4) {
        k.add([
          pos(
            k.width() * 2,
            getRandomIntBetween(k.height() / 4, k.height() - 250)
          ),
          sprite("airship"),
          area(),
          body({ isStatic: true }),
          "obstacle",
          { speedMultiplier: 0.7 },
        ]);
      } else if (obstacleType == 5) {
        k.add([
          pos(
            k.width() * 2,
            getRandomIntBetween(k.height() / 4, k.height() - 200)
          ),
          sprite("plane"),
          scale(0.16),
          area(),
          body({ isStatic: true }),
          "obstacle",
          { speedMultiplier: 0.5 },
        ]);
      }
    }
  });

  loop(1, () => {
    if (!dead) {
      maxSpeed += 10;
    }
  });

  onUpdate("ramp", (ramp) => {
    ramp.pos.x -= currentSpeed * dt();

    // Prevent the ramp from moving off-screen
    if (ramp.pos.x + ramp.width < 0) {
      destroy(ramp);
    }

    // Prevent the bike from being pushed off-screen by the ramp
    if (
      bike.pos.x + bike.width > ramp.pos.x &&
      bike.pos.x < ramp.pos.x + ramp.width
    ) {
      bike.pos.x = Math.clamp(
        bike.pos.x,
        ramp.pos.x,
        ramp.pos.x + ramp.width - bike.width
      );
    }
  });

  onUpdate("obstacle", (obstacle) => {
    obstacle.pos.x -=
      currentSpeed > 600
        ? currentSpeed * obstacle.speedMultiplier * dt()
        : -(300 * obstacle.speedMultiplier * dt());
    if (obstacle.pos.x < 0) {
      destroy(obstacle);
    }
  });

  bike.onCollide("obstacle", (r) => {
    onDeath();
  });

  function getRandomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
});

go("menu");
