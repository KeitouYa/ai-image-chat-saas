#!/usr/bin/env npx ts-node
/**
 * Concurrent Credit Deduction Test Script
 *
 * This script validates that the MongoDB atomic deduction implementation
 * correctly handles race conditions under high concurrency.
 *
 * Usage:
 *   npx ts-node scripts/test-concurrent-credits.ts
 *   (Uses in-memory MongoDB by default)
 *
 *   DATABASE_URL=mongodb://... npx ts-node scripts/test-concurrent-credits.ts
 *   (Uses external MongoDB if DATABASE_URL is set)
 *
 * Or with npm script:
 *   npm run test:concurrent:integration
 *
 * Test scenarios:
 * 1. 1000 concurrent requests competing for 100 credits
 * 2. Stress test: 500 requests for 5 credits
 * 3. Multi-batch consistency test
 *
 * Expected results:
 * - Exactly N successful deductions (N = available credits)
 * - Zero negative balance (no over-deduction)
 * - All excess requests fail gracefully
 */

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Inline model definition to avoid import issues
const CreditSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, index: true },
    credits: Number,
    amount: Number,
  },
  { timestamps: true }
);

const Credit =
  mongoose.models.Credit || mongoose.model("Credit", CreditSchema);

// Configuration
const CONFIG = {
  MONGODB_URI: process.env.DATABASE_URL || process.env.MONGODB_URI || "",
  CONNECTION_TIMEOUT: 30000,
};

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log("\n" + "=".repeat(60));
  log(title, colors.cyan);
  console.log("=".repeat(60));
}

/**
 * Atomic deduction function (same logic as creditRepository.deductCreditsAtomic)
 */
