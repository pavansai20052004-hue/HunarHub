export const getToken = () => localStorage.getItem("token");

export const getStoredUser = () => {
  const rawUser = localStorage.getItem("user");

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    clearSession();
    return null;
  }
};

export const saveSession = ({ token, user }) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getDashboardPath = (role) => {
  if (role === "admin") return "/admin";
  if (role === "entrepreneur") return "/entrepreneur";
  return "/customer";
};
