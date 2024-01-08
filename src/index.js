// index.js
import { setGlobalConfig } from "./config/comments.config.js";
import commentController from "./controllers/comment.controller.js";

export const configureCommentDependency = (config) => {
   setGlobalConfig(config);
};

export default commentController;
