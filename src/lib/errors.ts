export class AppError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ProviderError extends AppError {
  constructor(message = "AI provider failed") {
    super(message, 500);
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(message = "Insufficient credits", remainingCredits?: number) {
    super(message, 402); // 402 Payment Required
    this.name = "InsufficientCreditsError";
    // Store remaining credits for client response
    (this as any).remainingCredits = remainingCredits;
  }
}