var lerp = function(from, to, progress){
	var delta = to - from;
	return from + (delta*progress);
};

var lerp3d = function(from, to, progress){
	return new THREE.Vector3(
		lerp(from.x, to.x, progress),
		lerp(from.y, to.y, progress),
		lerp(from.z, to.z, progress)
	);
};

var matchOrder = [
	{ key: '0', 'type': 'simple' },
	{ key: '1', 'type': 'simple' },
	{ key: '2', 'type': 'simple' },
	{ key: '3', 'type': 'simple' },
	{ key: '4', 'type': 'simple' },
	{ key: '5', 'type': 'simple' },
	{ key: '6', 'type': 'simple' },
	{ key: '7', 'type': 'simple' },
	{ key: '8', 'type': 'simple' },
	{ key: '9', 'type': 'simple' },
	{ key: '10', 'type': 'simple' },
	{ key: '11', 'type': 'simple' },
	{ key: '12', 'type': 'simple' },
	{ key: '13', 'type': 'simple' },
	{ key: '14', 'type': 'simple' },
	{ key: '15', 'type': 'simple' },
	{ key: '16', 'type': 'simple' },
	{ key: '17', 'type': 'simple' },
	{ key: '18', 'type': 'simple' },
	{ key: '19', 'type': 'simple' },
	{ key: '20', 'type': 'simple' },
	{ key: '21', 'type': 'simple' },
	{ key: '22', 'type': 'simple' },
	{ key: '23', 'type': 'simple' },
	{ key: '24', 'type': 'simple' },
	{ key: '25', 'type': 'simple' },
	{ key: '26', 'type': 'simple' },
	{ key: '27', 'type': 'simple' },
	{ key: '28', 'type': 'simple' },
	{ key: '29', 'type': 'simple' },
	{ key: '30', 'type': 'simple' },
	{ key: '31', 'type': 'simple' },
	{ key: '32', 'type': 'simple' },
	{ key: '33', 'type': 'simple' },
	{ key: '34', 'type': 'simple' },
	{ key: '35', 'type': 'simple' },
	{ key: '36', 'type': 'number' },
	{ key: '37', 'type': 'simple' },
	{ key: '38', 'type': 'simple' },
	{ key: '39', 'type': 'simple' },
	{ key: '40', 'type': 'simple' },
	{ key: '41', 'type': 'simple' },
	{ key: '42', 'type': 'simple' },
	{ key: '43', 'type': 'simple' },
	{ key: '44', 'type': 'simple' },
	{ key: '45', 'type': 'simple' },
	{ key: '46', 'type': 'simple' },
	{ key: '47', 'type': 'simple' },
	{ key: '48', 'type': 'number' },
	{ key: '49', 'type': 'number' },
	{ key: '50', 'type': 'number' },
	{ key: '51', 'type': 'number' },
	{ key: '52', 'type': 'number' },
	{ key: '53', 'type': 'simple' },
	{ key: '54', 'type': 'simple' },
	{ key: '55', 'type': 'simple' },
	{ key: '56', 'type': 'simple' },
	{ key: '57', 'type': 'simple' },
	{ key: '58', 'type': 'simple' },
	{ key: '59', 'type': 'simple' },
	{ key: '60', 'type': 'simple' },
	{ key: '61', 'type': 'simple' },
	{ key: '62', 'type': 'simple' },
	{ key: '63', 'type': 'simple' },
	{ key: '64', 'type': 'simple' },
	{ key: '65', 'type': 'simple' },
	{ key: '66', 'type': 'simple' },
	{ key: '67', 'type': 'simple' },
	{ key: '68', 'type': 'number' },
	{ key: '69', 'type': 'number' },
	{ key: '70', 'type': 'number' },
	{ key: '71', 'type': 'number' }
];

var duplicateList = {};

// var lineMaterial = new THREE.LineBasicMaterial({
// 	color: 0xffffff,
// 	linewidth: 3,
// 	opacity: 0.7,
// 	transparent: true
// });

var lineMaterial = new THREE.MeshLineMaterial({
	color: new THREE.Color(1,1,1),
	lineWidth: 0.02,
	opacity: 0.2,
	transparent: true,
	resolution: new THREE.Vector2( window.innerWidth, window.innerHeight )
});

