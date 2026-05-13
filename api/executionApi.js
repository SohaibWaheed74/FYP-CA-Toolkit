import axios from "axios";

// const BASE_URL = "http://192.168.18.108/ComputerArchitectureToolkitAPI/api";
const BASE_URL = "http://192.168.1.9/ComputerArchitectureToolkitAPI/api";

// --------------------------------- USE ARCHITECTURE ---------------------------------
export const useArchitectureForExecution = async (architectureId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/execution/useArchitecture/${architectureId}`,
      null,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

// --------------------------------- EXECUTE PROGRAM ---------------------------------
export const executeProgram = async (architectureId, programLines) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/execution/execute/${architectureId}`,
      programLines,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

// --------------------------------- STEP FORWARD ---------------------------------
export const stepForwardProgram = async (architectureId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/execution/stepForward/${architectureId}`,
      null,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

// --------------------------------- ERROR NORMALIZER ---------------------------------
const normalizeApiError = (error) => {
  let message = "Network error occurred";

  if (error.response?.data) {
    const data = error.response.data;

    // Backend array errors
    if (Array.isArray(data)) {
      message = data.join("\n");
    }

    // Backend object errors
    else if (typeof data === "object") {
      message =
        data.Message ||
        data.message ||
        data.ExceptionMessage ||
        data.error ||
        JSON.stringify(data, null, 2);
    }

    // Backend string error
    else {
      message = data;
    }
  } else if (error.message) {
    message = error.message;
  }

  return new Error(message);
};