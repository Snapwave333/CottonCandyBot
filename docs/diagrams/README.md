# Architecture Diagrams

This directory contains UML 2.5 diagrams documenting the Cotton Candy Bot architecture.

## Diagram Inventory

### 1. System Architecture (`system-architecture.puml`)
**Type:** Component Diagram
**Purpose:** High-level system overview showing all major components and their interactions
**Related Components:** Client Layer, Backend Layer, Data Layer, External Services
**Last Updated:** 2025-12-29
**Author:** Documentation Team

### 2. Class Diagram (`class-diagram.puml`)
**Type:** Class Diagram
**Purpose:** Domain model showing core entities, their relationships, and behaviors
**Related Components:** Engine, ExecutionEngine, Strategy hierarchy, Wallet management
**Last Updated:** 2025-12-29
**Author:** Documentation Team

### 3. Trade Execution Sequence (`sequence-trade-execution.puml`)
**Type:** Sequence Diagram
**Purpose:** Detailed interaction flow for strategy-triggered trade execution
**Related Components:** Full stack interaction from user action to blockchain confirmation
**Last Updated:** 2025-12-29
**Author:** Documentation Team

### 4. Deployment Architecture (`deployment-diagram.puml`)
**Type:** Deployment Diagram
**Purpose:** Production infrastructure topology and node relationships
**Related Components:** Application server, databases, external services, network topology
**Last Updated:** 2025-12-29
**Author:** Documentation Team

### 5. Strategy State Machine (`state-diagram.puml`)
**Type:** State Machine Diagram
**Purpose:** Strategy lifecycle states and transitions
**Related Components:** Strategy execution states (CREATED, IDLE, RUNNING, EXECUTING, etc.)
**Last Updated:** 2025-12-29
**Author:** Documentation Team

## Viewing the Diagrams

### Option 1: PlantUML Online Server
Visit [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/) and paste the content of any `.puml` file.

### Option 2: VS Code Extension
1. Install the [PlantUML extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)
2. Install Java (required for PlantUML rendering)
3. Open any `.puml` file and press `Alt+D` to preview

### Option 3: Command Line (Generate PNG/SVG)
```bash
# Install PlantUML
brew install plantuml  # macOS
apt-get install plantuml  # Ubuntu/Debian
choco install plantuml  # Windows

# Generate PNG
plantuml -tpng system-architecture.puml

# Generate SVG (recommended for web/docs)
plantuml -tsvg system-architecture.puml

# Generate all diagrams
plantuml -tsvg *.puml
```

### Option 4: Docker
```bash
docker run -v $(pwd):/data plantuml/plantuml -tsvg /data/*.puml
```

## Diagram Standards

### Notation
- **UML 2.5 Standard:** All diagrams follow OMG UML 2.5 specification
- **Theme:** Blueprint theme for professional appearance
- **Stereotypes:** Used to clarify component roles (e.g., `<<Singleton>>`, `<<External>>`)

### Metadata Requirements
All diagrams MUST include:
- **Title:** Descriptive diagram title
- **Footer:** Generation date, version, author
- **Header:** Diagram type and context
- **Notes:** Explanatory annotations for complex interactions

### File Naming Convention
- Format: `{diagram-type}-{subject}.puml`
- Examples: `sequence-trade-execution.puml`, `class-diagram.puml`
- Use kebab-case for multi-word names

### Update Policy
- Diagrams must be updated when related code changes significantly
- Version numbers in footers should match CHANGELOG.md versions
- Deprecated diagrams should be moved to `archive/` subdirectory

## Accessibility

### Alt Text for Exported Images
When exporting diagrams to PNG/SVG for documentation, include alt text:

```markdown
![System Architecture showing client browser, Node.js backend, lowdb storage, and external services including Solana, Jupiter, BirdEye, and Jito](system-architecture.svg)
```

### Color Considerations
- Diagrams use blueprint theme with sufficient contrast
- Color is supplementary to shape/text (not relied upon exclusively)
- Monochrome-safe for printing

## Version History

| Version | Date       | Changes                                      | Author              |
|---------|------------|----------------------------------------------|---------------------|
| 2.0.0   | 2025-12-29 | Complete UML 2.5 diagram suite created      | Documentation Team  |
| 1.0.0   | 2025-12-29 | Initial Mermaid diagrams (deprecated)       | Initial Team        |

## Related Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Textual architecture documentation
- [API_REFERENCE.md](../API_REFERENCE.md) - REST and Socket.io API documentation
- [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) - v2.0.0 migration instructions

## Maintenance Guidelines

1. **Before Code Changes:** Review relevant diagrams for impact analysis
2. **After Code Changes:** Update diagrams if architecture/behavior changes
3. **Quarterly Reviews:** Validate all diagrams against current implementation
4. **Deprecation:** Move outdated diagrams to `archive/` with deprecation date

## Tools and Resources

- [PlantUML Official Documentation](https://plantuml.com/)
- [UML 2.5 Specification](https://www.omg.org/spec/UML/2.5/)
- [C4 Model](https://c4model.com/) - For additional context/container diagrams
- [PlantUML Cheat Sheet](https://ogom.github.io/draw_uml/plantuml/)

---

For questions or diagram requests, please open an issue in the repository.
