// comment.service.js
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { validateContentUpdate, validateNewCommentData } from "../utils/validateComments.util.js";
import { configEmitter, getConfig } from "../config/comments.config.js";

let Comment = getConfig().CommentModel;
let defaultCommentModel = false;

configEmitter.on("update", ({ mongoose, CommentModel }) => {
   Comment = CommentModel;
   if (mongoose) {
      defaultCommentModel = true;
   }
});

const operations = ["update", "delete"];

export const getComments = async ({ fieldsToPopulate = [], originalQuantity = null, flag = null, useLean = true, postID = null }) => {
   // Check if original quantity parameter is valid. If it's not valid, assign a default value.
   const quantity = typeof originalQuantity === "number" && originalQuantity > 0 ? originalQuantity : 15;

   // Create DateFlag for search query. If no flag is provided, use the current date.
   const dateFlag = flag ? new Date(flag) : new Date();

   // Create an object with search parameters, including postID and a createdAt condition based on the flag.
   const searchParams = { postID, createdAt: { $lt: dateFlag } };

   // Initialize search query with sort and limit methods to retrieve comments based on specified criteria.
   let query = Comment.find(searchParams).sort("-createdAt").limit(quantity);

   // Check if the user needs to populate any fields and perform population accordingly.
   if (fieldsToPopulate.length > 0) {
      query = query.populate(fieldsToPopulate.join(" "));
   }

   try {
      // Check if the user needs a complete instance of the model; otherwise, send a plain JavaScript object
      const comments = !useLean ? await query : await query.lean();

      // Send an error message if no comments were found.
      if (comments.length < 1) {
         return { success: false, message: "No comments found", code: 404 };
      }

      // Create new flag based on the latest comment's createdAt timestamp for the user to perform the next search.
      const newFlag = comments[comments.length - 1].createdAt;

      // Object to return, including success status, comments, HTTP status code, and newFlag for pagination.
      const returnObj = { success: true, comments, code: 200, newFlag };

      // Check if quantity parameter provided by the user is an invalid number, and if so, add a message to the object to return
      if (typeof originalQuantity === "number" && originalQuantity < 1) {
         returnObj.message = `Invalid value of ${originalQuantity} assigned to quantity parameter, returning 15 comments by default.`;
      }

      return returnObj;
   } catch (err) {
      return { success: false, message: err.message, code: 500, error: err };
   }
};

export const getOneComment = async ({ fieldsToPopulate = [], useLean = true, id = null }) => {
   if (!id) {
      return { success: false, message: `No comment id provided to perform comment search.`, code: 400 };
   }

   let query = Comment.findById(id);

   if (fieldsToPopulate.length > 0) {
      query = query.populate(fieldsToPopulate.join(" "));
   }

   try {
      const comment = !useLean ? await query : await query.lean();

      if (!comment) {
         return { success: false, message: `Comment not found`, code: 404 };
      }

      return { success: true, comment, code: 200 };
   } catch (err) {
      return { success: false, message: err.message, code: 500, error: err };
   }
};

export const createComment = async ({ newComment = null }) => {
   if (!newComment) {
      return { success: false, message: `No comment data ("newComment" parameter) provided to create the new comment`, code: 400 };
   } else if (defaultCommentModel) {
      const { success, message, code } = await validateNewCommentData(newComment);

      if (!success) {
         return { success, message, code };
      }
   }

   const window = new JSDOM("").window;
   const DOMPurify = createDOMPurify(window);

   const sanitizedContent = DOMPurify.sanitize(newComment.content);
   newComment.content = sanitizedContent;


   try {
      const createdComment = await Comment.create(newComment);

      if (!createdComment) {
         return { success: false, message: `Failed to create new Comment`, code: 500 };
      }

      return { success: true, newCommentID: createdComment._id, code: 201 };
   } catch (err) {
      return { success: false, message: err.message, code: 500, error: err };
   }
};

export const updatedeleteComment = async ({ action = "update", content = "", id = null, useLean = true }) => {
   if (!id) {
      return { success: false, message: `No comment id provided to perform comment ${action}.`, code: 400 };
   }

   if (!operations.includes(action)) {
      return { success: true, message: `Action ("action" property) not valid. This dependency only accepts the following actions: ${operations.join(", ")}`, code: 400 };
   }

   if (action === "update" && !content) {
      return { success: false, message: `No content data ("content" parameter) provided to perform comment update`, code: 400 };
   } else if (action === "update" && defaultCommentModel) {
      const { success, message, code } = validateContentUpdate(content);

      if (!success) return { success, message, code };
   }

   let sanitizedContent = DOMPurify.sanitize(content);

   if (action === "delete") {
      sanitizedContent = null;
   }
   
   let query = Comment.findByIdAndUpdate(id, { content: sanitizedContent });

   try {

      const oldComment = !useLean ? await query : await query.lean();

      if (!oldComment) {
         return { success: false, message: `Failed to ${action} comment`, code: 500 };
      }

      if (action === "delete") {
         const deletedComment = oldComment;

         return { success: true, deletedComment, code: 200 };
      }

      return { success: true, oldComment, code: 200 };
   } catch (err) {
      return { success: false, message: err.message, code: 500, error: err };
   }
};
