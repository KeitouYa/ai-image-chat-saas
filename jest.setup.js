// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock environment variables
process.env.UPSTASH_REDIS_REST_URL = "https://mock-redis.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "mock-token";
process.env.DATABASE_URL = "mongodb://localhost:27017/test";
process.env.MONGODB_URI = "mongodb://localhost:27017/test"; // Support both
process.env.GEMINI_API_KEY = "mock-gemini-key";
process.env.OPENAI_API_KEY = "mock-openai-key";

// Development simulation switches for testing (default to disabled)
process.env.DISABLE_CHAT_CREDITS = "false";
process.env.DISABLE_CHAT_CACHE = "false";
process.env.SIMULATE_GEMINI_FAILURE = "false";

// Mock mongoose
jest.mock("mongoose", () => {
  const mockModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  };

  return {
    connect: jest.fn(),
    connection: {
      readyState: 1,
    },
    model: jest.fn(() => mockModel),
    models: {},
    Schema: jest.fn(() => ({})),
    default: {
      connect: jest.fn(),
      model: jest.fn(() => mockModel),
      models: {},
      Schema: jest.fn(() => ({})),
    },
  };
});
