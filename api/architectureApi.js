import BASE_URL from "./apiConfig";

const parseResponse = async (response) => {
  const text = await response.text();

  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.Message ||
        text ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
};

// ================= CREATE FULL ARCHITECTURE =================
export const createFullArchitecture = async (fullData) => {
  try {
    const url = `${BASE_URL}/create-full`;

    console.log("CREATE FULL ARCHITECTURE URL:", url);
    console.log(
      "CREATE FULL ARCHITECTURE PAYLOAD:",
      JSON.stringify(fullData, null, 2)
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(fullData),
    });

    const data = await parseResponse(response);

    console.log(
      "CREATE FULL ARCHITECTURE RESPONSE:",
      JSON.stringify(data, null, 2)
    );

    return data;
  } catch (error) {
    console.log("CREATE FULL ARCHITECTURE API ERROR:", error);
    throw error;
  }
};

// ================= GET ARCHITECTURE DETAILS =================
export const getArchitectureDetails = async (id) => {
  try {
    const url = `${BASE_URL}/${id}/details`;

    console.log("GET ARCHITECTURE DETAILS URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await parseResponse(response);

    console.log(
      "GET ARCHITECTURE DETAILS RESPONSE:",
      JSON.stringify(data, null, 2)
    );

    return data;
  } catch (error) {
    console.log("GET ARCHITECTURE DETAILS API ERROR:", error);
    throw error;
  }
};

// ================= UPDATE FULL ARCHITECTURE =================
export const updateFullArchitecture = async (id, payload) => {
  try {
    const url = `${BASE_URL}/update-full/${id}`;

    console.log("UPDATE FULL ARCHITECTURE URL:", url);
    console.log(
      "UPDATE FULL ARCHITECTURE PAYLOAD:",
      JSON.stringify(payload, null, 2)
    );

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await parseResponse(response);

    console.log(
      "UPDATE FULL ARCHITECTURE RESPONSE:",
      JSON.stringify(data, null, 2)
    );

    return data;
  } catch (error) {
    console.log("UPDATE FULL ARCHITECTURE API ERROR:", error);
    throw error;
  }
};