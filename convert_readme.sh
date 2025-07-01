#!/bin/bash

set -e

INPUT_FILE="${1:-README.md}"
OUTPUT_FILE="${2:-README.pdf}"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

if ! command -v pandoc &> /dev/null; then
    print_error "pandoc is not installed. Please install it first:"
    echo "  - On Ubuntu/Debian: sudo apt-get install pandoc"
    echo "  - On macOS: brew install pandoc"
    echo "  - On other systems: https://pandoc.org/installing.html"
    exit 1
fi

if ! command -v pdflatex &> /dev/null; then
    print_error "pdflatex is not installed. Please install LaTeX:"
    echo "  - On Ubuntu/Debian: sudo apt install texlive-latex-base texlive-latex-recommended"
    echo "  - For full LaTeX: sudo apt install texlive-full"
    exit 1
fi


if [[ ! -f "$INPUT_FILE" ]]; then
    print_error "Input file '$INPUT_FILE' not found!"
    exit 1
fi

if [[ "$INPUT_FILE" == "README-PDF.md" && ! -f "README-PDF.md" ]]; then
    print_error "No README-PDF.md found in current directory!"
    exit 1
fi

print_status "Converting '$INPUT_FILE' to '$OUTPUT_FILE'..."

pandoc "$INPUT_FILE" \
    -f markdown \
    -t pdf \
    -V geometry:margin=1in \
    -o "$OUTPUT_FILE"

if [[ $? -eq 0 && -f "$OUTPUT_FILE" ]]; then
    print_status "Successfully converted to '$OUTPUT_FILE'"

    if command -v du &> /dev/null; then
        SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
        print_status "Output file size: $SIZE"
    fi
else
    print_error "Conversion failed!"
    exit 1
fi