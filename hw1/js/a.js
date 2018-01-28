var container;

var camera, scene, renderer;
var vs, fs;

function init() {

	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 50.0, window.innerWidth / window.innerHeight, 0.1, 10 );
	camera.position.z = 5;

	scene = new THREE.Scene();

	// geometry

	var geometry1 = new THREE.BoxGeometry( 1, 1, 1 );	    
	var geometry2 = new THREE.SphereGeometry( 1, 64, 64 );
	var geometry3 = new THREE.TorusKnotGeometry( 0.5, 0.15, 100, 16 );

	// material

	var material1 = new THREE.RawShaderMaterial( {
		uniforms: {
			time: { type: "f", value: 1.0 },
					my_color: { type: "v4", value: new THREE.Vector4(1.0,1.0,0.0,1.0) }
		},
		vertexShader: vs,
		fragmentShader: fs,
	} );


	var material2 = new THREE.RawShaderMaterial( {
		uniforms: {
			time: { type: "f", value: 1.0 },
					my_color: { type: "v4", value: new THREE.Vector4(0.0,0.0,0.0,1.0) }
		},
		vertexShader: vs,
		fragmentShader: fs,
		} );

	var material3 = new THREE.RawShaderMaterial( {
		uniforms: {
			time: { type: "f", value: 1.0 },
					my_color: { type: "v4", value: new THREE.Vector4(0.0,0.5,1.0,1.0) }
		},
		vertexShader: vs,
		fragmentShader: fs,
	} );




	var mesh1 = new THREE.Mesh( geometry1, material1 );
	mesh1.translateX(-2.0);
	scene.add( mesh1 );


	var mesh2 = new THREE.Mesh( geometry2, material2 );
	mesh2.translateX(0.0);
	scene.add( mesh2 );

	var mesh3 = new THREE.Mesh( geometry3, material3 );
	mesh3.translateX(2.0);
	scene.add( mesh3 );


	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x999999 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );


	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize( event ) {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {

	var time = performance.now();

	var object1 = scene.children[ 0 ];
	object1.rotation.x = time * 0.0009;
	object1.rotation.y = time * 0.0005;
	object1.material.uniforms.time.value = time * 0.005;

		var object2 = scene.children[ 1 ];
	object2.rotation.x = time * 0.0005;
	object2.rotation.y = time * 0.0009;
	object2.material.uniforms.time.value = time * 0.002;

	var object3 = scene.children[ 2 ];
	object3.rotation.z = time * 0.0007;
	object3.rotation.y = time * 0.0003;
	object3.material.uniforms.time.value = time * 0.003;


	renderer.render( scene, camera );
}

window.addEventListener('DOMContentLoaded', function() {
	vs = document.getElementById( 'vertexShader' ).textContent;
	fs = document.getElementById( 'fragmentShader' ).textContent;
	
	init();
	animate();
});