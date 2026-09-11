import mongoose from "mongoose"

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: "text" },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true, index: true },
    album: { type: mongoose.Schema.Types.ObjectId, ref: "Album", default: null, index: true },
    genre: { type: String, trim: true, default: "", index: true },
    year: { type: Number, default: null },
    // duration in seconds
    duration: { type: Number, default: 0 },
    audioUrl: { type: String, required: true },
    // storage provider key, used to delete the underlying file later
    audioKey: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
    coverKey: { type: String, default: "" },
    lyrics: { type: String, default: "" },
    // denormalized counters for trending / popular sorting
    playCount: { type: Number, default: 0, index: true },
    likeCount: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
)

// Compound text index so search can match title. Artist/album names are searched via populate + regex in the controller.
songSchema.index({ title: "text", genre: "text" })

export const Song = mongoose.model("Song", songSchema)
