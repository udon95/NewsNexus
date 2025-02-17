const pool = require("../config/db");

// Create a new article
const createArticle = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.userId; // Get user ID from JWT token

  try {
    const newArticle = await pool.query(
      "INSERT INTO articles (title, content, user_id) VALUES ($1, $2, $3) RETURNING *",
      [title, content, userId]
    );

    res.status(201).json({ message: "Article created successfully!", article: newArticle.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all articles (Publicly Accessible)
const getArticles = async (req, res) => {
  try {
    const articles = await pool.query(
      "SELECT articles.*, users.username FROM articles JOIN users ON articles.user_id = users.id ORDER BY created_at DESC"
    );
    res.status(200).json(articles.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single article by ID
const getArticleById = async (req, res) => {
  const { id } = req.params;
  try {
    const article = await pool.query("SELECT * FROM articles WHERE id = $1", [id]);

    if (article.rows.length === 0) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json(article.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an article (Only author can edit)
const updateArticle = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.user.userId;
  const userRole = req.user.role;

  try {
    const article = await pool.query("SELECT * FROM articles WHERE id = $1", [id]);

    if (article.rows.length === 0) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Check if the logged-in user is the author
    if (article.rows[0].user_id !== userId) {
      return res.status(403).json({ message: "You are not authorized to update this article" });
    }

    const updatedArticle = await pool.query(
      "UPDATE articles SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      [title, content, id]
    );

    res.status(200).json({ message: "Article updated successfully", article: updatedArticle.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an article (Only author or admin can delete)
const deleteArticle = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role; // Get role from JWT token

  try {
    const article = await pool.query("SELECT * FROM articles WHERE id = $1", [id]);

    if (article.rows.length === 0) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Only the author or an admin can delete
    if (article.rows[0].user_id !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "You are not authorized to delete this article" });
    }

    await pool.query("DELETE FROM articles WHERE id = $1", [id]);

    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createArticle, getArticles, getArticleById, updateArticle, deleteArticle };
