export const logoutAndClearAll = () => {
  // Clear all storage
  localStorage.clear();
  sessionStorage.clear();

  // Clear all cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });

  // Hard redirect to clear any stuck memory states
  window.location.href = "/login";
};
