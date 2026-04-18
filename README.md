# School Management System API

A Node.js REST API built with Express.js and MySQL to manage school data and provide proximity-based search functionality.

## Features
- **Add School**: POST endpoint to store school details (name, address, latitude, longitude).
- **List Schools**: GET endpoint to retrieve schools sorted by their distance from a given location using the Haversine formula.
- **Precision**: Uses `DECIMAL(10, 8)` and `DECIMAL(11, 8)` for high-precision coordinate storage.
- **Security**: Uses prepared statements to prevent SQL Injection.

## Prerequisites
- Node.js (v14 or higher)
- MySQL Server

## Setup Instructions

1. **Clone the repository**:
   ```bash
   cd SchoolMgmt
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Database Configuration**:
   - Create a MySQL database and table using the provided `db.sql` script.
   - For a quick cloud setup, I recommend using [Aiven](https://aiven.io/) or [Railway](https://railway.app/) for free MySQL hosting.

4. **Environment Variables**:
   - Rename `.env.example` to `.env`.
   - Update the variables with your database credentials.

5. **Run the server**:
   ```bash
   # Production
   npm start
   
   # Development (with nodemon)
   npm run dev
   ```

## API Documentation

### 1. Add School
- **URL**: `/addSchool`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "Example School",
    "address": "123 Street Name",
    "latitude": 34.052235,
    "longitude": -118.243683
  }
  ```

### 2. List Schools
- **URL**: `/listSchools`
- **Method**: `GET`
- **Query Parameters**:
  - `latitude`: User's current latitude (e.g., `34.052235`)
  - `longitude`: User's current longitude (e.g., `-118.243683`)
- **Response**: A sorted list of schools with an additional `distance` field (in km).

## Testing
A Postman collection is included in the project: `Postman_Collection.json`.
- Import it into Postman.
- Use the `baseUrl` variable to switch between localhost and your deployed URL.

## Deployment
To deploy this API for a live demo:
1. **Host the Database**: Use Aiven or Railway (MySQL).
2. **Host the API**:
   - **Render**: Connect your GitHub repo, set the Build Command to `npm install`, and Start Command to `node index.js`.
   - **Railway**: Connect your repo and it will automatically detect the Node.js environment.
3. **Environment Variables**: Make sure to add your `.env` variables to the hosting service's environment settings.