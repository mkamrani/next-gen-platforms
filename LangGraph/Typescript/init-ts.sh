#!/bin/bash

# script to initialize a new ts project

# Initialize package.json if it doesn't exist
if [ ! -f package.json ]; then
    npm init -y
fi

# Install TypeScript and ts-node as dev dependencies
npm install --save-dev typescript ts-node @types/node

# Initialize TypeScript configuration
npx tsc --init

# Create src directory
mkdir -p src

# Create a basic index.ts file
cat > src/index.ts << EOL
console.log('Hello TypeScript!');
EOL

# Add useful scripts to package.json
npm pkg set scripts.start="ts-node src/index.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.dev="ts-node-dev --respawn src/index.ts"

# Install ts-node-dev for development with hot reload
npm install --save-dev ts-node-dev

echo "TypeScript project initialized successfully!"
echo "You can now run:"
echo "  npm run dev   - for development with hot reload"
echo "  npm start     - to run the project"
echo "  npm run build - to compile TypeScript to JavaScript"

