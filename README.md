# Sphoords

Sphoords is a JavaScript library that transforms device orientation data into spherical coordinates. It is used by [Photo Sphere Viewer](https://github.com/JeremyHeleine/Photo-Sphere-Viewer) to let a user navigate into a panorama just by moving its compatible device.

## How To Use It

1. Include the `sphoords.min.js` file into your page.
2. Create a `Sphoords` object.
3. When you want to start listening to device orientation changes, use the `.start()` method to attach the event. Note that the event won't be attached if the API is not supported by the device: the `.isDeviceOrientationSupported` property is here to know if it is supported.
4. At any moment you can retrieve the current spherical coordinates with the `.getCoordinates()` or `.getCoordinatesInDegrees()` methods. They will give you an object like `{longitude: 0, latitude 0}` for example.
5. If you want to stop listening to the event, you can call the `.stop()` method.
6. You can add your own function to call every time device orientation is updated by simply calling the `.addListener()` method (e.g. `sphoords.addListener(f)` if your function is called `f` and you stored the `Sphoords` instance into the `sphoords` variable).

## It's Not Perfect!

Device Orientation is a young API, still in development. That's the reason why Sphoords must use this ugly browser detection.

I tried to see all the possible cases and Sphoords is fully functional on Firefox for Android, Chrome and Opera. Please understand that, as the API by itself, Sphoords is still under development.

Moreover, we currently don't have a good way to test if Device Orientation is really supported by the device. Just testing if the event is present is not enough, as desktop browsers support the event, even if hardware support is not here. That's why knowing if device orientation is supported can take a while (some milliseconds). Please keep this information in mind when you build an application with Sphoords.

## License

This library is available under the MIT license.
