var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('globe', { title: 'Fireball Visualizer' });
});

router.get('/newglobe', async function(req, res, next) {
    const json = await fetch('https://ssd-api.jpl.nasa.gov/fireball.api', {method: 'GET', headers: {'Content-Type': 'application/json'}});
    const data = await json.json();
    const jsonData = JSON.stringify(data);
    console.log(JSON.stringify(data));
    
    res.render('newglobe', { title: 'Extra example globe', responseJson: jsonData });

});

router.get('/testglobe', function(req, res, next){
    res.render('testglobe', { title: 'Test Globe' });
});

module.exports = router;
