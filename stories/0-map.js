var stories = [];

var degreeToVec3 = function(lat, lon, alt, rad){

	lat = THREE.Math.degToRad(lat);
	lon = THREE.Math.degToRad(lon);

	// rad = np.float64(6378137.0)        # Radius of the Earth (in meters)
    var f = 1.0/298.257223563;  //Flattening factor WGS84 Model
	// alt = rad;
    var cosLat = Math.cos(lat)
    var sinLat = Math.sin(lat)
    var FF     = Math.pow((1.0-f),2);
    var C      = 1/Math.sqrt(Math.pow(cosLat,2) + FF * Math.pow(sinLat,2))
    var S      = C * FF

    var x = (rad * C + alt)*cosLat * Math.cos(lon)
    var y = (rad * C + alt)*cosLat * Math.sin(lon)
    var z = (rad * S + alt)*sinLat

    return new THREE.Vector3(x, y, z);
}

var createTexture = function(){

	//use canvas object for shape
	var _canvas = document.createElement('canvas');
	var _context = _canvas.getContext('2d');

	//square dimensions
	_context.canvas.width = 32;
	_context.canvas.height = 32;

	//draw circle
	_context.fillStyle = 'rgba(165,165,175,0.3)';
	_context.beginPath();
	_context.arc(16,16,12,0,2*Math.PI);
	_context.fill();

	//create texture
	var texture = new THREE.Texture(_canvas);
	texture.needsUpdate = true;

	return texture;

};

var createLabel = function(text){

	var fontface = 'Helvetica neue';
	var fontsize = 18 * window.devicePixelRatio;
	var paddingTop = 5 * window.devicePixelRatio;
	var paddingLeft = 10 * window.devicePixelRatio;
	// var spriteAlignment = THREE.SpriteAlignment.topLeft;

	var canvas = document.createElement('canvas');
	canvas.width = 256 * window.devicePixelRatio;
	canvas.height = 256 * window.devicePixelRatio;

	var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;

	// get size data (height depends only on font size)
	var metrics = context.measureText( text );
	var textWidth = metrics.width;
	var textHeight = fontsize * 1.4;

	var left = canvas.width / 2 - textWidth / 2 - paddingLeft;
	var top = canvas.height / 2 - textHeight / 2 - paddingTop;

	// background color
	context.fillStyle = "black";
	context.fillRect(left, top,textWidth + paddingLeft * 2,textHeight + paddingTop * 2);

	// text
	context.fillStyle = "white";
	context.fillText( text, left + paddingLeft, canvas.height/2 + paddingTop);

	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas)
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial({ map: texture, color: 0xffffff });
	var sprite = new THREE.Sprite( spriteMaterial );
	var ratio = 0.05;
	sprite.scale.set( 256 * ratio, 256 * ratio, 256 * ratio );
	sprite.needsUpdate = true;


	sprite.frustumCulled = false;

	return sprite;

};

stories[0] = function(world){

	var worldSize = 25;

	//create camera and scene
	var scene = new THREE.Scene();
	var camera = world.camera.clone();

	//center
	var center = new THREE.Vector3(0,0,-200);

	//logo
	var loader = new THREE.TextureLoader();
	loader.load(
		'logo.png',
		function ( texture ) {

			// do something with the texture
			var material = new THREE.MeshBasicMaterial( {
				map: texture
			});

			var logoMat = new THREE.SpriteMaterial( { map: texture} );
			var logo = new THREE.Sprite( logoMat );

			//do scaling
			var ratio = 555/69;
			var scale = 5;
			logo.scale.set(scale * ratio, scale, scale);
			logo.frustumCulled = false;
			logo.needsUpdate = true;

			scene.add(logo);
		}
	);

	//do appropiate action for all persons
	world.persons.forEach(function(person){

		var data = person.data;

		//do positioning
		var position = degreeToVec3(data.lat, data.lon, worldSize, worldSize);
		person.object.position.copy(position);

		//create label
		var position = degreeToVec3(data.lat, data.lon, worldSize + 3, worldSize);
		person.label = createLabel(data.name);
		person.label.position.copy(position);

		scene.add(person.object);
		scene.add(person.label);

	});

	var cloud;

	//road airports
	d3
		.csv('data/airport-locations.csv')
		.row(function(d) {
			d.latitude = parseFloat(d.latitude);
			d.longitude = parseFloat(d.longitude);
			d.altitude = parseFloat(d.altitude);
			return d;
		})
    	.get(function(error, rows) {

			//create cloud of airports
			var size = rows.length;
			var geometry = new THREE.BufferGeometry();
			var pos = new Float32Array(size * 3);
			for (var i = 0 ; i < rows.length; i++){

					var airport = rows[i];
					var position = degreeToVec3( airport.latitude, airport.longitude, worldSize - Math.random(), worldSize );
					// position.add(center);

					pos[3 * i]   = position.x;
					pos[3 * i+1] = position.y;
					pos[3 * i+2] = position.z;

			}
			geometry.addAttribute('position', new THREE.BufferAttribute(pos, 3));

			//create material
			var pointMaterial = new THREE.PointsMaterial({
				// 'color': new THREE.Color(0.5,0.5,0.5),
				'size': 0.5,
				'sizeAttenuation': true,
				'map': createTexture()
			});

			//make sure points have transparancy
			pointMaterial.alphaTest = 0.1;

			//create 3d object for cloud
			cloud = new THREE.Points(geometry, pointMaterial);
			cloud.frustumCulled = false;
			scene.add(cloud);

		});

	controls = new THREE.OrbitControls( world.camera, world.renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.2;
	controls.rotateSpeed = 0.2;
	controls.autoRotate = true;
	controls.autoRotateSpeed = -0.1;
	controls.target.copy(center);

	// camera.position.z = 100;

	scene.position.copy(center);
	scene.rotation.x -= Math.PI/2;
	scene.rotation.y = Math.PI/6;

	world.renderManager
		.pipe('controls-0', controls.update.bind(controls));

	//on delete
	return{

		scene: scene,
		delete: function(){

			//remove elements from scene
			scene.remove(cloud);

			//remove controls
			world.renderManager.remove('controls-0');

			//transfer position of persons to world pos
			world.persons.map(function(person){

				var pos = person.object.position.clone();
				person.object._prevPos = scene.localToWorld(pos);

			});

			//clear memory
			controls.dispose();
			cloud.geometry.dispose();
			cloud.material.dispose();

			// world.camera = camera;

			cloud = undefined;
			scene = undefined;
			// camera = undefined;
			controls = undefined;

		}

	};

};
