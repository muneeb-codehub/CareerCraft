import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "Test route working!" }); // To verify if the server is running
});

// Will check the express server is running and the routes are set up correctly

export default router;