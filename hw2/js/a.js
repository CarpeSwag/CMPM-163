// Uses https://github.com/josephg/noisejs
var container;
var camera, scene, renderer;
var vs, fs;
var texture1, texture2, texture3, texture4;
var seed;
var size, cubeSize, perlinFactor, heightUpper, heightLower;

function init() {
	vs = document.getElementById( 'vertexShader' ).textContent;
	fs = document.getElementById( 'fragmentShader' ).textContent;
	
	seed = Math.ceil(Math.random() * 65536);
	noise.seed(seed);
	
	// Set up initial map creation
	size = Math.pow(2, 8);
	cubeSize = 4;
	perlinFactor = size / 10;
	heightUpper = 256;
	heightLower = 0;
	
	var canvas = createHeightMapCanvas('heightmap-canvas');
	texture1 = new THREE.Texture(canvas);
	texture2 = new THREE.TextureLoader().load( 'res/grass.png' );
	texture3 = new THREE.TextureLoader().load( 'res/snow.jpg' );
	texture4 = new THREE.TextureLoader().load( 'res/hill.jpg' );
	
	texture1.needsUpdate = true;
	
	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 50.0, window.innerWidth / window.innerHeight, 0.1, 50 );

	//adds a default mouse listener to control the camera rotation and zoom
	var controls = new THREE.OrbitControls( camera );
	camera.position.z = 5;
	controls.update();

	scene = new THREE.Scene();

	// geometry

	var geometry1 = new THREE.PlaneGeometry( 20, 20, 400, 300 );

	// material

	var uniforms1 =  {
		displaceAmt: { type: "f", value: 0.0 },
		tPic: { type: "t", value: texture1  },
		tGrass: { type: "t", value: texture2  },
		tSnow: { type: "t", value: texture3  },
		tHill: { type: "t", value: texture4  },
	};

	var material1 = new THREE.RawShaderMaterial( {
		uniforms: uniforms1,
		vertexShader: vs,
		fragmentShader: fs,

	} );

	var mesh1 = new THREE.Mesh( geometry1, material1 );
	mesh1.material.side = THREE.DoubleSide;
	mesh1.rotateX(-Math.PI/3);
	scene.add( mesh1 );

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x999999 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );
}

function createHeightMapCanvas(eleId) {
	var canvas = document.getElementById(eleId);
	var height = width = size;
	canvas.width  = width;
	canvas.height = height;
	
	var ctx = canvas.getContext('2d');
	
	ctx.colorChunk = function(x, y, color) {
		ctx.fillStyle = color;
		ctx.fillRect(x * cubeSize, y * cubeSize, cubeSize, cubeSize);
	}
	
	ctx.perlinChunk = function(x, y) {
		var h = heightUpper - heightLower;
		var c = Math.floor(Math.abs(noise.perlin2(x / perlinFactor, y / perlinFactor) * h)) + heightLower;
		this.colorChunk(x,y,'rgb('+c+','+c+','+c+')');
	}
	
	ctx.fillStyle='black';
	ctx.fillRect(0, 0, size, size);
	
	for (var i = 0; i < size / cubeSize; ++i) {
		for (var j = 0; j < size / cubeSize; ++j) {
			ctx.perlinChunk(j, i);
			ctx.perlinChunk(j+1, i+1);
		}
	}
	return canvas;
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

	var object0 = scene.children[ 0 ];
	//	object0.material.uniforms.displaceAmt.value = 0.5 * (1.0 + Math.sin(time * 0.001)); 

		object0.material.uniforms.displaceAmt.value = 1.0;


	renderer.render( scene, camera );
}

window.addEventListener('DOMContentLoaded', function() {
	init();
	animate();
});
