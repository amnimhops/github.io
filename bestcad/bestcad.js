
function initShaders( gl, vertexShaderId, fragmentShaderId )
{
    var vertShdr;
    var fragShdr;

    var vertElem = document.getElementById( vertexShaderId );
    if ( !vertElem ) { 
        alert( "Unable to load vertex shader " + vertexShaderId );
        return -1;
    }
    else {
        vertShdr = gl.createShader( gl.VERTEX_SHADER );
        gl.shaderSource( vertShdr, vertElem.text );
        gl.compileShader( vertShdr );
        if ( !gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS) ) {
            var msg = "Vertex shader failed to compile.  The error log is:"
          + "<pre>" + gl.getShaderInfoLog( vertShdr ) + "</pre>";
            alert( msg );
            return -1;
        }
    }

    var fragElem = document.getElementById( fragmentShaderId );
    if ( !fragElem ) { 
        alert( "Unable to load vertex shader " + fragmentShaderId );
        return -1;
    }
    else {
        fragShdr = gl.createShader( gl.FRAGMENT_SHADER );
        gl.shaderSource( fragShdr, fragElem.text );
        gl.compileShader( fragShdr );
        if ( !gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS) ) {
            var msg = "Fragment shader failed to compile.  The error log is:"
          + "<pre>" + gl.getShaderInfoLog( fragShdr ) + "</pre>";
            alert( msg );
            return -1;
        }
    }

    var program = gl.createProgram();
    gl.attachShader( program, vertShdr );
    gl.attachShader( program, fragShdr );
    gl.linkProgram( program );
    
    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        var msg = "Shader program failed to link.  The error log is:"
            + "<pre>" + gl.getProgramInfoLog( program ) + "</pre>";
        alert( msg );
        return -1;
    }

    return program;
}

function setupWebGL(canvas){
	var context = null;
	
	try{
		context = canvas.getContext('webgl');
	}catch(e){
		console.error(e);
	}

	return context;
}



function Mesh(vIndex,vCount,fIndex,fCount){
	this.vertexIndex = vIndex;
	this.numVertex = vCount;
	this.faceIndex = fIndex;
	this.numFaces = fCount;
}


function SceneManager(config){
	var vertexList = [];
	var faceList = [];
	var meshes = {};
	var wglVertexBuffer = null;

	/*
		Inicializacion webgl
	 */
	var gl = setupWebGL(config.canvas);
	var program = initShaders(gl,'vertex-shader','fragment-shader');
	
	//gl.enable(gl.DEPTH_TEST);

	var theBuffer = null;
	var rotationAngle = 0;
	var rotationAxis = vec3.create();rotationAxis.set([0,1,0],0);
	var rotationMatrix = mat4.create();

	function foo(){
		var pMatrix = mat4.create();
		var eye = vec3.create(); eye.set([1,1,1],0); // En el fondo, esto es un Float32Array !
		var center = vec3.create(); center.set([0,0,0],0);
		var up = vec3.create(); up.set([0,1,0],0);
		//mat4.perspective(pMatrix,Math.PI/4,800/600,0,100);
		//mat4.lookAt(pMatrix,eye,center,up);
		mat4.ortho(pMatrix,-10,10,-10,10,-10,10);
		
		var cam = mat4.create();
		mat4.lookAt(cam,eye,center,up);
		mat4.mul(pMatrix,pMatrix,cam)
		
		console.log(pMatrix)
		gl.useProgram(program);
		gl.viewport(0,0,800,600);
		
		if(theBuffer!=null) gl.deleteBuffer(theBuffer);

		theBuffer = gl.createBuffer();

		var data = new Float32Array([
			
				-1,0,0,	0,0,1,	1,0,0,1,	0,0
			,
			
				0,0.5,0,	0,0,1,	1,0,0,1,	0.5,1
			,
			
				0,0,0,	0,0,1,	1,0,0,1,	1,0
			,
				0,0,0,	0,0,1,	0,0,1,1,	0,0
			,
			
				0,1,0,	0,0,1,	0,0,1,1,	0.5,1
			,
			
				1,0,0,	0,0,1,	0,0,1,1,	1,0
			
		]);

		gl.bindBuffer( gl.ARRAY_BUFFER, theBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, data  , gl.STATIC_DRAW );

    	var vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 12 * 4, 0 ); // offset  8 elementos * 4 bytes, desplazamiento 0
        gl.enableVertexAttribArray( vPosition );

    	var vNormal = gl.getAttribLocation( program, "vNormal" );
        gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 12 * 4, 3*4 ); // offset 4 bytes * 3 elementos, desplazamiento el offset anterior
        gl.enableVertexAttribArray( vNormal );

		var vColor = gl.getAttribLocation( program, "vColor" );
        gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 12 * 4, 3*4 + 4*3 ); // offset 4 bytes * 3 elementos, desplazamiento el offset anterior
        gl.enableVertexAttribArray( vColor );


		var vTexture = gl.getAttribLocation( program, "vTexture" );
        gl.vertexAttribPointer( vTexture, 2, gl.FLOAT, false, 12 * 4 , 3*4 + 3*4 + 4*4 ); // offset 4 bytes * 2 elementos, desplazamiento la suma de offsets anteriores
        gl.enableVertexAttribArray( vTexture );
    
    	// Pasamos la proyeccion
    	gl.uniformMatrix4fv( gl.getUniformLocation(program, "camera"),false, pMatrix);
    	
    	//gl.lineWidth(2)
    	
    }

	/*
		Funciones de renderizado
	 */
	var self = this;
	var fps = 0;
	var frameCount = 0;
	var lastRenderTime = 0;
	var currentRenderTime = 0;
	var threshold = 1000;
	var iterations = 0;
rotationMatrix = mat4.create();
rotationAngle+=0.1;
	function render(){	
		
		
		mat4.rotate(rotationMatrix,rotationMatrix,rotationAngle,rotationAxis);
		if(rotationAngle>2*Math.PI) rotationAngle=0;

		gl.clearColor(0.4,0.4,0.4,1);
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
		gl.uniformMatrix4fv( gl.getUniformLocation(program, "rotation"),false, rotationMatrix);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
		//gl.lineWidth(3);
		//gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

		currentRenderTime = Date.now();
		var delta = currentRenderTime - lastRenderTime;

		if(delta>threshold){
			lastRenderTime = currentRenderTime;
			fps = frameCount
			frameCount = 0;
			
			iterations++;

			console.log(fps,rotationAngle);
		}else{
			frameCount++;
		}

		requestAnimationFrame(render);
	}
	foo();
	/* Inicia el renderizado */
	render();
}