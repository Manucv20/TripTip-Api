const { getConnection } = require('../db/db.js');
const {
  newCommentSchema,
  idCommentsSchema,
} = require('../schemas/commentsSchemas');
const {
  createComments,
  getCommentsByRecommendations,
  getCommentById,
} = require('../db/comments.js');
const path = require('path');
const { createPathIfNotExists } = require('../helpers');
const sharp = require('sharp');

const newCommentController = async (req, res, next) => {
  try {
    const { error, value } = newCommentSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }
    console.log(req.params.id);
    const comment = value;
    const commentId = await createComments(
      req.userId,
      req.params.id,
      comment.comment
    );
    return res
      .status(201)
      .json({ message: 'Comment posted successfully', commentId });
  } catch (err) {
    next(err);
  }
};
const getCommentsByRecommendationsController = async (req, res, next) => {
  try {
    const { error } = idCommentsSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const comments = await getCommentsByRecommendations(req, res);

    res.status(200).json({ comments: comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteCommentsByUserController = async (req, res, next) => {
  let connection;
  try {
    const { error } = idCommentsSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const { id } = req.params;
    const comment = await getCommentById(id);
    console.log(req.userId);
    console.log(comment.user_id);
    if (req.userId !== comment.user_id) {
      throw new Error(
        'You are trying to delete a comment that does not belong to you'
      );
    }
    connection = await getConnection();
    const deleteCommentQuery = 'DELETE FROM comments WHERE id = ?';
    await connection.query(deleteCommentQuery, [id]);

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  newCommentController,
  getCommentsByRecommendationsController,
  deleteCommentsByUserController,
};
