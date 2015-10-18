THREE.CopyShader = {

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D texData;",
		"varying vec2 vUv;",

		"void main() {",

			"gl_FragColor = texture2D( texData, vUv );",

		"}"

	].join("\n")

};
