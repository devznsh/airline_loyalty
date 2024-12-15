const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'devansh',
  database: 'airlineLoyalty'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to database');
});

// Trie Data Structure for Name Search
class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.customerId = null;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(name, id) {
    let node = this.root;
    for (const char of name) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
    node.customerId = id;
  }

  search(name) {
    let node = this.root;
    for (const char of name) {
      if (!node.children[char]) {
        return null;
      }
      node = node.children[char];
    }
    return node.isEndOfWord ? node.customerId : null;
  }
}

// Initialize Trie and Insert Customers
const customerTrie = new Trie();
let sortedCustomers = [];
db.query('SELECT id, name FROM customers', (err, results) => {
  if (err) throw err;
  results.forEach(customer => {
    customerTrie.insert(customer.name.toLowerCase(), customer.id);
  });
  sortedCustomers = results.sort((a, b) => a.name.localeCompare(b.name));
});

// Function to perform binary search on sorted customer array
function binarySearch(customers, name) {
  let low = 0;
  let high = customers.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midName = customers[mid].name.toLowerCase();

    if (midName === name) {
      return customers[mid];
    } else if (midName < name) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return null;
}

app.get('/search', (req, res) => {
  const name = req.query.name.toLowerCase();
  const customerId = customerTrie.search(name);

  if (customerId) {
    const customer = binarySearch(sortedCustomers, name);
    if (customer) {
      res.json(customer);
    } else {
      res.json({ name: 'Not found', points: 'N/A', perks: 'N/A' });
    }
  } else {
    res.json({ name: 'Not found', points: 'N/A', perks: 'N/A' });
  }
});

// Endpoint to add a new customer
app.post('/add-customer', (req, res) => {
  const { name, points } = req.body;
  const query = 'INSERT INTO customers (name, points) VALUES (?, ?)';
  db.query(query, [name, points], (err, result) => {
    if (err) throw err;
    customerTrie.insert(name.toLowerCase(), result.insertId);
    sortedCustomers.push({ id: result.insertId, name, points });
    sortedCustomers.sort((a, b) => a.name.localeCompare(b.name));
    res.json({ message: 'Customer added successfully' });
  });
});

const perksDict = {
  200: '25% discount on food',
  400: '25% discount and one drink for free',
  750: '50% discount on first class seats',
  1000: 'Free upgrade to first class seats'
};

function getPerks(points) {
  return perksDict[points] || 'No perks available';
}

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
