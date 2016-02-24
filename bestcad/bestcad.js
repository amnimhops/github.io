
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
	initShaders(gl,'vertex-shader','fragment-shader');
	/*
		Metodos de servicio
	 */
	
	this.addMesh = function(name,vlist,flist){
		
		
		/*
			Copiamos los vertices a la lista de vertices de la escena
		 */
		var vIndex = vertexList.length;
		vertexList = vertexList.concat(vlist);
		/*
			Cada face apunta a su propia lista de indices base-0, hay
			que sumar vIndex a cada indice
		 */
		var fIndex = faceList.length;
		var meshFaces = [];
		for(var i in flist){
			var face = []
			for(var j in flist[i]){
				face.push(flist[i][j] + vIndex);
			}
			faceList.push(face);
			meshFaces.push(fIndex++);
		}



		var mesh = new Mesh(vlist,flist);
		if(meshes[name]!==undefined) throw new Error('Mesh '+name+' already defined');

		meshes[name] = mesh;
	};

	this.rebuildScene = function(){
		/* Obtenemos las estadisticas de los modelos */
		var vertexCount = getVertexCount();
		if(wglVertexBuffer!==null){
			gl.deleteBuffer(wglVertexBuffer);
		}

		wglVertexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, wglVertexBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, this.size * 4 , gl.STATIC_DRAW );
	}

	this.foo = function(){
		console.log('ho');

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

	function renderA(){
		requestAnimationFrame(renderB);
		render();
	}

	function renderB(){
		requestAnimationFrame(renderA);
		render();
	}

	function render(){	
		currentRenderTime = Date.now();
		var delta = currentRenderTime - lastRenderTime;

		if(delta>threshold){
			lastRenderTime = currentRenderTime;
			fps = frameCount
			frameCount = 0;
			
			loop();

			iterations++;
		}else{
			frameCount++;
		}
	}

	function loop(){

	}

	/* Inicia el renderizado */
	requestAnimationFrame(renderA);
}