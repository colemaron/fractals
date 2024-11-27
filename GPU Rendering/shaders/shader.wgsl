struct VertexInput {
	@builtin(vertex_index) index: u32,
}

struct VertexOutput {
	@builtin(position) position: vec4<f32>,
	@location(0) transform: vec2<f32>,
	@location(1) ratio: f32,
}

struct Uniforms {
	screen: vec2<f32>,
	offset: vec2<f32>,
	iterations: f32,
	scale: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

// vertex

var<private> VERTICES: array<vec2<f32>, 4> = array<vec2<f32>, 4>(
	vec2<f32>(-1.0, -1.0),
	vec2<f32>( 1.0, -1.0),
	vec2<f32>(-1.0,  1.0),
	vec2<f32>( 1.0,  1.0),
);

@vertex
fn vs_main(vertex: VertexInput) -> VertexOutput {
	var out: VertexOutput;

	let position = VERTICES[vertex.index];
	let ratio = uniforms.screen.x / uniforms.screen.y;

	out.position = vec4<f32>(position.xy, 0.0, 1.0);
	out.transform = vec2<f32>(uniforms.offset.x, uniforms.offset.y);
	out.ratio = ratio;

	return out;
}

// fragment

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
	let max: f32 = uniforms.iterations;
	let normalized: vec2<f32> = (in.position.xy / uniforms.screen) * 2.0 - 1.0;

	let c: vec2<f32> = normalized * uniforms.scale;
	var z: vec2<f32> = vec2<f32>(0.0, 0.0);

	var i: f32 = 0.0;

	for (; i < max; i += 1.0) {
		z = vec2<f32>(
			z.x * z.x - z.y * z.y + c.x * in.ratio,
			2.0 * z.x * z.y + c.y
		) + in.transform;

		if (z.x * z.x + z.y * z.y > 4.0) {
			break;
		}
	}

	let m = 1 - step(max, i);
	let t = i / 15;

	return vec4<f32>(sin(t + 1) * m, sin(t + 2) * m, sin(t + 3) * m, 1.0);
}