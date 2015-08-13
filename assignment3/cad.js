function html2rgba(color){
	var r = parseInt(color.substr(1,2),16);
    var g = parseInt(color.substr(3,2),16);
    var b = parseInt(color.substr(5,2),16);
    
    return [r/256,g/256,b/256,1.0];
}

function Float32Buffer(gl){
    this.buffer = null;
    this.size = 0;

    this.setCapacity = function(count){
        this.size = count;
        
        if(this.buffer !== null){
            /* Free last buffer */
            gl.deleteBuffer(this.buffer);
        }

        this.buffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
        gl.bufferData( gl.ARRAY_BUFFER, this.size * 4 , gl.STATIC_DRAW );
    };
}

function Mesh(){
	this.id=null;
	
	this.triangleCount = 0;
	this.vertices = [];
	this.colors = [];

	this.position = [0,0,0];
	this.rotation = [0,0,0];
	this.scale = [1,1,1];

	this.color = "#0000ff";
	this.selected = false;
	

	this.generateGeometry = function(){
		// NOthing to do
	};
	this.clearGeometry = function(){
		this.vertices = [];
		this.colors = [];
		this.triangleCount = [];
	}

    this.triangle = function(vertexList){
    	for(var i in vertexList){
    		this.vertices.push(vertexList[i]);
    		this.colors.push(html2rgba(this.color));
    	}
    	this.triangleCount++;
    };

	this.render = function(){
		
	};
	this.update = function(){

	};
	this.setSelected = function(isselected){
		this.selected = isselected;
		this.update();
	};
	this.setPosition = function(pos){
		this.position = pos;
		this.update();
	}
	this.setColor = function(color){
		this.color = color;
		this.update();
	}
	this.setScale = function(scale){
		this.scale = scale;
		this.update();
	}
	this.setRotation = function(rotation){
		this.rotation = rotation;
		this.update;
	}

	this.getTranslationMatrix = function(){
		return translate(this.position[0],this.position[1],this.position[2]);
	}
	this.getRotationMatrix = function(){
		var rx = rotate(this.rotation[0],[1,0,0]);
		var ry = rotate(this.rotation[1],[0,1,0]);
		var rz = rotate(this.rotation[2],[0,0,1]);
		
		return mult(rz,mult(ry,rx));
	}
	this.getScaleMatrix = function(){
		return scalem(this.scale);
	}
}

function Plane(){
	Mesh.call(this);

	this.generateGeometry = function(){
		this.clearGeometry();

		var a = [-1,-1,0,1];
		var b = [-1,1,0,1];
		var c = [1,1,0,1];
		var d = [1,-1,0,1];

		this.triangle([a,b,c]);
		this.triangle([a,c,d]);
		this.triangle([[-1,-1,0.5,1],[-1,1,0.5,1],[1,1,0.5,1]]);
	}
}

function Cylinder(){
	Mesh.call(this);
	this.color="#ff00ff";

	this.generateGeometry = function(){
		this.clearGeometry();
		
		var sections = 16;
		var h = 1;

		var basePoints = [];
		var topPoints = [];
		for(var i = 0; i<360; i+=360/sections){
			var x = Math.cos(radians(i))/2; // We want radius/2 = 1
			var z = Math.sin(radians(i))/2;
			basePoints.push([x,0,z,1]);
			topPoints.push([x,1,z,1]); // Same point, displaced in y
		}
		var center1 = [0,0,0,1];
		var center2 = [0,1,0,1];

		for(var i=0;i<basePoints.length;i++){
			var v1Offset = i%basePoints.length;
			var v2Offset = (i+1)%basePoints.length;
			this.triangle([basePoints[v1Offset],basePoints[v2Offset],center1]); // Bottom
			this.triangle([topPoints[v1Offset],topPoints[v2Offset],center2]);
			this.triangle([basePoints[v1Offset],topPoints[v1Offset],topPoints[v2Offset]]);
			this.triangle([basePoints[v1Offset],topPoints[v2Offset],basePoints[v2Offset]]);
		}
	
		
	}
}
function Cube(){
	Mesh.call(this);
	this.color='#0c0c0c';

	this.generateGeometry = function(){
		var a = [-0.5,-0.5,-0.5,1];
		var b = [-0.5,0.5,-0.5,1];
		var c = [0.5,0.5,-0.5,1];
		var d = [0.5,-0.5,-0.5,1];

		var e = [-0.5,-0.5,0.5,1];
		var f = [-0.5,0.5,0.5,1];
		var g = [0.5,0.5,0.5,1];
		var h = [0.5,-0.5,0.5,1];
			
		var tris = [
			[a,b,c],
			[a,b,c],
			[b,f,g],
			[b,g,c],
			[d,c,g],
			[d,g,h],
			[e,a,d],
			[e,d,h],
			[e,f,b],
			[e,b,a],
			[h,g,f],
			[h,f,e]
		];

		for(var i in tris){
			this.triangle(tris[i]);
		}

	}
}

