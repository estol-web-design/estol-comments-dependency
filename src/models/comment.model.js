// comment.model.js

function createSchema(mongoose) {
   const { Schema, model } = mongoose;
   const { ObjectId } = Schema.Types;

   const commentSchema = new Schema(
      {
         author: { type: ObjectId, ref: "User", required: true },
         content: { type: String, required: true },
         likes: { type: Number, default: 0 },
         postID: { type: ObjectId, ref: "Post", required: true },
         replies: [{ type: ObjectId, ref: "Comment" }],
         parentCommentID: { type: ObjectId, ref: "Comment", default: null },
      },
      {
         timestamps: true,
      }
   );
   
   const Comment = model("Comment", commentSchema);

   return Comment
}

export default createSchema;
