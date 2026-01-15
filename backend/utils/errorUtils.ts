import AppError from "./appError.js";

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  return {
    message: "Unexpected error occurred. Please try again.",
    statusCode: 500,
  };
}
