(function() {
	window.onload = function() {
			var displayer = new PositionDisplayer();
		};
})();

// Store a vector
var Vector = function(x, y, z) {
	// Multiplication matrix * vector
	this.multiplyBy = function(mat) {
		var x = mat.a * this.x + mat.b * this.y + mat.c * this.z;
		var y = mat.d * this.x + mat.e * this.y + mat.f * this.z;
		var z = mat.g * this.x + mat.h * this.y + mat.i * this.z;

		return new Vector(x, y, z);
	};

	this.x = x;
	this.y = y;
	this.z = z;
};

// Get a vector from a longitude/colatitude couple
Vector.getByLongColat = function(radius, long, colat) {
	var x =  radius * Math.sin(colat) * Math.sin(long);
	var y = -radius * Math.sin(colat) * Math.cos(long);
	var z =  radius * Math.cos(colat);

	return new Vector(x, y, z);
};

// 3×3 matrix (given in lines)
var Matrix = function(a, b, c, d, e, f, g, h, i) {
	// Multiplication (another) matrix * (this) matrix
	this.multiplyBy = function(mat) {
		var a = mat.a * this.a + mat.b * this.d + mat.c * this.g;
		var b = mat.a * this.b + mat.b * this.e + mat.c * this.h;
		var c = mat.a * this.c + mat.b * this.f + mat.c * this.i;

		var d = mat.d * this.a + mat.e * this.d + mat.f * this.g;
		var e = mat.d * this.b + mat.e * this.e + mat.f * this.h;
		var f = mat.d * this.c + mat.e * this.f + mat.f * this.i;

		var g = mat.g * this.a + mat.h * this.d + mat.i * this.g;
		var h = mat.g * this.b + mat.h * this.e + mat.i * this.h;
		var i = mat.g * this.c + mat.h * this.f + mat.i * this.i;

		return new Matrix(a, b, c, d, e, f, g, h, i);
	};

	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
	this.e = e;
	this.f = f;
	this.g = g;
	this.h = h;
	this.i = i;
};

// A face to render
var Face = function(A, B, C, D) {
	this.A = A;
	this.B = B;
	this.C = C;
	this.D = D;
};

