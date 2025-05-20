import { Clock } from "./clock.js";
import { Vec2 } from "./vector.js";

// elements

const box = document.getElementById("box");
const iterations = document.getElementById("iterations");
const resolution = document.getElementById("resolution");
const threads = document.getElementById("threads");

// initialize

threads.max = navigator.hardwareConcurrency;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d", {
	imageSmoothingEnabled: false,
	willReadFrequently: true,
	alpha: false,
});

const clock = new Clock();

// constants

let maxIterations = iterations.value;
let fidelity = resolution.value;
let workerCount = threads.value;

const zoomStepSpeed = 1.25;
let zoomStep = 10;

const workers = [];
let completedCount = 0;

// view

let zoom = 0.5;
let offset = new Vec2(-0.5, 0);

// resize canvas

let size = new Vec2();

function scale() {
	const save = ctx.getImageData(0, 0, canvas.width, canvas.height);

	canvas.width = size.x;
	canvas.height = size.y;

	ctx.putImageData(save, 0, 0);
}

function resize() {
	size.replace(
		Math.round(window.innerWidth * fidelity),
		Math.round(window.innerHeight * fidelity)
	)
}

window.onresize = resize;

resize();
scale();

// mouse move for zoom

let mouse = new Vec2();

function updateBox(event) {
	if (event) { mouse.replace(event.clientX, event.clientY); }

	box.style.left = mouse.x + "px";
	box.style.top = mouse.y + "px";

	box.style.width = window.innerWidth / zoomStep + "px";
	box.style.height = window.innerHeight / zoomStep + "px";
}

canvas.addEventListener("mousemove", updateBox);

// worker function

function createWorker(start, end) {
	const worker = new Worker("src/mandelbrot.js", { type: "module" });
	workers.push(worker);

	worker.postMessage({
		size,
		start,
		end,
		zoom,
		offset,
		maxIterations
	});

	worker.onmessage = event => {
		ctx.putImageData(event.data, 0, start);
		worker.terminate();

		completedCount++;

		if (completedCount == workerCount) {
			completedCount = 0;
			state.textContent = "IDLE";

			// measure render duration

			const measure = clock.stop("render");

			console.log(measure.average);
		}
	}
}

// dispatch threads

const state = document.getElementById("state");

function render() {
	clock.start("render");

	// reset values

	workers.forEach(worker => worker.terminate());
	workers.length = 0;
	completedCount = 0;

	scale();

	// dispatch workers
	
	state.textContent = "RENDERING...";

	const step = Math.ceil(size.y / workerCount);

	for (let y = 0; y < size.y; y += step) {
		createWorker(
			y,
			Math.min(y + step, size.y)
		);
	}
}

render();

// click zooming

canvas.addEventListener("mousedown", event => {
	if (event.button === 0) {
		let m = new Vec2(
			event.clientX / size.x * fidelity - 0.5,
			event.clientY / size.y * fidelity - 0.5
		).mul(2 / zoom);

		offset = offset.add(m);

		zoom *= zoomStep;

		render();
		updateBox(event);
	} else if (event.button === 2) {
		zoom /= zoomStep;

		render();
		updateBox(event);
	}
})

// change zoom step

canvas.addEventListener("wheel", event => {
	const delta = Math.sign(event.deltaY);
	const scroll = delta > 0 ? 1 / zoomStepSpeed : zoomStepSpeed;

	zoomStep *= scroll;

	updateBox(event);
})

// force re-render

document.addEventListener("keydown", event => {
	if (event.key == "r") {
		render()
	} else if (event.key == "h") {
		info.classList.toggle("disabled");
		box.classList.toggle("disabled");
	}
})

// disable right click

document.addEventListener("contextmenu", function (event) {
	event.preventDefault();
});

// slider values

const info = document.getElementById("info");

function updateSliders() {
	maxIterations = iterations.value;
	fidelity = resolution.value;
	workerCount = threads.value;

	iterations.nextElementSibling.textContent = iterations.value;
	resolution.nextElementSibling.textContent = resolution.value;
	threads.nextElementSibling.textContent = threads.value;

	resize();
}

info.addEventListener("input", updateSliders);

updateSliders();