#!/bin/bash

# MSA Portal Development Setup Script
echo "Setting up Mi'raj Scouts Academy Portal..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the application
echo "Building application..."
npm run build

echo "Setup complete! You can now run:"
echo "  npm run dev    - Start development server"
echo "  npm run build  - Build for production"
echo "  npm run start  - Start production server"