function Sphere(){
	Mesh.call(this);
	this.color = "#ff0000";

	function getPolarVertex(radius,phi,theta){
		var y = radius * Math.sin(phi) * Math.cos(theta);
		var z = radius * Math.sin(phi) * Math.sin(theta);
		var x = radius * Math.cos(phi);

		return [x,y,z,1];
	}

	this.createSlab = function(radius,phi,theta,pdelta,tdelta){
		var a = getPolarVertex(radius,phi,theta);
		var b = getPolarVertex(radius,phi+pdelta,theta);
		var c = getPolarVertex(radius,phi+pdelta,theta+tdelta);
		var d = getPolarVertex(radius,phi,theta+tdelta);

		var cero = [0,0,0,1];
		/*this.triangle([cero,cero,a]);
		this.triangle([cero,cero,b]);
		this.triangle([cero,cero,c]);
		this.triangle([cero,cero,d]);*/
		this.triangle([a,b,c]);
		this.triangle([a,c,d]);
		
		//this.triangle([a,c,d]);


	};
	this.generateGeometry = function(){
		this.clearGeometry();

		var segments = 16;
		for(var i=0;i<Math.PI;i+=Math.PI/segments)
			for(var j=0;j<Math.PI*2;j+=Math.PI/segments)
				this.createSlab(1,i,j,Math.PI/segments,Math.PI/segments);
		
		//this.createSlab(1,1,1,1,1);
		//this.createSlab(1,2,2,1,1);
		
	}
}

function Cone(){
	Mesh.call(this);
	this.color = '#0ff00f';

	this.generateGeometry = function(){
		this.clearGeometry();
		
		var sections = 16;
		var h = 1;

		var basePoints = [];

		for(var i = 0; i<360; i+=360/sections){
			var x = Math.cos(radians(i))/2; // We want radius/2 = 1
			var z = Math.sin(radians(i))/2;
			basePoints.push([x,0,z,1]);
		}
		var center = [0,0,0,1];
		var peak = [0,1,0,1];

		for(var i=0;i<basePoints.length;i++){
			var v1Offset = i%basePoints.length;
			var v2Offset = (i+1)%basePoints.length;
			this.triangle([basePoints[v1Offset],basePoints[v2Offset],center]);
			this.triangle([basePoints[v1Offset],basePoints[v2Offset],peak]);
		}
	
		
	}
}

