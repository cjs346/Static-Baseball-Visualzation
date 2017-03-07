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
//this.description = 
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
var PARK_SIZE = 500;
var BAR_CHART_WIDTH = 400;
var BAR_CHART_HEIGHT = 200;

// Create scales to map ballpark locations to pixels
Ballpark.scaleX = d3.scaleLinear()
                    .domain([-GRASS_PADDING, MAX_HR_LENGTH])
                    .range([0, PARK_SIZE]);
Ballpark.scaleY = d3.scaleLinear()
                    .domain([-GRASS_PADDING, MAX_HR_LENGTH])
                    .range([PARK_SIZE, 0]);
Ballpark.scaleDist = d3.scaleLinear()
                       .domain([0, GRASS_PADDING + MAX_HR_LENGTH])
                       .range([0, PARK_SIZE]);

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
 * @param hrs An array of home runs
 * @param park The ballpark that the homeruns were hit in
 */
Ballpark.prototype.drawHomeRuns = function(hrs, park) {
  var svg = this.svg;

  hrs.forEach(function(season) {
    // if (hr.season != 2016) return;
    season.values.forEach(function(hr) {
      var x = Ballpark.scaleX(
        hr.distance * Math.cos((hr.horizAngle - 45) * Math.PI / 180)
      );
      var y = Ballpark.scaleY(
        hr.distance * Math.sin((hr.horizAngle - 45) * Math.PI / 180)
      );

      if(park.homeTeam == hr.hitterTeam){
        svg.append("circle")
           .attr("cx", x)
           .attr("cy", y)
           .attr("r", 4)
           .style("fill", "rgb("+ park.color1 + ")")
           .attr("fill-opacity", "0.25")
      }
      else{
        svg.append("circle")
           .attr("cx", x)
           .attr("cy", y)
           .attr("r", 4)
           .style("fill", "rgba(0, 0, 0, 0.25)");
      }
    });
  });
};

/**
 * Draws a bar chart under the park showing how many home runs were hit each
 * year.
 * @param hrs An array of home runs
 * @param hrMax The maximum number of home runs hit in any season in any
 *              ballpark
 */
Ballpark.prototype.drawBarCharts = function(hrs, hrMax, park) {
  var svg = this.svg;

  // Draw a background for the chart
  svg.append("rect")
    .attr("x", PARK_SIZE)
    .attr("y", 0)
    .attr("width", BAR_CHART_WIDTH)
    .attr("height", PARK_SIZE)
    .style("fill", "rgba(0, 0, 0, 0.05)")

  var timeScale = d3.scaleLinear()
                    .domain([2006, 2016])
                    .range([PARK_SIZE + 40, PARK_SIZE + BAR_CHART_WIDTH - 20]);
  var lengthScale = d3.scaleLinear()
                      .domain([0, hrMax])
                      .range([BAR_CHART_HEIGHT - 20, 20]);

  var seasonHRs=[];
  var homeHRs=[];

  hrs.forEach(function(season) {
    var numHrs = season.values.length;
    var thisSeason = +season.key;
    var homeTeamHrs = 0;

    season.values.forEach(function(hr) {
        if(hr.hitterTeam == park.homeTeam){homeTeamHrs++;}
    });

    seasonHRs.push({season: thisSeason, homeRuns: numHrs});
    homeHRs.push({season: thisSeason, homeRuns: homeTeamHrs});

    // Total home runs
    svg.append("circle")
        .attr("cx", timeScale(thisSeason))
        .attr("cy", lengthScale(numHrs))
        .attr("r", "4px");
    // Home team home runs
    svg.append("circle")
        .attr("cx", timeScale(thisSeason))
        .attr("cy", lengthScale(homeTeamHrs))
        .attr("r", "4px")
        .style("fill", "rgb("+ park.color1 + ")");
  });

  var line = d3.line()
      .x(function(d) { return timeScale(d.season); })
      .y(function(d) { return lengthScale(d.homeRuns); });

  var totalLine = svg.append("path")
      .datum(seasonHRs)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);

  var homeLine = svg.append("path")
      .datum(homeHRs)
      .attr("fill", "none")
      .attr("stroke", "rgb("+ park.color1 + ")")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);

  // Create labels for the axes
  var timeAxis = d3.axisBottom(timeScale).tickFormat(d3.format("4"));
  svg.append("g")
    .attr(
      "transform",
      "translate(0, " + (BAR_CHART_HEIGHT - 20) + ")")
    .call(timeAxis);
  var countAxis = d3.axisLeft(lengthScale);
  svg.append("g")
    .attr("transform", "translate(" + (PARK_SIZE + 40) + ", 0)")
    .call(countAxis);

  // Create a legend
  svg.append("rect")
    .attr("x", PARK_SIZE + 70)
    .attr("y", BAR_CHART_HEIGHT + 15)
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", "rgb(" + park.color1 + ")");
  svg.append("text")
    .text("Home team home runs")
    .attr("x", PARK_SIZE + 92)
    .attr("y", BAR_CHART_HEIGHT + 22.5)
    .style("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .style("font-size", "12px");
  svg.append("rect")
    .attr("x", PARK_SIZE + 230)
    .attr("y", BAR_CHART_HEIGHT + 15)
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", "black");
  svg.append("text")
    .text("Total home runs")
    .attr("x", PARK_SIZE + 252)
    .attr("y", BAR_CHART_HEIGHT + 22.5)
    .style("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .style("font-size", "12px");
//console.log(park);

};
