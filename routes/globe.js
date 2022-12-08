var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();

let url = "https://ssd-api.jpl.nasa.gov/fireball.api";
let settings = {method: "GET", headers: {'Content-Type': 'application/json'}};

/* GET users listing. */
router.get('/fireball', async (req, res, next) => {
    res.render('fireball', { title: 'DLU', message: 'Fireball Visualizer', showData: true});
});

/* initizalizing the globe */
router.get('/init', async (req, res, next) => {
    const json = await fetch(url+"?vel-comp=true&req-loc=true", settings)
    .then(res => res.json());
    const jsonData = JSON.stringify(json);
    res.json(jsonData);

});

/* get data for the globe upon request */
router.get('/request', async (req, res, next) => {
    const searchParams = new URLSearchParams(req.query);
    const json = await fetch(url + '?req-loc=true&' + searchParams.toString(), settings)
    .then(res => res.json());
    const jsonData = JSON.stringify(json);
    res.json(jsonData);
});

module.exports = router;
