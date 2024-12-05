import { Vec2 } from "./vector.js"

self.onmessage = event => {
	const { size, start, end, zoom, offset, maxIterations } = event.data;

	// get constants

	const ratio = size.x / size.y;
	const scale = 2 / zoom;
	const twoScale = scale / 2;

	// create pixel array

	const height = end - start;
	const pixels = new Uint8ClampedArray(size.x * height * 4);

	// run per pixel in region

	for (let y = start; y < end; y++) {
		for (let x = 0; x < size.x; x++) {

			// get complex coordinate

			const c = new Vec2(
				x / size.x * scale - twoScale + offset.x,
				y / size.y * scale - twoScale + offset.y
			);

			// iterate

			let z = new Vec2();
			let i = 0;

			while (z.x * z.x + z.y * z.y < 4 && i < maxIterations) {
				z.replace(
					z.x * z.x - z.y * z.y + c.x,
					2 * z.x * z.y + c.y
				);

				i++;
			}

			// apply color based on iterations

			const m = i == maxIterations ? 0 : 255;
			const t = i / 10;

			const color = [
				Math.sin(t + 4) * m,
				Math.sin(t + 5) * m,
				Math.sin(t + 6) * m,
				255,
			];

			// set pixel color

			const flatPixelIndex = ((y - start) * size.x + x) * 4;

			pixels.set(color, flatPixelIndex);
		}
	}

	// create and send image with pixel data

	const image = new ImageData(pixels, size.x, height);

	postMessage(image);
}