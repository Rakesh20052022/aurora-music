import mongoose from "mongoose"

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true, index: true },
    coverUrl: { type: String, default: "" },
    releaseYear: { type: Number, default: null },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  },
  { timestamps: true },
)

albumSchema.index({ title: "text" })

export const Album = mongoose.model("Album", albumSchema)
