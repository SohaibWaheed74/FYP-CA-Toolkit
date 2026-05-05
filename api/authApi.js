// ================= AUTH BASE URL =================
// Architecture wala apiConfig use nahi kar rahe,
// kyun ke usme /architecture already added hai.
const AUTH_BASE_URL =
  "http://192.168.18.108/ComputerArchitectureToolkitAPI/api/auth";

const safeJsonParse = async (response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.log("API returned non-JSON response:", text);
    throw new Error(
      "API returned HTML instead of JSON. Please check API URL, IIS publish, or backend route."
    );
  }
};

// ================= LOGIN USER =================
export const loginUser = async (email, password) => {
  try {
    const url = `${AUTH_BASE_URL}/login`;

    console.log("LOGIN URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        Email: email,
        Password: password,
      }),
    });

    const data = await safeJsonParse(response);

    if (!response.ok) {
      throw new Error(data?.message || "Login failed");
    }

    return data;
  } catch (error) {
    console.log("Login API Error:", error);
    throw error;
  }
};

// ================= REGISTER USER =================
export const registerUser = async (email, password) => {
  try {
    const url = `${AUTH_BASE_URL}/register`;

    console.log("REGISTER URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        Email: email,
        Password: password,
      }),
    });

    const data = await safeJsonParse(response);

    if (!response.ok) {
      throw new Error(data?.message || "Register failed");
    }

    return data;
  } catch (error) {
    console.log("Register API Error:", error);
    throw error;
  }
};

// ================= GET ALL USERS =================
export const getAllUsers = async () => {
  try {
    const url = `${AUTH_BASE_URL}/users`;

    console.log("USERS URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await safeJsonParse(response);

    if (!response.ok) {
      throw new Error(data?.message || "Failed to load users");
    }

    return data;
  } catch (error) {
    console.log("Get Users API Error:", error);
    throw error;
  }
};

// ================= MAKE USER ADMIN =================
export const makeAdmin = async (userId) => {
  try {
    const url = `${AUTH_BASE_URL}/make-admin/${userId}`;

    console.log("MAKE ADMIN URL:", url);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const data = await safeJsonParse(response);

    if (!response.ok) {
      throw new Error(data?.message || "Failed to make admin");
    }

    return data;
  } catch (error) {
    console.log("Make Admin API Error:", error);
    throw error;
  }
};