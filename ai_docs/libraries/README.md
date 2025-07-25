# Library Documentation

Curated documentation for libraries used in this project, optimized for AI agent consumption.

## Purpose

This directory provides **precise, version-specific documentation** that AI agents can reference when implementing features. Each library guide includes:

- **Exact versions** and installation commands
- **Working examples** with project-specific context
- **Integration patterns** with existing codebase
- **Common use cases** and best practices
- **Error handling** and troubleshooting

## Library Documentation Standards

Each library guide should include:

### 1. Installation and Setup
```bash
# Exact installation command
uv add library-name==1.2.3

# Additional setup if required
export LIBRARY_CONFIG=/path/to/config
```

### 2. Basic Usage
```python
# Minimal working example
from library import Component

component = Component(config="value")
result = component.process("input")
```

### 3. Project Integration
```python
# How it integrates with existing code
from src.core import BaseHandler
from library import LibraryComponent

class ProjectHandler(BaseHandler):
    def __init__(self):
        self.library = LibraryComponent()
        super().__init__()
```

### 4. Common Patterns
- Authentication patterns
- Error handling approaches
- Configuration management
- Testing strategies

### 5. Troubleshooting
- Common errors and solutions
- Performance considerations
- Compatibility notes

## Current Libraries

### Core Framework
- **FastAPI** - Web framework and API development
- **SQLAlchemy** - Database ORM and migrations
- **Pydantic** - Data validation and serialization

### AI/ML Libraries
- **Google ADK** - Agent development kit
- **LangChain** - LLM application framework
- **OpenAI** - AI model integration

### Infrastructure
- **Google Cloud** - Cloud services and deployment
- **Redis** - Caching and session storage
- **Docker** - Containerization

### Development Tools
- **pytest** - Testing framework
- **Ruff** - Code formatting and linting
- **mypy** - Type checking

## Adding New Library Documentation

### Template Structure
```markdown
# [Library Name] v[Version]

## Quick Reference
**Installation**: `uv add library-name==1.2.3`
**Import**: `from library import Component`
**Docs**: [Official documentation URL]
**GitHub**: [Repository URL]

## Installation and Setup
[Detailed installation instructions]

## Basic Usage
[Simple, working example]

## Project Integration
[How it fits with existing code]

## Common Patterns
[Established usage patterns]

## Configuration
[Environment variables and settings]

## Error Handling
[Common errors and solutions]

## Testing
[How to test code using this library]

## Performance Notes
[Optimization tips and considerations]

## Troubleshooting
[Common issues and solutions]
```

### Content Guidelines

1. **Be Specific**: Include exact versions and command syntax
2. **Show Working Code**: Every example should be copy-paste ready
3. **Include Context**: Explain when and why to use each pattern
4. **Handle Errors**: Show proper exception handling
5. **Stay Current**: Update when library versions change

## Maintenance

### Regular Updates
- Review library versions monthly
- Update examples when APIs change
- Add new patterns as they emerge
- Remove deprecated approaches

### Version Management
```bash
# Check for updates
uv pip list --outdated

# Update library documentation
python scripts/update-library-docs.py [library-name]

# Validate examples still work
python -m pytest ai_docs/libraries/ --doctest-modules
```

## Usage in PRPs

Reference library documentation in Product Requirement Prompts:

```markdown
## Technical Context
**Framework**: FastAPI (see ai_docs/libraries/fastapi-guide.md)
**Database**: SQLAlchemy patterns (ai_docs/libraries/sqlalchemy-guide.md)
**Validation**: Pydantic schemas (ai_docs/libraries/pydantic-guide.md)
```

This ensures AI agents have immediate access to project-specific implementation patterns and established conventions.