import Matter, {
  Engine,
  Render,
  Runner,
  Bodies,
  World,
  Body,
  Mouse,
  MouseConstraint,
} from "matter-js";
import MatterAttractors from "matter-attractors";

Matter.use(
  "matter-wrap",
  "matter-attractors"
);

function roundInteger(value, precision) {
  const multiplier = Math.pow(10, precision || 0);

  return Math.round(value * multiplier) / multiplier;
}

const OrbitSimulation = {
  gravitySimulation: function() {
    const engine = Engine.create(),
      world = engine.world;

    const render = Render.create({
      element: document.getElementById("orbit-simulation-canvas"),
      engine: engine,
      options: {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
      }
    });

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, engine);

    world.bodies = [];
    world.gravity.scale = 0;

    engine.timing.timeScale = 0.5;

    const earth = Bodies.circle(
      document.documentElement.clientWidth/2,
      document.documentElement.clientHeight/2,
      250,
      {
        mass: 2700,
        friction: 1,
        frictionStatic: 10,
        frictionAir: 1,
        plugin: {
          attractors: [
            // there is a built in helper function for Newtonian gravity!
            // you can find out how it works in index.js
            MatterAttractors.Attractors.gravity
          ],
          wrap: {
            min: { x: 0, y: 0 },
            max: { x: render.options.width, y: render.options.height }
          }
        }
      }
    );

    const moon = Bodies.circle(
      document.documentElement.clientWidth/2,
      document.documentElement.clientHeight/2 - 400,
      20,
      {
        mass: 1,
        frictionAir: 0,
        render: {
          sprite: {
            x: 0,
            y: 0,
            texture: "./image/moon.png"
          }
        },
        plugin: {
          attractors: [
            // there is a built in helper function for Newtonian gravity!
            // you can find out how it works in index.js
            MatterAttractors.Attractors.gravity
          ],
          wrap: {
            min: { x: 0, y: 0 },
            max: { x: render.options.width, y: render.options.height }
          }
        }
      }
    );

    const spaceShip = Bodies.rectangle(
      document.documentElement.clientWidth/2,
      document.documentElement.clientHeight/2 - 253,
      5,
      10,
      {
        mass: 0.08,
        frictionAir: 0,
        render: {
          fillStyle: "white",
          strokeStyle: "blue"
        },
        plugin: {
          attractors: [
            MatterAttractors.Attractors.gravity
          ],
          wrap: {
            min: { x: 0, y: 0 },
            max: { x: render.options.width, y: render.options.height }
          }
        }
      }
    );

    Body.setVelocity(moon, {
      x: 1.4,
      y: 0
    });

    World.add(world, moon);
    World.add(world, earth);
    World.add(world, spaceShip);

    const ctx = document.body.getElementsByTagName("canvas")[0].getContext("2d");
    const spaceShipSpeedWrapper = document.getElementsByClassName("current-speed")[0];
    const moonSpeedWrapper = document.getElementsByClassName("current-speed")[1];

    function drawVectors() { //render force and velocity vectors for each mass
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#00ffff';

        ctx.beginPath();

        ctx.moveTo(spaceShip.position.x, spaceShip.position.y);

        ctx.lineTo(
          spaceShip.position.x + 10 * spaceShip.velocity.x * 20,
          spaceShip.position.y + 10 * spaceShip.velocity.y * 20
        );

        ctx.stroke();
    }

    (function cycle() { //render loop
      drawVectors();

      spaceShipSpeedWrapper.innerHTML = `Space Ship Speed: ${roundInteger(spaceShip.speed * 1000, 1)} km`;
      moonSpeedWrapper.innerHTML = `Moon Speed: ${roundInteger(moon.speed * 1000, 1)} km`;

      window.requestAnimationFrame(cycle);
    })();

    const mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false
          }
        }
      });

    World.add(world, mouseConstraint);

    render.mouse = mouse;

    window.addEventListener("keydown", function (event) {
      if (event.defaultPrevented) {
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          Body.applyForce(
            spaceShip,
            {
              x: spaceShip.position.x,
              y: spaceShip.position.y
            },
            {
              x: 0,
              y: 0.0000075,
            }
          );

          break;

        case "Up":
        case "ArrowUp":
          Body.applyForce(
            spaceShip,
            {
              x: spaceShip.position.x,
              y: spaceShip.position.y
            },
            {
              x: 0,
              y: -0.0000075
            }
          );

          break;

        case "Left":
        case "ArrowLeft":
          Body.applyForce(
            spaceShip,
            {
              x: spaceShip.position.x,
              y: spaceShip.position.y
            },
            {
              x: -0.0000075,
              y: 0
            }
          );

          break;

        case "Right":
        case "ArrowRight":
          Body.applyForce(
            spaceShip,
            {
              x: spaceShip.position.x,
              y: spaceShip.position.y
            },
            {
              x: 0.0000075,
              y: 0
            }
          );

          break;

        default:
          return;
      }

      event.preventDefault();
    }, true);

    return {
      engine: engine,
      runner: runner,
      render: render,
      canvas: render.canvas,
      stop: function() {
        Matter.Render.stop(render);
        Matter.Runner.stop(runner);
      }
    };
  }
};

window.onload = OrbitSimulation.gravitySimulation();
