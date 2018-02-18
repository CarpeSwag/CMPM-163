var renderer, scene, camera;
var boxOfPoints;
var WIDTH, HEIGHT;
var material;

function init() {
	var time = Math.floor(performance.now()) * 0.001;
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	
	camera = new THREE.PerspectiveCamera( 40, WIDTH / HEIGHT, 1, 10000 );
	camera.position.z = 300;
	var controls = new THREE.OrbitControls( camera );


	scene = new THREE.Scene();

	//initialize point attributes

	//var amount = 10000;
	//var radius = 25;
	var amount = 20;
	var radius = 20;

	var positions = new Float32Array( amount * 3 );
	var colors = new Float32Array( amount * 3 );
	var sizes = new Float32Array( amount );
	var seeds = new Float32Array( amount );

	var vertex = new THREE.Vector3();
	var color = new THREE.Color( 0xffffff );

	for ( var i = 0; i < amount; i ++ ) {

		vertex.x = ( Math.random() * 2 - 1 ) * radius;
		vertex.y = ( Math.random() * 2 - 1 ) * radius;
		vertex.z = ( Math.random() * 2 - 1 ) * radius;
		vertex.toArray( positions, i * 3 );

		if ( vertex.x < 0 ) {

			color.setHSL( 0.5 + 0.1 * ( i / amount ), 0.7, 0.5 );
			//color.setRGB( 1.0, 0.0, 0.0 );

		} else {

			color.setHSL( 0.0 + 0.1 * ( i / amount ), 0.9, 0.5 );
			//color.setRGB( 0.0, 0.0, 1.0 );
		}

		color.toArray( colors, i * 3 );

		sizes[i] = 20;
		seeds[i] = Math.floor(Math.random() * 512);
	}

	// Geometries
	
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.addAttribute( 'seed', new THREE.BufferAttribute( seeds, 1 ) );

	// Textures
	
	var textureMask = new THREE.TextureLoader().load( "res/mask.png" );
	
	// Materials

	material = new THREE.ShaderMaterial( {
		uniforms: {
			uStartTime: { value: time },
			uTime:      { value: time },
			amplitude:  { value: 1.0 },
			color:      { value: new THREE.Color( 0xffffff ) },
			alphaMask:   { value: textureMask }
		},
		vertexShader:   document.getElementById( 'particle-vs' ).textContent,
		fragmentShader: document.getElementById( 'particle-fs' ).textContent,

		blending:       THREE.AdditiveBlending,
		depthTest:      false,
		transparent:    true

	});

	//

	boxOfPoints = new THREE.Points( geometry, material );
	scene.add( boxOfPoints );

	//

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( WIDTH, HEIGHT );

	var container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );

	render();

}

function render() {
	var time = Date.now() * 0.005;

	boxOfPoints.rotation.z = 0.01 * time;

	var geometry = boxOfPoints.geometry;
	var attributes = geometry.attributes;

	for ( var i = 0; i < attributes.size.array.length; i++ ) {
		//attributes.size.array[ i ] = 20 + 6 * Math.sin( 0.1 * i + time );
	}

	attributes.size.needsUpdate = true;
	
	var uTime = Math.floor(performance.now()) * 0.001;
	material.uniforms.uTime.value = uTime;

	renderer.render( scene, camera );

}

window.addEventListener('DOMContentLoaded', function() {
	init();
	animate();
});
