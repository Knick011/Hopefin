#!/bin/bash

echo "🚀 BrainBites Complete Setup Script"
echo "=================================="

# Create assets directories
echo "📁 Creating asset directories..."
node scripts/createAssets.js

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Additional dependencies that might be missing
echo "📦 Installing additional dependencies..."
npm install --save \
  react-native-push-notification \
  @react-native-firebase/app \
  @react-native-firebase/admob \
  react-native-device-info \
  react-native-fs

# iOS specific setup
if [ "$(uname)" == "Darwin" ]; then
  echo "🍎 Setting up iOS..."
  cd ios && pod install && cd ..
fi

# Android specific setup
echo "🤖 Setting up Android..."

# Create raw folder for sounds
mkdir -p android/app/src/main/res/raw

# Copy sound files to Android raw folder (lowercase names)
if [ -d "src/assets/sounds" ]; then
  for file in src/assets/sounds/*.mp3; do
    if [ -f "$file" ]; then
      filename=$(basename "$file" | tr '[:upper:]' '[:lower:]' | tr ' ' '_')
      cp "$file" "android/app/src/main/res/raw/$filename"
    fi
  done
fi

# Clean and rebuild
echo "🧹 Cleaning build folders..."
cd android && ./gradlew clean && cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your mascot images to src/assets/images/"
echo "2. Add your sound files to src/assets/sounds/"
echo "3. Add your questions to src/assets/data/questions.json"
echo "4. Run: npm start -- --reset-cache"
echo "5. In another terminal: npm run android"
echo ""
echo "⚠️  Important Android Setup:"
echo "1. Grant Usage Access permission when prompted"
echo "2. Enable notification permissions"
echo "3. Add apps to monitor in Settings"