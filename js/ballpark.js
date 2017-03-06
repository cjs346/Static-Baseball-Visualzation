/**
 * Creates a new ballpark to be rendered in the given SVG element with the given
 * dimensions.
 * @param svg The SVG to render the field in
 * @param dimensions An object with keys `lf`, `lcf`, `cf`, `rcf`, and `rf`,
 *                   corresponding to the distance (in feet) to the left field,
 *                   left center field, center field, right center field, and
 *                   right field walls.
 */
var Ballpark = function(svg, dimensions) {
  // Save the SVG element and the dimensions
  this.svg = svg;
  this.lf  = dimensions.lf;
  this.lcf = dimensions.lcf;
  this.cf  = dimensions.cf;
  this.rcf = dimensions.rcf;
  this.rf = dimensions.rf;

  // Render the field
  this.render();
};

// Ballpark constant dimensions (in feet)
var WARNING_ZONE = 20;
var BASEPATH_LENGTH = 90;
var BASEPATH_WIDTH = 6;
var BASE_WIDTH = 3;
var PITCHER_MOUND_RADIUS = 9;
var BATTER_ZONE_RADIUS = 13;
var INFIELD_SAND_SIZE = 120;
var GRASS_PADDING = 20;
var MAX_HR_LENGTH = 550;

// SVG constant dimensions
var SVG_SIZE = 500;

// Create scales to map ballpark locations to pixels
Ballpark.scaleX = d3.scaleLinear()
                    .domain([-GRASS_PADDING, MAX_HR_LENGTH])
                    .range([0, SVG_SIZE]);
Ballpark.scaleY = d3.scaleLinear()
                    .domain([-GRASS_PADDING, MAX_HR_LENGTH])
                    .range([SVG_SIZE, 0]);
Ballpark.scaleDist = d3.scaleLinear()
                       .domain([0, GRASS_PADDING + MAX_HR_LENGTH])
                       .range([0, SVG_SIZE]);

/**
 * Draws the infield, including the sand, the grass diamond, the pitcher's
 * mound, and the baselines.
 */
Ballpark.prototype.drawInfield = function() {
  // Draw the sand around the basepaths
  var basepaths = new PathGenerator(Ballpark.scaleX, Ballpark.scaleY)
    .moveTo(-BASEPATH_WIDTH / 2, -BASEPATH_WIDTH /2)
    .lineTo(INFIELD_SAND_SIZE, -BASEPATH_WIDTH / 2)
    .quadraticCurveTo(
      INFIELD_SAND_SIZE + 25, INFIELD_SAND_SIZE + 25,
      -BASEPATH_WIDTH / 2, INFIELD_SAND_SIZE
    )
    .closePath()
    .getPath();
  this.svg.append("path")
          .attr("d", basepaths.toString())
          .attr("class", "sand");

  // Draw the inner grass diamond
  var grassPath = new PathGenerator(Ballpark.scaleX, Ballpark.scaleY)
    .moveTo(BASEPATH_WIDTH / 2, BASEPATH_WIDTH / 2)
    .lineTo(BASEPATH_WIDTH / 2, BASEPATH_LENGTH - BASEPATH_WIDTH / 2)
    .lineTo(BASEPATH_LENGTH - BASEPATH_WIDTH / 2, BASEPATH_LENGTH - BASEPATH_WIDTH / 2)
    .lineTo(BASEPATH_LENGTH - BASEPATH_WIDTH / 2, BASEPATH_WIDTH / 2)
    .closePath()
    .getPath();
  this.svg.append("path")
          .attr("d", grassPath.toString())
          .attr("class", "grass");

  // Draw the circles around the bases, as well as the pitcher's mound
  var firstBaseCircle = new PathGenerator(
    Ballpark.scaleX, Ballpark.scaleY, Ballpark.scaleDist
  )
    // First base
    .moveTo(BASEPATH_LENGTH, 0)
    .arc(BASEPATH_LENGTH, 0, PITCHER_MOUND_RADIUS, -Math.PI / 2, -Math.PI, true)
    // Second base
    .moveTo(BASEPATH_LENGTH, BASEPATH_LENGTH)
    .arc(
      BASEPATH_LENGTH, BASEPATH_LENGTH, PITCHER_MOUND_RADIUS,
      Math.PI / 2, Math.PI
    )
    // Third base
    .moveTo(0, BASEPATH_LENGTH)
    .arc(0, BASEPATH_LENGTH, PITCHER_MOUND_RADIUS, 0, Math.PI / 2)
    // Home plate
    .moveTo(0, 0)
    .arc(0, 0, BATTER_ZONE_RADIUS, 0, 2 * Math.PI)
    // Pitcher's mound
    .moveTo(BASEPATH_LENGTH / 2, BASEPATH_LENGTH / 2)
    .arc(
      BASEPATH_LENGTH / 2, BASEPATH_LENGTH / 2, PITCHER_MOUND_RADIUS,
      0, 2 * Math.PI
    )
    .getPath();
  this.svg.append("path")
          .attr("d", firstBaseCircle.toString())
          .attr("class", "sand");

  // Draw the baselines
  var baselines = new PathGenerator(Ballpark.scaleX, Ballpark.scaleY)
    .moveTo(0, 0)
    .lineTo(INFIELD_SAND_SIZE + 1, 0)
    .moveTo(BASEPATH_LENGTH, 0)
    .lineTo(BASEPATH_LENGTH, BASEPATH_LENGTH)
    .lineTo(0, BASEPATH_LENGTH)
    .lineTo(0, INFIELD_SAND_SIZE + 1)
    .lineTo(0, 0)
    .getPath();
  this.svg.append("path")
          .attr("d", baselines.toString())
          .attr("class", "baseline");

  // Draw the bases
  var bases = new PathGenerator(
    Ballpark.scaleX, Ballpark.scaleY, Ballpark.scaleDist
  )
    // First base
    .moveTo(BASEPATH_LENGTH - BASE_WIDTH / 2, BASE_WIDTH / 2)
    .rect(
      BASEPATH_LENGTH - BASE_WIDTH / 2, BASE_WIDTH / 2, BASE_WIDTH, BASE_WIDTH
    )
    // Second base
    .moveTo(BASEPATH_LENGTH - BASE_WIDTH / 2, BASEPATH_LENGTH + BASE_WIDTH / 2)
    .rect(
      BASEPATH_LENGTH - BASE_WIDTH / 2, BASEPATH_LENGTH + BASE_WIDTH / 2,
      BASE_WIDTH, BASE_WIDTH
    )
    // Third base
    .moveTo(-BASE_WIDTH / 2, BASEPATH_LENGTH + BASE_WIDTH / 2)
    .rect(
      -BASE_WIDTH / 2, BASEPATH_LENGTH + BASE_WIDTH / 2,
      BASE_WIDTH, BASE_WIDTH
    )
    // Home plate
    .moveTo(-BASE_WIDTH / 2, BASE_WIDTH / 2)
    .rect(-BASE_WIDTH / 2, BASE_WIDTH / 2, BASE_WIDTH, BASE_WIDTH)
    .getPath();
  this.svg.append("path")
          .attr("d", bases.toString())
          .attr("class", "base");

  // Draw the pitcher's mound base
  this.svg.append("rect")
          .attr("width", Ballpark.scaleDist(2 * BASE_WIDTH))
          .attr("height", Ballpark.scaleDist(BASE_WIDTH))
          .attr("class", "base")
          .attr(
            "transform",
            "translate(" +
            Ballpark.scaleX(BASEPATH_LENGTH / 2 - BASE_WIDTH / 2) +
            ", " + Ballpark.scaleY(BASEPATH_LENGTH / 2 + BASE_WIDTH) +
            ") rotate(45)"
          );
};

