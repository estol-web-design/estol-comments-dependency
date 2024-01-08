// comments.config.js
import EventEmitter from "events";
import createSchema from "../models/comment.model.js";

const configEmitter = new EventEmitter();

export let globalConfig = {
   mongoose: undefined,
   CommentModel: undefined,
};

const getConfig = () => globalConfig;

const updateConfig = (newConfig) => {
   globalConfig = { ...globalConfig, ...newConfig };
   configEmitter.emit("update", globalConfig);
};

export const setGlobalConfig = async ({ mongoose, model }) => {
   if (mongoose && model) {
      throw new Error("You must only provide one prop, databaseURL or model, not both");
   }

   const config = {
      mongoose: mongoose || null,
      CommentModel: mongoose ? createSchema(mongoose) : model,
   };

   updateConfig(config);
};

export { configEmitter, getConfig };
