var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('globe', { title: 'Fireball Visualizer' });
});

router.get('/newglobe', function(req, res, next) {
    res.render('newglobe', { title: 'Extra example globe' });
});

router.get('/testglobe', function(req, res, next){
    res.render('testglobe', { title: 'Test Globe' });
});

module.exports = router;
