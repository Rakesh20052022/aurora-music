import mongoose from "mongoose"

const artistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    image: { type: String, default: "" },
    bio: { type: String, default: "" },
  },
  { timestamps: true },
)

artistSchema.index({ name: "text" })

export const Artist = mongoose.model("Artist", artistSchema)
