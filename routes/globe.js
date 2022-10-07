var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();
var cors = require('cors');

var allowlist = ['https://fireball.azurewebsites.net', 'http://localhost:3000', 'https://ssd-api.jpl.nasa.gov']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

/* GET users listing. */
router.get('/', cors(corsOptionsDelegate), function(req, res, next) {
    res.render('globe', { title: 'Fireball Visualizer' });
});

router.get('/newglobe', cors(corsOptionsDelegate), async function(req, res, next) {
    const json = await fetch('https://ssd-api.jpl.nasa.gov/fireball.api', {method: 'GET', headers: {'Content-Type': 'application/json'}});
    const data = await json.json();
    const jsonData = JSON.stringify(data);
    
    res.render('newglobe', { title: 'Data Globe', responseJson: jsonData });

});

router.get('/newglobe/submit', async function(req, res, next) {
    console.log(req.query);

    res.render('newglobe');
})

module.exports = router;
