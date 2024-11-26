import { Utils } from "./utils.js"

// get GPU

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

// configure canvas

const format = navigator.gpu.getPreferredCanvasFormat()
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("webgpu");

ctx.configure({
	device,
	format,
	alphaMode: "opaque",
})

// screen x | screen y | offset x | offset y | scale | iterations

const uniforms = device.createBuffer({
	size: 24,
	usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
})

// create render pipeline

const pipeline = device.createRenderPipeline({
	layout: "auto",
	vertex: {
		module: await Utils.getShaderModule(device, "shader"),
		entryPoint: "vs_main",
	},
	fragment: {
		module: await Utils.getShaderModule(device, "shader"),
		entryPoint: "fs_main",
		targets: [{ format }],
	},
	primitive: {
		topology: "triangle-strip",
		cullMode: "back"
	}
});

// create bind group

const bindGroup = device.createBindGroup({
	layout: pipeline.getBindGroupLayout(0),
	entries: [
		{ binding: 0, resource: { buffer: uniforms } },
	],
})

// main loop

function main() {
	const commandEncoder = device.createCommandEncoder();

	// render pass

	const renderPass = commandEncoder.beginRenderPass({
		colorAttachments: [
			{
				view: ctx.getCurrentTexture().createView(),
				clearValue: { r: 1.0, g: 0.0, b: 1.0, a: 1.0 },
				loadOp: "clear",
				storeOp: "store",
			},
		],
	})

	renderPass.setPipeline(pipeline);
	renderPass.setBindGroup(0, bindGroup);
	renderPass.draw(4, 1, 0, 0);
	renderPass.end();

	// send commands

	device.queue.submit([commandEncoder.finish()]);

	// loop

	window.requestAnimationFrame(main);
}

window.requestAnimationFrame(main);

// lerp function

function lerp(a, b, t) {
    return a + (b - a) * t;
}

// update uniforms

const info = document.getElementById("info");

const iterations = document.getElementById("iterations");
const offset = document.getElementById("offset");
const zoom = document.getElementById("zoom");

let offsetX = 0;
let offsetY = 0;
let lerpOffsetX = offsetX;
let lerpOffsetY = offsetY;

let scale = 1;
let lerpScale = scale;

function updateUniforms() {
	const array = new Float32Array([
		canvas.width,
		canvas.height,
		offsetX,
		offsetY,
		iterations.value,
		scale,
	])

	iterations.nextElementSibling.textContent = iterations.value;
	offset.textContent = `x: ${offsetX.toFixed(4)}, y: ${offsetY.toFixed(4)}`
	zoom.textContent = scale.toPrecision(2);

	device.queue.writeBuffer(uniforms, 0, array);
}

// zooming

const zoomSpeed = 1.35;

document.addEventListener("wheel", event => {
	const delta = Math.sign(event.deltaY);

	delta > 0 ? lerpScale *= zoomSpeed : lerpScale /= zoomSpeed;
})

// dragging

let lastX = 0;
let lastY = 0;

canvas.addEventListener("mousemove", event => {
	const down = event.buttons & 1 === 1;

	const dx = (event.clientX - lastX) * scale * 2;
	const dy = (event.clientY - lastY) * scale * 2;

	if (down) {
		lerpOffsetX -= dx / canvas.width * (canvas.width / canvas.height);
		lerpOffsetY -= dy / canvas.height;
	}

	lastX = event.clientX;
	lastY = event.clientY;
})

// keys

const keys = new Set();

document.addEventListener("keydown", (event) => {
	keys.add(event.key);

	if (event.key == "r") {
		lerpScale = 1;

		lerpOffsetX = 0;
		lerpOffsetY = 0;
	} else if (event.key == "h") {
		info.classList.toggle("disabled");
	}
});

document.addEventListener("keyup", (event) => {
	keys.delete(event.key);
});

// resize

function resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

window.onresize = resize;

resize();

// update all

let lastTime = window.performance.now() / 1000;

function update() {
	// get dt
	
	const now = window.performance.now() / 1000;
	const dt = now - lastTime;
	lastTime = now;

	// constant keys

	const zoomDelta = zoomSpeed * dt;
		
	if (keys.has("w")) {
		lerpOffsetY -= scale * dt;
	}
	if (keys.has("a")) {
		lerpOffsetX -= scale * dt;
	}
	if (keys.has("s")) {
		lerpOffsetY += scale * dt;
	}
	if (keys.has("d")) {
		lerpOffsetX += scale * dt;
	}
	if (keys.has("e")) {
		lerpScale /= (1 + zoomDelta);
	}
	if (keys.has("q")) {
		lerpScale *= (1 + zoomDelta);
	}

	// lerp scale

	scale = lerp(scale, lerpScale, dt * 10);

	offsetX = lerp(offsetX, lerpOffsetX, dt * 25);
	offsetY = lerp(offsetY, lerpOffsetY, dt * 25);

	// update

	updateUniforms();

	// loop

	window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);