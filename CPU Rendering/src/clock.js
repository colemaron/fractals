class Clock {
	#entries = {};
	
	constructor() {}

	// get now

	get now() {
		return window.performance.now() / 1000;
	}

	// start new measure

	start(name) {
		const entries = this.#entries;

		if (name in entries) {

			// update existing entry

			entries[name].start = this.now;
		} else {

			// create new entry

			this.#entries[name] = {
				start: this.now,
				times: [],
	
				measures: 0,
				total: 0,
				average: 0,

				duration: 0,
			};
		}
	}

	// stop and return measure

	stop(name) {
		const entry = this.#entries[name];

		// update entry

		entry.measures++;
		entry.duration = this.now - entry.start;

		entry.total += entry.duration;
		entry.average = entry.total / entry.measures;

		return entry;
	}
}

export { Clock };