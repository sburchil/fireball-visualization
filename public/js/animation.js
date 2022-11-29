var pause_play = $("#pause-play");
var forward_fast = $("#forward-fast");
var forward = $("#forward");
var backward = $("#backward");
var backward_fast = $("#backward-fast");

$('#pause-play').click((e) => {
    if(e.target.className == "fa-solid fa-play" ){
        e.target.className = "fa-solid fa-pause";
        speed = 0.000001;
    } else if(e.target.className == "fa-solid fa-pause"){
        e.target.className = "fa-solid fa-play";
        speed = 0;
    }
});

forward.mousedown(function() {
    if(speed == 0) return;
    speed = 0.00001
});
forward.mouseup(function() {
    if(speed == 0) return;
    speed = 0.000001
});
forward_fast.mousedown(function() {
    if(speed == 0) return;
    speed = 0.00005
});
forward_fast.mouseup(function() {
    if(speed == 0) return;
    speed = 0.000001
});
backward.mousedown(function() {
    if(speed == 0) return;
    speed = -0.00001
});
backward.mouseup(function() {
    if(speed == 0) return;
    speed = 0.000001
});
backward_fast.mousedown(function() {
    if(speed == 0) return;
    speed = -0.00005
});
backward_fast.mouseup(function() {
    if(speed == 0) return;
    speed = 0.000001
});


///animate through pages
$('#goToGlobe').click((e) => {
    $('#index-wrapper').fadeOut(1000);
    $('.wrapper').animate({ opacity: '+=1' }, 1500);
    
    globe.pointOfView({ altitude: 5 }, 2000);
    sleep(2000).then(() => $('.home-page').remove());
});
$('#goToGraph').click((e) => {
    document.location = '/graphs';
});