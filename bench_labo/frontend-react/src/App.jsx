// frontend-react/src/App.jsx
import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3003/api/products';

function App() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Erreur de chargement');
        setLoading(false);
      });
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '1rem' }}>
      <h1>Frontend React - Products</h1>

      <input
        type="text"
        placeholder="Rechercher un produit..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          padding: '0.5rem',
          width: '100%',
          maxWidth: 400,
          marginBottom: '1rem',
        }}
      />

      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '1rem' }}>
        {/* Liste */}
        <div style={{ flex: 1 }}>
          {filtered.map((p) => (
            <div
              key={p.id}
              style={{
                border: '1px solid #ccc',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                cursor: 'pointer',
              }}
              onClick={() => setSelected(p)}
            >
              <strong>{p.name}</strong>
              <div>Prix : {p.price} €</div>
              <div>Stock : {p.stock}</div>
            </div>
          ))}
        </div>

        {/* Détail */}
        <div style={{ flex: 1 }}>
          <h2>Détail</h2>
          {selected ? (
            <div>
              <h3>{selected.name}</h3>
              <p>Prix : {selected.price} €</p>
              <p>Stock : {selected.stock}</p>
            </div>
          ) : (
            <p>Cliquer sur un produit...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
