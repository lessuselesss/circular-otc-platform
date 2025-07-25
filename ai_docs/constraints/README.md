# Project Constraints

Technical and business constraints that guide implementation decisions throughout the project.

## Purpose

This directory documents **non-negotiable requirements** and **boundaries** that AI agents must respect when implementing features. Constraints ensure:

- **Consistent architecture** across all implementations
- **Security compliance** with organizational policies
- **Performance standards** for production readiness
- **Operational requirements** for deployment and maintenance

## Constraint Categories

### Technical Constraints
- **Performance requirements** and optimization guidelines
- **Security policies** and implementation standards
- **Architectural boundaries** and design principles
- **Technology stack** limitations and approved libraries

### Business Constraints
- **Compliance requirements** (GDPR, SOC2, etc.)
- **Budget limitations** for infrastructure and services
- **Timeline constraints** for delivery milestones
- **Resource availability** for development and operations

### Operational Constraints
- **Deployment environments** and infrastructure limits
- **Monitoring and observability** requirements
- **Backup and recovery** procedures
- **Scaling limitations** and capacity planning

## Constraint Documentation Template

```markdown
# [Constraint Category] - Requirements

## Overview
**Scope**: [What this constraint applies to]
**Rationale**: [Why this constraint exists]
**Impact**: [How it affects implementation]
**Enforcement**: [How compliance is verified]

## Specific Requirements

### Requirement 1: [Name]
**Description**: [Detailed requirement]
**Measurement**: [How to verify compliance]
**Examples**: [Good and bad examples]

### Requirement 2: [Name]
**Description**: [Detailed requirement]
**Measurement**: [How to verify compliance]
**Examples**: [Good and bad examples]

## Implementation Guidelines

### Do This ✅
- [Approved approach 1]
- [Approved approach 2]
- [Best practice 3]

### Avoid This ❌
- [Prohibited approach 1]
- [Anti-pattern 2]
- [Security risk 3]

## Validation

### Automated Checks
```bash
# Commands to verify compliance
script-to-check-constraint.py
```

### Manual Review
- [Checklist item 1]
- [Checklist item 2]
- [Review criteria 3]

## Exceptions

**Process**: [How to request an exception]
**Approval**: [Who can approve exceptions]
**Documentation**: [How exceptions are tracked]

## Related Documentation

- [Related constraints]
- [Implementation patterns]
- [External standards]
```

## Core Constraint Areas

### Security Constraints
```markdown
# Security Requirements

## Authentication
- All endpoints require authentication except public health checks
- JWT tokens expire within 15 minutes
- Refresh tokens expire within 7 days
- No hardcoded credentials in code

## Data Protection
- All PII must be encrypted at rest
- Database connections use TLS 1.3+
- API responses never include sensitive data in logs
- User passwords hashed with bcrypt (cost factor 12+)

## Access Control
- Implement least privilege principle
- Role-based access control for all features
- API rate limiting (100 requests/minute per user)
- Input validation on all user-provided data
```

### Performance Constraints
```markdown
# Performance Requirements

## Response Times
- API endpoints: <200ms (95th percentile)
- Database queries: <100ms (average)
- Authentication: <50ms (average)
- File uploads: <5s (100MB max)

## Throughput
- Support 1000 concurrent users
- Handle 10,000 requests per minute
- Database connections: 5-20 pool size
- Memory usage: <512MB per container

## Availability
- 99.9% uptime SLA
- <5 minute recovery time
- Graceful degradation under load
- Circuit breaker for external dependencies
```

### Deployment Constraints
```markdown
# Deployment Requirements

## Environment
- Containerized with Docker
- Kubernetes for orchestration
- Google Cloud Platform only
- Multi-region deployment capability

## Configuration
- All config via environment variables
- No secrets in container images
- Health check endpoints required
- Structured logging (JSON format)

## Monitoring
- Application metrics via Prometheus
- Distributed tracing with OpenTelemetry
- Error tracking with Sentry
- Log aggregation in Google Cloud Logging
```

## Using Constraints in PRPs

Reference constraints in Product Requirement Prompts:

```markdown
## Implementation Constraints
**Security**: Following ai_docs/constraints/security-requirements.md
**Performance**: Must meet ai_docs/constraints/performance-standards.md
**Deployment**: Compliant with ai_docs/constraints/deployment-guidelines.md

## Validation Criteria
- [ ] Security scan passes (ai_docs/constraints/security-checklist.md)
- [ ] Performance tests meet targets (ai_docs/constraints/performance-benchmarks.md)
- [ ] Deployment ready (ai_docs/constraints/deployment-checklist.md)
```

## Constraint Validation

### Automated Validation
```bash
# Security constraints
bandit -r src/
pip-audit

# Performance constraints
pytest tests/performance/ --benchmark-min-rounds=5

# Code quality constraints
ruff check src/
mypy src/
```

### Manual Validation
- **Security review** checklist
- **Performance testing** results
- **Architecture review** compliance
- **Deployment readiness** verification

## Constraint Evolution

### Adding New Constraints
1. **Identify need** based on incidents or requirements
2. **Define measurable criteria** for compliance
3. **Create validation methods** (automated where possible)
4. **Document rationale** and implementation guidance
5. **Communicate to team** and update PRPs

### Updating Existing Constraints
1. **Review current effectiveness** and compliance
2. **Identify gaps** or outdated requirements
3. **Update documentation** with new standards
4. **Validate changes** don't break existing implementations
5. **Plan migration** for non-compliant code

## Emergency Exceptions

### When Constraints Can Be Temporarily Bypassed
- **Critical production issues** requiring immediate fix
- **Security vulnerabilities** needing rapid response
- **Business-critical deadlines** with executive approval

### Exception Process
1. **Document the exception** and rationale
2. **Get appropriate approval** (security, architecture, executive)
3. **Set remediation timeline** to restore compliance
4. **Track exception** until resolved
5. **Review process** to prevent future exceptions

Constraints are **guardrails for quality** - they prevent technical debt and ensure production readiness while enabling rapid development within safe boundaries.