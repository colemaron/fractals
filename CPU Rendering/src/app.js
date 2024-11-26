const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d", {
	willReadFrequently: true,
});

// zoom rendering

const box = document.getElementById("box");

let rendering = false;

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
let offsetX = -0.5, offsetY = 0;

// resize canvas

function resize() {
	const save = ctx.getImageData(0, 0, canvas.width, canvas.height);

	canvas.width = window.innerWidth * fidelity;
	canvas.height = window.innerHeight * fidelity;

	ctx.putImageData(save, 0, 0);
}

window.onresize = resize;

resize();

// mouse move for zoom

let mouseX = 0;
let mouseY = 0;

function updateBox(event) {
	if (event) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	if (!rendering) {
		box.style.left = mouseX + "px";
		box.style.top = mouseY + "px";

		box.style.width = window.innerWidth / zoomStep + "px";
		box.style.height = window.innerHeight / zoomStep + "px";

		box.style.backgroundColor = "transparent";
	} else {
		box.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
	}
}

canvas.addEventListener("mousemove", updateBox);

// worker function

function createWorker(start, end) {
	const worker = new Worker("src/mandelbrot.js");
	workers.push(worker);

	worker.postMessage({
		width: canvas.width,
		height: canvas.height,
		start,
		end,
		zoom,
		offsetX,
		offsetY,
		maxIterations
	});

	worker.onmessage = event => {
		const image = ctx.createImageData(canvas.width, end - start);

		event.data.forEach(({ x, y, color }) => {
			const i = (y * canvas.width + x) * 4;

			image.data[i + 0] = color[0];
			image.data[i + 1] = color[1];
			image.data[i + 2] = color[2];
			image.data[i + 3] = color[3];
		});

		ctx.putImageData(image, 0, start);

		completedCount++;

		if (completedCount == workerCount) {
			completedCount = 0;

			rendering = false;

			updateBox();
		}

		worker.terminate();
	}
}

// dispatch threads

function render() {
	rendering = true;

	workers.forEach(worker => {
		worker.terminate();
		completedCount = 0;
		rendering = false;
	})

	const size = Math.ceil(canvas.height / workerCount);

	for (let i = 0; i < workerCount; i++) {
		const start = i * size;
		const end = Math.min((i + 1) * size, canvas.height);
	
		createWorker(start, end);
	}
}

render();

// click zooming

canvas.addEventListener("mousedown", event => {
	if (event.which === 1) {
		const mx = event.clientX / canvas.width * fidelity - 0.5;
		const my = event.clientY / canvas.height * fidelity - 0.5;

		const cx = mx * 2 / zoom + offsetX;
		const cy = my * 2 / zoom + offsetY;

		const dx = cx - offsetX;
		const dy = cy - offsetY;

		offsetX += dx;
		offsetY += dy;

		zoom *= zoomStep;

		render();
		updateBox(event);
	} else if (event.which === 3) {
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