/**
 * Metrics Collection Script (JavaScript version for easier execution)
 * Collects all available metrics from the application
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log("=".repeat(60));
}

// Get test coverage
function getTestCoverage() {
  logSection("📊 Test Coverage Metrics");
  try {
    const output = execSync("npm run test:coverage", {
      encoding: "utf-8",
      cwd: __dirname + "/..",
      stdio: "pipe",
    });

    // Extract coverage percentages
    const coverageMatch = output.match(
      /All files\s+\|\s+(\d+\.\d+)\s+\|\s+(\d+\.\d+)\s+\|\s+(\d+\.\d+)\s+\|\s+(\d+\.\d+)/
    );

    if (coverageMatch) {
      log(`Statements: ${coverageMatch[1]}%`, colors.green);
      log(`Branches:   ${coverageMatch[2]}%`, colors.green);
      log(`Functions:  ${coverageMatch[3]}%`, colors.green);
      log(`Lines:      ${coverageMatch[4]}%`, colors.green);

      // Extract test results
      const testMatch = output.match(/Tests:\s+(\d+)\s+passed/);
      const failedMatch = output.match(/(\d+)\s+failed/);
      const totalMatch = output.match(/(\d+)\s+total/);

      if (totalMatch) {
        log(`\nTest Results:`, colors.yellow);
        log(`  Total:    ${totalMatch[1]}`, colors.cyan);
        if (testMatch) log(`  Passed:   ${testMatch[1]}`, colors.green);
        if (failedMatch) log(`  Failed:  ${failedMatch[1]}`, colors.yellow);
      }

      return {
        statements: parseFloat(coverageMatch[1]),
        branches: parseFloat(coverageMatch[2]),
        functions: parseFloat(coverageMatch[3]),
        lines: parseFloat(coverageMatch[4]),
        tests: {
          total: totalMatch ? parseInt(totalMatch[1]) : 0,
          passed: testMatch ? parseInt(testMatch[1]) : 0,
          failed: failedMatch ? parseInt(failedMatch[1]) : 0,
        },
      };
    } else {
      log("Could not parse coverage data", colors.yellow);
      return null;
    }
  } catch (error) {
    log("Error running test coverage:", colors.yellow);
    log(error.message, colors.yellow);
    return null;
  }
}

// Get code statistics
function getCodeStats() {
  logSection("📈 Code Statistics");

  const srcDir = path.join(__dirname, "..", "src");
  let totalFiles = 0;
  let totalLines = 0;
  let totalSize = 0;

  function countFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        countFiles(filePath);
      } else if (
        file.endsWith(".ts") ||
        file.endsWith(".tsx") ||
        file.endsWith(".js") ||
        file.endsWith(".jsx")
      ) {
        totalFiles++;
        const content = fs.readFileSync(filePath, "utf-8");
        totalLines += content.split("\n").length;
        totalSize += stat.size;
      }
    });
  }

  try {
    countFiles(srcDir);
    log(`Total Files:  ${totalFiles}`, colors.green);
    log(`Total Lines:  ${totalLines.toLocaleString()}`, colors.green);
    log(`Total Size:   ${(totalSize / 1024).toFixed(2)} KB`, colors.green);

    return {
      files: totalFiles,
      lines: totalLines,
      size: totalSize,
    };
  } catch (error) {
    log("Error counting code stats:", colors.yellow);
    return null;
  }
}

// Get package.json info
function getPackageInfo() {
  logSection("📦 Package Information");

  try {
    const packagePath = path.join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

    log(`Name:        ${packageJson.name}`, colors.green);
    log(`Version:     ${packageJson.version}`, colors.green);
    log(`Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`, colors.cyan);
    log(`DevDeps:     ${Object.keys(packageJson.devDependencies || {}).length}`, colors.cyan);

    // Count test scripts
    const testScripts = Object.keys(packageJson.scripts || {}).filter((s) =>
      s.includes("test")
    );
    log(`Test Scripts: ${testScripts.length}`, colors.cyan);

    return {
      name: packageJson.name,
      version: packageJson.version,
      dependencies: Object.keys(packageJson.dependencies || {}).length,
      devDependencies: Object.keys(packageJson.devDependencies || {}).length,
      testScripts: testScripts.length,
    };
  } catch (error) {
    log("Error reading package.json:", colors.yellow);
    return null;
  }
}

// Check for metrics-related files
function checkMetricsFiles() {
  logSection("🔍 Metrics & Testing Files");

  const metricsFiles = [
    "src/services/chat.service.ts",
    "src/lib/analytics.ts",
    "src/services/cost-tracking.service.ts",
    "app/api/admin/stats/route.ts",
    "src/__tests__/services/chat.service.test.ts",
    "jest.config.js",
    "jest.setup.js",
  ];

  const found = [];
  const missing = [];

  metricsFiles.forEach((file) => {
    const filePath = path.join(__dirname, "..", file);
    if (fs.existsSync(filePath)) {
      found.push(file);
      log(`✓ ${file}`, colors.green);
    } else {
      missing.push(file);
      log(`✗ ${file}`, colors.yellow);
    }
  });

  return {
    found: found.length,
    missing: missing.length,
    files: found,
  };
}

// Main execution
function main() {
  log("\n" + "=".repeat(60), colors.bright);
  log("  METRICS COLLECTION REPORT", colors.bright + colors.cyan);
  log("=".repeat(60) + "\n", colors.bright);

  const report = {
    timestamp: new Date().toISOString(),
    testCoverage: getTestCoverage(),
    codeStats: getCodeStats(),
    packageInfo: getPackageInfo(),
    metricsFiles: checkMetricsFiles(),
  };

  // Summary
  logSection("📋 Summary");

  if (report.testCoverage) {
    log("Test Coverage Available:", colors.green);
    log(
      `  Overall: ${report.testCoverage.lines.toFixed(1)}% line coverage`,
      colors.cyan
    );
  }

  if (report.codeStats) {
    log("Codebase Size:", colors.green);
    log(`  ${report.codeStats.files} files, ${report.codeStats.lines.toLocaleString()} lines`, colors.cyan);
  }

  if (report.metricsFiles) {
    log("Metrics Infrastructure:", colors.green);
    log(`  ${report.metricsFiles.found} metrics-related files found`, colors.cyan);
  }

  // Save report to file
  const reportPath = path.join(__dirname, "..", "metrics-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Full report saved to: metrics-report.json`, colors.blue);

  log("\n" + "=".repeat(60));
  log("  Report Complete", colors.bright + colors.green);
  log("=".repeat(60) + "\n");
}

main();

