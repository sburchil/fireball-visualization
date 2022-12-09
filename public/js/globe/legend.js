var gradientBar = document.getElementById("gradient-bar");
var barHeight = gradientBar.offsetHeight;
var indicators = document.getElementsByClassName("indicator");
var numberOfIndicators = indicators.length;
var counter = 0;

// Set the top position of each indicator for the legend
for (var x = 0; x < numberOfIndicators; x++) {
	indicators[x].style.top = counter + "px";
	counter += barHeight / numberOfIndicators + 45;
}
