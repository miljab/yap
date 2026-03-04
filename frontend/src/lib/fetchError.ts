import axios, { type AxiosError } from "axios";

export type FetchErrorType = "network_error" | "not_found" | "server_error";

export type FetchErrorState = {
  type: FetchErrorType;
  message: string;
};

export function getErrorState(err: unknown): FetchErrorState {
  const axiosError = err as AxiosError;
  const isNetworkError =
    axios.isAxiosError(err) &&
    (err.code === "ECONNABORTED" || !axiosError.response);

  if (isNetworkError) {
    return {
      type: "network_error",
      message: "Could not connect. Please try again.",
    };
  }

  if (axiosError.response?.status === 404) {
    return {
      type: "not_found",
      message: "Not found.",
    };
  }

  return {
    type: "server_error",
    message: "Failed to load data. Please try again.",
  };
}
