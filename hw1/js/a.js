var container;

var camera, scene, renderer;
var torus, cube;
var cubeTexture;
var waltHead, binLoader;
var waltLight;
var vs1, vs2, vs3, 
	fs1, fs2, fs3;

function init() {
	vs1 = document.getElementById( 'vertexShader1' ).textContent;
	fs1 = document.getElementById( 'fragmentShader1' ).textContent;
	vs2 = document.getElementById( 'vertexShader2' ).textContent;
	fs2 = document.getElementById( 'fragmentShader2' ).textContent;
	vs3 = document.getElementById( 'vertexShader3' ).textContent;
	fs3 = document.getElementById( 'fragmentShader3' ).textContent;
	
	
	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 50.0, window.innerWidth / window.innerHeight, 0.1, 10 );
	camera.position.z = 5;

	scene = new THREE.Scene();
	
	// Geometry

	var geometry1 = new THREE.TorusKnotGeometry( 0.5, 0.15, 100, 16 );
	var geometry3 = new THREE.BoxGeometry( 1, 1, 1 );
	binLoader = new THREE.BinaryLoader();
	var callback = function( geometry ) {
		var ambient = new THREE.Vector3(0.1,0.1,0.1);

		var light_specular = new THREE.Vector3(1.0,1.0,1.0);
		var light_diffuse = new THREE.Vector3(1.0,1.0,1.0);

		var light1_pos = waltLight[0].position; 
		var light2_pos = waltLight[1].position; 
		var light3_pos = waltLight[2].position; 
		
		var uniforms = {
			ambient: { type: "v3", value: ambient },
			light1_pos: { type: "v3", value: light2_pos },
			light1_diffuse: { type: "v3", value: light_diffuse },
			light1_specular:  { type: "v3", value: light_specular },
			light2_pos: { type: "v3", value: light2_pos },
			light2_diffuse: { type: "v3", value: light_diffuse },
			light2_specular:  { type: "v3", value: light_specular },
			light3_pos: { type: "v3", value: light3_pos },
			light3_diffuse: { type: "v3", value: light_diffuse },
			light3_specular:  { type: "v3", value: light_specular }
		};

		var material2 = new THREE.RawShaderMaterial( {
			uniforms: uniforms,
			vertexShader: vs2,
			fragmentShader: fs2,	
		} );
		
		waltHead = new THREE.Mesh( geometry, material2 );
		waltHead.scale.x = waltHead.scale.y = waltHead.scale.z = 0.025;
		waltHead.translateY(-1.0);
		
		scene.add( waltHead );
	};
	binLoader.load( "res/WaltHead.js", callback );

	// Textures
	cubeTexture = createDataTexture();

	// material

	var material1 = new THREE.RawShaderMaterial( {
		uniforms: {
			time: { type: "f", value: 1.0 },
					my_color: { type: "v4", value: new THREE.Vector4(1.0,1.0,0.0,1.0) }
		},
		vertexShader: vs1,
		fragmentShader: fs1,
	} );

	var material3 = new THREE.RawShaderMaterial( {
		uniforms: {t1: { type: "t", value: cubeTexture }},
		vertexShader: vs3,
		fragmentShader: fs3,	
	} );

	torus = new THREE.Mesh( geometry1, material1 );
	torus.translateX(-2.0);
	torus.translateY(1.0);
	scene.add( torus );

	cube = new THREE.Mesh( geometry3, material3 );
	cube.translateX(2.0);
	cube.translateY(1.0);
	scene.add( cube );
	
	// Add Lights
	var sphere = new THREE.SphereGeometry( 0.01, 16, 8 );
	
	waltLight = [];
	for (var i = 0; i < 3; ++i) {
		waltLight.push(new THREE.PointLight( 0xffffff, 2, 5 ));
		waltLight[i].add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
		scene.add( waltLight[i] );
	}
	
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
	
	if (torus) {
		var torusSin = Math.sin( time * 0.01 );
		torus.position.z = torusSin * 0.5;
		torus.position.x = torusSin * 0.01 - 2;
		torus.rotation.x = time * 0.0009;
		torus.rotation.y = time * 0.0006;
		torus.rotation.z = time * 0.0003;
		torus.material.uniforms.time.value = time * 0.003;
	}

	if (waltHead) {
		waltHead.rotation.y = time * 0.0007;
	}
	
	if (cube) {
		cube.rotation.x = time * 0.0005;
		cube.rotation.y = time * 0.0009;
		//cube.material.uniforms.time.value = time * 0.002;
	}
	
	// Lights
	var lightX = [3,3,5];
	var lightY = [5,7,3];
	var lightZ = [7,5,7];
	
	var lightTime = time * 0.00025;
	for (var i = 0; i < 3; ++i) {
		waltLight[i].position.x = Math.sin( lightX[i] * lightTime );
		waltLight[i].position.y = Math.cos( lightY[i] * lightTime ) * 1.25 - 1;
		waltLight[i].position.z = Math.cos( lightZ[i] * lightTime );
	}

	renderer.render( scene, camera );
}

function createDataTexture() {
	var resX = 25;
	var resY = 25;

	var size = resX * resY;
	var data = new Uint8Array( 4 * size );

	for ( var i = 0; i < size; i++ ) {
		var stride = i * 4;

		data[ stride ] = Math.random() * 255;
		data[ stride + 1 ] = Math.random() * 255;;
		data[ stride + 2 ] = Math.random() * 255;;
		data[ stride + 3 ] = 255;
	}


	var texture = new THREE.DataTexture( data, resX, resY, THREE.RGBAFormat );
	texture.needsUpdate = true;

	return texture;
}

window.addEventListener('DOMContentLoaded', function() {
	init();
	animate();
});