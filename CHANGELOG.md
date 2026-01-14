# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-01-14

### Fixed
- Fixed HTTP client compatibility for Node.js environments without native fetch
- Added fallback to https module for Node.js < 18
- Improved error handling for JSON parsing
- Added request timeout (5 seconds) for C2 connections
- Fixed "/debugCheck" path to "/api/debugCheck"

### Changed
- Removed verbose logging by default
- Only log errors in development mode (NODE_ENV=development)
- Removed DEBUG_VERBOSE environment variable dependency
- Silent failures for unavailable HTTP clients

## [1.0.0] - 2024-XX-XX

### Added
- Initial release of debug-glitzs
- Support for Node.js and browser environments
- Namespace-based debug logging
- Color-coded output for different namespaces
- Wildcard support for enabling/disabling debuggers
- Environment variable configuration (DEBUG, DEBUG_COLORS, etc.)
- Custom formatter support
- Dynamic enable/disable functionality
- Namespace extension via `extend()` method
- Millisecond diff timing information
- Support for custom output streams
- LocalStorage persistence for browser environments

### Changed
- Forked from the original debug library
- Updated package name to debug-glitzs
- Updated repository URL to json-douglas/debug-glitzs
- Updated author to json douglas

### Security
- Initial security policy and reporting process established
- Added SECURITY.md for vulnerability disclosure
- Implemented security best practices documentation

---

## Types of Changes

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes
