# NoteStack

NoteStack is a web application for managing notes and bookmarks, providing APIs for user authentication, note creation, and bookmark management.

## Prerequisites
- Node.js installed
- Git installed
- MongoDB installed and running
- A code editor (e.g., VS Code)

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/shivamxverma/NoteStack.git
   ```

2. **Navigate to the Client Directory**
   ```bash
   cd server
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Environmental Variables**
   - Create a `.env` file in the `client` directory.
   - Add the required environmental variables (e.g., MongoDB URI, API endpoints) as specified in the `.env.example` file or project documentation.

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### User Authentication

- **Register User**  
  `POST http://localhost:8000/api/v1/users/register`
  ```json
  {
      "fullName": "Shivam Verma",
      "email": "shivam12@gmail.com",
      "username": "shivam12@",
      "password": "12345678"
  }
  ```

- **Login**  
  `POST http://localhost:8000/api/v1/users/login`
  ```json
  {
      "username": "shivam12@",
      "email": "shivam12@gmail.com",
      "password": "12345678"
  }
  ```

- **Logout**  
  `POST http://localhost:8000/api/v1/users/logout`

### Notes Management

- **Create Note**  
  `POST http://localhost:8000/api/v1/notes`
  ```json
  {
      "title": "Notes on Http Methods",
      "content": "Http methods is used to tell the valid...",
      "tags": ["backend", "computer science", "web development"]
  }
  ```

- **Get All Notes**  
  `GET http://localhost:8000/api/v1/notes/687525a2b04520a8bc88eaf5`

- **Update Note**  
  `PUT http://localhost:8000/api/v1/notes/687526f72d2ce5ac74d56e29`
  ```json
  {
      "title": "Notes on Http Methods and Headers",
      "content": "Http methods is used to tell the valid because of Nice and Well formatted things",
      "tags": ["backend", "computer science", "web development,computer networks"]
  }
  ```

- **Delete Note**  
  `DELETE http://localhost:8000/api/v1/notes/687526f72d2ce5ac74d56e29`

- **Search Notes**  
  `GET http://localhost:8000/api/v1/notes?q=http%20methods&tags=backend,computer%20science,web%20development`

### Bookmarks Management

- **Create Bookmark**  
  `POST http://localhost:8000/api/v1/bookmarks`
  ```json
  {
      "title": "learn marketing",
      "url": "https://en.wikipedia.org/wiki/Marketing",
      "tags": ["stocks", "marketing"]
  }
  ```

- **Update Bookmark**  
  `PUT http://localhost:8000/api/v1/bookmarks`
  ```json
  {
      "title": "learn frontend with mastering react",
      "url": "https://react.dev/learn",
      "tags": ["react", "frontend", "javascript"]
  }
  ```

- **Delete Bookmark**  
  `DELETE http://localhost:8000/api/v1/bookmarks/6875347aaf623709c2cd6a02`

- **Search Bookmarks**  
  `GET http://localhost:8000/api/v1/bookmarks?tags=frontend,react%20science,web%20development`

- **Favorite Bookmark**  
  `POST http://localhost:8000/api/v1/bookmarks/68753404af623709c2cd69fc/favorite`