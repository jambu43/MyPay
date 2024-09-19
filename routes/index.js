var express = require('express');
var router = express.Router();
var cors = require('cors');
var qs = require('qs');
const { v4: uuidv4 } = require('uuid');

// Utiliser CORS pour autoriser toutes les origines ou configurer des origines spécifiques
router.use(cors({
  origin: 'https://votre-domaine.com', // Remplacez par votre domaine, sinon mettre '*' pour autoriser toutes les origines.
  methods: ['GET', 'POST'], // Vous pouvez spécifier les méthodes autorisées
  allowedHeaders: ['Content-Type'] // Vous pouvez spécifier les headers autorisés
}));

// Votre fonction maxicash et route
async function maxicash(phone, currency, amount) {
  try {
    phone = phone.replace(/\s+/g, '');
    if (!phone.startsWith('+')) {
      phone = '+' + phone;  
    }
    let head = phone.toString().slice(0, 6);

    let payload = {
      "RequestData": {
        "Amount": amount,
        "Reference": uuidv4(),
        "Telephone": phone
      },
      "MerchantID": "caa878a9f0a64c30b7d026d2dc79c1bc", // Remplacez par votre Merchant ID
      "MerchantPassword": "3eb3d38a20ae48db84845df2596c6d3b", // Remplacez par votre Merchant Password
      "PayType": (head === "+24381" || head === "+24382" || head === "+24383") ? 2 : 
                 (head === "+24384" || head === "+24385" || head === "+24397") ? 3 : 
                 (head === "+24399") ? 1 : 0,
      "CurrencyCode": currency
    };

    console.log('Get Amount :', payload.RequestData.Amount);

    const response = await fetch('https://webapi.maxicashapp.com/Integration/PayNowSync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.ResponseStatus === "Failed") {
      return { state: false, message: data.ResponseError ?? "Paiement échoué" };
    }

    return { state: true, message: "Transaction réussie" };

  } catch (error) {
    return { state: false, message: error.message || error };
  }
}

// Route Express pour gérer la requête
router.get('/api/maxicash', async function(req, res) {
  const { phone, currency, amount } = req.query;

  const result = await maxicash(phone, currency, amount);

  if (!result.state) {
    return res.status(500).json({ success: false, message: result.message });
  }

  return res.status(200).json({ success: true, message: result.message });
});

module.exports = router;
