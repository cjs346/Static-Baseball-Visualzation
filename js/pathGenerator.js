/**
 * A chainable path generator with automatic scaling of x- and y-values. Wraps
 * the D3 path generator.
 * @param scaleX The function to use for x-scaling
 * @param scaleY The function to use for y-scaling
 * @param scaleDist The function to use for distance scaling
 */
var PathGenerator = function(scaleX, scaleY, scaleDist) {
  // Save the scales
  this.scaleX = scaleX;
  this.scaleY = scaleY;
  this.scaleDist = scaleDist;

  // Create the D3 path
  this.path = d3.path();
};

/**
 * Converts a distance and angle into an x-coordinate, in pixels.
 * @param r The distance
 * @param theta The angle
 * @return The x-coordinate
 */
PathGenerator.prototype.xFromPolar = function(r, theta) {
  return this.scaleX(r * Math.cos(theta * Math.PI / 180));
};

/**
 * Converts a distance and angle into a y-coordinate, in pixels.
 * @param r The radius
 * @param theta The angle
 * @return The y-coordinate
 */
PathGenerator.prototype.yFromPolar = function(r, theta) {
  return this.scaleY(r * Math.sin(theta * Math.PI / 180));
};

/**
 * Move the path cursor to the given coordinates.
 * @param x The x-coordinate
 * @param y The y-coordinate
 */
PathGenerator.prototype.moveTo = function(x, y) {
  this.path.moveTo(this.scaleX(x), this.scaleY(y));
  return this;
};

/**
 * Move the path cursor to the given polar coordinates.
 * @param r The radius
 * @param angle The angle (measured counterclockwise from the x-axis)
 */
PathGenerator.prototype.moveToPolar = function(r, theta) {
  this.path.moveTo(this.xFromPolar(r, theta), this.yFromPolar(r, theta));
  return this;
};

/**
 * Draw a line to the given coordinates.
 * @param x The x-coordinate
 * @param y The y-coordinate
 */
PathGenerator.prototype.lineTo = function(x, y) {
  this.path.lineTo(this.scaleX(x), this.scaleY(y));
  return this;
};

/**
 * Draw a line to the given polar coordinates.
 * @param r The radius
 * @param theta The angle
 */
PathGenerator.prototype.lineToPolar = function(r, theta) {
  this.path.lineTo(this.xFromPolar(r, theta), this.yFromPolar(r, theta));
  return this;
};

/**
 * Draws a quadratic curve.
 * @param cx
 * @param cy
 * @param x
 * @param y
 */
PathGenerator.prototype.quadraticCurveTo = function(cx, cy, x, y) {
  this.path.quadraticCurveTo(
    this.scaleX(cx), this.scaleY(cy), this.scaleX(x), this.scaleY(y)
  );
  return this;
};

/**
 * Draws an arc
 * @param x
 * @param y
 * @param radius
 * @param startAngle
 * @param endAngle
 * @param anticlockwise
 */
PathGenerator.prototype.arc =
    function(x, y, radius, startAngle, endAngle, anticlockwise) {
  this.path.arc(
    this.scaleX(x), this.scaleY(y), this.scaleDist(radius),
    startAngle, endAngle, anticlockwise
  );
  return this;
};

/**
 * Draws a rectangle.
 * @param x
 * @param y
 * @param w
 * @param h
 */
PathGenerator.prototype.rect = function(x, y, w, h) {
  this.path.rect(
    this.scaleX(x), this.scaleY(y), this.scaleDist(w), this.scaleDist(h)
  );
  return this;
};

/**
 * Closes the current path.
 */
PathGenerator.prototype.closePath = function() {
  this.path.closePath();
  return this;
};

/**
 * @return The generated path
 */
PathGenerator.prototype.getPath = function() {
  return this.path;
};
