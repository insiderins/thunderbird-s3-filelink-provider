#!/bin/bash

# Build script untuk membuat XPI dan ZIP file yang valid untuk Thunderbird
# Usage: ./build-xpi.sh [zip|xpi|both]

set -e

XPI_NAME="s3-filelink-provider.xpi"
ZIP_NAME="s3-filelink-provider.zip"
TEMP_DIR="temp_build"

# Parse command line argument
BUILD_TYPE=${1:-both}

echo "Building S3 FileLink Provider..."

# Buat temporary directory
mkdir -p "$TEMP_DIR"

# Copy file yang diperlukan
echo "Copying files..."
cp manifest.json "$TEMP_DIR/"
cp background.js "$TEMP_DIR/"
cp management.html "$TEMP_DIR/"
cp management.js "$TEMP_DIR/"
cp icon.svg "$TEMP_DIR/"

# Copy locales directory
cp -r _locales "$TEMP_DIR/"

cd "$TEMP_DIR"

# Build based on type
if [ "$BUILD_TYPE" = "zip" ] || [ "$BUILD_TYPE" = "both" ]; then
    echo "Creating ZIP file..."
    zip -r "../$ZIP_NAME" . -x "*.DS_Store" "*/.DS_Store"
    echo "ZIP file created: $ZIP_NAME"
    echo "ZIP size: $(cd .. && ls -lh $ZIP_NAME | awk '{print $5}')"
fi

if [ "$BUILD_TYPE" = "xpi" ] || [ "$BUILD_TYPE" = "both" ]; then
    echo "Creating XPI file..."
    zip -r "../$XPI_NAME" . -x "*.DS_Store" "*/.DS_Store"
    echo "XPI file created: $XPI_NAME"
    echo "XPI size: $(cd .. && ls -lh $XPI_NAME | awk '{print $5}')"
fi

cd ..

# Cleanup
echo "Cleaning up..."
rm -rf "$TEMP_DIR"

# Validate file contents
if [ "$BUILD_TYPE" = "zip" ] || [ "$BUILD_TYPE" = "both" ]; then
    echo ""
    echo "Validating ZIP contents:"
    unzip -l "$ZIP_NAME"
fi

if [ "$BUILD_TYPE" = "xpi" ] || [ "$BUILD_TYPE" = "both" ]; then
    echo ""
    echo "Validating XPI contents:"
    unzip -l "$XPI_NAME"
fi

echo ""
echo "Done! Available files:"
if [ -f "$ZIP_NAME" ]; then
    echo "- $ZIP_NAME (for manual distribution)"
fi
if [ -f "$XPI_NAME" ]; then
    echo "- $XPI_NAME (for Thunderbird installation)"
fi

echo ""
echo "Usage:"
echo "  ZIP: Can be extracted and installed via 'Install Add-on From File' > select manifest.json"
echo "  XPI: Direct install via 'Install Add-on From File' > select .xpi file"