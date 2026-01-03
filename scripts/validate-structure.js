#!/usr/bin/env node

/**
 * @fileoverview Validation script for Cotton Candy Bot v2.0.0 structure
 *
 * This script validates:
 * - Directory structure compliance with clean architecture
 * - File naming conventions (Airbnb/Google style guide)
 * - Import path correctness
 * - Documentation completeness
 *
 * @version 2.0.0
 * @since 2025-12-29
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let errors = [];
let warnings = [];
let passed = [];

// ============================================================================
// Validation Rules
// ============================================================================

const validationRules = {
  // Required directories for clean architecture
  requiredDirectories: [
    'docs',
    'docs/diagrams',
    'src/domain',
    'src/application',
    'src/infrastructure',
    'src/presentation',
    'server/domain',
    'server/application',
    'server/infrastructure',
  ],

  // Required documentation files
  requiredDocs: [
    'docs/ARCHITECTURE.md',
    'docs/API_REFERENCE_V2.md',
    'docs/CLEAN_ARCHITECTURE_STRUCTURE.md',
    'docs/STYLE_GUIDE.md',
    'docs/MIGRATION_GUIDE.md',
    'docs/diagrams/README.md',
    'README.md',
    'CHANGELOG.md',
  ],

  // Required diagram files
  requiredDiagrams: [
    'docs/diagrams/system-architecture.puml',
    'docs/diagrams/class-diagram.puml',
    'docs/diagrams/sequence-trade-execution.puml',
    'docs/diagrams/deployment-diagram.puml',
    'docs/diagrams/state-diagram.puml',
  ],

  // File naming patterns
  fileNamingPatterns: {
    // React components should be PascalCase
    reactComponents: /^[A-Z][a-zA-Z0-9]*\.(tsx|jsx)$/,
    // TypeScript utilities should be camelCase
    utilities: /^[a-z][a-zA-Z0-9]*\.(ts|js)$/,
    // Hooks should start with 'use'
    hooks: /^use[A-Z][a-zA-Z0-9]*\.(ts|tsx)$/,
    // Test files should end with .test or .spec
    tests: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
    // Entity files should end with .entity
    entities: /^[A-Z][a-zA-Z0-9]*\.entity\.(ts|js)$/,
    // Use case files should end with .useCase
    useCases: /^[a-z][a-zA-Z0-9]*\.useCase\.(ts|js)$/,
  },

  // Forbidden patterns
  forbiddenPatterns: {
    // No snake_case file names
    snakeCase: /_[a-z]/,
    // No spaces in file names
    spaces: / /,
    // No uppercase in directory names (except special Next.js dirs)
    uppercaseDir: /^[A-Z]/,
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exists(filePath) {
  return fs.existsSync(path.join(rootDir, filePath));
}

function isDirectory(filePath) {
  const fullPath = path.join(rootDir, filePath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
}

function getFiles(dir, ext = []) {
  const fullPath = path.join(rootDir, dir);
  if (!fs.existsSync(fullPath)) return [];

  const files = [];
  const items = fs.readdirSync(fullPath);

  items.forEach((item) => {
    const itemPath = path.join(fullPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      files.push(...getFiles(path.join(dir, item), ext));
    } else if (ext.length === 0 || ext.some((e) => item.endsWith(e))) {
      files.push(path.join(dir, item));
    }
  });

  return files;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate required directory structure
 */
function validateDirectories() {
  log('\n📁 Validating directory structure...', 'cyan');

  validationRules.requiredDirectories.forEach((dir) => {
    if (isDirectory(dir)) {
      passed.push(`Directory exists: ${dir}`);
      log(`  ✓ ${dir}`, 'green');
    } else {
      errors.push(`Missing required directory: ${dir}`);
      log(`  ✗ ${dir} (MISSING)`, 'red');
    }
  });
}

/**
 * Validate required documentation files
 */
