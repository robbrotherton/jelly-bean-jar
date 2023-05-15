// https://codesandbox.io/s/github/rjoxford/MatterJSGaltonBoard
// https://www.tylermw.com/plinko-statistics-insights-from-the-bean-machine/


let width = 500;
let height = 600;
let x0 = width / 2;

// ball properties
// const ballRadius = 8;
let y_start = 0;
let y_peg_start = 50;
// let gap_between_pegs_and_buckets = ballRadius * 2;
let generation_speed = 20;
let nBeans = 250;
let mass = 100;


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
let restitution = 0.5;
let friction = 0.01;
let frictionAir = 0.045;
let frictionStatic = 0;
let density = 1;

let intervalId;


var { Engine, Render, Runner,
    Composite, Composites, Common,
    MouseConstraint, Mouse, Events,
    World, Bodies, Body } = Matter;

let engine, render, runner, world;

let beanRadius, jarWidth, jarHeight, jarCount;

function setParams() {
    jarCount = 0;
    jarWidth = 0.5 + Math.random() * 0.4;
    jarHeight = 0.5 + Math.random() * 0.2;
    beanRadius = jarWidth * 6 + Math.random() * 6;
    nBeans = 500 * jarWidth;
}

function initialize() {
    // create engine
    engine = Engine.create({
        enableSleeping: true
    }),
        world = engine.world;

    // create renderer
    render = Render.create({
        element: document.getElementById("board"),
        canvas: document.getElementById("canvas"),
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

    // create runner
    runner = Runner.create();
    Runner.run(runner, engine);
    render.canvas.addEventListener("mousedown", reset);
}




function makeBeans() {

    let total = nBeans;
    clearInterval(intervalId);

    intervalId = setInterval(() => {
        let balls = [];
        if (total-- > 0) {
            const circle = Bodies.circle(x0 + (-0.5 + Math.random()) * 250, -20, beanRadius + Math.random() * 8, {
                label: "circle",
                friction: 0.001,
                restitution,
                mass,
                slop: 0.05,
                density,
                frictionAir,
                sleepThreshold: 15,
                render: {
                    fillStyle: colorPal[Math.floor(Math.random()*colorPal.length)]
                }
            });

            Events.on(circle, "sleepStart", function () {
                circle.isStatic = true;
                jarCount++;
            });

            Matter.Composite.add(world, circle);
        }
    }, generation_speed);
}

let existingBalls = () => {
    return world.bodies.filter((body) => body.label === "circle");
};

const btn = document.getElementById("revealBtn");
btn.addEventListener("click", function(event) {
    btn.innerHTML = jarCount;
})

function showRevealButton() {
    btn.innerHTML = "Reveal";
}

const makeStaticInterval = setInterval(() => {
    existingBalls().forEach(function (ball) {
        let ballHeight = ball.position.y;
        let ballSpeed = ball.speed;
        let minHeight = 50; // height - (floorHeight + wallHeight);
        if (ballHeight > height) {
            console.log("gonner");
            Composite.remove(world, ball);
        }
        // if (ballHeight > minHeight && ballSpeed < 0.02) {
        //     // ball.render.opacity = 0.5;
        //     Body.setStatic(ball, true);
        //     jarCount++;
        //     console.log(jarCount);
        // }
    });
}, 200);


function makeJar() {

    const thickness = 10;

    // left wall
    Matter.Composite.add(
        world,
        Bodies.rectangle(width * (1 - jarWidth) / 2, (height) - (height * jarHeight/2), thickness, height * jarHeight, {
            isStatic: true,
            render: {
                fillStyle: "#000000",
                visible: true
            },
            chamfer: { radius: [5, 5, 5, 5]}
        })
    );

    // right wall
    Matter.Composite.add(
        world,
        Bodies.rectangle(width * (1 - (1 - jarWidth) / 2), (height) - (height * jarHeight/2), thickness, height * jarHeight, {
            isStatic: true,
            render: {
                fillStyle: "#000000",
                visible: true
            },
            chamfer: { radius: [5, 5, 5, 5]}
        })
    );
    // bottom
    Matter.Composite.add(
        world,
        Bodies.rectangle(width * 0.5, height - 5, width * jarWidth, thickness, {
            isStatic: true,
            render: {
                fillStyle: "#000000",
                visible: true
            },
            chamfer: { radius: [5, 5, 5, 5]}
        })
    );
}


function reset() {
    Composite.clear(world);
    Engine.clear(engine);
    Render.stop(render);
    Runner.stop(runner);
    // render.canvas.remove();
    render.canvas = null;
    render.context = null;
    render.textures = {};
    console.log('reset clicked');

    setParams();
    initialize();
    makeJar();
    makeBeans();
}


//
setParams();
initialize();
makeJar();
makeBeans();

