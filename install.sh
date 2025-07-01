#!/bin/bash

# Exit on error
set -e

echo "Detecting Linux distribution and package manager..."

# Check for apt (Debian, Ubuntu, etc.)
if command -v apt &> /dev/null; then
    echo "Detected apt package manager (Debian/Ubuntu)"
    sudo apt update
    sudo apt install -y nodejs npm

# Check for dnf (Fedora, RHEL 8+)
elif command -v dnf &> /dev/null; then
    echo "Detected dnf package manager (Fedora/RHEL 8+)"
    sudo dnf install -y nodejs npm

# Check for yum (CentOS, older RHEL)
elif command -v yum &> /dev/null; then
    echo "Detected yum package manager (CentOS/RHEL)"
    sudo yum install -y nodejs npm

# Check for pacman (Arch Linux)
elif command -v pacman &> /dev/null; then
    echo "Detected pacman package manager (Arch Linux)"
    sudo pacman -Sy nodejs npm

# Check for zypper (openSUSE)
elif command -v zypper &> /dev/null; then
    echo "Detected zypper package manager (openSUSE)"
    sudo zypper install -y nodejs npm

# Check for apk (Alpine Linux)
elif command -v apk &> /dev/null; then
    echo "Detected apk package manager (Alpine Linux)"
    sudo apk add nodejs npm

else
    echo "Could not detect a supported package manager."
    echo "Please install NodeJS and NPM manually for your distribution."
    exit 1
fi

# Verify installation
echo "Verifying installation..."
node --version
npm --version

echo "NodeJS and NPM have been successfully installed!"