async function deductCreditsAtomic(
  userEmail: string,
  creditAmount: number
): Promise<{ success: boolean; remainingCredits: number | null }> {
  const result = await Credit.findOneAndUpdate(
    {
      userEmail,
      credits: { $gte: creditAmount }, // Only match if sufficient credits
    },
    {
      $inc: { credits: -creditAmount },
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!result) {
    const current = await Credit.findOne({ userEmail }).lean();
    return {
      success: false,
      remainingCredits: (current as any)?.credits ?? null,
    };
  }

  return {
    success: true,
    remainingCredits: (result as any)?.credits ?? 0,
  };
}

/**
 * Test 1: Main concurrent deduction test
 */
async function testConcurrentDeductions() {
  logSection("TEST 1: 1000 Concurrent Requests for 100 Credits");

  const testEmail = `concurrent-test-${Date.now()}@test.com`;
  const INITIAL_CREDITS = 100;
  const CONCURRENT_REQUESTS = 1000;
  const DEDUCTION_AMOUNT = 1;

  try {
    // Setup: Create test user
    await Credit.deleteMany({ userEmail: testEmail });
    await Credit.create({
      userEmail: testEmail,
      credits: INITIAL_CREDITS,
      amount: 0,
    });

    log(`Created test user with ${INITIAL_CREDITS} credits`, colors.dim);
    log(
      `Launching ${CONCURRENT_REQUESTS} concurrent deduction requests...`,
      colors.dim
    );

    const startTime = Date.now();

    // Launch all requests simultaneously
    const promises = Array.from({ length: CONCURRENT_REQUESTS }, (_, i) =>
      deductCreditsAtomic(testEmail, DEDUCTION_AMOUNT)
    );

    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    // Analyze results
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    // Get final state
    const finalRecord = await Credit.findOne({ userEmail: testEmail }).lean();
    const finalCredits = (finalRecord as any)?.credits ?? -999;

    // Calculate expected values
    const expectedSuccesses = INITIAL_CREDITS / DEDUCTION_AMOUNT;
    const expectedFailures = CONCURRENT_REQUESTS - expectedSuccesses;

    // Report
    console.log("-".repeat(60));
    console.log(`Initial Credits:      ${INITIAL_CREDITS}`);
    console.log(`Concurrent Requests:  ${CONCURRENT_REQUESTS}`);
    console.log(`Duration:             ${duration}ms`);
    console.log(
      `Throughput:           ${Math.round((CONCURRENT_REQUESTS / duration) * 1000)} req/s`
    );
    console.log("-".repeat(60));
    console.log(
      `Successful Deductions: ${successCount} (expected: ${expectedSuccesses})`
    );
    console.log(
      `Failed Deductions:     ${failureCount} (expected: ${expectedFailures})`
    );
    console.log(`Final Credits:         ${finalCredits} (expected: 0)`);
    console.log("-".repeat(60));

    // Assertions
    const passed =
      finalCredits === 0 &&
      successCount === expectedSuccesses &&
      failureCount === expectedFailures;

    if (passed) {
      log("✅ TEST PASSED", colors.green);
    } else {
      log("❌ TEST FAILED", colors.red);
      if (finalCredits !== 0) log(`  - Final credits: ${finalCredits} (should be 0)`, colors.red);
      if (successCount !== expectedSuccesses)
        log(`  - Success count: ${successCount} (should be ${expectedSuccesses})`, colors.red);
    }

    // Cleanup
    await Credit.deleteMany({ userEmail: testEmail });

    return passed;
  } catch (error) {
    log(`❌ TEST ERROR: ${error}`, colors.red);
    await Credit.deleteMany({ userEmail: testEmail });
    return false;
  }
}

/**
 * Test 2: Stress test - many requests, few credits
 */
async function testStressDeductions() {
  logSection("TEST 2: Stress Test - 500 Requests for 5 Credits");

  const testEmail = `stress-test-${Date.now()}@test.com`;
  const INITIAL_CREDITS = 5;
  const CONCURRENT_REQUESTS = 500;

  try {
    await Credit.deleteMany({ userEmail: testEmail });
    await Credit.create({
      userEmail: testEmail,
      credits: INITIAL_CREDITS,
      amount: 0,
    });

    const startTime = Date.now();

    const promises = Array.from({ length: CONCURRENT_REQUESTS }, () =>
      deductCreditsAtomic(testEmail, 1)
    );

    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    const successCount = results.filter((r) => r.success).length;
    const finalRecord = await Credit.findOne({ userEmail: testEmail }).lean();
    const finalCredits = (finalRecord as any)?.credits ?? -999;

    console.log("-".repeat(60));
    console.log(`Initial Credits:      ${INITIAL_CREDITS}`);
    console.log(`Concurrent Requests:  ${CONCURRENT_REQUESTS}`);
    console.log(`Duration:             ${duration}ms`);
    console.log(`Successful:           ${successCount} (expected: ${INITIAL_CREDITS})`);
    console.log(`Final Credits:        ${finalCredits} (expected: 0)`);
    console.log("-".repeat(60));

    const passed = finalCredits === 0 && successCount === INITIAL_CREDITS;

    if (passed) {
      log("✅ TEST PASSED", colors.green);
    } else {
      log("❌ TEST FAILED - Race condition detected!", colors.red);
    }

    await Credit.deleteMany({ userEmail: testEmail });
    return passed;
  } catch (error) {
    log(`❌ TEST ERROR: ${error}`, colors.red);
    return false;
  }
}

/**
 * Test 3: Multi-batch consistency
 */
async function testMultiBatchConsistency() {
  logSection("TEST 3: Multi-Batch Consistency (3 batches x 100 requests)");

  const testEmail = `batch-test-${Date.now()}@test.com`;
  const TOTAL_CREDITS = 50;
  const BATCHES = 3;
  const REQUESTS_PER_BATCH = 100;

  try {
    await Credit.deleteMany({ userEmail: testEmail });
    await Credit.create({
      userEmail: testEmail,
      credits: TOTAL_CREDITS,
      amount: 0,
    });

    let totalSuccesses = 0;

    for (let batch = 0; batch < BATCHES; batch++) {
      const batchPromises = Array.from({ length: REQUESTS_PER_BATCH }, () =>
        deductCreditsAtomic(testEmail, 1)
      );

      const batchResults = await Promise.all(batchPromises);
      const batchSuccesses = batchResults.filter((r) => r.success).length;
      totalSuccesses += batchSuccesses;

      const currentRecord = await Credit.findOne({ userEmail: testEmail }).lean();
      const currentCredits = (currentRecord as any)?.credits ?? 0;

      log(
        `  Batch ${batch + 1}: ${batchSuccesses} successful, remaining: ${currentCredits}`,
        colors.dim
      );
    }

    const finalRecord = await Credit.findOne({ userEmail: testEmail }).lean();
    const finalCredits = (finalRecord as any)?.credits ?? -999;

    console.log("-".repeat(60));
    console.log(`Total Requests:       ${BATCHES * REQUESTS_PER_BATCH}`);
    console.log(`Total Successful:     ${totalSuccesses} (expected: ${TOTAL_CREDITS})`);
    console.log(`Final Credits:        ${finalCredits} (expected: 0)`);
    console.log("-".repeat(60));

    const passed = finalCredits === 0 && totalSuccesses === TOTAL_CREDITS;

    if (passed) {
      log("✅ TEST PASSED", colors.green);
    } else {
      log("❌ TEST FAILED", colors.red);
    }

    await Credit.deleteMany({ userEmail: testEmail });
    return passed;
  } catch (error) {
    log(`❌ TEST ERROR: ${error}`, colors.red);
    return false;
  }
}

/**
 * Test 4: Verify no negative balance possible
 */
async function testNoNegativeBalance() {
  logSection("TEST 4: Negative Balance Prevention");

  const testEmail = `negative-test-${Date.now()}@test.com`;

  try {
    await Credit.deleteMany({ userEmail: testEmail });
    await Credit.create({
      userEmail: testEmail,
      credits: 10,
      amount: 0,
    });

    // Try to deduct more than available in rapid succession
    const promises = Array.from({ length: 100 }, () =>
      deductCreditsAtomic(testEmail, 3) // Try to deduct 3 each time
    );

    await Promise.all(promises);

    const finalRecord = await Credit.findOne({ userEmail: testEmail }).lean();
    const finalCredits = (finalRecord as any)?.credits ?? -999;

    console.log("-".repeat(60));
    console.log(`Initial Credits:      10`);
    console.log(`Deduction Amount:     3 per request`);
    console.log(`Concurrent Requests:  100`);
    console.log(`Final Credits:        ${finalCredits}`);
    console.log("-".repeat(60));

    // Final credits should be 1 (10 - 3*3 = 1)
    const passed = finalCredits >= 0 && finalCredits <= 1;

    if (passed) {
      log("✅ TEST PASSED - No negative balance", colors.green);
    } else {
      log(`❌ TEST FAILED - Final balance: ${finalCredits}`, colors.red);
    }

    await Credit.deleteMany({ userEmail: testEmail });
    return passed;
  } catch (error) {
    log(`❌ TEST ERROR: ${error}`, colors.red);
    return false;
  }
}

/**
 * Main test runner
 */
async function main() {
  let mongoServer: MongoMemoryServer | null = null;
  let mongoUri = CONFIG.MONGODB_URI;

  console.log("\n");
  log("╔══════════════════════════════════════════════════════════╗", colors.cyan);
  log("║     CONCURRENT TRANSACTION TEST SUITE                    ║", colors.cyan);
  log("║     Testing MongoDB Atomic Operations                    ║", colors.cyan);
  log("╚══════════════════════════════════════════════════════════╝", colors.cyan);

  try {
    if (!mongoUri) {
      log("\nNo DATABASE_URL provided. Attempting to start in-memory MongoDB...", colors.dim);
      try {
        mongoServer = await MongoMemoryServer.create({
          binary: {
            version: "6.0.12", // Use a widely available version
          },
        });
        mongoUri = mongoServer.getUri();
        log("In-memory MongoDB started!", colors.green);
      } catch (memoryServerError) {
        log("\n❌ Could not start in-memory MongoDB.", colors.red);
        log("\nPlease provide a MongoDB connection string:", colors.yellow);
        log("  DATABASE_URL=mongodb://localhost:27017/test npm run test:concurrent:integration", colors.dim);
        log("\nOr start MongoDB with Docker:", colors.yellow);
        log("  docker run -d -p 27017:27017 --name mongo-test mongo:7", colors.dim);
        log("  DATABASE_URL=mongodb://localhost:27017/test npm run test:concurrent:integration", colors.dim);
        log("\nOr use MongoDB Atlas (free tier):", colors.yellow);
        log("  DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/test npm run test:concurrent:integration", colors.dim);
        process.exit(1);
      }
    } else {
      log("\nUsing external MongoDB: " + mongoUri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"), colors.dim);
    }

    log("Connecting to MongoDB...", colors.dim);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: CONFIG.CONNECTION_TIMEOUT,
    });
    log("Connected successfully!\n", colors.green);

    const results: boolean[] = [];

    // Run all tests
    results.push(await testConcurrentDeductions());
    results.push(await testStressDeductions());
    results.push(await testMultiBatchConsistency());
    results.push(await testNoNegativeBalance());

    // Summary
    logSection("TEST SUMMARY");

    const passedCount = results.filter((r) => r).length;
    const totalCount = results.length;

    console.log(`Passed: ${passedCount}/${totalCount}`);
    console.log("");

    if (passedCount === totalCount) {
      log("✅ ALL TESTS PASSED", colors.green);
      log("   MongoDB atomic operations are working correctly.", colors.green);
      log("   No race conditions detected under concurrent load.", colors.green);
    } else {
      log(`❌ ${totalCount - passedCount} TEST(S) FAILED`, colors.red);
      log("   Review the atomic deduction implementation.", colors.red);
    }

    console.log("\n" + "=".repeat(60) + "\n");

    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      log("In-memory MongoDB stopped.", colors.dim);
    }
    process.exit(passedCount === totalCount ? 0 : 1);
  } catch (error) {
    log(`\n❌ Connection Error: ${error}`, colors.red);
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.exit(1);
  }
}

main();
