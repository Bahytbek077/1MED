#!/bin/bash
# Build script that handles the path mismatch between Vite output and server expectation

# Run the standard build
npm run build

# Vite builds to: /public (at project root)
# Server expects: /client/public (when running from /dist)

# Create client/public directory and copy built files
mkdir -p client/public
cp -r public/* client/public/

echo "Build complete. Frontend files copied to client/public for production serving."
