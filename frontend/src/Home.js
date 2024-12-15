import React, { useState, useEffect } from 'react';
import JsBarcode from 'jsbarcode';

function Home() {
  const [name, setName] = useState('');
  const [customer, setCustomer] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');

  useEffect(() => {
    if (voucherCode) {
      JsBarcode("#barcode", voucherCode, {
        format: "CODE128",
        displayValue: true,
        fontOptions: "bold",
        fontSize: 18,
      });
    }
  }, [voucherCode]);

  const searchCustomer = async () => {
    const response = await fetch(`http://localhost:3001/search?name=${name}`);
    const data = await response.json();
    const perks = getPerks(data.points);
    setCustomer({ ...data, perks });
    setVoucherCode(''); // Reset voucher code when a new customer is searched
  };

  const generateVoucherCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let voucher = '';
    for (let i = 0; i < 10; i++) {
      voucher += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setVoucherCode(voucher);
  };

  const getPerks = (points) => {
    const perksDict = {
      200: '25% discount on food',
      400: '25% discount and one drink for free',
      750: '50% discount on first class seats',
      1000: 'Free upgrade to first class seats'
    };
    return perksDict[points] || 'No perks available';
  };

  return (
    <div>
      <h1>Airline Loyalty Program</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter customer name"
      />
      <button onClick={searchCustomer}>Search</button>
      {customer && (
        <div id="results">
          <p>Name: {customer.name}</p>
          <p>Points: {customer.points}</p>
          <p>Perks: {customer.perks}</p>
          <button onClick={generateVoucherCode}>Redeem Points</button>
          {voucherCode && (
            <>
              <p>Voucher Code: {voucherCode}</p>
              <svg id="barcode"></svg>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
