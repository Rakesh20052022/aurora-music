# Aurora Music

Aurora Music is a fully-featured, full-stack music streaming platform featuring local file uploads, user authentication, playlist management, and a dynamic integration with the Audius decentralized streaming network.

## Features

- **Local Music Library**: Upload, manage, and stream your own MP3 files directly from the server.
- **Audius Integration**: Stream millions of tracks directly from the Audius network without downloading or storing files locally.
- **Smart Recommendation Shuffle**: An intelligent shuffle system that analyzes your current song's genre and artist to build a continuous, dynamic playlist of highly relevant music.
- **User Authentication**: Secure user registration and login system with JWT.
- **Admin Dashboard**: Upload new tracks, artists, and albums directly from a secure admin panel.
- **Playlists & Favorites**: Create custom playlists and save your favorite tracks.
- **Modern UI**: A responsive, Spotify-inspired interface built with React and Vite.

## Tech Stack

- **Frontend**: React, Vite, CSS Modules
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **External API**: `@audius/sdk`

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd aurora-music
   ```

2. Install dependencies for both client and server:
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

3. Configure Environment Variables:
   - Copy `server/.env.example` to `server/.env` and fill in your MongoDB URI and secret keys.
   - Copy `client/.env.example` to `client/.env` and fill in your backend URL.

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

## Environment Variables

### Server (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/aurora
JWT_SECRET=your_jwt_secret
STORAGE_PROVIDER=local
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

## License

This project is licensed under the MIT License.
