var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('fireball', { title: 'DLU', message: 'Fireball Visualizer', showData: false });
});

router.get('/about', (req, res, next) => {
  res.render('about', { title: 'About' });
});

router.get('/contact', (req, res, next) => {
  res.render('contact', { title: 'Who?' });
});


module.exports = router;
