import { Vec2 } from "./Vector.js"

self.onmessage = event => {
	const { size, start, end, zoom, offset, maxIterations } = event.data;
	const result = [];

	const scale = 2 / zoom;
	const ratio = size.x / size.y;

	for (let y = start; y < end; y++) {
		for (let x = 0; x < size.x; x++) {

			// get complex coordinate

			const c = new Vec2(
				x / size.x * scale - (scale / 2) + offset.x,
				y / size.y * scale - (scale / 2) + offset.y
			)

			// get iterations

			let z = new Vec2();
			let i = 0;

			while (z.magnitudeSquared < 4 && i < maxIterations) {
				z.replace(
					z.x * z.x - z.y * z.y + c.x * ratio,
					2 * z.x * z.y + c.y
				);

				i++;
			}

			// apply color

			const m = i == maxIterations ? 0 : 255;
			const t = i / 25;

			const color = [
				Math.sin(t + 1) * m,
				Math.sin(t + 2) * m,
				Math.sin(t + 3) * m,
				255
			];
			
			result.push({ x, y, color });
		}
	}

	postMessage(result);
}