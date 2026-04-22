import BASE_URL from "./apiConfig";

// ================= CREATE FULL ARCHITECTURE =================
// export const createFullArchitecture = async (fullData) => {
//   try {
//     const response = await fetch(`${BASE_URL}/create-full`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(fullData),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || "Something went wrong");
//     }

//     return data;
//   } catch (error) {
//     throw error;
//   }
// };
export const createFullArchitecture = async (fullData) => {
  try {
    const response = await fetch(`${BASE_URL}/create-full`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fullData),
    });

    const text = await response.text(); // 👈 IMPORTANT DEBUG

    console.log("RAW RESPONSE:", text); // 👈 SEE REAL ERROR

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data.message || text || "Request failed");
    }

    return data;

  } catch (error) {
    console.log("API ERROR:", error);
    throw error;
  }
};

// ================= UPDATE ARCHITECTURE =================
export const updateArchitecture = async (id, payload) => {
  try {
    const response = await fetch(`${BASE_URL}/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Update failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
};