/**
 * Concurrent Transaction Test for Credits Repository
 *
 * This test validates that the atomic deduction implementation correctly handles
 * race conditions under high concurrency. It simulates 1000+ concurrent transactions
 * attempting to deduct credits from the same user account.
 *
 * Key assertions:
 * 1. No over-deduction (final credits >= 0)
 * 2. Exactly N successful deductions where N = initial_credits / deduction_amount
 * 3. All excess requests fail gracefully with insufficient credits error
 *
 * Run with: npm run test:concurrent
 */

import mongoose from "mongoose";
import Credit from "@/src/models/credit.model";
import { creditRepository } from "@/src/repositories/credits.repository";

// Test configuration
const TEST_CONFIG = {
  MONGODB_URI: process.env.DATABASE_URL || "mongodb://localhost:27017/test_db",
  TEST_USER_EMAIL: `concurrent-test-${Date.now()}@test.com`,
  INITIAL_CREDITS: 100,
  DEDUCTION_AMOUNT: 1,
  CONCURRENT_REQUESTS: 1000,
  CONNECTION_TIMEOUT: 30000,
};

describe("Credits Repository - Concurrent Deduction Test", () => {
  beforeAll(async () => {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_CONFIG.MONGODB_URI, {
        serverSelectionTimeoutMS: TEST_CONFIG.CONNECTION_TIMEOUT,
      });
    }
  });

  afterAll(async () => {
    // Cleanup test data
    await Credit.deleteMany({ userEmail: TEST_CONFIG.TEST_USER_EMAIL });
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Reset test user before each test
    await Credit.deleteMany({ userEmail: TEST_CONFIG.TEST_USER_EMAIL });
  });

  it("should handle 1000+ concurrent deductions without race conditions", async () => {
    const { TEST_USER_EMAIL, INITIAL_CREDITS, DEDUCTION_AMOUNT, CONCURRENT_REQUESTS } = TEST_CONFIG;

    // Step 1: Create test user with initial credits
    await Credit.create({
      userEmail: TEST_USER_EMAIL,
      credits: INITIAL_CREDITS,
      amount: 0,
    });

    // Verify initial state
    const initialRecord = await Credit.findOne({ userEmail: TEST_USER_EMAIL }).lean();
    expect((initialRecord as any)?.credits).toBe(INITIAL_CREDITS);

    // Step 2: Launch concurrent deduction requests
    const startTime = Date.now();

    const deductionPromises = Array.from({ length: CONCURRENT_REQUESTS }, (_, index) =>
      creditRepository.deductCreditsAtomic(
        TEST_USER_EMAIL,
        DEDUCTION_AMOUNT,
        `concurrent-req-${index}`
      )
    );

    // Wait for all concurrent requests to complete
    const results = await Promise.all(deductionPromises);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Step 3: Analyze results
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    // Step 4: Verify final state
    const finalRecord = await Credit.findOne({ userEmail: TEST_USER_EMAIL }).lean();
    const finalCredits = (finalRecord as any)?.credits ?? -1;

    // Calculate expected values
    const expectedSuccesses = Math.floor(INITIAL_CREDITS / DEDUCTION_AMOUNT);
    const expectedFailures = CONCURRENT_REQUESTS - expectedSuccesses;

    // Log results for debugging
    console.log("\n" + "=".repeat(60));
    console.log("CONCURRENT DEDUCTION TEST RESULTS");
    console.log("=".repeat(60));
    console.log(`Initial Credits:      ${INITIAL_CREDITS}`);
    console.log(`Deduction Amount:     ${DEDUCTION_AMOUNT} per request`);
    console.log(`Concurrent Requests:  ${CONCURRENT_REQUESTS}`);
    console.log(`Duration:             ${duration}ms`);
    console.log(`Throughput:           ${Math.round((CONCURRENT_REQUESTS / duration) * 1000)} req/s`);
    console.log("-".repeat(60));
    console.log(`Successful Deductions: ${successCount} (expected: ${expectedSuccesses})`);
    console.log(`Failed Deductions:     ${failureCount} (expected: ${expectedFailures})`);
    console.log(`Final Credits:         ${finalCredits} (expected: 0)`);
    console.log("=".repeat(60) + "\n");

    // Assertions
    // 1. Final credits should be exactly 0 (no over-deduction)
    expect(finalCredits).toBe(0);

    // 2. Success count should equal initial credits / deduction amount
    expect(successCount).toBe(expectedSuccesses);

    // 3. Failure count should equal concurrent requests - expected successes
    expect(failureCount).toBe(expectedFailures);

    // 4. Total results should match total requests
    expect(successCount + failureCount).toBe(CONCURRENT_REQUESTS);
  }, 60000); // 60 second timeout for this test

  it("should prevent negative credit balance under any circumstances", async () => {
    const { TEST_USER_EMAIL } = TEST_CONFIG;

    // Start with just 5 credits
    const SMALL_INITIAL_CREDITS = 5;
    const LARGE_CONCURRENT_REQUESTS = 500;

    await Credit.create({
      userEmail: TEST_USER_EMAIL,
      credits: SMALL_INITIAL_CREDITS,
      amount: 0,
    });

    // Launch many more requests than available credits
    const deductionPromises = Array.from({ length: LARGE_CONCURRENT_REQUESTS }, (_, index) =>
      creditRepository.deductCreditsAtomic(TEST_USER_EMAIL, 1, `stress-req-${index}`)
    );

    const results = await Promise.all(deductionPromises);

    // Verify final state
    const finalRecord = await Credit.findOne({ userEmail: TEST_USER_EMAIL }).lean();
    const finalCredits = (finalRecord as any)?.credits ?? -1;

    const successCount = results.filter((r) => r.success).length;

    // Critical assertion: credits should NEVER go negative
    expect(finalCredits).toBeGreaterThanOrEqual(0);
    expect(finalCredits).toBe(0);
    expect(successCount).toBe(SMALL_INITIAL_CREDITS);

    console.log(`\nStress Test: ${LARGE_CONCURRENT_REQUESTS} requests, ${SMALL_INITIAL_CREDITS} credits`);
    console.log(`Result: ${successCount} successful, final balance: ${finalCredits}`);
  }, 30000);

  it("should maintain consistency across multiple batches of concurrent requests", async () => {
    const { TEST_USER_EMAIL } = TEST_CONFIG;

    // Create user with 50 credits
    const TOTAL_CREDITS = 50;
    await Credit.create({
      userEmail: TEST_USER_EMAIL,
      credits: TOTAL_CREDITS,
      amount: 0,
    });

    // Run 3 batches of 100 concurrent requests each
    const BATCHES = 3;
    const REQUESTS_PER_BATCH = 100;

    let totalSuccesses = 0;

    for (let batch = 0; batch < BATCHES; batch++) {
      const batchPromises = Array.from({ length: REQUESTS_PER_BATCH }, (_, index) =>
        creditRepository.deductCreditsAtomic(
          TEST_USER_EMAIL,
          1,
          `batch-${batch}-req-${index}`
        )
      );

      const batchResults = await Promise.all(batchPromises);
      const batchSuccesses = batchResults.filter((r) => r.success).length;
      totalSuccesses += batchSuccesses;

      console.log(`Batch ${batch + 1}: ${batchSuccesses} successful deductions`);
    }

    // Verify final state
    const finalRecord = await Credit.findOne({ userEmail: TEST_USER_EMAIL }).lean();
    const finalCredits = (finalRecord as any)?.credits ?? -1;

    expect(finalCredits).toBe(0);
    expect(totalSuccesses).toBe(TOTAL_CREDITS);

    console.log(`\nMulti-batch Test: Total ${totalSuccesses} successful across ${BATCHES} batches`);
  }, 60000);
});

