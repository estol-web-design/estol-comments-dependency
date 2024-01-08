// validateComments.util.js
import { Types } from "mongoose";
import { getConfig, configEmitter } from "../config/comments.config.js";

let Comment = getConfig().CommentModel;

configEmitter.on("update", ({CommentModel}) => {
   Comment = CommentModel;
})

export const validateNewCommentData = async (newComment) => {
   const { author, content, parentCommentID, postID } = newComment;

   const missingParameters = [];

   // Verify required parameters where provided, if not add missing parameter(s) to missingParamenters array
   if (!author) missingParameters.push("author");
   if (!content) missingParameters.push("content");
   if (!postID) missingParameters.push("postID");

   // If there is at least one missing required paramameter, send an validation error
   if (missingParameters.length > 0) {
      return { success: false, message: `Missing required parameter(s): "${missingParameters.join(" ")}"`, code: 400 };
   }

   const parametersWithInvalidValue = [];

   // Verify all parameters recived have a valid spected value
   if (parentCommentID && !Types.ObjectId.isValid(parentCommentID)) parametersWithInvalidValue.push("parentCommentID");
   if (typeof author !== "string") parametersWithInvalidValue.push("author");
   if (typeof content !== "string") parametersWithInvalidValue.push("content");
   if (!Types.ObjectId.isValid(postID)) parametersWithInvalidValue.push("postID");

   // If there is at least one parameter with an invalid value, send a validation error.
   if (parametersWithInvalidValue.length > 0) {
      return { success: false, message: `Some parameter(s) has/have invalid values: "${parametersWithInvalidValue.join(" ")}"`, code: 400 };
   }

   // If the parentCommentID parameter is provided, verify the comment exists, and if not, send a validation error.
   if (parentCommentID) {
      const parent = await Comment.exists({ _id: parentCommentID });

      if (!parent)
         return {
            success: false,
            message: `The provided parentCommentID ("${parentCommentID}") is well-formed. However, no comment was found with this ID. Please verify that the provided ID is correct.`,
         };
   }

   return { success: true, message: "All parameters were validated", code: 200 };
};

export const validateContentUpdate = ({ content }) => {
   if (!content) return { success: false, message: `Missing required parameter: "content"`, code: 400 };

   if (typeof content !== "string") return { success: false, message: `Parameter has invalid value: "content"`, code: 400 };

   return { success: true, message: "All parameters were validated", code: 200 };
};
