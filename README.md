# Todo Application Frontend

A React-based frontend for a todo application that connects to a RESTful API backend.

## Features

- User authentication (register and login with username)
- Create, read, update, and delete tasks
- Add descriptions to tasks
- Task completion status
- User-specific tasks
- Beautiful UI with TailwindCSS

## Technologies Used

- React with Hooks
- Axios for API requests
- TailwindCSS for styling
- Vite for fast development and production builds

## Getting Started

### Prerequisites

- Node.js installed
- The backend API running (see backend README)

### Installation

1. Clone the repository

```
git clone <repository-url>
```

2. Install dependencies

```
npm install
```

3. Create a .env file in the root directory (or copy .env.example)

```
VITE_API_URL=http://localhost:5000
```

4. Start the development server

```
npm run dev
```

The application will be available at http://localhost:5173

## Building for Production

To build the app for production:

```
npm run build
```

This will create optimized files in the `dist` folder that you can deploy to a web server.

## Backend Integration

This frontend is designed to work with the Todo Application Backend, which provides the following endpoints:

- User authentication (with username and password)
- Task management (create, read, update, delete)

Make sure the backend server is running and accessible at the URL specified in your .env file.

## License

MIT
