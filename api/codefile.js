import BASE_URL from "./apiConfig";

// ================= SAVE CODE FILE =================
export const saveCodeFile = async (architectureId, fileName, code) => {
  const url = `${BASE_URL}/${architectureId}/codefile/add`;

  try {
    const payload = {
      FileName: fileName,
      Code: code,
    };

    console.log("SAVE CODE FILE URL:", url);
    console.log("SAVE CODE FILE PAYLOAD:", JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    console.log("SAVE CODE FILE STATUS:", response.status);
    console.log("SAVE CODE FILE RAW RESPONSE:", text);

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (parseError) {
      throw new Error(
        `Server returned non-JSON response. Status: ${response.status}. URL: ${url}`
      );
    }

    if (!response.ok) {
      throw new Error(data?.message || `Failed to save code file. URL: ${url}`);
    }

    return data;
  } catch (error) {
    console.log("SAVE CODE FILE API ERROR:", error);
    throw error;
  }
};
// ================= GET ALL CODE FILES BY ARCHITECTURE =================
export const getCodeFiles = async (architectureId) => {
  try {
    const url = `${BASE_URL}/${architectureId}/codefile/all`;

    console.log("GET CODE FILES URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const text = await response.text();

    console.log("GET CODE FILES STATUS:", response.status);
    console.log("GET CODE FILES RAW RESPONSE:", text);

    let data = null;

    try {
      data = text ? JSON.parse(text) : [];
    } catch (parseError) {
      throw new Error(
        `Server returned non-JSON response. Status: ${response.status}. URL: ${url}`
      );
    }

    if (!response.ok) {
      throw new Error(data?.message || "Failed to fetch code files");
    }

    return data || [];
  } catch (error) {
    console.log("GET CODE FILES API ERROR:", error);
    throw error;
  }
};

// ================= GET SINGLE CODE FILE BY ID =================
export const getCodeFileById = async (fileId) => {
  try {
    const url = `${BASE_URL}/codefile/${fileId}`;

    console.log("GET CODE FILE BY ID URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const text = await response.text();

    console.log("GET CODE FILE BY ID STATUS:", response.status);
    console.log("GET CODE FILE BY ID RAW RESPONSE:", text);

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (parseError) {
      throw new Error(
        `Server returned non-JSON response. Status: ${response.status}. URL: ${url}`
      );
    }

    if (!response.ok) {
      throw new Error(data?.message || "Failed to fetch code file");
    }

    return data;
  } catch (error) {
    console.log("GET CODE FILE BY ID API ERROR:", error);
    throw error;
  }
};