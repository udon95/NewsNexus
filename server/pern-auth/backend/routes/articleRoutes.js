const express = require("express");
const { createArticle, getArticles, getArticleById, updateArticle, deleteArticle } = require("../controllers/articleController");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes (Anyone can view articles)
router.get("/", getArticles);
router.get("/:id", getArticleById);

// Protected routes (Users must be logged in)
router.post("/", verifyToken, createArticle);
router.put("/:id", verifyToken, updateArticle);
router.delete("/:id", verifyToken, deleteArticle);

module.exports = router;
