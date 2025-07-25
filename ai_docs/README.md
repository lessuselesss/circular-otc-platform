# AI Documentation Pipeline

This directory contains curated documentation for AI agents to reference during development. The ai_docs/ directory is a core part of the PRP (Product Requirement Prompt) methodology.

## Structure

```
ai_docs/
├── libraries/          # Library-specific documentation
├── architecture/       # System design and patterns
├── examples/          # Working code examples
├── constraints/       # Technical and business constraints
├── patterns/          # Reusable implementation patterns
└── templates/         # Code and document templates
```

## Purpose

The ai_docs/ directory provides **context engineering** for AI agents, ensuring they have access to:

1. **Precise Examples**: Working code snippets instead of abstract descriptions
2. **Current Documentation**: Up-to-date library usage and best practices
3. **Project Patterns**: Established conventions and architectural decisions
4. **Constraints**: Technical boundaries and requirements

## Content Guidelines

### Libraries Documentation
- **Version-specific examples** with exact library versions
- **Common patterns** and anti-patterns
- **Integration approaches** with existing codebase
- **Configuration templates** and best practices

### Architecture Documentation
- **System diagrams** showing component relationships
- **Data flow patterns** and integration points
- **Naming conventions** and code organization
- **API design patterns** and standards

### Examples
- **Working, tested code** that can be copied and adapted
- **Comment-heavy explanations** of complex logic
- **Common use cases** and edge case handling
- **Error handling patterns** and logging standards

### Constraints
- **Performance requirements** and optimization guidelines
- **Security policies** and implementation requirements
- **Deployment guidelines** and environment considerations
- **Business rules** and validation requirements

## Usage in PRPs

When creating Product Requirement Prompts, reference ai_docs/ content:

```markdown
## Code Context
**Pattern Reference**: See ai_docs/patterns/auth-flow.md
**Library Usage**: Following ai_docs/libraries/fastapi-patterns.md
**Example Implementation**: Based on ai_docs/examples/user-registration.py
```

## Maintenance

### Regular Updates
- Update library documentation when dependencies change
- Add new patterns as they emerge in the codebase
- Refresh examples to match current implementation
- Validate that examples still work with current versions

### Content Review
- Monthly review of documentation accuracy
- Remove outdated patterns and examples
- Add documentation for new libraries and tools
- Ensure examples follow current best practices

## Adding New Documentation

### For New Libraries
1. Create `libraries/[library-name]-guide.md`
2. Include version, installation, and basic usage
3. Add integration patterns with existing stack
4. Provide working examples

### For New Patterns
1. Create `patterns/[pattern-name].md`
2. Explain when and why to use the pattern
3. Provide complete implementation example
4. Include error handling and edge cases

### For New Examples
1. Add to appropriate subdirectory in `examples/`
2. Include comprehensive comments
3. Ensure code is tested and working
4. Add usage context and variations

## Example Structure

### Library Documentation Template
```markdown
# [Library Name] v[Version] - Usage Guide

## Installation
```bash
uv add library-name==1.2.3
```

## Basic Usage
[Working example]

## Integration with Project
[How it fits with existing code]

## Common Patterns
[Established usage patterns]

## Error Handling
[How to handle failures]

## Configuration
[Environment and setup requirements]
```

### Pattern Documentation Template
```markdown
# [Pattern Name]

## When to Use
[Specific scenarios]

## Implementation
[Complete working example]

## Variations
[Different approaches]

## Testing
[How to test this pattern]

## Common Pitfalls
[What to avoid]
```

## Tools for Documentation

### Automated Documentation Extraction
```bash
# Extract library documentation
python scripts/extract-docs.py [library-name]

# Generate API documentation
pdoc --html src/ --output-dir ai_docs/api/

# Create architecture diagrams
mermaid-cli -i docs/diagrams/ -o ai_docs/architecture/
```

### Documentation Validation
```bash
# Test code examples
python -m pytest ai_docs/examples/ --doctest-modules

# Check documentation links
linkchecker ai_docs/

# Validate markdown
markdownlint ai_docs/
```

The ai_docs/ directory is **living documentation** that evolves with your project. Keep it current, specific, and actionable for maximum AI agent effectiveness.