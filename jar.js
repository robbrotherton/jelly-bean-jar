let width = 500;
let height = 600;
let x0 = width / 2;

let colorPal = [
    '#ff8aa6', // Pastel Pink
    '#ff9b48', // Pastel Orange
    '#fff067', // Pastel Yellow
    '#9EE09E', // Pastel Green
    '#71c4e6', // Pastel Blue
    '#edceff', // Pastel Purple
    '#fc5c30', // Pastel Brown
    '#CAF7E2'  // Pastel Mint
];


// physics properties
const physicsParams = {
    label: "circle",
    mass: 100,
    restitution: 0.5,
    friction: 0.01,
    frictionAir: 0.025,
    frictionStatic: 0,
    density: 1,
    slop: 0.05,
    sleepThreshold: 15
}



var { Engine, Render, Runner,
    Composite, Composites, Common,
    MouseConstraint, Mouse, Events,
    World, Bodies, Body } = Matter;

let intervalId = null;

let params = randomizeParams();
let engine = initializeWorld("board", "canvas", width, height);

Composite.add(engine.world, makeJar(params));

let generateBean = createBeanGenerator(params, physicsParams, x0, colorPal);
addBeansToWorld(engine.world, generateBean, params);


function randomizeParams() {
    const generationSpeed = 20;
    const jarCount = 0;
    const jarWidth = 0.5 + Math.random() * 0.4;
    const jarHeight = 0.5 + Math.random() * 0.2;
    const beanRadius = 6 + Math.random() * 6;
    const nBeans = Math.floor(4000 * (jarWidth * jarHeight) * (1 / beanRadius));
    
    return {nBeans, beanRadius, generationSpeed, jarWidth, jarHeight, jarCount};
}

function initializeWorld(element, canvas, width, height) {
    let engine = Engine.create({
        enableSleeping: true
    }),
    world = engine.world;

    // create renderer
    let render = Render.create({
        element: document.getElementById(element),
        canvas: document.getElementById(canvas),
        engine: engine,
        options: {
            width: width,
            height: height,
            background: "transparent",
            wireframes: false,
            showSleeping: false
        }
    });
    Render.run(render);

    let runner = Runner.create();
    Runner.run(runner, engine);

    // Reset simulation on mousedown events
    render.canvas.addEventListener("mousedown", handleReset);

    return {world, render};
}


function createBeanGenerator(params, physicsParams, x, colors) {
    let total = params.nBeans;

    return function generateBean() {
        if (total-- > 0) {
            const circle = Bodies.circle(x + (-0.5 + Math.random()) * 250, -20, params.beanRadius + Math.random() * 8, {
                label: "circle",
                friction: physicsParams.friction,
                restitution: physicsParams.restitution,
                mass: physicsParams.mass,
                slop: physicsParams.slop,
                density: physicsParams.density,
                frictionAir: physicsParams.frictionAir,
                sleepThreshold: physicsParams.sleepThreshold,
                render: {
                    fillStyle: colors[Math.floor(Math.random()*colors.length)]
                }
            });

            Events.on(circle, "sleepStart", function () {
                circle.isStatic = true;
                circle.label = "inJar";
            });

            return circle;
        } else {
            return null;
        }
    }
}

function addBeansToWorld(world, generatorFunction, params) {
    intervalId = setInterval(() => {
        let bean = generatorFunction();
        if (bean) {
            Composite.add(world, bean);
        } else {
            clearInterval(intervalId);
            intervalId = null;
        }
    }, params.generationSpeed);
}


let existingBalls = () => {
    return engine.world.bodies.filter((body) => body.label === "circle");
};


const makeStaticInterval = setInterval(() => {
    existingBalls().forEach(function (ball) {
        let ballHeight = ball.position.y;
        if (ballHeight > height) {
            console.log("gonner");
            Composite.remove(engine.world, ball);
        }
    });
}, 200);


function makeJar(params) {

    const thickness = 10;

    const properties = {
        isStatic: true,
        render: {
            fillStyle: "#000000",
            visible: true
        },
        chamfer: { radius: [5, 5, 5, 5]}
    };

    // left wall
    const leftWall = Bodies.rectangle(width * (1 - params.jarWidth) / 2, (height) - (height * params.jarHeight/2), thickness, height * params.jarHeight, properties);

    // right wall
    const rightWall = Bodies.rectangle(width * (1 - (1 - params.jarWidth) / 2), (height) - (height * params.jarHeight/2), thickness, height * params.jarHeight, properties);

    // bottom
    const bottom = Bodies.rectangle(width * 0.5, height - 5, width * params.jarWidth, thickness, properties);

    return [leftWall, rightWall, bottom];
}

const btn = document.getElementById("revealBtn");

function countBeansInJar(world) {
    return world.bodies.filter((body) => body.label === "inJar").length;
}

btn.addEventListener("click", function(event) {
    btn.innerHTML = countBeansInJar(engine.world);
})

function resetRevealButton(button) {
    button.innerHTML = "Reveal";
}


function reset() {
    const newParams = randomizeParams();
    const newEngine = initializeWorld("board", "canvas");
    const newJar = makeJar(newParams);
    const newBeans = createBeanGenerator(newParams, physicsParams, x0, colorPal);

    return { newParams, newEngine, newBeans, newJar };
}

function handleReset() {
    resetRevealButton(btn);
    Composite.clear(engine.world);
    
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    
    const { newParams, newEngine, newBeans, newJar } = reset();
    params = newParams;
    engine = newEngine;
    Composite.add(engine.world, newJar)
    generateBean = newBeans;
    addBeansToWorld(engine.world, generateBean, params);
}