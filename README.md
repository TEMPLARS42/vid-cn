
# Vid-CN

Vid-CN is a video-sharing web application built using the MERN stack (MongoDB, Express, React, Node.js) with support for HLS video streaming. It leverages BullMQ and Redis for efficient video processing, queuing, and management, providing a seamless video upload and streaming experience for users.

## Features

- **Video Sharing**: Users can upload, share, and view videos in a streamlined interface.
- **HLS Streaming**: Uses HTTP Live Streaming (HLS) for adaptive video streaming, ensuring smooth playback across different network conditions.
- **Real-Time Video Processing**: BullMQ and Redis are used for efficient job management, including video processing tasks like encoding, thumbnail generation, etc.
- **User Authentication**: Secure user authentication with support for OAuth2 (Google, Outlook) via Auth0.
- **Responsive UI**: Built with React, the frontend is responsive and user-friendly, ensuring a great experience on all devices.
- **Scalable Backend**: A Node.js/Express server handles API requests, and MongoDB stores video metadata and user information.

## Tech Stack

- **Frontend**: React.js (with Bootstrap for styling)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Queue Management**: BullMQ, Redis
- **Video Streaming**: HLS (HTTP Live Streaming)
- **Authentication**: Auth0 OAuth2 with Google and Outlook
- **Storage**: Cloud-based storage (e.g., AWS S3, Google Cloud Storage) for video files

## Getting Started

### Prerequisites

- **Node.js** and **npm** installed
- **MongoDB** server running
- **Redis** installed and running
- **Auth0 account** for user authentication
- **Cloud Storage** (optional but recommended for large-scale file storage)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/vid-cn.git
   cd vid-cn
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env` file in the root directory and configure the following variables:

   ```bash
   # MongoDB connection
   MONGODB_URI=your-mongodb-connection-string

   # Redis connection
   REDIS_URL=redis://localhost:6379

   # Auth0 configuration
   AUTH0_DOMAIN=your-auth0-domain
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   AUTH0_CALLBACK_URL=http://localhost:3000/callback
   ```

4. **Run the application**:

   Start both the backend and frontend servers:

   ```bash
   npm run dev
   ```

   This will start the Node.js backend and the React frontend simultaneously.

### Video Streaming

Vid-CN supports HLS video streaming to ensure optimal playback across different devices and network speeds. Videos uploaded by users are processed and split into chunks for adaptive bitrate streaming.

### Queue Management with BullMQ

BullMQ and Redis are used to manage tasks such as:

- Video encoding and processing
- Generating thumbnails
- Managing video uploads and streaming preparation

Redis handles job queuing and ensures the scalability and performance of the video processing pipeline.

## Contributing

We welcome contributions to improve Vid-CN! Here's how you can get involved:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Make your changes and commit them (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
