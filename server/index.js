const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/login/login');
const { cleanUpExpiredToken, blacklistExpiredToken } = require("./utils/tokenCleanup");
const property = require("./routes/properties/property");
const inventory=require("./routes/inventory/entries");
const inventoryconfirmation=require("./routes/inventory/confirmations");


const app = express();
const port = 4500;

app.use(cors());
app.use(bodyParser.json());

app.use("/uploads", express.static("uploads"));

app.use('/admin', authRoutes);
app.use('', property);

app.use('/admin', authRoutes);        
app.use('/', inventory);        
app.use('/', inventoryconfirmation);        

blacklistExpiredToken()
cleanUpExpiredToken()

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

