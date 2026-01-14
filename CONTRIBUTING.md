# Contributing to debug-glitz

Thank you for your interest in contributing to `debug-glitz`! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue on GitHub with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Environment information (Node.js version, OS, etc.)
- Code examples or screenshots if applicable

### Suggesting Enhancements

We welcome suggestions for enhancements! Please open an issue with:

- A clear description of the enhancement
- Use case examples
- Potential implementation approach (if you have ideas)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Write or update tests** as needed
4. **Ensure all tests pass**: Run `npm test`
5. **Ensure linting passes**: Run `npm run lint`
6. **Update documentation** if you're adding new features
7. **Commit your changes** with clear, descriptive commit messages
8. **Push to your fork** and open a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/debug-glitz.git
cd debug-glitz

# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint

# Run tests in watch mode (if available)
npm run test:watch
```

### Coding Standards

- Follow the existing code style
- Use [XO](https://github.com/xojs/xo) for linting (already configured)
- Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/) format
- Add comments for complex logic
- Keep functions small and focused

### Testing

- All new features should include tests
- Ensure existing tests continue to pass
- Write tests for bug fixes to prevent regressions
- Tests are located in `test.js` and `test.node.js`

### Documentation

- Update README.md if you add new features or change behavior
- Add JSDoc comments for public APIs
- Update CHANGELOG.md with your changes

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes (no code change)
- `refactor:` for code refactoring
- `test:` for adding or updating tests
- `chore:` for maintenance tasks

Example:
```
feat: add support for custom formatters
fix: handle edge case in namespace parsing
docs: update README with new examples
```

### Pull Request Process

1. Ensure your PR has a clear title and description
2. Link any related issues
3. Wait for CI checks to pass
4. Address any review feedback promptly
5. Maintain a clean commit history (use rebase if needed)

### Review Process

- All PRs require review from maintainers
- We aim to review PRs within 48 hours
- Feedback will be provided in comments
- Once approved, a maintainer will merge your PR

### Questions?

If you have questions about contributing, please:
- Open an issue with the `question` label
- Check existing issues and discussions
- Review the README.md for documentation

Thank you for contributing to `debug-glitz`! 🎉
