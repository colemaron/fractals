import { Vec2 } from "./vector.js"

self.onmessage = event => {
	const { size, start, end, zoom, offset, maxIterations } = event.data;

	// get constants

	const scale = 2 / zoom;
	const twoScale = scale / 2;

	const ratio = size.x / size.y;

	// create pixel array

	const height = end - start;
	const pixels = new Uint8ClampedArray(size.x * height * 4);

	// initialize

	const c = new Vec2();
	const z = new Vec2();

	// run per pixel in region

	for (let y = start; y < end; y++) {
		const indexY = y - start;

		for (let x = 0; x < size.x; x++) {

			// get complex coordinate

			c.replace(
				x / size.x * scale - twoScale + offset.x,
				y / size.y * scale - twoScale + offset.y
			);

			c.x *= ratio;

			// iterate

			z.zero();

			let i = 0;

			while (z.x * z.x + z.y * z.y < 4 && i < maxIterations) {
				z.replace(
					z.x * z.x - z.y * z.y + c.x,
					2 * z.x * z.y + c.y
				);

				i++;
			}

			// apply color based on iterations

			const t = i / 10;
			const j = (indexY * size.x + x) * 4;

			pixels[j + 0] = Math.sin(t + 4) * 255;
			pixels[j + 1] = Math.sin(t + 5) * 255;
			pixels[j + 2] = Math.sin(t + 6) * 255;
			pixels[j + 3] = i == maxIterations ? 0 : 255;
		}
	}

	// create and send image with pixel data

	const image = new ImageData(pixels, size.x, height);

	postMessage(image);
}