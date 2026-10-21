
// Get HTML Elements
const changePasswordForm = document.getElementById("change-password-form");

const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");


// Show / Hide Password
document.querySelectorAll(".show-password").forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
        const passwordInput = document.getElementById(this.dataset.target);

        passwordInput.type = this.checked ? "text" : "password";
    });
});


// Cancel Button
document.getElementById("cancel-button").addEventListener("click", function () {
    window.history.back();
});


// Change Password
changePasswordForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validate New Password
    if (newPassword !== confirmPassword) {
        alert("New password and confirmation do not match.");
        return;
    }

    // Get Current User Data
    const userID = localStorage.getItem("userID");
   
    if (!userID || !localStorage.getItem("accessToken")) {
        alert("Please log in first.");
        return;
    }

    try {
        const response = await  apiFetch(
            "https://localhost:7147/api/Auth/ChangePassword",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                  
                },
                body: JSON.stringify({
                    userId: Number(userID),
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                    confirmPassword: confirmPassword
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to change password.");
            return;
        }

        alert(data.message || "Password changed successfully.");

        changePasswordForm.reset();

        // Hide passwords after reset
        document.querySelectorAll(".show-password").forEach(function (checkbox) {
            checkbox.checked = false;
        });

    } catch (error) {
        console.error("Change password error:", error);
        alert("Couldn't connect to the API. Make sure the backend is running.");
    }
});
