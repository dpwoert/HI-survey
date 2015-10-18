var createPerson = function(data){

	//create THREE object
	var geometry = new THREE.SphereGeometry( 1, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
	var mesh = new THREE.Mesh( geometry, material );

	return {
		object: mesh,
		data: data
	};
};

var startParticles = function(){

	var width = window.innerWidth;
	var height = window.innerHeight;

	var renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( 0x000000, 1 );
	renderer.setSize(width, height);

	//add DOM element
	var canvas = document.getElementById('canvas');
	canvas.appendChild( renderer.domElement );

	//setup scene
	var scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );

	//render manager to add abbility to play and add FX
	var renderManager = new THREE.renderPipeline(renderer);

	//tilt shift effect
	var tiltV = new THREE.ShaderStep(width, height);
	var tiltH = new THREE.ShaderStep(width, height);
	var copy = new THREE.ShaderStep(width, height);

	var pos = 0.5;

	tiltV
		.pipe()
		.shader('vertex', THREE.HorizontalTiltShiftShader.vertexShader)
		.shader('fragment', THREE.HorizontalTiltShiftShader.fragmentShader)
		.setting('v', 'f', 1 / height)
		.setting('r', 'f', pos)
		.setting('spread', 'f', 10)

	tiltH
		.pipe()
		.shader('vertex', THREE.VerticalTiltShiftShader.vertexShader)
		.shader('fragment', THREE.VerticalTiltShiftShader.fragmentShader)
		.setting('h', 'f', 1 / width)
		.setting('r', 'f', pos)
		.setting('spread', 'f', 10)

	copy
		.pipe()
		.shader('vertex', THREE.CopyShader.vertexShader)
		.shader('fragment', THREE.CopyShader.fragmentShader)
		.renderToScreen();

	//create list of all persons
	var persons = [];

	//load data
	d3
		.csv('data/hyper.csv')
		.row(function(d) {
			d.lat = parseFloat(d.lat);
			d.lon = parseFloat(d.lon);
			return d;
		})
    	.get(function(error, rows) {

			for( var i = 0 ; i < rows.length ; i++ ){

				var person = rows[i];

				if(person.lat && person.lon){
					persons.push( createPerson(person) );
				}

			}

			//load first story
			scene = stories[0](persons, camera, renderManager, renderer);

			//create renderpass
			var renderPass = new THREE.RenderStep(width, height, scene, camera);

			//make pipeline
			renderManager
				// .pipe('init', function(){
				// 	renderer.render( scene, camera );
				// })
				.pipe('main', renderPass)
				.pipe('tilt-v', tiltV)
				.pipe('tilt-h', tiltH)
				.pipe('copy', copy)
				.start();

		});

};

document.addEventListener("DOMContentLoaded", startParticles);
