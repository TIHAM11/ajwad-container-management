(function () {

  const path = location.pathname.toLowerCase();
  const isLoginPage = path.endsWith("login.html");

  const loggedIn = localStorage.getItem("loggedIn") === "true";

  // If NOT on login page and NOT logged in → redirect
  if (!isLoginPage && !loggedIn) {
    location.replace("login.html");
  }

})();

function logoutUser() {
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}
