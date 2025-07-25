// backend/src/routes/azureRoute.js
const express = require('express');
const router = express.Router();
const database = require('../connection/azureConnection');

// http://localhost:3000/api/alwaysdataDB/test
router.get('/test', (req, res) => {
  database.query('SELECT NOW() AS now', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// http://localhost:3000/api/alwaysdataDB/orders
router.get('/orders', (req, res) => {
  database.query('SELECT * FROM orders', (err, results) => {
    if (err) return res.status(500).json({ error: '查詢失敗', details: err });
    res.json(results);
  });
});

// http://localhost:3000/api/alwaysdataDB/orders_query
router.get('/orders_query', (req, res) => {
  database.query('SELECT * FROM orders_query', (err, results) => {
    if (err) return res.status(500).json({ error: '查詢失敗', details: err });
    res.json(results);
  });
});

// http://localhost:3000/api/alwaysdataDB/products
router.get('/products', (req, res) => {
  database.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: '查詢失敗', details: err });
    res.json(results);
  });
});

// http://localhost:3000/api/alwaysdataDB/users
router.get('/users', (req, res) => {
  database.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: '查詢失敗', details: err });
    res.json(results);
  });
});

// http://localhost:3000/api/alwaysdataDB/visits
router.get('/visits', (req, res) => {
  database.query('SELECT * FROM visits', (err, results) => {
    if (err) return res.status(500).json({ error: '查詢失敗', details: err });
    res.json(results);
  });
});

// http://localhost:3000/api/alwaysdataDB/visits_last_3_days
router.get('/visits_last_3_days', (req, res) => {
  database.query('SELECT * FROM visits_last_3_days', (err, results) => {
    if (err) return res.status(500).json({ error: '查詢失敗', details: err });
    res.json(results);
  });
});

module.exports = router;
