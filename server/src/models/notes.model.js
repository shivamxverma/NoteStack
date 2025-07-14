import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    content: {
      type: String,
      required: true,
      trim: true, 
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.every(
            (tag) => typeof tag === 'string' && tag.length <= 50
          );
        },
        message: 'Each tag must be a string with a maximum length of 50 characters',
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

noteSchema.index({ content: 'text', tags: 'text' });

const Note = mongoose.model('Note', noteSchema);

export default Note;