function validateDocumentation() {
  log('\n📚 Validating documentation files...', 'cyan');

  validationRules.requiredDocs.forEach((doc) => {
    if (exists(doc)) {
      const fullPath = path.join(rootDir, doc);
      const stat = fs.statSync(fullPath);
      const size = stat.size;

      if (size === 0) {
        warnings.push(`Documentation file is empty: ${doc}`);
        log(`  ⚠ ${doc} (EMPTY)`, 'yellow');
      } else if (size < 100) {
        warnings.push(`Documentation file is suspiciously small: ${doc} (${size} bytes)`);
        log(`  ⚠ ${doc} (${size} bytes - too small?)`, 'yellow');
      } else {
        passed.push(`Documentation exists: ${doc}`);
        log(`  ✓ ${doc} (${(size / 1024).toFixed(2)} KB)`, 'green');
      }
    } else {
      errors.push(`Missing required documentation: ${doc}`);
      log(`  ✗ ${doc} (MISSING)`, 'red');
    }
  });
}

/**
 * Validate UML diagram files
 */
function validateDiagrams() {
  log('\n🎨 Validating UML diagrams...', 'cyan');

  validationRules.requiredDiagrams.forEach((diagram) => {
    if (exists(diagram)) {
      const fullPath = path.join(rootDir, diagram);
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Check for required PlantUML elements
      if (!content.includes('@startuml')) {
        errors.push(`Invalid PlantUML diagram (missing @startuml): ${diagram}`);
        log(`  ✗ ${diagram} (INVALID FORMAT)`, 'red');
      } else if (!content.includes('footer')) {
        warnings.push(`Diagram missing metadata footer: ${diagram}`);
        log(`  ⚠ ${diagram} (missing footer)`, 'yellow');
      } else {
        passed.push(`Diagram valid: ${diagram}`);
        log(`  ✓ ${diagram}`, 'green');
      }
    } else {
      errors.push(`Missing required diagram: ${diagram}`);
      log(`  ✗ ${diagram} (MISSING)`, 'red');
    }
  });
}

/**
 * Validate file naming conventions
 */
function validateFileNaming() {
  log('\n📝 Validating file naming conventions...', 'cyan');

  // Check React components
  const components = getFiles('src/presentation/components', ['.tsx', '.jsx']);
  components.forEach((file) => {
    const basename = path.basename(file);

    if (basename.match(validationRules.forbiddenPatterns.snakeCase)) {
      errors.push(`Component uses snake_case: ${file}`);
      log(`  ✗ ${file} (snake_case forbidden)`, 'red');
    } else if (!basename.match(validationRules.fileNamingPatterns.reactComponents)) {
      warnings.push(`Component doesn't follow PascalCase: ${file}`);
      log(`  ⚠ ${file} (should be PascalCase)`, 'yellow');
    } else {
      passed.push(`Component naming correct: ${file}`);
    }
  });

  // Check hooks
  const hooks = getFiles('src/presentation/hooks', ['.ts', '.tsx']);
  hooks.forEach((file) => {
    const basename = path.basename(file);

    if (!basename.match(validationRules.fileNamingPatterns.hooks)) {
      errors.push(`Hook doesn't start with 'use': ${file}`);
      log(`  ✗ ${file} (must start with 'use')`, 'red');
    } else {
      passed.push(`Hook naming correct: ${file}`);
    }
  });
}

/**
 * Validate import paths
 */
