var scene;
var camera;
var renderer;


var resX = 300;
var resY = 300;


var bufferScene;
var bufferMaterial;
var bufferObject;
var FBO_A, FBO_B;
var plane;
var fullScreenQuad;




scene_setup(); //initialize the Three.js scene

function scene_setup(){
	//This is the basic scene setup
	scene = new THREE.Scene();
	var width = window.innerWidth;
	var height = window.innerHeight;

	//orthographic camera can be used for 2D
	camera = new THREE.PerspectiveCamera( 50.0, window.innerWidth / window.innerHeight, 0.1, 10 );
	camera.position.z = 2;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
}


FBO_setup();

function FBO_setup(){
	//Create off-screen buffer scene
	bufferScene = new THREE.Scene();
	
	//Create 2 buffer textures
	//FBO_A = new THREE.WebGLRenderTarget( resX, resY );
	//FBO_B = new THREE.WebGLRenderTarget( resX, resY ); 
	FBO_A = new THREE.WebGLRenderTarget( resX, resY, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
	FBO_B = new THREE.WebGLRenderTarget( resX, resY, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter} );


	
	//Begin by passing an initial "seed" texture to shader, containing randomly placed cells
	var dataTexture = createDataTexture();

	bufferMaterial = new THREE.RawShaderMaterial( {
		uniforms: {
			bufferTexture: { type: "t", value: dataTexture },
			textureSize : {type: "v2", value: new THREE.Vector2( resX, resY )}  //shader doesn't have access to these global variables, so pass in the resolution
		},
		vertexShader: document.getElementById( 'vertexShader' ).innerHTML,
		fragmentShader: document.getElementById( 'fragmentShader' ).innerHTML
	} );

	//we can use a Three.js Plane Geometry along with the orthographic camera to create a "full screen quad"
	plane = new THREE.BoxGeometry(1,1,1);

	bufferObject = new THREE.Mesh( plane, bufferMaterial );
	bufferScene.add(bufferObject);


	//Draw textureB to screen 
	fullScreenQuad = new THREE.Mesh( plane, new THREE.MeshBasicMaterial() );
	scene.add(fullScreenQuad);
}



render();

function render() {

	requestAnimationFrame( render );
	
	//Draw to the active offscreen buffer (whatever is stored in FBO_B), that is the output of this rendering pass will be stored in the texture associated with FBO_B
	renderer.render(bufferScene, camera, FBO_B);
	
	//grab that texture and map it to the full screen quad
	fullScreenQuad.material.map = FBO_B.texture;
	
	var time = performance.now();
	
	renderer.setClearColor( 0x999999 );
	if (bufferObject) {
		bufferObject.rotation.x = time * 0.0005;
		bufferObject.rotation.y = time * 0.0009;
	}
	
	//Then draw the full sceen quad to the on screen buffer, ie, the display
	renderer.render( scene, camera );

	//Now prepare for the next cycle by swapping FBO_A and FBO_B, so that the previous frame's *output* becomes the next frame's *input*
	var t = FBO_A;
	FBO_A = FBO_B;
	FBO_B = t;
	bufferMaterial.uniforms.bufferTexture.value = FBO_A.texture;
}

function createDataTexture() {

	// create a buffer with color data

	var size = resX * resY;
	var data = new Uint8Array( 4 * size );


	for ( var i = 0; i < size; i++ ) {

		var stride = i * 4;

		if (Math.random() < 0.5) {
			data[ stride ] = 255;
			data[ stride + 1 ] = 255;
			data[ stride + 2 ] = 255;
			data[ stride + 3 ] = 255;
		} else {
			data[ stride ] = 0;
			data[ stride + 1 ] = 0;
			data[ stride + 2 ] = 0;
			data[ stride + 3 ] = 255;
		}
	}


	// used the buffer to create a DataTexture

	var texture = new THREE.DataTexture( data, resX, resY, THREE.RGBAFormat );
	
	texture.needsUpdate = true; // just a weird thing that Three.js wants you to do after you set the data for the texture

	return texture;

}

