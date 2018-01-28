var container;

var camera, scene, renderer;
var vs, fs;

var mesh;
var material;

var texture1;

var mouseX = 0.0;
var mouseY = 0.0;

function init() {
	vs = document.getElementById( 'vertexShader' ).textContent;
	fs = document.getElementById( 'fragmentShader' ).textContent;
	texture1 =  new THREE.TextureLoader().load( 'res/goldblum.png' );
	
	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 60.0, window.innerWidth / window.innerHeight, 0.1, 50 );
	camera.position.z = 2;

	scene = new THREE.Scene();

	// buffer geometry

	var geometry = new THREE.BufferGeometry();

	var vertices = new Float32Array( [
		-1.0, -1.0, 0.0,
		+1.0, -1.0, 0.0,
		+1.0, +1.0, 0.0,
 
		-1.0, -1.0, 0.0,
		+1.0, +1.0, 0.0,
		-1.0, +1.0, 0.0,

	] );

	var texCoords = new Float32Array( [
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		
		0.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
	] );

	// itemSize = 3 because there are 3 values (components) per vertex
	geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'texCoords', new THREE.BufferAttribute( texCoords, 2 ) );

	// materials (ie, linking to the shader program)
	var uniforms = {
		t1: { type: "t", value: texture1  },
		rx: {type: "f", value: 1024/2},
		ry: {type: "f", value: 1024/2},
		mixVal: {type: "f", value: 0.5},
	};

	material = new THREE.RawShaderMaterial( {
		uniforms: uniforms,
		vertexShader: vs,
		fragmentShader: fs,	
	} );

	mesh = new THREE.Mesh( geometry, material );
	mesh.translateX(0.0);
	mesh.material.side = THREE.DoubleSide; //to render both sides of triangle
	scene.add( mesh );

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x999999 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	//make it so that resizing the browser window also resizes the scene
	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
	var time = performance.now();

	mesh.material.uniforms.mixVal.value = mouseX;

	renderer.render( scene, camera );
}

function onDocumentMouseMove(event) {
	event.preventDefault();
	mouseX = (event.clientX / window.innerWidth) ;
	mouseY = -(event.clientY / window.innerHeight) ;
}


function onWindowResize( event ) {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener('DOMContentLoaded', function() {
	init();
	animate();
});
