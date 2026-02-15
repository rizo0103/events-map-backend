# Use the official Node.js 20 Alpine image as the base image for smaller size
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
# to install dependencies
COPY package*.json ./

# Install dependencies
# Using npm ci for clean and reproducible builds
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the application will listen on
# Cloud Run typically expects applications to listen on the PORT environment variable
# If not set, it defaults to 8080.
ENV PORT 8080
EXPOSE $PORT

# Command to run the application
# Assumes index.js is the main entry point as per package.json
CMD ["node", "index.js"]
