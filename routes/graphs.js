var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');

let url = "https://ssd-api.jpl.nasa.gov/fireball.api";
let settings = {method: "GET", headers: {'Content-Type': 'application/json'}};

/* GET home page. */
router.get('/', async function(req, res, next) {
  const json = await fetch(url, settings)
    .then(res => res.json());
  res.render('graphs', {fields: json.fields, title: 'Graphs' });
});

router.get('/request', async (req, res, next) => {
    let params = new URLSearchParams(req.query);
    let jsonData;
    if(params.has('sort') && params.get('sort') === 'date') {
      const json = await fetch(url+"?"+params, settings)
      .then(res => res.json());
      jsonData = JSON.stringify(json);
    } else if (params.has('sort') && params.get('sort') === 'impact-e') {
      const json = await fetch(url+"?"+params, settings)
      .then(res => res.json());
      jsonData = JSON.stringify(json);
    }
    res.json({jsonData});
});

router.get('/inittable', async (req, res, next) => {
  const json = await fetch(url, settings)
    .then(res => res.json());
    res.json({data: json.data, count: json.count});
});

router.get('/filltable', async (req, res, next) => {
  let params = new URLSearchParams(req.query);
    params.forEach((value, key) => {
      if(key === '_') params.delete(key);
      if(value.length === 0) params.delete(key);
    });
    const json = await fetch(url+"?"+params, settings)
    .then(res => res.json());
    res.json({data: json.data});
});
module.exports = router;
