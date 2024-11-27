import { Vec2 } from "./Vector.js";

// set up canvas

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d", {
	willReadFrequently: true,
});

// zoom rendering

const box = document.getElementById("box");

// constants

let maxIterations = 1000;
let fidelity = 1;

const zoomStepSpeed = 1.25;
let zoomStep = 10;

const workerCount = navigator.hardwareConcurrency;
const workers = [];
let completedCount = 0;

// view

let zoom = 1;
let offset = new Vec2(-1.5437 + 0.75, 0);

// resize canvas

let size = new Vec2();

function resize() {
	const save = ctx.getImageData(0, 0, canvas.width, canvas.height);

	size.x = canvas.width = window.innerWidth * fidelity;
	size.y = canvas.height = window.innerHeight * fidelity;

	ctx.putImageData(save, 0, 0);
}

window.onresize = resize;

resize();

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
		const image = ctx.createImageData(size.x, end - start);

		event.data.forEach(({ x, y, color }) => {
			const i = ((y - start) * size.x + x) * 4;

			image.data[i + 0] = color[0];
			image.data[i + 1] = color[1];
			image.data[i + 2] = color[2];
			image.data[i + 3] = color[3];
		});

		ctx.putImageData(image, 0, start);

		completedCount++;

		if (completedCount == workerCount) {
			completedCount = 0;
			state.textContent = "IDLE";

			updateBox();
		}

		worker.terminate();
	}
}

// dispatch threads

const state = document.getElementById("state");

function render() {
	// reset workers

	workers.forEach(worker => worker.terminate());
	workers.length = 0;
	completedCount = 0;

	// dispatch workers
	
	state.textContent = "RENDERING...";

	const step = Math.ceil(size.y / workerCount);

	for (let y = 0; y < workerCount; y++) {
		const start = y * step;
		const end = Math.min((y + 1) * step, size.y);

		createWorker(start, end);
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
		render();
	}
})

// disable right click

document.addEventListener("contextmenu", function (event) {
	event.preventDefault();
});

// slider values

const info = document.getElementById("info");

const iterations = document.getElementById("iterations");
const resolution = document.getElementById("resolution");

function updateSliders() {
	maxIterations = iterations.value;
	fidelity = resolution.value;

	iterations.nextElementSibling.textContent = iterations.value;
	resolution.nextElementSibling.textContent = resolution.value;

	resize();
}

info.addEventListener("input", updateSliders);

updateSliders();