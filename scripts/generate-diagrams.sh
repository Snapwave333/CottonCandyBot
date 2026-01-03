#!/bin/bash

###############################################################################
# PlantUML Diagram Generation Script
#
# This script generates PNG and SVG exports from PlantUML (.puml) files
# for use in documentation and presentations.
#
# Prerequisites:
#   - Java Runtime Environment (JRE) installed
#   - PlantUML jar file or installed via package manager
#
# Usage:
#   ./scripts/generate-diagrams.sh
#
# Version: 2.0.0
# Date: 2025-12-29
###############################################################################

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DIAGRAMS_DIR="$PROJECT_ROOT/docs/diagrams"
OUTPUT_DIR="$DIAGRAMS_DIR/exports"

echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       PlantUML Diagram Generation Script v2.0.0              ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"

# Check if diagrams directory exists
if [ ! -d "$DIAGRAMS_DIR" ]; then
  echo -e "${RED}✗ Error: Diagrams directory not found: $DIAGRAMS_DIR${NC}"
  exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR/png"
mkdir -p "$OUTPUT_DIR/svg"
mkdir -p "$OUTPUT_DIR/pdf"

echo -e "\n${BLUE}📂 Output directories created:${NC}"
echo -e "  ${GREEN}✓${NC} $OUTPUT_DIR/png"
echo -e "  ${GREEN}✓${NC} $OUTPUT_DIR/svg"
echo -e "  ${GREEN}✓${NC} $OUTPUT_DIR/pdf"

# Check for PlantUML installation
echo -e "\n${BLUE}🔍 Checking for PlantUML installation...${NC}"

PLANTUML_CMD=""

# Method 1: Check for plantuml command
if command -v plantuml &> /dev/null; then
  PLANTUML_CMD="plantuml"
  echo -e "  ${GREEN}✓${NC} Found plantuml command"

# Method 2: Check for plantuml.jar
elif [ -f "/usr/local/bin/plantuml.jar" ]; then
  PLANTUML_CMD="java -jar /usr/local/bin/plantuml.jar"
  echo -e "  ${GREEN}✓${NC} Found plantuml.jar at /usr/local/bin/"

# Method 3: Check for local plantuml.jar
elif [ -f "$SCRIPT_DIR/plantuml.jar" ]; then
  PLANTUML_CMD="java -jar $SCRIPT_DIR/plantuml.jar"
  echo -e "  ${GREEN}✓${NC} Found plantuml.jar in scripts directory"

# Method 4: Try Docker
elif command -v docker &> /dev/null; then
  PLANTUML_CMD="docker run --rm -v \"$DIAGRAMS_DIR:/data\" plantuml/plantuml"
  echo -e "  ${GREEN}✓${NC} Will use Docker plantuml/plantuml image"

else
  echo -e "  ${RED}✗${NC} PlantUML not found!"
  echo -e "\n${YELLOW}Installation options:${NC}"
  echo -e "  ${CYAN}macOS:${NC}   brew install plantuml"
  echo -e "  ${CYAN}Ubuntu:${NC}  sudo apt-get install plantuml"
  echo -e "  ${CYAN}Windows:${NC} choco install plantuml"
  echo -e "  ${CYAN}Docker:${NC}  docker pull plantuml/plantuml"
  echo -e "  ${CYAN}Manual:${NC}  Download from https://plantuml.com/download"
  exit 1
fi

# Find all .puml files
echo -e "\n${BLUE}🔎 Finding PlantUML files...${NC}"
PUML_FILES=$(find "$DIAGRAMS_DIR" -maxdepth 1 -name "*.puml" -type f)

if [ -z "$PUML_FILES" ]; then
  echo -e "  ${RED}✗${NC} No .puml files found in $DIAGRAMS_DIR"
  exit 1
fi

FILE_COUNT=$(echo "$PUML_FILES" | wc -l | tr -d ' ')
echo -e "  ${GREEN}✓${NC} Found $FILE_COUNT diagram file(s)"

# Generate diagrams
echo -e "\n${BLUE}🎨 Generating diagrams...${NC}"

SUCCESS_COUNT=0
FAIL_COUNT=0

for PUML_FILE in $PUML_FILES; do
  BASENAME=$(basename "$PUML_FILE" .puml)
  echo -e "\n  ${CYAN}Processing:${NC} $BASENAME.puml"

  # Generate PNG
  echo -n "    → PNG: "
  if $PLANTUML_CMD -tpng "$PUML_FILE" -o "$OUTPUT_DIR/png" &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
    ((SUCCESS_COUNT++))
  else
    echo -e "${RED}✗ Failed${NC}"
    ((FAIL_COUNT++))
  fi

  # Generate SVG
  echo -n "    → SVG: "
  if $PLANTUML_CMD -tsvg "$PUML_FILE" -o "$OUTPUT_DIR/svg" &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
    ((SUCCESS_COUNT++))
  else
    echo -e "${RED}✗ Failed${NC}"
    ((FAIL_COUNT++))
  fi

  # Generate PDF (if supported)
  echo -n "    → PDF: "
  if $PLANTUML_CMD -tpdf "$PUML_FILE" -o "$OUTPUT_DIR/pdf" &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
    ((SUCCESS_COUNT++))
  else
    echo -e "${YELLOW}⚠ Skipped (requires LaTeX)${NC}"
  fi
