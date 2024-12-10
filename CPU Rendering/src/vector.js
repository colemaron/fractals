class Vec2 {
	// constructors

	constructor(x, y) {
		this.x = x; this.y = y;
	}

	static zero()  { return new Vec2( 0,  0); }
	static one()   { return new Vec2( 1,  1); }

	static up()    { return new Vec2( 0,  1); }
	static down()  { return new Vec2( 0, -1); }
	static left()  { return new Vec2(-1,  0); }
	static right() { return new Vec2( 1,  0); }

	static fromPolar(r, theta) {
		return new Vec2(
			r * Math.cos(theta),
			r * Math.sin(theta)
		)
	}

	// reverse constructors

	toPolar() {
		const r = Math.hypot(this.x, this.y);
		const theta = Math.atan2(this.y, this.x);

		return { r, theta };
	}

	// operations

	static add(v1, v2) {
		return new Vec2(v1.x + v2.x, v1.y + v2.y);
	}

	static sub(v1, v2) {
		return new Vec2(v1.x - v2.x, v1.y - v2.y);
	}

	static mul(v, i) {
		return new Vec2(v.x * i, v.y * i);
	}

	static div(v, i) {
		return new Vec2(v.x / i, v.y / i);
	}


	// methods

	add(v) {
		this.x += v.x; this.y += v.y;

		return this;
	}

	sub(v) {
		this.x -= v.x; this.y -= v.y;

		return this;
	}

	mul(i) {
		this.x *= i; this.y *= i;

		return this;
	}

	div(i) {
		this.x /= i; this.y /= i;

		return this;
	}

	dot(v) {
		return (this.x * v.x) + (this.y * v.y);
	}

	cross(v) {
		return this.x * v.y - this.y * v.x;
	}

	equals(v) {
		return this.x === v.x && this.y === v.y;
	}

	// swap components

	replace(x, y) {
		this.x = x; this.y = y;
	}

	zero() {
		this.x = 0; this.y = 0;
	}

	// attributes

	get magnitude() {
		return Math.hypot(this.x, this.y);
	}

	get magnitudeSquared() {
		return this.x * this.x + this.y * this.y;
	}

	get unit() {
		return Vec2.div(this, this.magnitude);
	}

	// to string override

	toString() {
		return `x: ${this.x} y: ${this.y}`
	}
}

class Vec3 {
	// constructors

	constructor(x , y , z ) {
		this.x = x; this.y = y; this.z = z;
	}
	
	static zero()     { return new Vec3( 0,  0,  0); }
	static one()      { return new Vec3( 1,  1,  1); }

	static up()       { return new Vec3( 0,  1,  0); }
	static down()     { return new Vec3( 0, -1,  0); }
	static left()     { return new Vec3(-1,  0,  0); }
	static right()    { return new Vec3( 1,  0,  0); }
	static forward()  { return new Vec3( 0,  0,  1); }
	static backward() { return new Vec3( 0,  0, -1); }

	static fromSpherical(r, theta, phi) {
		return new Vec3(
			r * Math.sin(theta) * Math.cos(phi),
			r * Math.sin(theta) * Math.sin(phi),
			r * Math.cos(theta)
		)
	}
	
	// reverse constructors

	toSpherical() {
		const r = Math.hypot(this.x, this.y, this.z);
		const theta = Math.atan2(this.y, this.x);
		const phi = Math.acos(this.z / r);

		return { r, theta, phi };
	}

	// operations

	static add(v1, v2) {
		return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
	}

	static sub(v1, v2) {
		return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
	}

	static mul(v, i) {
		return new Vec3(v.x * i, v.y * i, v.z * i);
	}

	static div(v, i) {
		return new Vec3(v.x / i, v.y / i, v.z / i);
	}

	// methods

	add(v) {
		this.x += v.x; this.y += v.y; this.z += v.z;

		return this;
	}

	sub(v) {
		this.x -= v.x; this.y -= v.y; this.z -= v.z;

		return this;
	}

	mul(i) {
		this.x *= i; this.y *= i; this.z *= i;

		return this;
	}

	div(i) {
		this.x /= i; this.y /= i; this.z /= i;

		return this;
	}

	dot(v) {
		return (this.x * v.x) + (this.y * v.y) + (this.z * v.z);
	}

	cross(v) {
		return new Vec3(
			this.y * v.z - this.z * v.y,
			this.z * v.x - this.x * v.z,
			this.x * v.y - this.y * v.x
		);
	}

	equals(v) {
		return this.x === v.x && this.y === v.y && this.z === v.z;
	}

	replace(x, y, z) {
		this.x = x; this.y = y; this.z = z;

		return this;
	}

	// attributes

	get magnitude() {
		return Math.hypot(this.x, this.y, this.z);
	}

	get magnitudeSquared() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}
	
	get unit() {
		return Vec3.div(this, this.magnitude);
	}

	// to string override

	toString() {
		return `x: ${this.x} y: ${this.y} z: ${this.z}`
	}
}

export { Vec2, Vec3 };