/**
 * Draws the outfield, including the grass, warning zone, and the foul lines.
 */
Ballpark.prototype.drawOutfield = function() {
  // Draw the warning zone
  var warningPath = new PathGenerator(Ballpark.scaleX, Ballpark.scaleY)
    .moveTo(-GRASS_PADDING, -GRASS_PADDING)
    .lineTo(this.rf, -GRASS_PADDING)
    .lineTo(this.rf, 0)
    .lineToPolar(this.rcf, 30)
    .lineToPolar(this.cf, 45)
    .lineToPolar(this.lcf, 60)
    .lineTo(0, this.lf)
    .lineTo(-GRASS_PADDING, this.lf)
    .closePath()
    .getPath();
  this.svg.append("path")
          .attr("d", warningPath.toString())
          .attr("class", "sand");

  // Draw the grass
  var grassPath = new PathGenerator(Ballpark.scaleX, Ballpark.scaleY)
    .moveTo(-GRASS_PADDING, -GRASS_PADDING)
    .lineTo(this.rf - WARNING_ZONE, -GRASS_PADDING)
    .lineTo(this.rf - WARNING_ZONE, 0)
    .lineToPolar(this.rcf - WARNING_ZONE, 30)
    .lineToPolar(this.cf - WARNING_ZONE, 45)
    .lineToPolar(this.lcf - WARNING_ZONE, 60)
    .lineTo(0, this.lf - WARNING_ZONE)
    .lineTo(-GRASS_PADDING, this.lf - WARNING_ZONE)
    .closePath()
    .getPath();
  this.svg.append("path")
          .attr("d", grassPath.toString())
          .attr("class", "grass");

  // Draw the foul lines
  var foulPath = new PathGenerator(Ballpark.scaleX, Ballpark.scaleY)
    .moveTo(0, 0)
    .lineTo(this.rf, 0)
    .moveTo(0, 0)
    .lineTo(0, this.lf)
    .getPath();
  this.svg.append("path")
          .attr("d", foulPath.toString())
          .attr("class", "baseline");
};

/**
 * Draws and displays the ballpark, including the infield, outfield, and base
 * paths.
 */
Ballpark.prototype.render = function() {
  this.drawOutfield();
  this.drawInfield();
};

/**
 * Draws the home run ball markers on the field.
 * @param hrs An array of objects representing home runs, with keys for the
 *            `distance`, `horizAngle`, and `homeTeam`
 * @param park The ballpark that the homeruns were hit in
 */
Ballpark.prototype.drawHomeRuns = function(hrs, park) {
  var svg = this.svg;
  console.log(hrs);

  hrs.forEach(function(hr) {
    // if (hr.season != 2016) return;

    var x = Ballpark.scaleX(
      hr.distance * Math.cos((hr.horizAngle - 45) * Math.PI / 180)
    );
    var y = Ballpark.scaleY(
      hr.distance * Math.sin((hr.horizAngle - 45) * Math.PI / 180)
    );

    svg.append("circle")
       .attr("cx", x)
       .attr("cy", y)
       .attr("r", 10)
       .style("fill", "rgba(0, 0, 128, 0.05)");

    // var season = hr.season % 100 + "";
    // svg.append("text")
    //    .text("00".substring(0, 2 - season.length) + season)
    //    .attr("x", x)
    //    .attr("y", y)
    //    .style("alignment-baseline", "middle")
    //    .style("text-anchor", "middle")
    //    .style("font-weight", "bold");
  });
};
