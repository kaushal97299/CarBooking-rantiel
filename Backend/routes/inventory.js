const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Inventory = require("../models/Inventory");
const protect = require("../middleware/auth");


module.exports = (app) => {

  const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/\s+/g, "_");
      cb(null, Date.now() + "-" + safeName);
    },
  });

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
        return cb(new Error("Only images allowed"));
      }
      cb(null, true);
    },
  });

 app.post(
  "/api/inventory",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("TOKEN:", req.headers.authorization);
     

      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (!req.body.price || isNaN(Number(req.body.price))) {
        return res.status(400).json({ message: "Invalid price" });
      }

      const car = await Inventory.create({
        user: req.user._id,
        name: req.body.name,
        brand: req.body.brand,
        model: req.body.model,
        gear: req.body.gear,
        fuel: req.body.fuel,
        price: Number(req.body.price),
        about: req.body.about,
        features: JSON.parse(req.body.features || "[]"),
        image: req.file ? `/uploads/${req.file.filename}` : "",
      });

      res.json(car);
    } catch (err) {
      console.error("INVENTORY ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);


  app.get("/api/inventory/my", protect, async (req, res) => {
    const data = await Inventory.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(data);
  });

  app.delete("/api/inventory/:id", protect, async (req, res) => {
    const deleted = await Inventory.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  });
};
