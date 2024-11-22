

import mongoose from 'mongoose';

const savedSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    postId: {
      type: mongoose.Types.ObjectId,
      ref: 'Post', 
    },
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const Saved = mongoose.model('Saved', savedSchema);

export default Saved;
