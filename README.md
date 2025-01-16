# Qlarr Frontend
Qlarr Surveys is a framework to create and run customizable, scientific & offline-first **[surveys as code](https://github.com/qlarr-surveys/survey-engine)** on all platforms. Surveys are defined using JSON to represent ui agnostic survey components and [Javascript instructions](https://github.com/qlarr-surveys/survey-engine-script) to represent complex survey logic.


This is the backend application for qlarr, built using React to
1. Provide a WYSIWYG editor to create and edit surveys, in Qlarr [Survey Engnine](https://github.com/qlarr-surveys/survey-engine) DSL
2. Render surveys that are executed by Qlarr Survey Engnine (used both in Web and [Android](https://github.com/qlarr-surveys/android) Apps)
3. GUI for Survey management and administrive functionalities exposed by our open source backend, like login, adding using, cloning surveys....etc.


## Operations
If you wish to run this project for a production environment, we recommend you to use our [docker-compose](https://github.com/qlarr-surveys/backend/blob/main/docker-compose.yml) file that deploys both frontend and backend

To run this locally, follow these steps:

1. **Prerequisites**:
   - Ensure you have [Node.js](https://nodejs.org/) (version 16 or later) and [npm](https://www.npmjs.com/) installed.

2. **Clone the Repository**:
   ```bash
   git clone https://github.com/qlarr-surveys/frontend
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
   


## Contributing
We welcome contributors, the easiest way to contribute to this project is to join our [Discored server](https://discord.gg/3exUNKwsET) and talk to us directly


## Support
If you are interested in a new feature, please start a Discussion/ Idea
To report a bug, please raise an issue with clear steps to reproduce... Export the survey with the issue and import it as part of your bug report

