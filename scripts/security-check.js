#!/usr/bin/env node

/**
 * Security validation script for debug-glitz
 * Performs comprehensive security checks before publishing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Security check configuration
const SECURITY_CONFIG = {
  requiredFiles: [
    'SECURITY.md',
    'SECURITY_GUIDELINES.md',
    'VULNERABILITY_DISCLOSURE.md',
    'THREAT_MODEL.md',
    'PRIVACY.md',
    'SECURITY_CHECKLIST.md',
    'SECURITY_RISK_ACCEPTANCE.md',
    '.snyk'
  ],
  forbiddenPatterns: [
    /password\s*[:=]\s*['"][^'"]+['"]/i,
    /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
    /secret\s*[:=]\s*['"][^'"]+['"]/i,
    /token\s*[:=]\s*['"][^'"]+['"]/i,
    /private[_-]?key\s*[:=]/i,
    /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/,
    /sk_live_[a-zA-Z0-9]+/,
    /pk_live_[a-zA-Z0-9]+/
  ],
  maxFileSize: 1024 * 1024, // 1MB
  excludePatterns: [
    /node_modules/,
    /\.git/,
    /coverage/,
    /dist/,
    /build/,
    /\.nyc_output/
  ]
};

class SecurityValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}]`;
    
    switch (type) {
      case 'error':
        console.error(`${colors.red}${colors.bold}✗ ERROR:${colors.reset} ${message}`);
        break;
      case 'warning':
        console.warn(`${colors.yellow}${colors.bold}⚠ WARNING:${colors.reset} ${message}`);
        break;
      case 'success':
        console.log(`${colors.green}${colors.bold}✓ PASS:${colors.reset} ${message}`);
        break;
      case 'info':
      default:
        console.log(`${colors.blue}${colors.bold}ℹ INFO:${colors.reset} ${message}`);
        break;
    }
  }

  addError(message) {
    this.errors.push(message);
    this.log(message, 'error');
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log(message, 'warning');
  }

  addPass(message) {
    this.passed.push(message);
    this.log(message, 'success');
  }

  // Check if required security files exist
  checkRequiredFiles() {
    this.log('Checking required security documentation files...');
    
    for (const file of SECURITY_CONFIG.requiredFiles) {
      if (fs.existsSync(file)) {
        this.addPass(`Required file exists: ${file}`);
      } else {
        this.addError(`Missing required security file: ${file}`);
      }
    }
  }

  // Check package.json for security configurations
  checkPackageJson() {
    this.log('Validating package.json security configuration...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check for security scripts
      const securityScripts = [
        'security:audit',
        'security:check',
        'security:validate'
      ];
      
      for (const script of securityScripts) {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.addPass(`Security script defined: ${script}`);
        } else {
          this.addWarning(`Missing security script: ${script}`);
        }
      }
      
      // Check for security-related fields
      if (packageJson.repository) {
        this.addPass('Repository field defined for vulnerability reporting');
      } else {
        this.addWarning('Repository field missing - needed for security reporting');
      }
      
      if (packageJson.bugs) {
        this.addPass('Bug reporting URL defined');
      } else {
        this.addWarning('Bug reporting URL missing');
      }
      
      // Check files array includes security docs
      if (packageJson.files) {
        const securityFiles = ['SECURITY.md', 'PRIVACY.md'];
        for (const file of securityFiles) {
          if (packageJson.files.includes(file)) {
            this.addPass(`Security file included in package: ${file}`);
          } else {
            this.addWarning(`Security file not included in package: ${file}`);
          }
        }
      }
      
    } catch (error) {
      this.addError(`Failed to parse package.json: ${error.message}`);
    }
  }

  // Scan files for hardcoded secrets
  scanForSecrets() {
    this.log('Scanning for hardcoded secrets and sensitive data...');
    
    const scanFile = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          for (const pattern of SECURITY_CONFIG.forbiddenPatterns) {
            if (pattern.test(line)) {
              this.addError(`Potential secret found in ${filePath}:${index + 1}: ${line.trim().substring(0, 50)}...`);
            }
          }
        });
      } catch (error) {
        // Skip files that can't be read as text
        if (error.code !== 'EISDIR') {
          this.addWarning(`Could not scan file ${filePath}: ${error.message}`);
        }
      }
    };

    const scanDirectory = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          // Skip excluded patterns
          if (SECURITY_CONFIG.excludePatterns.some(pattern => pattern.test(fullPath))) {
            continue;
          }
          
          if (stat.isDirectory()) {
            scanDirectory(fullPath);
          } else if (stat.isFile() && stat.size < SECURITY_CONFIG.maxFileSize) {
            // Only scan text-like files
            const ext = path.extname(item).toLowerCase();
            if (['.js', '.json', '.md', '.txt', '.yml', '.yaml', '.env'].includes(ext) || !ext) {
              scanFile(fullPath);
            }
          }
        }
      } catch (error) {
        this.addWarning(`Could not scan directory ${dir}: ${error.message}`);
      }
    };

    scanDirectory('.');
    
    if (this.errors.filter(e => e.includes('Potential secret')).length === 0) {
      this.addPass('No hardcoded secrets detected');
    }
  }

  // Check npm audit results
  checkNpmAudit() {
    this.log('Running npm audit security check...');
    
    try {
      execSync('npm audit --audit-level=high --omit=dev --json', { stdio: 'pipe' });
      this.addPass('npm audit: No high or critical vulnerabilities in production dependencies');
    } catch (error) {
      try {
        const auditOutput = JSON.parse(error.stdout.toString());
        const vulnerabilities = auditOutput.metadata?.vulnerabilities || {};
        
        const critical = vulnerabilities.critical || 0;
        const high = vulnerabilities.high || 0;
        const moderate = vulnerabilities.moderate || 0;
        
        if (critical > 0) {
          this.addError(`npm audit: ${critical} critical vulnerabilities in production dependencies`);
        }
        if (high > 0) {
          this.addError(`npm audit: ${high} high vulnerabilities in production dependencies`);
        }
        if (moderate > 0) {
          this.addWarning(`npm audit: ${moderate} moderate vulnerabilities in production dependencies`);
        }
        
        if (critical === 0 && high === 0) {
          this.addPass('npm audit: No critical or high vulnerabilities in production dependencies');
        }
      } catch (parseError) {
        // If JSON parsing fails, try a simple check
        try {
          execSync('npm audit --audit-level=high --omit=dev', { stdio: 'pipe' });
          this.addPass('npm audit: No high or critical vulnerabilities in production dependencies');
        } catch (simpleError) {
          this.addWarning('npm audit: Some vulnerabilities found in production dependencies');
        }
      }
    }
  }

  // Check if Snyk is available and run it
  checkSnyk() {
    this.log('Checking Snyk security scan...');
    
    try {
      execSync('snyk --version', { stdio: 'pipe' });
      
      try {
        execSync('snyk test --json', { stdio: 'pipe' });
        this.addPass('Snyk: No vulnerabilities found');
      } catch (error) {
        try {
          const snykOutput = JSON.parse(error.stdout.toString());
          if (snykOutput.vulnerabilities) {
            const vulnCount = snykOutput.vulnerabilities.length;
            if (vulnCount > 0) {
              this.addWarning(`Snyk: ${vulnCount} vulnerabilities found`);
            }
          }
        } catch (parseError) {
          this.addWarning('Snyk test completed with issues (run manually for details)');
        }
      }
    } catch (error) {
      this.addWarning('Snyk not available - install with: npm install -g snyk');
    }
  }

  // Check Git configuration for security
  checkGitSecurity() {
    this.log('Checking Git security configuration...');
    
    // Check for .gitignore
    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      const securityPatterns = [
        'node_modules',
        '.env',
        '*.log',
        '.DS_Store'
      ];
      
      for (const pattern of securityPatterns) {
        if (gitignore.includes(pattern)) {
          this.addPass(`Gitignore includes security pattern: ${pattern}`);
        } else {
          this.addWarning(`Gitignore missing security pattern: ${pattern}`);
        }
      }
    } else {
      this.addWarning('No .gitignore file found');
    }
    
    // Check for GitHub security files
    const githubSecurityFiles = [
      '.github/SECURITY.md',
      '.github/ISSUE_TEMPLATE/security.md'
    ];
    
    for (const file of githubSecurityFiles) {
      if (fs.existsSync(file)) {
        this.addPass(`GitHub security file exists: ${file}`);
      } else {
        this.addWarning(`Missing GitHub security file: ${file}`);
      }
    }
  }

  // Run all security checks
  async runAllChecks() {
    this.log('Starting comprehensive security validation...', 'info');
    console.log('='.repeat(60));
    
    this.checkRequiredFiles();
    console.log();
    
    this.checkPackageJson();
    console.log();
    
    this.scanForSecrets();
    console.log();
    
    this.checkNpmAudit();
    console.log();
    
    this.checkSnyk();
    console.log();
    
    this.checkGitSecurity();
    console.log();
    
    this.printSummary();
    
    return this.errors.length === 0;
  }

  // Print validation summary
  printSummary() {
    console.log('='.repeat(60));
    this.log('Security Validation Summary', 'info');
    console.log('='.repeat(60));
    
    console.log(`${colors.green}✓ Passed: ${this.passed.length}${colors.reset}`);
    console.log(`${colors.yellow}⚠ Warnings: ${this.warnings.length}${colors.reset}`);
    console.log(`${colors.red}✗ Errors: ${this.errors.length}${colors.reset}`);
    
    if (this.errors.length > 0) {
      console.log(`\n${colors.red}${colors.bold}SECURITY VALIDATION FAILED${colors.reset}`);
      console.log('Please fix the errors above before publishing.');
      return false;
    } else if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}${colors.bold}SECURITY VALIDATION PASSED WITH WARNINGS${colors.reset}`);
      console.log('Consider addressing the warnings above.');
      return true;
    } else {
      console.log(`\n${colors.green}${colors.bold}SECURITY VALIDATION PASSED${colors.reset}`);
      console.log('All security checks completed successfully!');
      return true;
    }
  }
}

// Main execution
async function main() {
  const validator = new SecurityValidator();
  
  try {
    const success = await validator.runAllChecks();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(`${colors.red}${colors.bold}FATAL ERROR:${colors.reset} ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = SecurityValidator;