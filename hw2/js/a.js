// Uses https://github.com/josephg/noisejs
var container;
var camera, scene, renderer;
var terrainVS, terrainFS;
var skyboxVS, skyboxFS;
var textureHeightMap, textureLow, textureMed, textureHigh;
var seed;
// Values that can be adjusted with the GUI
var size, cubeSize, perlinFactor, heightUpper, heightLower,
	displaceAmt, displaceExpt, waterHeight;

function init() {
	terrainVS = document.getElementById( 'terrain-vs' ).textContent;
	terrainFS = document.getElementById( 'terrain-fs' ).textContent;
	skyboxVS = document.getElementById( 'skybox-vs' ).textContent;
	skyboxFS = document.getElementById( 'skybox-fs' ).textContent;
	
	seed = Math.ceil(Math.random() * 65536);
	noise.seed(seed);
	
	// Set up initial map creation
	size = Math.pow(2, 8);
	cubeSize = 4;
	perlinFactor = size / 20;
	heightUpper = 256;
	heightLower = 0;
	displaceAmt = 25;
	displaceExpt = 1.0;
	waterHeight = 0;
	
	var canvas = createHeightMapCanvas('heightmap-canvas');
	textureHeightMap = new THREE.Texture(canvas);
	textureLow = new THREE.TextureLoader().load( 'res/low.jpg' );
	textureMed = new THREE.TextureLoader().load( 'res/med.jpg' );
	textureHigh = new THREE.TextureLoader().load( 'res/high.jpg' );
	
	textureHeightMap.needsUpdate = true;
	
	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 50.0, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.x = 50;
	camera.position.y = 50;
	camera.position.z = 0;
	
	//adds a default mouse listener to control the camera rotation and zoom
	var controls = new THREE.OrbitControls( camera );
	controls.update();

	scene = new THREE.Scene();

	// geometry

	var terrainGeometry = new THREE.PlaneGeometry( 250, 250, 400, 400 );
	var skyboxGeometry = new THREE.BoxGeometry( 500, 500, 500 );

	// material

	var terrainUniforms =  {
		displaceAmt: { type: "f", value: displaceAmt },
		displaceExpt: { type: "f", value: displaceExpt },
		tPic: { type: "t", value: textureHeightMap },
		tLow: { type: "t", value: textureLow },
		tMed: { type: "t", value: textureMed },
		tHigh: { type: "t", value: textureHigh },
	};

	var terrainMaterial = new THREE.RawShaderMaterial( {
		uniforms: terrainUniforms,
		vertexShader: terrainVS,
		fragmentShader: terrainFS
	} );
	
	
	var cubeMap = new THREE.CubeTextureLoader()
		.setPath("res/skybox/")
		.load( [
			'posx.jpg',
			'negx.jpg',
			'posy.jpg',
			'negy.jpg',
			'posz.jpg',
			'negz.jpg'
		]);
	var skyboxUniforms = { "tCube": { type: "t", value: cubeMap } };
	
	var skyboxMaterial = new THREE.RawShaderMaterial({
		uniforms: skyboxUniforms,
		vertexShader: skyboxVS,
		fragmentShader: skyboxFS
	});
	skyboxMaterial.depthWrite = false;
	skyboxMaterial.side = THREE.BackSide;

	// Mesh
	
	var terrainMesh = new THREE.Mesh( terrainGeometry, terrainMaterial );
	terrainMesh.material.side = THREE.DoubleSide;
	terrainMesh.rotateX(-Math.PI/2);
	terrainMesh.position.y = -50;
	scene.add( terrainMesh );
	
	var skyboxMesh = new THREE.Mesh( skyboxGeometry, skyboxMaterial );
	scene.add( skyboxMesh );

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
	//object0.material.uniforms.displaceExpt.value = 1.0;


	renderer.render( scene, camera );
}

window.addEventListener('DOMContentLoaded', function() {
	init();
	animate();
});