var createLink = function(from, to, world, width){

	if(!from || !to){
		return false;
	}

	var centerPoint = lerp3d(from, to, 0.5);
	var middle = new THREE.Vector3(0,0,from.x);

 	middle = new THREE.Vector3(0, 0.9, 0.5);
	middle = middle.unproject( world.camera );

	centerPoint = lerp3d(centerPoint, middle, 0.5);

	var curve = new THREE.QuadraticBezierCurve3(from.clone(), centerPoint, to.clone());
	var points = curve.getPoints(30);

	var geometry = new THREE.Geometry();
	geometry.vertices = points;
	geometry.verticesNeedUpdate = true;
	geometry.lineDistancesNeedUpdate = true;

	material = lineMaterial;

	if(width){
		material = lineMaterial.clone();
		material.linewidth = width;
	}

	//create line
	var line = new THREE.MeshLine();
	line.setGeometry( geometry );

	return new THREE.Mesh( line.geometry, material );;

}

var findMatches = function(step, person, world, scene){

	var q = matchOrder[step];
	var toUse = q.key;
	var type = q.type;
	var my = person.data[toUse];

	world.persons.forEach(function(_person){

		var data = _person.data;
		var his = data[toUse];

		if(type === 'simple' && his === my && data.name !== person.data.name && my !== ''){
			var mesh = createLink(person.object.position, _person.object.position, world);
			scene.add(mesh);
		}

		if(type === 'number' && Math.abs(his - my) < 3 && data.name !== person.data.name){

			var dist = Math.abs(his - my);
			var width = 3;

			switch(dist){
				case 1: width = 2; break;
				case 2: width = 0.7; break;
				case 3: width = 0.1; break;
			}

			var mesh = createLink(person.object.position, _person.object.position, world, width);
			scene.add(mesh);
		}

	})

	//show question
	var question = document.getElementById('question')
	question.innerText = world.questions[toUse];

}

stories[1] = function(world, step){

	// create camera and scene
	var scene = new THREE.Scene();

	var nrPersons = world.persons.length - 1;

	var left = -window.innerWidth / 2;
	var right = window.innerWidth / 2;
	var center = window.innerHeight / 2;

	left = new THREE.Vector3(-0.8, 0.7, 0.5);
	left = left.unproject( world.camera );

	right = new THREE.Vector3(0.8, 0.7, 0.5);
	right = right.unproject( world.camera );

	var bottomLeft = new THREE.Vector3(-0.8,-1.2, 0.5);
	bottomLeft = bottomLeft.unproject( world.camera );

	var bottomRight = new THREE.Vector3(0.8,-1.2, 0.5);
	bottomRight = bottomRight.unproject( world.camera );

	var curve = new THREE.CubicBezierCurve3(left, bottomLeft, bottomRight, right);
	var points = curve.getPoints(nrPersons);

	world.persons.forEach(function(person, index){

		var fromPos = person.object._prevPos.clone();
		var toPos = points[index].clone();

		//add to scene
		scene.add(person.object);
		scene.add(person.label);

		if(world.prevStory === 0){

			var anim = new Tweenable();
			var anim2 = new Tweenable();
			var anim4 = new Tweenable();

			anim.tween({

				from: fromPos.clone(),
				to: toPos.clone(),
				duration: 1000,
				easing: 'easeOutQuint',
				step: function (state) {
					person.object.position.set(state.x, state.y, state.z);
					person.label.position.set(state.x, state.y - 0.2, state.z + 0.1);
				},
				finish: function () {

					// console.log('finished', person.object);

				}

			});

			anim2.tween({

				from: person.object.scale.clone(),
				to: person.object.scale.clone().set(0.05,0.05,0.05),
				duration: 1000,
				easing: 'easeOutQuint',
				step: function (state) {
					person.object.scale.set(state.x, state.y, state.z);
				},
				finish: function () {

					findMatches(step, person, world, scene);

				}

			});

			anim4.tween({

				from: person.label.scale.clone(),
				to: person.label.scale.clone().set(1, 1, 1),
				duration: 1000,
				easing: 'easeOutQuint',
				step: function (state) {
					person.label.scale.set(state.x, state.y, state.z);
				}

			});

			var anim3 = new Tweenable();

			anim3.tween({

				from: 0,
				to: 0.7,
				duration: 5000,
				delay: 1000,
				easing: 'easeOutQuint',
				step: function (state) {
					lineMaterial.opacity = state;
				}

			});

		} else {

			findMatches(step, person, world, scene);

		}

	})

	return {

		scene: scene,
		delete: function(){

			world.persons.map(function(person){

				var pos = person.object.position.clone();
				person.object._prevPos = pos;

			});

			scene.children.forEach(function(item){
				scene.remove(item);
				item.geometry.dispose();
			});

			scene = undefined;

		}

	}

}
