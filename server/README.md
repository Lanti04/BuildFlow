# BuildFlow Backend API Server

Node.js/Express backend server for BuildFlow with JWT authentication and AWS S3 integration.

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   - `JWT_SECRET`: A strong secret key for JWT tokens
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: AWS region (e.g., `us-east-1`)
   - `AWS_S3_BUCKET`: Your S3 bucket name

3. **Start the server:**
   ```bash
   npm run dev  # Development mode with auto-reload
   # or
   npm start    # Production mode
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name"
  }
  ```

- `POST /api/auth/login` - Login
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/verify` - Verify JWT token (requires Authorization header)

### Upload

- `POST /api/upload/signed-url` - Get signed URL for uploading to S3
  ```json
  {
    "filename": "image.jpg",
    "fileType": "image/jpeg",
    "folder": "photos"
  }
  ```

- `POST /api/upload/signed-read-url` - Get signed URL for reading from S3
  ```json
  {
    "key": "photos/user-id/filename.jpg"
  }
  ```

- `DELETE /api/upload/:key` - Delete file from S3

### Users

- `GET /api/users/me` - Get current user (requires authentication)
- `PUT /api/users/me` - Update current user (requires authentication)

## Database

Currently uses an in-memory database for development. For production, replace `server/db/users.js` with a real database like PostgreSQL or MongoDB.

## Security Notes

- Always use HTTPS in production
- Store JWT_SECRET securely (use environment variables)
- Never expose AWS credentials in the frontend
- Use signed URLs for S3 uploads (implemented)
- Implement rate limiting for production
- Add input validation and sanitization

## Production Deployment

1. Use a process manager like PM2
2. Set up environment variables on your hosting platform
3. Use a real database (PostgreSQL, MongoDB, etc.)
4. Enable HTTPS
5. Set up CORS properly for your domain
6. Add monitoring and logging
7. Implement rate limiting
8. Set up backup and recovery

