var gradientBar = document.getElementById("gradient-bar");
var barHeight = gradientBar.offsetHeight;
var indicators = document.getElementsByClassName("indicator");
var numberOfIndicators = indicators.length;
var counter = 0;
for (var x = 0; x < numberOfIndicators; x++) {
	indicators[x].style.top = counter + "px";
	counter += barHeight / numberOfIndicators + 45;
}
