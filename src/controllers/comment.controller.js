// comment.controller.js
import * as commentService from "../services/Comment.service.js";

const actions = ["create", "update", "delete"];

const getComments = async ({ fieldsToPopulate, quantity, flag, useLean, postID }) => {
   if (!postID) {
      return { success: false, message: `No post ID ("postID" parameter) provided to perform comments search`, code: 400 };
   }

   try {
      const { success, comments, code, newFlag, message } = await commentService.getComments({fieldsToPopulate, quantity, flag, useLean, postID});

      if (!success) {
         return { success, code, message };
      }

      const returnObj = { success, comments, code, newFlag };
      if (message) returnObj.message = message;

      return returnObj;
   } catch (err) {
      return err;
   }
};

const commentManagement = async ({ action, author, content, commentID, parentCommentID, postID, fieldsToPopulate, useLean }) => {
   if (!actions.includes(action.toLowerCase())) {
      return { success: false, message: `Action provided is invalid ("action" parameter). Current available actions are: ${actions.join(", ")}`, code: 400 };
   }

   const serviceMethod = action === "create" ? action : "updatedelete";

   try {
      const { success, newCommentID, code, message, oldComment, deletedComment } = await commentService[`${serviceMethod}Comment`]({
         action,
         content,
         id: commentID,
         useLean,
         newComment: { author, content, parentCommentID, postID },
      });

      if (!success) {
         return { success, code, message };
      }

      if (action === "create") {
         const response = await commentService.getOneComment({ fieldsToPopulate, useLean, id: newCommentID });

         if (!response.success) return response;

         return { success, code, createdComment: response.comment };
      } else if (action === "update") {
         const response = await commentService.getOneComment({ fieldsToPopulate, useLean, id: oldComment._id });

         if (!response.success) return response;

         return { success, code, oldComment, updatedComment: response.comment };
      } else {
         return { success, deletedComment, code };
      }
   } catch (error) {
      return err;
   }
};

const commentsController = { getComments, commentManagement };

export default commentsController;
