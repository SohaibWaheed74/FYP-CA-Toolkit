import axios from "axios";

const BASE_URL = "http://192.168.18.104/ComputerArchitectureToolkitAPI/api";

// --------------------------------- USE ARCHITECTURE ---------------------------------
export const useArchitectureForExecution = async (architectureId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/execution/useArchitecture/${architectureId}`
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
      programLines
    );

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

// --------------------------------- ERROR NORMALIZER (IMPORTANT) ---------------------------------
const normalizeApiError = (error) => {
  if (error.response?.data) {
    const data = error.response.data;

    // backend array errors
    if (Array.isArray(data)) {
      return data.join("\n");
    }

    // backend object errors
    if (typeof data === "object") {
      return JSON.stringify(data, null, 2);
    }

    return data;
  }

  return error.message || "Network error occurred";
};