function validateImportPaths() {
  log('\n🔗 Validating import paths...', 'cyan');

  const tsFiles = getFiles('src', ['.ts', '.tsx']);

  tsFiles.forEach((file) => {
    const fullPath = path.join(rootDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');

    // Check for deprecated relative imports
    const relativeImports = content.match(/from ['"]\.\.\/\.\.\/\.\.\//g);
    if (relativeImports && relativeImports.length > 0) {
      warnings.push(`File uses deep relative imports: ${file}`);
      log(`  ⚠ ${file} (use @ aliases instead of ../../../)`, 'yellow');
    }

    // Check for absolute path usage
    if (content.includes('from "@/')) {
      passed.push(`Uses path aliases: ${file}`);
    }
  });
}

/**
 * Validate package.json versions
 */
function validatePackageVersions() {
  log('\n📦 Validating package versions...', 'cyan');

  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
  const serverPackageJson = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'server/package.json'), 'utf-8')
  );

  // Check Node version requirement
  if (!packageJson.engines?.node) {
    warnings.push('package.json missing engines.node specification');
    log('  ⚠ package.json: Missing engines.node', 'yellow');
  } else {
    passed.push('package.json has Node version requirement');
    log(`  ✓ package.json: engines.node = ${packageJson.engines.node}`, 'green');
  }

  // Check critical dependencies
  const criticalDeps = ['next', 'react', '@solana/web3.js', 'zustand'];
  criticalDeps.forEach((dep) => {
    if (packageJson.dependencies?.[dep]) {
      passed.push(`Critical dependency present: ${dep}`);
      log(`  ✓ ${dep}: ${packageJson.dependencies[dep]}`, 'green');
    } else {
      errors.push(`Missing critical dependency: ${dep}`);
      log(`  ✗ ${dep} (MISSING)`, 'red');
    }
  });

  log(`\n  Server package version: ${serverPackageJson.version}`, 'blue');
}

/**
 * Validate environment configuration
 */
function validateEnvironment() {
  log('\n🔐 Validating environment configuration...', 'cyan');

  const envExample = path.join(rootDir, 'server/.env.example');
  const env = path.join(rootDir, 'server/.env');

  if (exists('server/.env.example')) {
    passed.push('.env.example exists');
    log('  ✓ server/.env.example exists', 'green');
  } else {
    warnings.push('Missing .env.example file');
    log('  ⚠ server/.env.example missing (create template)', 'yellow');
  }

  if (exists('server/.env')) {
    log('  ✓ server/.env exists', 'green');

    // Read and validate required variables
    const envContent = fs.readFileSync(path.join(rootDir, 'server/.env'), 'utf-8');
    const requiredVars = ['PORT', 'SECRET_KEY', 'RPC_URL'];

    requiredVars.forEach((varName) => {
      if (envContent.includes(`${varName}=`)) {
        passed.push(`Environment variable defined: ${varName}`);
        log(`    ✓ ${varName} defined`, 'green');
      } else {
        errors.push(`Missing environment variable: ${varName}`);
        log(`    ✗ ${varName} (MISSING)`, 'red');
      }
    });
  } else {
    warnings.push('No .env file found (expected for development)');
    log('  ⚠ server/.env missing (copy from .env.example)', 'yellow');
  }
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  log('╔═══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║   Cotton Candy Bot - Structure Validation Script v2.0.0      ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════╝', 'cyan');

  validateDirectories();
  validateDocumentation();
  validateDiagrams();
  validateFileNaming();
  validateImportPaths();
  validatePackageVersions();
  validateEnvironment();

  // Summary
  log('\n╔═══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                      VALIDATION SUMMARY                        ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════╝', 'cyan');

  log(`\n✓ Passed: ${passed.length}`, 'green');
  log(`⚠ Warnings: ${warnings.length}`, 'yellow');
  log(`✗ Errors: ${errors.length}`, 'red');

  if (warnings.length > 0) {
    log('\nWarnings:', 'yellow');
    warnings.forEach((warning, i) => log(`  ${i + 1}. ${warning}`, 'yellow'));
  }

  if (errors.length > 0) {
    log('\nErrors:', 'red');
    errors.forEach((error, i) => log(`  ${i + 1}. ${error}`, 'red'));
  }

  log('\n' + '='.repeat(67), 'cyan');

  if (errors.length === 0) {
    log('\n🎉 Validation PASSED! Structure complies with v2.0.0 standards.\n', 'green');
    process.exit(0);
  } else {
    log('\n❌ Validation FAILED! Please fix the errors above.\n', 'red');
    process.exit(1);
  }
}

// Run validation
main();
