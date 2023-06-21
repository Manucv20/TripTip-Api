const { getConnection } = require("../db/db.js");

const {
  newCommentSchema,
  idCommentsSchema,
} = require("../schemas/commentsSchemas");

const {
  createComments,
  getCommentsByRecommendations,
  getCommentById,
} = require("../db/comments.js");
const { generateError } = require("../helpers.js");

const newCommentController = async (req, res, next) => {
  try {
    const { error, value } = newCommentSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { comment } = value;

    const commentId = await createComments(req.userId, req.params.id, comment);

    return res
      .status(200)
      .json({ message: "Comentario publicado exitosamente.", commentId });
  } catch (err) {
    next(err);
  }
};

const getCommentsByRecommendationsController = async (req, res, next) => {
  try {
    const { error } = idCommentsSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ error: "Id Invalido" });
    }

    const comments = await getCommentsByRecommendations(req, res);

    res.status(200).json({ comments: comments });
  } catch (err) {
    next(err);
  }
};

const deleteCommentsByUserController = async (req, res, next) => {
  let connection;
  try {
    const { error } = idCommentsSchema.validate(req.params);
    if (error) {
      return res.status(400).json({ error: "Id Invalido" });
    }
    const { id } = req.params;
    const comment = await getCommentById(id);

    if (req.userId !== comment.user_id) {
      throw generateError(
        "No estás autorizado para eliminar este comentario",
        400
      );
    }
    connection = await getConnection();
    const deleteCommentQuery = "DELETE FROM comments WHERE id = ?";
    await connection.query(deleteCommentQuery, [id]);

    res.status(200).json({ message: "Comentario eliminado exitosamente." });
  } catch (err) {
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  newCommentController,
  getCommentsByRecommendationsController,
  deleteCommentsByUserController,
};
