# cs481_asl
The repository of CS481 Group 1's project, an ASL translator built in Angular.JS.

# Hosting
This web application is compiled using NPM.
Node V22.16 is required.

To host a development server:
1. Run npm install in the asl directory to install the requirements.
2. Run npm run build to build the application.
3. Run npm run start to run a development server.

To host a live server:
1. Update the environment.ts file with your firebase information in app/src/environments.
2. Install the firebase CLI with npm install -g firebase-tools, then run firebase login and log in.
3. Run firebase deploy to deploy the server.
