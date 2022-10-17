var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();

let url = "https://ssd-api.jpl.nasa.gov/fireball.api";
let settings = {method: "GET", headers: {'Content-Type': 'application/json'}};

/* GET users listing. */
router.get('/fireball', async function(req, res, next) {
    res.render('fireball', { title: 'Data Globe'});
});

router.get('/init', async function(req, res, next) {
    const json = await fetch(url, settings)
    .then(res => res.json());
    const jsonData = JSON.stringify(json);
    res.json(jsonData);

});

router.get('/request', async function(req, res, next) {
    const searchParams = new URLSearchParams(req.query);
    const json = await fetch(url + '?' + searchParams.toString(), settings)
    .then(res => res.json());
    const jsonData = JSON.stringify(json);
    res.json(jsonData);
});

module.exports = router;
