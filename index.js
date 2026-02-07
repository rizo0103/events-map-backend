const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

require("dotenv").config();

const serviceAccount = require("./events-map-f3384-firebase-adminsdk-fbsvc-7bc3cab05d.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hello From Rizo!");
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
