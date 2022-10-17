var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');

let url = "https://ssd-api.jpl.nasa.gov/fireball.api";
let settings = {method: "GET", headers: {'Content-Type': 'application/json'}};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('graphs', { title: 'DLU'});
});

router.get('/request', async (req, res, next) => {
    const json = await fetch(url + "?limit=10", settings)
    .then(res => res.json());
    const jsonData = JSON.stringify(json);
    res.json(jsonData);
});


module.exports = router;
