# MSA Portal Emergency Deployment Dockerfile
# Using Node.js 18.17.0 as specified in .nvmrc

FROM node:18.17.0-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .nvmrc ./

# Install dependencies with npm (more stable than bun for Docker)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]