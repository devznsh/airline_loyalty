import React, { useState } from 'react';

function AddCustomer() {
  const [name, setName] = useState('');
  const [points, setPoints] = useState('');

  const addCustomer = async () => {
    const response = await fetch('http://localhost:3001/add-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, points })
    });
    const data = await response.json();
    alert(data.message);
    setName('');
    setPoints('');
  };

  return (
    <div>
      <h1>Add Customer</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter customer name"
      />
      <input
        type="number"
        value={points}
        onChange={(e) => setPoints(e.target.value)}
        placeholder="Enter points"
      />
      <button onClick={addCustomer}>Add Customer</button>
    </div>
  );
}

export default AddCustomer;
