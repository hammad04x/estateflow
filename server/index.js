const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/login/login');
const { cleanUpExpiredToken, blacklistExpiredToken } = require("./utils/tokenCleanup");


const app = express();
const port = 4500;

app.use(cors());
app.use(bodyParser.json());

app.use("/uploads", express.static("uploads"));

app.use('/admin', authRoutes);        

blacklistExpiredToken()
cleanUpExpiredToken()

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

