// Uses https://github.com/josephg/noisejs
var container;
var camera, scene, renderer;
var terrainVS, terrainFS;
var skyboxVS, skyboxFS;
var waterVS, waterFS;
var textureHeightMap, textureLow, textureMed, textureHigh,
	textureWaterNoise;
var renderCounter = 0;
var FRAMES_TIL_RENDER = 30;
var WATER_RERENDER = 10;
var waterCounter = 0;
var seed;
// Values that can be adjusted with the GUI
var gui, opt;
var lastOpt;

function init() {
	var time = Math.floor(performance.now());
	
	terrainVS = document.getElementById( 'terrain-vs' ).textContent;
	terrainFS = document.getElementById( 'terrain-fs' ).textContent;
	waterVS = document.getElementById( 'water-vs' ).textContent;
	waterFS = document.getElementById( 'water-fs' ).textContent;
	skyboxVS = document.getElementById( 'skybox-vs' ).textContent;
	skyboxFS = document.getElementById( 'skybox-fs' ).textContent;
	
	// Setup gui
	gui = new dat.GUI( { width: 350 } )
	opt = {
		seed: Math.ceil(Math.random() * 65536),
		size: 8,
		terrainRoughness: 2,
		perlinSmoothing: 13,
		heightUpperLimit: 256,
		displaceAmount: 50,
		displaceExponent: 1.0,
		waterHeight: 5,
		waterRoughness: 5.0
	};
	lastOpt = Object.assign({}, opt);
	
	gui.add(opt, "seed", 1, 65536, 1.0);
	gui.add(opt, "size", 1, 10, 1.0);
	gui.add(opt, "terrainRoughness", 0, 5, 1.0);
	gui.add(opt, "perlinSmoothing", 1, 50, 1.0);
	gui.add(opt, "heightUpperLimit", 0, 256, 1.0);
	gui.add(opt, "displaceAmount", 25, 100, 1.0);
	gui.add(opt, "displaceExponent", 0.1, 10, 0.1);
	gui.add(opt, "waterHeight", 0, 50, 1.0);
	gui.add(opt, "waterRoughness", 0.0, 25, 0.5);
	
	// Set up initial map creation
	textureHeightMap = new THREE.Texture(createHeightMapCanvas('heightmap-canvas'));
	textureLow = new THREE.TextureLoader().load( 'res/low.jpg');
	textureMed = new THREE.TextureLoader().load( 'res/med.jpg');
	textureWaterNoise = new THREE.Texture(createWaterCanvas('water-canvas', time));
	
	textureHeightMap.needsUpdate = true;
	textureWaterNoise.needsUpdate = true;
	
	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 50.0, window.innerWidth / window.innerHeight, 0.1, 1500 );
	camera.position.x = 200;
	camera.position.y = 100;
	
	
	//adds a default mouse listener to control the camera rotation and zoom
	var controls = new THREE.OrbitControls( camera );
	controls.target = new THREE.Vector3( 0, -150, 0 );
	controls.update();

	scene = new THREE.Scene();

	// geometry

	var terrainGeometry = new THREE.PlaneGeometry( 250, 250, 400, 400 );
	var waterGeometry = new THREE.PlaneGeometry( 250, 250, 100, 100 );
	var skyboxGeometry = new THREE.BoxGeometry( 1000, 1000, 1000 );

	// material
	
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
	
	var terrainUniforms =  {
		displaceAmt: { type: "f", value: opt.displaceAmount },
		displaceExpt: { type: "f", value: opt.displaceExponent },
		tPic: { type: "t", value: textureHeightMap },
		tLow: { type: "t", value: textureLow },
		tMed: { type: "t", value: textureMed }
	};

	var terrainMaterial = new THREE.RawShaderMaterial( {
		uniforms: terrainUniforms,
		vertexShader: terrainVS,
		fragmentShader: terrainFS
	} );
	
	var waterUniforms =  {
		displaceAmt: { type: "f", value: opt.waterRoughness },
		tPic: { type: "t", value: textureWaterNoise },
		envMap: { type: "t", value: cubeMap }
	};

	var waterMaterial = new THREE.RawShaderMaterial( {
		uniforms: waterUniforms,
		vertexShader: waterVS,
		fragmentShader: waterFS,
		transparent: true
	} );
	
	
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
	terrainMesh.position.y = -100;
	scene.add( terrainMesh );
	
	var waterMesh = new THREE.Mesh( waterGeometry, waterMaterial );
	waterMesh.material.side = THREE.DoubleSide;
	waterMesh.rotateX(-Math.PI/2);
	waterMesh.position.y = -100 + opt.waterHeight;
	scene.add( waterMesh );
	
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
	var size = Math.pow(2, opt.heightMapSize);
	var cubeSize = Math.pow(2, opt.terrainRoughness);
	var height = width = size;
	canvas.width  = width;
	canvas.height = height;
	
	var ctx = canvas.getContext('2d');
	
	ctx.colorChunk = function(x, y, color) {
		ctx.fillStyle = color;
		ctx.fillRect(x * cubeSize, y * cubeSize, cubeSize, cubeSize);
	}
	
	ctx.perlinChunk = function(x, y) {
		var c = Math.floor(Math.abs(noise.perlin2(x / opt.perlinSmoothing,
			y / opt.perlinSmoothing) * opt.heightUpperLimit));
		this.colorChunk(x,y,'rgb('+c+','+c+','+c+')');
	}
	
	// Seed perlin noise generator
	noise.seed(opt.seed);
	
	// Cover canvas
	ctx.fillStyle='black';
	ctx.fillRect(0, 0, size, size);
	
	// Draw noise
	for (var i = 0; i < size / cubeSize; ++i) {
		for (var j = 0; j < size / cubeSize; ++j) {
			ctx.perlinChunk(j, i);
			ctx.perlinChunk(j+1, i+1);
		}
	}
	return canvas;
}

