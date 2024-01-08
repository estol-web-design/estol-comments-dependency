# estol-comments

`estol-comments` is a Node.js dependency for managing comments-related operations.

## Installation

To use `estol-comments` in your Node.js project, you can install it using npm:

```bash
npm install estol-comments
```

## Usage

### Importing and initializing

```javascript
import commentController, { configureCommentsDependency } from "estol-comments";

// Configure the dependency with your database URL
configureBlogDependency({
   mongoose: "your-mongoose-instance",
   model: YourCommentModel, // Replace YourCommentModel with your Mongoose model
});

// Access blogController for various blog management operations
const { getComments, commentManagement } = estolCommentController;
```

### Usage example

#### Getting comments

```javascript
const comments = await getComments({ fieldsToPopulate: ["author", "postID", "parentCommentID"], quantity: 5, postID: postID });
console.log(comments);

// comments is going to have this structure

// if error
{
   success: false, 
   message: "", //error message
   code: 500, //error statusCode
   error: error, //sometimes will include a complete error object including errorStack
}

// if success
{
   success: true,
   comments: [], //an array with found posts
   newFalg: newFlag, //a date to use as a flag in the next request
   code: 200, // statusCode for more clarification
}
```

#### Post management

```javascript
const newCommentData = {
  author: // Should be the ObjectId of the author in the User model,
  content: "New comment content",
  postID: postID, // The objectID of the commented post in the Post model
  parentCommentID: parentCommentID, // If newComment is a reply to another comment, must include the parent comment ObjectId
};

const createdComment = await commentManagement({ action: 'create', fieldsToPopulate: ["author", "parentCommentID", "postID"], ...newCommentData });
console.log(createdComment);

// createdComment is going to have this structure

// if error
{
   success: false, 
   message: "", //error message
   code: 500, //error statusCode
   error: error, //sometimes will include a complete error object including errorStack
}

// if success
{
   success: true,
   createdCinnebt: {}, //an object with the new comment document data from de DB
   code: 201, // statusCode for more clarification
}

```

**Note**: Please replace `// Should be the ObjectId of the author in the User model` with the actual ObjectId of the author in your User model. This adjustment ensures that the "author" field is correctly represented as an ObjectId, maintaining the integrity of the data model.

## Configuration

estol-comments uses Mongoose for database interactions. Make sure to have Mongoose installed and configured in your project.

## API Reference

### `configureCommentsDependency(config)`

Configures the `estol-comments` dependency with the provided configuration.

-  `config`: An object containing the configuration options. It should have either a `databaseURL` or a `model`, but not both.

   -  `mongoose`: The complete Mongoose intance of your project. estol-comments will use this instance for comment Schema and model creation.

   -  `model`: The Mongoose model instance from the user's project. If provided, the dependency will use the user's Mongoose model for comments.

**Note**: The user must provide either `mongoose` or `model`, not both. If `mongoose` instance is provided, the dependency connects to the database using its default model. If `model` is provided, the dependency uses the user's Mongoose model. It's mandatory to provide one of the two options; providing both is not allowed.

**Important**: If the user decides to provide a model, it is important that this model has at least the same fields in the default model(author, content, likes, postID, replies, parentCommentID and timestamps) to avoid dependency's malfunctions.

### Default Model

If the user chooses to use the default model provided by the `estol-comments` dependency, the model looks like this:

```javascript
// post.model.js
import { Schema, model } from "mongoose";
const { ObjectId } = Schema.Types;

const commentSchema = new Schema(
      {
         author: { type: ObjectId, rel: "User", required: true },
         content: { type: String, required: true },
         likes: { type: Number, default: 0 },
         postID: { type: ObjectId, rel: "Post", required: true },
         replies: [{ type: ObjectId, rel: "Comment" }],
         parentCommentID: { type: ObjectId, rel: "Comment", default: null },
      },
      {
         timestamps: true,
      }
   );

const Comment = model("Comment", commentSchema);
```

**Important**: If you opt to use the default model, it's crucial to ensure that your project includes a Mongoose models for "User" and "Post" to prevent errors. The "author" field in the default comment model references the "User" model, and the "postID" field references the "Post" model. If the "User" or "Post" models is not defined in your project, it may lead to reference errors. Please make sure that the "User" and "Post" model are availables in your project to maintain the integrity of the default comment model.

## `estolCommentController`

A set of functions for managing comment-related operations.

### `getComments(options)`

Retrieve comments based on specified options.

#### Options

The `options` object can include several properties:

-  `fieldsToPopulate`: Should be an array of strings containing the names of all the fields of the model to be populated.

-  `useLean`: An optional boolean property. By default, this field is set to `true` unless the dependency user needs to receive the complete model instance. In that case, the user should set this property as `useLean: false`, and the dependency will return a complete model instance instead of a plain JavaScript object.

-  `flag`: An optional string property representing a date to facilitate pagination. When requesting the first page, this property is not necessary to include. The dependency will include the flag for the next page in the returned object after the first page. The user only needs to include this flag in the next request.

-  `quantity`: An optional property determining the extent of each page. If not provided, by default, each call will return a maximum of 15 comments.

-  `postID`: A mandatory property. This property is used by the dependency to perform the search of the post's comments on database.

### `commentManagement(options)`

Perform comment management actions like creating, updating, or deleting.

#### Options

The `options` object can include several properties:

-  `action`: A mandatory string property that can have a value of `"create"`, `"update"`, or `"delete"`, depending on the action to be carried out.

-  `fieldsToPopulate`: Should be an array of strings containing the names of all the fields of the model to be populated.

-  `author`: A mandatory property when the `action` property is set to `"create"`. The `author` property will be an ObjectId from de User model.

-  `content`: A mandatory property in case the `action` property is set to `"create"` or `"update"`. The `content` property will be a string containing the text content for the comment to be created or updated.

-  `commentID`: A mandatory property in case the `action` property is set to `"update"` or `"delete"`. This property is used by the dependency to identify the comment in the database that needs to be updated or deleted.

-  `parentCommentID`: An optional property in case the `action` property is set to `"create"` and the new comment is a response to another comment. The `parentCommentID` property will be an ObjectId from the Comment model.

-  `postID`: A mandatory property in case the `action` property is set to `"create"`. The `postID` property will be an ObjectId form de Post model.

-  `useLean`: An optional boolean property. By default, this field is set to `true` unless the dependency user needs to receive the complete model instance. In that case, the user should set this property as `useLean: false`, and the dependency will return a complete model instance instead of a plain JavaScript object.

**Note**: Ensure consistency in the naming convention of properties, using `camelCase` throughout the `options` object.

## Licence

This project is licensed under the MIT License - see the LICENSE.md file for details.

```vbnet

Make sure to replace placeholders like `'your-database-url'`, `YourPostModel`, and adjust the code snippets based on your actual implementation and use case.

```
