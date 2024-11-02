# Qlarr Frontend
A React frontend built for Qlarr Survey Engnine, a UI-agnostic tool that lets you create and run customizable, scientific & offline-first surveys as code on all platforms.

As mentioned, Qlarr Survey engine is a UI agnostic tool, meaning it doesn't render UI. Instead, this project aims to
1. WYSIWYG editor to surveys, in Qlarr Survey Engnine DSL
2. Render surveys that are executed by Qlarr Survey Engnine (used both in Web and Android Apps)
3. GUI for Survey management and administrive functionalities exposed by our open source backend, like login, adding using, cloning surveys....etc.

## Contributing
Wanis


## Support
Wanis

## Operations
If you wish to run this project for a production environment, we recommend you to use our docker repo that packages both frontend and backend

To run this locally, follow these steps:

1. **Prerequisites**:
   - Ensure you have [Node.js](https://nodejs.org/) (version 16 or later) and [npm](https://www.npmjs.com/) installed.

2. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/qlarr-surveys.git
   cd frontend
   ```

3. **Install Dependencies**:
   Run the following command to install all necessary dependencies:
   ```bash
   npm install
   ```

4. **Set Up Development Environment**:
   - Edit a `.env` file in the root directory to configure environment variables as needed (e.g., API endpoints, environment settings).
   
5. **Run the Development Server**:
   Start the development server with:
   ```bash
   npm run start
   ```
   This will start the application on `http://localhost:3000`.

6. **Build for Production** (optional):
   To create a production build locally:
   ```bash
   npm run build
   ```

---

This setup will get you up and running with `@qlarr-surveys/frankie-react` for local development. Adjust `.env` settings or port numbers as needed.

