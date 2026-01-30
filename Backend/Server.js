const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./Conifig/db");
const cors = require("cors");
// const authRoutes = require("./routes/auth");
// const clientRoutes = require("./routes/client");

dotenv.config(); // 👈 load .env

const app = express();
app.use(cors());
app.use(express.json());

/* connect database */
connectDB();


/* test route */
app.get("/", (req, res) => {
  res.send("Server running + DB connected");
});
require("./routes/auth")(app);
require("./routes/client")(app);

// app.use("/api/auth", authRoutes);
// app.use("/api/clients", clientRoutes);

/* start server */
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
