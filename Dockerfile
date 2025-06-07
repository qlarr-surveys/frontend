# Stage 1: Build the React app
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Define build-time environment variables
ARG VITE_FRONT_END_HOST
ARG VITE_PROTOCOL
ARG VITE_BE_URL

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app for production, passing the environment variables
RUN VITE_FRONT_END_HOST=$VITE_FRONT_END_HOST VITE_PROTOCOL=$VITE_PROTOCOL VITE_BE_URL=$VITE_BE_URL npm run build

# Stage 2: Serve the React app with Nginx
FROM nginx:alpine

# Copy the ngnix.conf to the container
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output to the Nginx HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]