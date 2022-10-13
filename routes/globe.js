var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();

let url = "https://ssd-api.jpl.nasa.gov/fireball.api";
let settings = {method: "GET"};

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('globe', { title: 'Fireball Visualizer' });
});

router.get('/newglobe', async function(req, res, next) {

    const json = await fetch(url, settings)
    .then(res => res.json())
    .then((json) => {
        console.log(json);
    });
    const jsonData = JSON.stringify(json);
    console.log(json);
    res.render('newglobe', { title: 'Data Globe'});

});

router.get('/testglobe', async function(req, res, next) {

    const json = await fetch(url, settings)
    .then(res => res.json())
    .then((json) => {
        console.log(json);
    });
    const jsonData = JSON.stringify(json);
    res.render('testglobe', { title: 'Data Globe'});

});

router.get('/init', async function(req, res, next) {
    const json = await fetch('https://ssd-api.jpl.nasa.gov/fireball.api', {method: 'GET', headers: {'Content-Type': 'application/json'}});
    const data = await json.json();
    const jsonData = JSON.stringify(data);

    res.json(jsonData);

});

router.get('/request', async function(req, res, next) {
    const searchParams = new URLSearchParams(req.query);
    const json = await fetch('https://ssd-api.jpl.nasa.gov/fireball.api?' + searchParams.toString(), {method: 'GET', headers: {'Content-Type': 'application/json'}});
    const data = await json.json();
    const jsonData = JSON.stringify(data);
    if(searchParams == ''){
        return;
    } else {
        return res.json(jsonData);
    }

});

module.exports = router;
