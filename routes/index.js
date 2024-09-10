var express = require('express');
var router = express.Router();
var qs = require('qs');
const { v4: uuidv4 } = require('uuid');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.get('/api/paiement/', async function(req, res, next) {
  try {
   
    const { amount, currency, phone } = req.query;

    const queryParams = JSON.parse({
      PayType: "2",
      MerchantID: "caa878a9f0a64c30b7d026d2dc79c1bc",
      MerchantPassword: "3eb3d38a20ae48db84845df2596c6d3b",
      Amount: '500',
      Currency: "USD",
      Telephone: "243824043468",
      Language: "fr",
      Reference: "REF09766789",
      Email: "ambujoel@gmail.com",
      Reference: "referencegenrer",
      SuccessURL: "https://rtnc.cd",
      FailureURL: "https://rtnc.cd",
      CancelURL: "https://rtnc.cd",
    });

    console.log("queryParams :", queryParams);

    const response = await fetch(`https://api.maxicashapp.com/PayEntry?data={PayType:"MaxiCash",Amount:"500",Currency:"maxiDollar",Telephone:"0824707127",MerchantID:"caa878a9f0a64c30b7d026d2dc79c1bc",MerchantPassword:"3eb3d38a20ae48db84845df2596c6d3b",Language:"fr",Reference:"ref/11/04/",Accepturl:"https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-http-basic-authentication/",Declineurl:"https://developer.android.com/guide/topics/manifest/receiver-element",NotifyURL:""}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Erreur API:', data);
      return res.status(500).json({ error: 'Erreur de l\'API MaxiCash', details: data });
    }

    return res.json(data);
  } catch (error) {
    console.error('Erreur de requête:', error);
    return res.status(500).json({ error: 'Une erreur est survenue lors de la requête', details: error });
  }
});




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
