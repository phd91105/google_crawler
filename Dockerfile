# Use an official Node.js runtime as the base image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and yarn.lock files to the container
COPY package.json yarn.lock ./

# Install the project dependencies
RUN yarn install

# Copy the rest of the project files to the container
COPY . .

# Build the TypeScript code to JavaScript
RUN yarn build

# Specify the command to run when the container starts
CMD ["yarn", "start"]
