# Project Overview

This project is a **Mobile PDF Signing Workflow** application consisting of a **React frontend** and a **Python Flask backend** (mock server). The app allows users to upload a PDF, add initials and metadata to the server, and instantly preview or download the signed document.

## Project Structure

- **frontend/** – Contains the React UI for interacting with the app.
- **backend/** – Contains the Flask API that handles PDF processing and signing.

## Prerequisites

- **Frontend**:
  - Node.js **≥ 16**
  - npm **≥ 8**
- **Backend**:
  - Python **≥ 3.10**
  - pip (for Python dependency management)

## Install & Run – Frontend

1. Navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

2. Install the necessary dependencies:

   ```bash
   npm install
   ```

3. Start the frontend development server:

   ```bash
   npm start
   ```

   The app will run locally at `http://localhost:3000`.

4. (Optional) For production, build the frontend:
   ```bash
   npm run build
   ```

## Install & Run – Backend

1. Navigate to the `backend` directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment:

   ```bash
   python3 -m venv .venv
   ```

3. Activate the virtual environment:

   - For macOS/Linux:
     ```bash
     source .venv/bin/activate
     ```
   - For Windows:
     ```bash
     .venv\Scripts\activate
     ```

4. Install the backend dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Run the Flask server:
   ```bash
   python server.py
   ```
   Or:
   ```bash
   python3 server.py
   ```
   The backend will run locally at `http://localhost:4000`.

## Local Development Flow

1. The backend server is running at `http://localhost:4000`.
2. The frontend React app is running at `http://localhost:3000`.

To successfully upload a PDF, make sure both the frontend and backend servers are running.

### Notes:

- Ensure that the backend server is running before interacting with the web app, as it handles the PDF processing.
- You can modify the port numbers if required in your server configurations.