/**
 * Standalone test runner for manual verification
 * Can be run directly: npx ts-node src/__tests__/repositories/credits.concurrent.test.ts
 */
async function runStandaloneTest() {
  const MONGODB_URI = process.env.DATABASE_URL;

  if (!MONGODB_URI) {
    console.error("ERROR: DATABASE_URL environment variable is required");
    console.log("Usage: DATABASE_URL=mongodb://... npx ts-node <this-file>");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected!\n");

  const testEmail = `standalone-test-${Date.now()}@test.com`;
  const INITIAL_CREDITS = 100;
  const CONCURRENT_REQUESTS = 1000;

  try {
    // Setup
    await Credit.create({
      userEmail: testEmail,
      credits: INITIAL_CREDITS,
      amount: 0,
    });

    console.log(`Created test user with ${INITIAL_CREDITS} credits`);
    console.log(`Launching ${CONCURRENT_REQUESTS} concurrent deduction requests...\n`);

    const startTime = Date.now();

    // Run concurrent requests
    const promises = Array.from({ length: CONCURRENT_REQUESTS }, (_, i) =>
      creditRepository.deductCreditsAtomic(testEmail, 1, `req-${i}`)
    );

    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    // Analyze
    const successes = results.filter((r) => r.success).length;
    const failures = results.filter((r) => !r.success).length;

    const finalRecord = await Credit.findOne({ userEmail: testEmail }).lean();
    const finalCredits = (finalRecord as any)?.credits;

    // Report
    console.log("=".repeat(60));
    console.log("CONCURRENT TRANSACTION TEST RESULTS");
    console.log("=".repeat(60));
    console.log(`Concurrent Requests:  ${CONCURRENT_REQUESTS}`);
    console.log(`Duration:             ${duration}ms`);
    console.log(`Throughput:           ${Math.round((CONCURRENT_REQUESTS / duration) * 1000)} req/s`);
    console.log("-".repeat(60));
    console.log(`Successful:           ${successes} (expected: ${INITIAL_CREDITS})`);
    console.log(`Failed:               ${failures} (expected: ${CONCURRENT_REQUESTS - INITIAL_CREDITS})`);
    console.log(`Final Credits:        ${finalCredits} (expected: 0)`);
    console.log("-".repeat(60));

    const passed =
      finalCredits === 0 && successes === INITIAL_CREDITS && failures === CONCURRENT_REQUESTS - INITIAL_CREDITS;

    if (passed) {
      console.log("✅ TEST PASSED: Atomic operations working correctly!");
      console.log("   No race conditions detected under concurrent load.");
    } else {
      console.log("❌ TEST FAILED: Race condition detected!");
      console.log("   Review the atomic deduction implementation.");
    }
    console.log("=".repeat(60));

    // Cleanup
    await Credit.deleteMany({ userEmail: testEmail });
  } finally {
    await mongoose.disconnect();
  }
}

// Allow standalone execution
if (require.main === module) {
  runStandaloneTest().catch(console.error);
}
