


document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("logoutButton");

    if (!logoutButton) return;

    logoutButton.addEventListener("click", async () => {
      
        const email = localStorage.getItem("email");
        const refreshToken = sessionStorage.getItem("refreshToken");

        try {
            if (email && refreshToken) {
             
                const response = await fetch(
                    "https://localhost:7147/api/Auth/Logout",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: email,
                            refreshToken: refreshToken
                        })
                    }
                );
              
                if (!response.ok) {
                    console.error("Logout request failed:", response.status);
                    alert("Logout failed. Please try again.");
                    return;
                }
            }

            localStorage.removeItem("accessToken");
            localStorage.removeItem("userID");
            localStorage.removeItem("roleName");
            localStorage.removeItem("email");
            sessionStorage.removeItem("refreshToken");
// إيقاف التحويل مؤقتًا
window.location.href = "Login.html";
           

        } catch (error) {
            console.error("Logout error:", error);
            alert("Could not connect to the server. Please try again.");
        }
    });
});
