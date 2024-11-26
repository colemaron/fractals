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

			let x1 = 0;
			let y1 = 0;

			let i = 0;

			while (x1 * x1 + y1 * y1 < 4 && i < maxIterations) {
				const x2 = x1 * x1 - y1 * y1 + cx * ratio;
				y1 = 2 * x1 * y1 + cy;
				x1 = x2;

				++i;
			}

			// apply color

			const terminated = i === maxIterations ? 0 : 1;
			const t = i / maxIterations * maxIterations;

			const color = [t, t / 5, 0, 255];
			
			result.push({ x, y, color });
		}
	}

	postMessage(result);
}