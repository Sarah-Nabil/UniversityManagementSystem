
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
        const response = await fetch("https://localhost:7147/api/Auth/Login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Email or password is incorrect.");
            return;
        }

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("userID", data.userID);
        localStorage.setItem("roleName", data.roleName);
        localStorage.setItem("email", email);
        sessionStorage.setItem("refreshToken", data.refreshToken);

        if (data.roleName === "Admin") {
            window.location.href = "Admin-dashboard.html";
        } else if (data.roleName === "Teacher") {
            window.location.href = "Teacher-dashboard.html";
        } else if (data.roleName === "Student") {
            window.location.href = "Student-dashboard.html";
        } else {
            alert("Invalid user role: " + data.roleName);
        }

    } catch (error) {
        console.error("Login error:", error);
        alert("Couldn't connect to the API. Make sure the backend is running.");
    }
});
