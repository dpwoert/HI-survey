var createPerson = function(data){

	//create THREE object
	var geometry = new THREE.IcosahedronGeometry( 1, 2 );
	var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	var mesh = new THREE.Mesh( geometry, material );

	return {
		object: mesh,
		data: data
	};
};

var World = function(){

	var width = window.innerWidth;
	var height = window.innerHeight;

	this.renderer = new THREE.WebGLRenderer( { antialias: true } );
	this.renderer.setClearColor( 0x000000, 1 );
	this.renderer.setSize(width, height);

	//add DOM element
	var canvas = document.getElementById('canvas');
	canvas.appendChild( this.renderer.domElement );

	//setup scene
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
	this.camera.position.setZ(-75);

	//render manager to add abbility to play and add FX
	this.renderManager = new THREE.renderPipeline(this.renderer);

	//tilt shift effect
	var tiltV = new THREE.ShaderStep(width, height);
	var tiltH = new THREE.ShaderStep(width, height);
	var copy = new THREE.ShaderStep(width, height);

	var pos = 0.3;
	var blur = 50;
	var spread = 30;

	tiltV
		.pipe()
		.setting('v', 'f', blur / height)
		.setting('r', 'f', pos)
		.setting('spread', 'f', spread)
		.shader('vertex', THREE.HorizontalTiltShiftShader.vertexShader)
		.shader('fragment', THREE.HorizontalTiltShiftShader.fragmentShader)

	tiltH
		.pipe()
		.setting('h', 'f', blur / width)
		.setting('r', 'f', pos)
		.setting('spread', 'f', spread)
		.shader('vertex', THREE.VerticalTiltShiftShader.vertexShader)
		.shader('fragment', THREE.VerticalTiltShiftShader.fragmentShader)

	copy
		.pipe()
		.shader('vertex', THREE.CopyShader.vertexShader)
		.shader('fragment', THREE.CopyShader.fragmentShader)
		.renderToScreen(true);

	//create list of all persons
	this.persons = [];

	var self = this;

	//load data
	d3
		.csv('data/hyper-data-2.csv')
		.row(function(d) {
			d.lat = parseFloat(d.lat);
			d.lon = parseFloat(d.lon);

			d.lat = isNaN(d.lat) || d.lat === 0 ? 53.480759 : d.lat;
			d.lon = isNaN(d.lon) || d.lon === 0 ? -2.242631 : d.lon;

			return d;
		})
    	.get(function(error, rows) {

			self.questions = rows[0];

			for( var i = 0 ; i < rows.length ; i++ ){

				var person = rows[i];

				if(person.lat && person.lon && i > 2){
					self.persons.push( createPerson(person) );
				}

			}

			//load first story
			story = stories[0](self);
			self.prevStory = 0;

			//create renderpass
			var renderPass = new THREE.RenderStep(width, height, story.scene, self.camera);

			var current = 0;

			//load next story on spacebar
			document.body.onkeyup = function(e){

				if(e.keyCode === 32 || e.keyCode === 39){


					story.delete();
					story = stories[1](self, current);
					self.prevStory = 1;

					renderPass.replace(story.scene, self.camera);

					current++;

					if(current > 71){
						current = 0;
					}

				}

			};

			//make pipeline
			self.renderManager
				.pipe('main', renderPass)
				.pipe('tilt-h', tiltH)
				.pipe('tilt-v', tiltV)
				.pipe('copy', copy)
				.start();

		});

};

var startParticles = function(){
	new World();
};

document.addEventListener("DOMContentLoaded", startParticles);
