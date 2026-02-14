const express = require("express");
const cors = require("cors");

require("dotenv").config();

const authRotes = require('./routes/auth');
const eventsRoutes = require('./routes/events.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRotes);
app.use('/api/events', eventsRoutes);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hello From Rizo!");
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
