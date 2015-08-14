(function() {
	// Save the position every SAVE_INTERVAL milliseconds
	var SAVE_INTERVAL = 50;

	// Sphere radius (in pixels)
	var radius = 200;

	// Position storage
	// Sadly we must wait a little bit to see if Device Orientation is supported…
	var sphoords = new Sphoords();
	setTimeout(function() {
		sphoords.start();
	}, 100);

	// Calculate the position from the spherical coordinates
	function calcPos() {
		// Current coordinates
		var coords = sphoords.getCoordinates();
		var coords_deg = sphoords.getCoordinatesInDegrees();

		// Corresponding position on the sphere
		return {
				x: radius * Math.cos(coords.latitude) * Math.sin(coords.longitude),
				y: radius * Math.cos(coords.latitude) * Math.cos(coords.longitude),
				z: radius * Math.sin(coords.latitude),
				long: coords_deg.longitude,
				lat: coords_deg.latitude,
				orientation: sphoords.getScreenOrientation()
			};
	}

	// Save the current position into the right file
	function savePosition() {
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function() {
			// We stored the position, we'll store it again
			if (xhr.readyState == 4 && xhr.status == 200)
				setTimeout(savePosition, SAVE_INTERVAL);
		};

		xhr.open('POST', 'save-position.php', true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send('data=' + JSON.stringify(calcPos()));
	}

	// First position
	savePosition();
})();
