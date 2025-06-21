require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

const urls = {};      // maps short_id → original_url
let nextId = 1;       // counter for issuing new short URLs

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

const dns = require('dns');
const { URL } = require('url');

app.post('/api/shorturl', (req, res) => {
  let original;
  // validate URL format by constructing new URL()
  try {
    original = new URL(req.body.url);
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }

  // dns.lookup only needs the hostname
  dns.lookup(original.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    // store and respond
    const id = nextId++;
    urls[id] = original.href;
    res.json({ original_url: original.href, short_url: id });
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  const dest = urls[req.params.id];
  if (!dest) {
    return res.json({ error: 'No short URL found for the given input' });
  }
  res.redirect(dest);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