// Retrieve and display the position
var PositionDisplayer = function() {
	// Initialization
	var init = function() {
		// Calculate the sphere faces
		calculateSphere();

		// Retrieve the canvas
		canvas = document.getElementById('canvas');

		width = canvas.offsetWidth;
		height = canvas.offsetHeight;

		canvas.width = width;
		canvas.height = height;

		ctx = canvas.getContext('2d');

		ctx.fillStyle = sphere_faces_color;

		cx = width / 2;
		cy = height / 2;

		// First render
		render();

		// Events
		canvas.addEventListener('mousedown', mouseDown, false);
		document.addEventListener('mouseup', mouseUp, false);
		document.addEventListener('mousemove', mouseMove, false);

		// Retrive the first position
		retrievePos();
	};

	// Calculate the different faces of the sphere
	var calculateSphere = function() {
		// Faces storage
		sphere_faces = [];

		// For every horizontal ring
		for (var i = 0; i <= horizontal_rings_number; ++i) {
			// For every vertical ring
			for (var j = 0; j < vertical_rings_number; ++j) {
				// The different longitude/colatitude couples to use
				var theta0 = j / vertical_rings_number * 2 * Math.PI;
				var theta1 = (j + 1) / vertical_rings_number * 2 * Math.PI;

				var phi0 = i / (horizontal_rings_number + 1) * Math.PI;
				var phi1 = (i + 1) / (horizontal_rings_number + 1) * Math.PI;

				// The four points of the current face
				var A = Vector.getByLongColat(radius, theta0, phi0);
				var B = Vector.getByLongColat(radius, theta0, phi1);
				var C = Vector.getByLongColat(radius, theta1, phi1);
				var D = Vector.getByLongColat(radius, theta1, phi0);

				sphere_faces.push(new Face(A, B, C, D));
			}
		}

		sphere_faces_number = sphere_faces.length;
	};

	// Retrieve the current stored position
	var retrievePos = function() {
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				// Sometimes, file is empty and that causes the crash of the script, so we catch the error. Essentially we ignore it.
				try {
					var data = JSON.parse(xhr.responseText);
					positions.push(new Vector(data.x, data.y, data.z));

					// Current coordinates
					document.getElementById('long').textContent = data.long;
					document.getElementById('lat').textContent = data.lat;

					// Current screen orientation
					document.getElementById('orientation').textContent = data.orientation;

					// Must we remove the first point?
					if (positions.length > positions_number_limit)
						positions.splice(0, 1);

					render();
				}

				catch (e) {
					console.log('Error while parsing file content');
				}

				// Next point
				setTimeout(retrievePos, UPDATE_INTERVAL);
			}
		}

		xhr.open('GET', 'position.json?cache=' + Math.random(), true);
		xhr.send(null);
	};

	// The user wants to move
	var mouseDown = function(evt) {
		mouse_x = evt.clientX;
		mouse_y = evt.clientY;
		mouse_down = true;
	};

	// The users wants to stop the rotation
	var mouseUp = function(evt) {
		mouse_down = false;
	};

	// The user moves their mouse
	var mouseMove = function(evt) {
		if (mouse_down) {
			var x = evt.clientX;
			var y = evt.clientY;

			var theta = (mouse_x - x) * Math.PI / 360;
			var phi = (mouse_y - y) * Math.PI / 180;
			rotate(theta, phi);

			mouse_x = x;
			mouse_y = y;
		}
	};

	// Rotation
	var rotate = function(theta, phi) {
		var cos_t = Math.cos(theta);
		var sin_t = Math.sin(theta);
		var cos_p = Math.cos(phi);
		var sin_p = Math.sin(phi);

		var rot = new Matrix(
				cos_t,	-sin_t * cos_p,	 sin_t * sin_p,
				sin_t,	 cos_t * cos_p,	-cos_t * sin_p,
				0,		 sin_p,			 cos_p
			);

		R = R.multiplyBy(rot);
	};

	// Render an image
	var render = function() {
		// A brand new image
		ctx.clearRect(0, 0, width, height);

		// Display ALL the sphere faces!
		ctx.strokeStyle = sphere_rings_color;

		for (var i = 0; i < sphere_faces_number; ++i) {
			// Rotation needed?
			var A = sphere_faces[i].A.multiplyBy(R);
			var B = sphere_faces[i].B.multiplyBy(R);
			var C = sphere_faces[i].C.multiplyBy(R);
			var D = sphere_faces[i].D.multiplyBy(R);

			// Face
			var path_face = new Path2D();
			path_face.moveTo(A.x + cx, -A.z + cy);
			path_face.lineTo(B.x + cx, -B.z + cy);
			path_face.lineTo(C.x + cx, -C.z + cy);
			path_face.lineTo(D.x + cx, -D.z + cy);
			path_face.closePath();

			ctx.stroke(path_face);
			ctx.fill(path_face);
		}

		// Display ALL the positions!
		if (positions.length > 0) {
			ctx.strokeStyle = user_path_color;

			var user_path = new Path2D();

			var P = positions[0].multiplyBy(R);
			user_path.moveTo(P.x + cx, -P.z + cy);

			for (var i = 1, n = positions.length; i < n; ++i) {
				P = positions[i].multiplyBy(R);
				user_path.lineTo(P.x + cx, -P.z + cy);
			}

			ctx.stroke(user_path);
		}
	};

	// Position will be updated every UPDATE_INTERVAL milliseconds
	var UPDATE_INTERVAL = 50;

	// Sphere settings
	var radius = 200;
	var horizontal_rings_number = 24;
	var vertical_rings_number = 24;

	// Some styles
	var sphere_faces_color = 'rgba(0, 150, 255, 0.2)';
	var sphere_rings_color = 'rgba(0, 0, 0, 0.1)';
	var user_path_color = '#000000';

	// Sphere
	var sphere_faces = [];
	var sphere_faces_number = 0;

	// Stored positions
	var positions = [];

	// Positions storage limit
	var positions_number_limit = 1000;

	// Current rotation
	var R = new Matrix(
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		);

	// Useful attributes
	var canvas = null, ctx = null;
	var width = 0, height = 0, cx = 0, cy = 0;

	var mouse_x = 0, mouse_y = 0;
	var mouse_down = false;

	// Initialization
	init();
};
