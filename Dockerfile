# Use the official lightweight Node.js 20 image.
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) before other files
# This leverages Docker cache to save time when rebuilding
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the application files to the working directory
COPY . .

# Expose the default port your app runs on
EXPOSE 8000

# Command to run the application
CMD ["npm", "start"]
