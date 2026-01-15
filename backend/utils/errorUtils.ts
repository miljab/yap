import AppError from "./appError.js";

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  return {
    message: "Internal server error",
    statusCode: 500,
  };
}