function createWaterCanvas(eleId, time) {
	var canvas = document.getElementById(eleId);
	var size = 64;
	var perlinFactor = 10;
	var height = width = size;
	canvas.width  = width;
	canvas.height = height;
	
	var ctx = canvas.getContext('2d');
	
	ctx.colorPixel = function(x, y, color) {
		ctx.fillStyle = color;
		ctx.fillRect(x, y, 1, 1);
	}
	
	ctx.perlinPixel = function(x, y) {
		var c = Math.floor(Math.abs(noise.perlin3(x / perlinFactor,
			y / perlinFactor, time / 5000) * 256));
		this.colorPixel(x,y,'rgb('+c+','+c+','+c+')');
	}
	
	// Cover canvas
	ctx.fillStyle='black';
	ctx.fillRect(0, 0, size, size);
	
	// Draw noise
	for (var i = 0; i < size; ++i) {
		for (var j = 0; j < size; ++j) {
			ctx.perlinPixel(j, i);
			ctx.perlinPixel(j+1, i+1);
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
	var time = Math.floor(performance.now());
	var terrain = scene.children[0];
	var water = scene.children[1];
	
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
		textureHeightMap = new THREE.Texture(createHeightMapCanvas('heightmap-canvas'));
		textureHeightMap.needsUpdate = true;
		
		terrain.material.uniforms.displaceAmt.value = opt.displaceAmount;
		terrain.material.uniforms.displaceExpt.value = opt.displaceExponent;
		terrain.material.uniforms.tPic.value = textureHeightMap;
		water.position.y = -100 + opt.waterHeight;
		water.material.uniforms.displaceAmt.value = opt.waterRoughness;
	}
	
	// Update water height map
	textureWaterNoise = new THREE.Texture(createWaterCanvas('water-canvas', time));
	textureWaterNoise.needsUpdate = true;
	water.material.uniforms.tPic.value = textureWaterNoise;


	renderer.render( scene, camera );
}

window.addEventListener('DOMContentLoaded', function() {
	init();
	animate();
});
