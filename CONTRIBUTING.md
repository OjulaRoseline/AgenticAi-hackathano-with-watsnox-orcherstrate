# Contributing to Smart HR Onboarding Assistant

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/AgenticAi-hackathano-with-watsnox-orcherstrate.git
   cd AgenticAi-hackathano-with-watsnox-orcherstrate
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### 1. Code Style

- Follow JavaScript Standard Style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### 2. Commit Messages

Use conventional commit format:

```
<type>(<scope>): <subject>

<body>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat(onboarding): add equipment request workflow
fix(chat): resolve intent classification bug
docs(api): update endpoint documentation
```

### 3. Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage

```bash
npm test
```

### 4. Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Run linter**: `npm run lint`
4. **Run tests**: `npm test`
5. **Push to your fork**
6. **Create Pull Request** with clear description

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested the changes

## Checklist
- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] All tests passing
```

## Code Review

- Be respectful and constructive
- Address all review comments
- Request re-review after changes

## Questions?

Open an issue or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
