// backend-express-front/index.js

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Données fake identiques pour tous les frontends
function generateProducts() {
  const products = [];
  for (let i = 1; i <= 100; i++) {
    products.push({
      id: i,
      name: `Product ${i}`,
      price: (i % 100) + 0.99,
      stock: i * 3,
    });
  }
  return products;
}

const PRODUCTS = generateProducts();

// Liste
app.get('/api/products', (req, res) => {
  res.json(PRODUCTS);
});

// Détail
app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(product);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Express FRONT API running on port ' + port));
