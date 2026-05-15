// src/api/instructionApi.js
import axios from "axios";

// Same BASE_URL jo executionApi.js mein use ho raha hai
// const BASE_URL = "http://192.168.18.108/ComputerArchitectureToolkitAPI/api";
const BASE_URL = "http://192.168.1.5/ComputerArchitectureToolkitAPI/api";

const normalizeApiError = (error) => {
  let message = "Network error occurred";

  if (error.response?.data) {
    const data = error.response.data;

    if (Array.isArray(data)) {
      message = data.join("\n");
    } else if (typeof data === "object") {
      message =
        data.Message ||
        data.message ||
        data.ExceptionMessage ||
        data.error ||
        JSON.stringify(data, null, 2);
    } else {
      message = data;
    }
  } else if (error.message) {
    message = error.message;
  }

  return new Error(message);
};

// --------------------------------- GET INSTRUCTIONS BY ARCHITECTURE ID ---------------------------------
export const getInstructionsByArchitectureId = async (architectureId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/architecture/${architectureId}/details`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    return (
      data?.Instructions ||
      data?.instructions ||
      data?.ArchitectureInstructions ||
      data?.architectureInstructions ||
      []
    );
  } catch (error) {
    throw normalizeApiError(error);
  }
};