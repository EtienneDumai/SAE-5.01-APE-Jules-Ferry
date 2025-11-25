const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/products', (req, res) => {
  // TODO: plus tard → requête vers Postgres
  res.json([{ id: 1, name: 'Product 1', price: 10 }]);
});


app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Express running on port ' + port));
