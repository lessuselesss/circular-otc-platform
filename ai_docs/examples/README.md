# Code Examples

Working code examples that AI agents can reference and adapt during development.

## Organization

```
examples/
├── auth/              # Authentication patterns
├── database/          # Database operations
├── api/              # API endpoint patterns
├── integrations/     # External service integrations
├── testing/          # Testing patterns
└── deployment/       # Deployment and configuration
```

## Example Standards

All examples in this directory must:

1. **Work as-is**: Copy-paste ready without modification
2. **Be well-commented**: Explain the why, not just the what
3. **Include error handling**: Show proper exception management
4. **Follow project conventions**: Use established patterns
5. **Be tested**: Include or reference relevant tests

## Usage Guidelines

### For AI Agents
Reference these examples in PRPs:
```markdown
**Implementation Pattern**: Based on ai_docs/examples/auth/jwt-authentication.py
**Error Handling**: Following ai_docs/examples/common/error-patterns.py
```

### For Developers
Use as reference implementations:
- Copy and adapt patterns
- Understand established conventions
- See complete working examples

## Adding New Examples

1. **Choose appropriate directory**
2. **Include comprehensive comments**
3. **Add error handling**
4. **Test the example**
5. **Update this README if needed**

## Example Template

```python
"""
Example: [Brief description]

Purpose: [What this example demonstrates]
Context: [When to use this pattern]
Dependencies: [Required libraries and versions]

Usage:
    [How to use this example]
    
Notes:
    - [Important consideration 1]
    - [Important consideration 2]
"""

import logging
from typing import Optional

# Configuration and setup
logger = logging.getLogger(__name__)


def example_function(param: str) -> Optional[str]:
    """
    Example function with proper documentation.
    
    Args:
        param: Description of parameter
        
    Returns:
        Description of return value
        
    Raises:
        ValueError: When invalid input provided
        
    Example:
        >>> result = example_function("test")
        >>> print(result)
        "processed: test"
    """
    try:
        # Main logic with comments
        if not param:
            raise ValueError("Parameter cannot be empty")
            
        # Process the parameter
        result = f"processed: {param}"
        logger.info(f"Successfully processed: {param}")
        
        return result
        
    except Exception as e:
        # Error handling
        logger.error(f"Error processing {param}: {e}")
        raise


if __name__ == "__main__":
    # Example usage
    try:
        result = example_function("example")
        print(f"Result: {result}")
    except ValueError as e:
        print(f"Error: {e}")
```

Keep examples **practical**, **current**, and **production-ready**.