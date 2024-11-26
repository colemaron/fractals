let shaderPath = "./shaders";

const Utils = {
	setShaderPath: function(path) {
		shaderPath = path;
	},

	getShaderModule: async function(device, name) {
		const response = await fetch(`${shaderPath}/${name}.wgsl`);
		
		return device.createShaderModule({ code: await response.text() });
	},
}

export { Utils };