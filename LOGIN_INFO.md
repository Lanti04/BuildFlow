# BuildFlow - Login Information

## Test Account (Development)

A test user is automatically created when the server starts for the first time.

### Login Credentials:

**Email:** `test@buildflow.com`  
**Password:** `test123`

### How to Login:

1. Make sure the backend server is running:
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

4. You'll be redirected to the login page

5. Enter the credentials above and click "Sign In"

## Create Your Own Account

You can also register a new account:

1. On the login page, click "Don't have an account? Sign up"

2. Fill in:
   - **Name:** Your name
   - **Email:** Your email address
   - **Password:** Your password (minimum 6 characters)

3. Click "Sign Up"

4. You'll be automatically logged in

## Notes

- The test user is only created if no users exist in the database
- Passwords are securely hashed using bcrypt
- In production, use a real database (PostgreSQL, MongoDB, etc.)
- The in-memory database resets when the server restarts (development only)

## Troubleshooting

### Can't Login?
- Make sure the backend server is running on port 3001
- Check that the frontend can connect to the backend (check `.env` file)
- Verify you're using the correct email and password
- Check browser console for errors

### Test User Not Created?
- Check server console for any errors
- The test user is only created if the database is empty
- Restart the server if needed

### Forgot Password?
- In the current version, there's no password reset feature
- You can create a new account with a different email
- In production, implement password reset functionality

## Security Notes

- **Never** use these test credentials in production
- Change the JWT_SECRET in production
- Use strong passwords in production
- Implement password reset functionality for production
- Use a real database in production (data is lost on server restart in development)

