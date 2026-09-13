import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const recentlyPlayedSchema = new mongoose.Schema(
  {
    song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
    audiusSong: { type: Object },
    playedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const preferencesSchema = new mongoose.Schema(
  {
    volume: { type: Number, default: 0.8, min: 0, max: 1 },
    muted: { type: Boolean, default: false },
    shuffle: { type: Boolean, default: false },
    repeat: { type: String, enum: ["off", "one", "all"], default: "off" },
  },
  { _id: false },
)

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    likedAudiusSongs: { type: Array, default: [] },
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Playlist" }],
    recentlyPlayed: [recentlyPlayedSchema],
    preferences: { type: preferencesSchema, default: () => ({}) },
  },
  { timestamps: true },
)

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next()
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export const User = mongoose.model("User", userSchema)