done

# Generate index HTML for viewing diagrams
echo -e "\n${BLUE}📄 Generating index.html...${NC}"

cat > "$OUTPUT_DIR/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cotton Candy Bot - Architecture Diagrams</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
      border-bottom: 3px solid #007bff;
      padding-bottom: 10px;
    }
    .diagram {
      background: white;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .diagram h2 {
      margin-top: 0;
      color: #007bff;
    }
    .diagram img {
      max-width: 100%;
      height: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .formats {
      margin: 10px 0;
    }
    .formats a {
      display: inline-block;
      margin-right: 10px;
      padding: 5px 15px;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
    }
    .formats a:hover {
      background: #0056b3;
    }
    .timestamp {
      color: #666;
      font-size: 14px;
      margin-top: 20px;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>🍬 Cotton Candy Bot - Architecture Diagrams v2.0.0</h1>
  <p>Generated on: <strong>2025-12-29</strong></p>

  <div class="diagram">
    <h2>System Architecture</h2>
    <p>High-level component diagram showing the overall system structure.</p>
    <div class="formats">
      <a href="png/system-architecture.png" download>Download PNG</a>
      <a href="svg/system-architecture.svg" download>Download SVG</a>
      <a href="pdf/system-architecture.pdf" download>Download PDF</a>
    </div>
    <img src="svg/system-architecture.svg" alt="System Architecture Diagram">
  </div>

  <div class="diagram">
    <h2>Class Diagram</h2>
    <p>Domain model showing entities, relationships, and behaviors.</p>
    <div class="formats">
      <a href="png/class-diagram.png" download>Download PNG</a>
      <a href="svg/class-diagram.svg" download>Download SVG</a>
      <a href="pdf/class-diagram.pdf" download>Download PDF</a>
    </div>
    <img src="svg/class-diagram.svg" alt="Class Diagram">
  </div>

  <div class="diagram">
    <h2>Trade Execution Sequence</h2>
    <p>Detailed interaction flow for strategy-triggered trade execution.</p>
    <div class="formats">
      <a href="png/sequence-trade-execution.png" download>Download PNG</a>
      <a href="svg/sequence-trade-execution.svg" download>Download SVG</a>
      <a href="pdf/sequence-trade-execution.pdf" download>Download PDF</a>
    </div>
    <img src="svg/sequence-trade-execution.svg" alt="Trade Execution Sequence Diagram">
  </div>

  <div class="diagram">
    <h2>Deployment Architecture</h2>
    <p>Production infrastructure topology and node relationships.</p>
    <div class="formats">
      <a href="png/deployment-diagram.png" download>Download PNG</a>
      <a href="svg/deployment-diagram.svg" download>Download SVG</a>
      <a href="pdf/deployment-diagram.pdf" download>Download PDF</a>
    </div>
    <img src="svg/deployment-diagram.svg" alt="Deployment Diagram">
  </div>

  <div class="diagram">
    <h2>Strategy State Machine</h2>
    <p>Strategy lifecycle states and transitions.</p>
    <div class="formats">
      <a href="png/state-diagram.png" download>Download PNG</a>
      <a href="svg/state-diagram.svg" download>Download SVG</a>
      <a href="pdf/state-diagram.pdf" download>Download PDF</a>
    </div>
    <img src="svg/state-diagram.svg" alt="State Machine Diagram">
  </div>

  <div class="timestamp">
    Generated with PlantUML | Cotton Candy Bot v2.0.0
  </div>
</body>
</html>
EOF

echo -e "  ${GREEN}✓${NC} index.html created"

# Summary
echo -e "\n${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                      GENERATION SUMMARY                       ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${GREEN}✓ Success:${NC} $SUCCESS_COUNT diagram(s) generated"
if [ $FAIL_COUNT -gt 0 ]; then
  echo -e "${RED}✗ Failed:${NC} $FAIL_COUNT diagram(s) failed"
fi

echo -e "\n${BLUE}📦 Output location:${NC}"
echo -e "  $OUTPUT_DIR"

echo -e "\n${BLUE}🌐 View diagrams:${NC}"
echo -e "  file://$OUTPUT_DIR/index.html"

echo -e "\n${GREEN}✓ Done!${NC}\n"

# Open index.html in browser (optional)
read -p "Open index.html in browser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$OUTPUT_DIR/index.html"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$OUTPUT_DIR/index.html"
  elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    start "$OUTPUT_DIR/index.html"
  else
    echo "Please open file://$OUTPUT_DIR/index.html manually"
  fi
fi

exit 0
