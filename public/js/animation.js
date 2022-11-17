var pause_play = $("#pause-play");
var forward_fast = $("#forward-fast");
var forward = $("#forward");
var backward = $("#backward");
var backward_fast = $("#backward-fast");

$('#pause-play').click((e) => {
    if(e.target.className == "fa-solid fa-play" ){
        e.target.className = "fa-solid fa-pause";
        speed = 0.00001;
    } else if(e.target.className == "fa-solid fa-pause"){
        e.target.className = "fa-solid fa-play";
        speed = 0;
    }
});

forward.mousedown(function() {
    if(speed == 0) return;
    speed = 0.0001
});
forward.mouseup(function() {
    if(speed == 0) return;
    speed = 0.00001
});
forward_fast.mousedown(function() {
    if(speed == 0) return;
    speed = 0.001
});
forward_fast.mouseup(function() {
    if(speed == 0) return;
    speed = 0.00001
});
backward.mousedown(function() {
    if(speed == 0) return;
    speed = -0.0001
});
backward.mouseup(function() {
    if(speed == 0) return;
    speed = 0.00001
});
backward_fast.mousedown(function() {
    if(speed == 0) return;
    speed = -0.001
});
backward_fast.mouseup(function() {
    if(speed == 0) return;
    speed = 0.00001
});
