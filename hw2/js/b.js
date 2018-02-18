var renderer, scene, camera;
var boxOfPoints;
var WIDTH, HEIGHT;
var material;
var renderCounter = 0;
var FRAMES_TIL_RENDER = 30;
var gui, opt, lastOpt;

function init() {
	var time = Math.floor(performance.now()) * 0.001;
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	
	camera = new THREE.PerspectiveCamera( 40, WIDTH / HEIGHT, 1, 10000 );
	camera.position.z = 300;
	var controls = new THREE.OrbitControls( camera );

	scene = new THREE.Scene();

	// Setup gui
	gui = new dat.GUI( { width: 350 } )
	opt = {
		spawnerRadius: 50,
		amountOfParticles: 2000,
		particleSizeVariance: 20,
		particleMinSize: 10
	};
	lastOpt = Object.assign({}, opt);
	
	gui.add(opt, "spawnerRadius", 1, 1000, 1.0);
	gui.add(opt, "amountOfParticles", 1, 10000, 1.0);
	gui.add(opt, "particleSizeVariance", 0, 400, 1.0);
	gui.add(opt, "particleMinSize", 1, 100, 1.0);
	
	// Textures
	
	var textureMask = new THREE.TextureLoader().load( "res/mask.png" );

	// Materials 
	
	material = new THREE.ShaderMaterial( {
		uniforms: {
			uStartTime: { value: time },
			uTime:      { value: time },
			color:      { value: new THREE.Color( 0xffffff ) },
			alphaMask:   { value: textureMask }
		},
		vertexShader:   document.getElementById( 'particle-vs' ).textContent,
		fragmentShader: document.getElementById( 'particle-fs' ).textContent,

		blending:       THREE.AdditiveBlending,
		depthTest:      false,
		transparent:    true
	});
	
	createBoxOfPoints();

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( WIDTH, HEIGHT );

	var container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );


	window.addEventListener( 'resize', onWindowResize, false );

}

function createBoxOfPoints() {
	if (boxOfPoints != null) {
		scene.remove(boxOfPoints);
	}
	
	var amount = opt.amountOfParticles;
	var radius = opt.spawnerRadius;

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

		} else {

			color.setHSL( 0.0 + 0.1 * ( i / amount ), 0.9, 0.5 );
		}

		color.toArray( colors, i * 3 );

		sizes[i] = Math.floor(Math.random() * opt.particleSizeVariance) + opt.particleMinSize;
		seeds[i] = Math.floor(Math.random() * 512);
	}

	// Geometries
	
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	geometry.addAttribute( 'seed', new THREE.BufferAttribute( seeds, 1 ) );
	
	// Add it to the scene

	boxOfPoints = new THREE.Points( geometry, material );
	scene.add( boxOfPoints );
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function render() {
	var time = Date.now() * 0.005;

	var changed = false;
	var keys = Object.keys(opt);
	for (var i = 0; i < keys.length; ++i) {
		if (opt[keys[i]] != lastOpt[keys[i]]) {
			changed = true;
			break;
		}
	}
	
	// Update if gui changed
	if (changed) {
		renderCounter = FRAMES_TIL_RENDER;
		lastOpt = Object.assign({}, opt);
	}
	if (renderCounter-- == 0) {
		createBoxOfPoints();
	}
	
	boxOfPoints.rotation.z = 0.01 * time;

	var geometry = boxOfPoints.geometry;
	var attributes = geometry.attributes;

	for ( var i = 0; i < attributes.size.array.length; i++ ) {
		attributes.size.array[ i ] += 0.01 * Math.sin( 0.1 * i + time );
	}

	attributes.size.needsUpdate = true;
	
	var uTime = Math.floor(performance.now()) * 0.001;
	material.uniforms.uTime.value = uTime;

	renderer.render( scene, camera );
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

window.addEventListener('DOMContentLoaded', function() {
	init();
	animate();
});
