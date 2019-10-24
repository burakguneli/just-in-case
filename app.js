import Matter, {Engine, Render, Runner, Body, MouseConstraint, Mouse, World, Bodies, Common} from "matter-js";
import MatterAttractors from "matter-attractors";

Matter.use(
  "matter-wrap", // not required, just for demo
  "matter-attractors" // PLUGIN_NAME
);

var Example = Example || {};

Example.gravity = function() {
  // create engine
  const engine = Engine.create(),
        world = engine.world;

  // create renderer
  const render = Render.create({
    element: document.body,
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

  engine.timing.timeScale = 1;

  const earth = Bodies.circle(
    document.documentElement.clientWidth/2,
    document.documentElement.clientHeight/2 - 50,
    50,
    {
      mass: 1000,
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
    document.documentElement.clientHeight/2 - 200,
    10,
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

  Body.setVelocity(moon, {
    x: 1.4,
    y: 0
  });

  World.add(world, moon);
  World.add(world, earth);

  // add mouse control
  var mouse = Mouse.create(render.canvas),
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

  // keep the mouse in sync with rendering
  render.mouse = mouse;

  // context for MatterTools.Demo
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
};

window.onload = Example.gravity();