function CAD(canvas){
	var gl = WebGLUtils.setupWebGL(canvas);
	if ( !gl ) { throw 'GL not supported' };

	MAX_VERTICES = 	1000;
	var objectIndex = 0;
	
	this.width = null;
	this.height = null;

	this.objects = {};
	this.vertices = [];

	this.vertexBuffer = new Float32Buffer(gl);
	this.colors = [];
	this.colorBuffer = new Float32Buffer(gl);
	this.triangles = [];

	/*
     * This function allocates sufficient memory to store
     * vertex and color data for all defined objects
     */
    this.uploadGeometry = function(){
    	var vertices = [];
    	//var colors = [];

    	for(var i in this.objects){
    		this.objects[i].generateGeometry(); // Recreate primitive with current state

    		for(var j in this.objects[i].vertices){
    			vertices.push(this.objects[i].vertices[j]);
    			//colors.push(this.objects[i].colors[j]); // 1 vertex, 1 color
    		}
    	}
    	/* Redim buffers sizes */
    	this.vertexBuffer.setCapacity(vertices.length*4);
    	//this.colorBuffer.setCapacity(colors.length*4);
    	/* Bind vertex shader data to vertex local buffer*/
    	gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer.buffer);
    	var vPosition = gl.getAttribLocation( this.program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );
        
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));

 		// Color 
        /*gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer.buffer);
        var verColor = gl.getAttribLocation( this.program, "verColor" );
        
        gl.enableVertexAttribArray(verColor);
        gl.vertexAttribPointer(verColor, 4, gl.FLOAT, false, 0, 0);
       
        gl.bufferSubData(gl.ARRAY_BUFFER,0, flatten(colors));*/
        
    }

    this.triangle = function(vertexList,color){
    	for(var i in vertexList){
    		this.vertices.push(vertexList[i]);
    		//this.colors.push(html2rgba(color));
    	}
    };

	this.createObject = function(generator){
		var object = new generator(this);
		
		object.generateGeometry();

		var index = "o-"+objectIndex;
		object.id = index;

		this.objects[index] = object;
		this.selectObject(index);

		objectIndex++;

		this.uploadGeometry();

		return index;
	}

	this.selectObject = function(id){
		for(var i in this.objects){
			this.objects[i].setSelected(false);
		}

		var object = this.objects[id];
		object.setSelected(true);
		
		return object;
	};
	this.getObject = function(id){

	};
	this.removeObject = function(id){
		delete this.objects[id];
		this.uploadGeometry();
	};
	this.reset = function(){

	};
	this.resize = function(w,h){
		this.width = w;
		this.height = h;
		console.log(this.width,this.height);
		gl.viewport(0,0,this.width,this.height);
	}
	this.render = function(){
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
		
		/* Camera position */
		var camera = lookAt([2,2,-2],[0,0,0],[0,1,0]);
		var persp = perspective(90,this.width/this.height,0.5,10);
		camera = mult(persp,camera);

		/* Send camera to shader */
		var vsCameraMatrix = gl.getUniformLocation(this.program,'camera');
		gl.uniformMatrix4fv(vsCameraMatrix,false,flatten(camera));
		
		var color = gl.getUniformLocation(this.program,"color");

		var index = 0;
		for(var i in this.objects){
			var object = this.objects[i];
			var vsTranslationMatrix = gl.getUniformLocation(this.program,'translation');
			var vsScaleMatrix = gl.getUniformLocation(this.program,'scale');
			var vsRotationMatrix = gl.getUniformLocation(this.program,'rotation');

			var locMatrix = flatten(object.getTranslationMatrix());
			var rotMatrix = flatten(object.getRotationMatrix());
			var sclMatrix = flatten(object.getScaleMatrix());

			gl.uniformMatrix4fv(vsTranslationMatrix,false,locMatrix);
			gl.uniformMatrix4fv(vsRotationMatrix,false,rotMatrix);
			gl.uniformMatrix4fv(vsScaleMatrix,false,sclMatrix);

			gl.uniform4fv(color,html2rgba(object.color));

			gl.drawArrays(gl.TRIANGLES, index, 3*object.triangleCount);
			index+=object.triangleCount*3;
		}
		// Wireframe pass
		var wireColor = [0,0,0,1];
		var selColor = [1,1,0,1];

		var index = 0;
		for(var i in this.objects){
			var object = this.objects[i];
			var col = object.selected? selColor:wireColor;

			var vsTranslationMatrix = gl.getUniformLocation(this.program,'translation');
			var vsScaleMatrix = gl.getUniformLocation(this.program,'scale');
			var vsRotationMatrix = gl.getUniformLocation(this.program,'rotation');

			var locMatrix = flatten(object.getTranslationMatrix());
			var rotMatrix = flatten(object.getRotationMatrix());
			var sclMatrix = flatten(object.getScaleMatrix());

			gl.uniformMatrix4fv(vsTranslationMatrix,false,locMatrix);
			gl.uniformMatrix4fv(vsRotationMatrix,false,rotMatrix);
			gl.uniformMatrix4fv(vsScaleMatrix,false,sclMatrix);

			gl.uniform4fv(color,col);
			

			for(var j=0;j<object.triangleCount;j++){
				gl.drawArrays(gl.LINE_LOOP, index, 3);
				index+=3;
			}
		}
	};

	/* Setup GL */
	gl.clearColor(0.4,0.4,0.4,1);
	gl.enable(gl.DEPTH_TEST);

	this.program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(this.program);

    

}

