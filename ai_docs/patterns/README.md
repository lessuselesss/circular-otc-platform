# Implementation Patterns

Reusable implementation patterns that establish consistency across the project.

## Purpose

This directory contains **battle-tested patterns** that solve common development challenges. Each pattern includes:

- **When to use** the pattern
- **Complete implementation** with working code
- **Variations** for different scenarios
- **Testing approaches** for the pattern
- **Common pitfalls** to avoid

## Pattern Categories

### Authentication & Authorization
- JWT token management
- Role-based access control
- API key authentication
- OAuth2 integration

### Database Operations
- Repository pattern
- Transaction management
- Connection pooling
- Migration strategies

### API Design
- RESTful resource patterns
- Error response formatting
- Pagination implementation
- Request validation

### Integration Patterns
- External API clients
- Event-driven architecture
- Circuit breaker pattern
- Retry mechanisms

### Testing Patterns
- Unit test structure
- Integration test setup
- Mock and fixture patterns
- End-to-end testing

## Pattern Documentation Template

```markdown
# [Pattern Name]

## Overview
**Purpose**: [What problem this pattern solves]
**When to Use**: [Specific scenarios]
**Benefits**: [Advantages of this approach]
**Trade-offs**: [Limitations or considerations]

## Implementation

### Basic Structure
```python
# Core implementation with comments
class PatternExample:
    def __init__(self):
        # Setup and initialization
        pass
        
    def main_method(self):
        # Primary pattern logic
        pass
```

### Complete Example
[Full working implementation]

### Configuration
[Required settings and environment variables]

## Variations

### Variation 1: [Scenario]
[Modified implementation for specific use case]

### Variation 2: [Scenario]
[Alternative approach for different requirements]

## Testing

```python
# Test patterns for this implementation
import pytest

def test_pattern_basic_usage():
    # Test the happy path
    pass
    
def test_pattern_error_handling():
    # Test error scenarios
    pass
```

## Integration with Project

**File Location**: [Where this pattern is typically implemented]
**Dependencies**: [Required libraries and modules]
**Related Patterns**: [Other patterns that work with this one]

## Common Pitfalls

1. **Pitfall 1**: [What to avoid and why]
2. **Pitfall 2**: [Common mistake and solution]
3. **Pitfall 3**: [Performance or security concern]

## References

- [External documentation or articles]
- [Related internal documentation]
- [Examples in the codebase]
```

## Using Patterns in PRPs

Reference patterns in Product Requirement Prompts:

```markdown
## Implementation Context
**Authentication**: Following ai_docs/patterns/jwt-auth-pattern.md
**Database Access**: Using ai_docs/patterns/repository-pattern.md
**Error Handling**: Based on ai_docs/patterns/error-response-pattern.md
```

## Pattern Evolution

### Adding New Patterns
1. **Identify repeated code** across the project
2. **Extract common structure** and variations
3. **Document the pattern** using the template
4. **Add working examples** and tests
5. **Update related documentation**

### Updating Existing Patterns
1. **Review pattern usage** in current codebase
2. **Identify improvements** or new variations
3. **Update documentation** with new examples
4. **Validate examples** still work
5. **Communicate changes** to the team

## Quality Standards

All patterns must:

- ✅ **Solve a real problem** encountered in the project
- ✅ **Include working code** that can be copied and adapted
- ✅ **Handle error cases** appropriately
- ✅ **Follow project conventions** for naming and structure
- ✅ **Include test examples** showing how to validate the pattern
- ✅ **Document trade-offs** and when not to use the pattern

## Pattern Catalog

Maintain a catalog of available patterns:

```markdown
# Pattern Catalog

## Authentication
- [JWT Authentication](jwt-auth-pattern.md) - Stateless token-based auth
- [API Key Auth](api-key-pattern.md) - Simple key-based authentication

## Database
- [Repository Pattern](repository-pattern.md) - Data access abstraction
- [Unit of Work](unit-of-work-pattern.md) - Transaction management

## API Design
- [Resource Controller](resource-controller-pattern.md) - RESTful endpoints
- [Error Response](error-response-pattern.md) - Consistent error formatting
```

Patterns are **living documentation** that evolves with the project. Keep them current, practical, and focused on real-world usage.