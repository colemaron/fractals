self.onmessage = event => {
	const { width, height, start, end, zoom, offsetX, offsetY, maxIterations } = event.data;
	const result = [];

	const scale = 2 / zoom;
	const ratio = width / height;

	for (let y = 0; y < end - start; y++) {
		for (let x = 0; x < width; x++) {

			// get complex coordinate

			const cx = (x / width) * scale - (scale / 2) + offsetX;
			const cy = ((y + start) / height) * scale - (scale / 2) + offsetY;

			// get iterations

			let zx = 0;
			let zy = 0;

			let i = 0;

			while (zx * zx + zy * zy < 4 && i < maxIterations) {
				const x2 = zx * zx - zy * zy + cx * ratio;
				zy = 2 * zx * zy + cy;
				zx = x2;

				i++;
			}

			// apply color

			const m = i == maxIterations ? 0 : 255;
			const t = i / 10;

			const r = Math.sin(t + 1) * m;
			const g = Math.sin(t + 2) * m;
			const b = Math.sin(t + 3.2) * m;

			const color = [r, g, b, 255];
			
			result.push({ x, y, color });
		}
	}

	postMessage(result);
}