function createObjectProperties(object){
	var pos = object.position;
	var sca = object.scale;
	var rot = object.rotation;
	var col = object.color;

	/* 1.- Create position container */
	$("#object-properties").append('\
		<div class="property">\
			<h1>Position</h1>\
			<p>\
				<span>X</span><input class="float" name="posx" type="number" value="'+pos[0]+'" />\
				Y<input class="float" name="posy" type="number" value="'+pos[1]+'" />\
				Z<input class="float" name="posz" type="number" value="'+pos[2]+'" />\
			</p>\
			<h1>Scale</h1>\
				<p>X</p>\
				<p><input class="range" name="scalex" type="range" step="0.1" min="1" max="5" value="'+sca[0]+'" /></p>\
				<p>Y</p>\
				<p><input class="range" name="scaley" type="range" step="0.1" min="1" max="5" value="'+sca[1]+'" /></p>\
				<p>Z</p>\
				<p><input class="range" name="scalez" type="range" step="0.1" min="1" max="5" value="'+sca[2]+'" /></p>\
			<h1>Rotation</h1>\
			<p>\
				<p>X</p>\
				<p><input class="range" name="rotatex" type="range" step="0.1" min="1" max="360" type="text" value="'+rot[0]+'" /></p>\
				<p>Y</p>\
				<input class="range" name="rotatey" type="range" step="0.1" min="1" max="360" value="'+rot[1]+'" /></p>\
				<p>Z</p>\
				<input class="range" name="rotatez" type="range" step="0.1" min="1" max="360" value="'+rot[2]+'" /></p>\
			</p>\
			<h1>Color</h1>\
			<p><input name="color" type="color" value="'+col+'" style="width:100%"/></p>\
		</div>\
	');
	/* 2.- Attach listeners */
	$("#object-properties input[name='posx'],input[name='posy'],input[name='posz']").change(function(event){
		var x = $("#object-properties input[name='posx']").val();
		var y = $("#object-properties input[name='posy']").val();
		var z = $("#object-properties input[name='posz']").val();
		
		object.setPosition([x,y,z]);
		//cad.uploadGeometry();
	});
	$("#object-properties input[name='scalex'],input[name='scaley'],input[name='scalez']").change(function(event){
		var x = $("#object-properties input[name='scalex']").val();
		var y = $("#object-properties input[name='scaley']").val();
		var z = $("#object-properties input[name='scalez']").val();
		
		object.setScale([x,y,z]);
		//cad.uploadGeometry();
	});
	$("#object-properties input[name='rotatex'],input[name='rotatey'],input[name='rotatez']").change(function(event){
		var x = $("#object-properties input[name='rotatex']").val();
		var y = $("#object-properties input[name='rotatey']").val();
		var z = $("#object-properties input[name='rotatez']").val();
		
		object.setRotation([x,y,z]);
		//cad.uploadGeometry();
	});
	$("#object-properties input[name='color']").change(function(event){
		object.setColor(event.target.value);
		cad.uploadGeometry();
	});
}

function resizeCanvas(canvasId){
	var w = $(document).width();
	var h = $(document).height();
	console.log('resizing',w,h);
	document.getElementById(canvasId).width = w;
	document.getElementById(canvasId).height = h;
	console.log(document.getElementById(canvasId).height);
	cad.resize(w,h);
}
function startCAD(canvasId){
	cad = new CAD(document.getElementById(canvasId));
	var generators = {
		'plane':Plane,
		'cube':Cube,
		'sphere':Sphere,
		'cone':Cone,
		'cylinder':Cylinder
	}
	resizeCanvas(canvasId);

	$(window).resize(function(){
		resizeCanvas(canvasId);
	});
	/* Setup the mesh creator */
	$("#mesh-type-selector").append("<option value='default'>select type</option>");
	for(var type in generators){
		$("#mesh-type-selector").append("<option value='"+type+"'>"+type+"</option>");
	}

	$("#mesh-type-selector").change(function(event){
		var generator = generators[event.target.value];
		console.log('Creating object with',generator);
		
		var objectIndex = cad.createObject(generator);

		var title = "Object #"+objectIndex+" ("+event.target.value+")";

		$("#object-list").append(
			'<p id="p-'+objectIndex+'">\
				<a class="destroyer" href="#" title="Delete this object">[X]</a>\
				<a class="selector" href="#" title="Select this object">'+title+' </a>\
			</p>'
		);

		
		/* Add destroy listener */
		$("#p-"+objectIndex+" .destroyer").click(function(event){
			cad.removeObject(objectIndex);
			$("#p-"+objectIndex).remove();
		});
		/* Add select listener */
		$("#p-"+objectIndex+" .selector").click(function(event){
			/* Remove .selected from any other anchor */
			$("#object-list a").removeClass("selected");
			/* Set current anchor as selected */
			$("#p-"+objectIndex+" .selector").addClass("selected");

			/* Let the cad object do the logic associated with selection */
			var selectedObject = cad.selectObject(objectIndex);
			
			/* Empty property tab and show the selected object custom properties */
			$("#object-properties").empty();
			createObjectProperties(selectedObject);
		});
	

		
		/* Finally, reset selector to default value */
		$("#mesh-type-selector option").attr('selected','');
		$("#mesh-type-selector option[value='default']").attr('selected','selected');
	});

	/* Init render loop */
	function render(){
	    setTimeout(function(){
	        requestAnimFrame(render);
	        
	        cad.render();
	        
	    },25);
	}

	render();
}

var cad = null;
