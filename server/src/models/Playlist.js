import mongoose from "mongoose"

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    coverUrl: { type: String, default: "" },
    description: { type: String, default: "", maxlength: 300 },
  },
  { timestamps: true },
)

playlistSchema.index({ name: "text" })

export const Playlist = mongoose.model("Playlist", playlistSchema)
