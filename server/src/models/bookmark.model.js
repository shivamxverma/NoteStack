import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
        trim : true,
        maxlength : [100, "Title cannot exceed 100 characters"]
    },
    description : {
        type : String,
        trim : true,
        maxlength : [5000, "Description cannot exceed 5000 characters"]
    },  
    url : {
        type : String,
        required : true,
        trim : true,
        maxlength : [5000, "URL cannot exceed 5000 characters"]
    },
    visited: {
      type: Date,
      default: () => new Date(),
    },
    favorite: {
        type: Boolean,
        default: false,
    },
    tags : [{
        type : String,
        trim : true,
        maxlength : [50, "Tag cannot exceed 50 characters"]
    }],
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    }
},{timestamps: true});

bookmarkSchema.index({ title: 'text', description: 'text', tags: 'text' });
bookmarkSchema.index({ visited: 1 });

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;