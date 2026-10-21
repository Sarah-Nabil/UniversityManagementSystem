
 // Refresh Token Management

let refreshPromise = null;


// Get a new Access Token using the Refresh Token
async function refreshAccessToken() {

    // Prevent multiple refresh requests at the same time
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async function () {
        const email = localStorage.getItem("email");
        const refreshToken = sessionStorage.getItem("refreshToken");

        if (!email || !refreshToken) {
            return false;
        }

        try {
            const response = await fetch(
                "https://localhost:7147/api/Auth/Refresh",
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
    const errorDetails = await response.text();

    console.error("Refresh failed:", {
        status: response.status,
        details: errorDetails
    });

    return false;
}

            const data = await response.json();

            if (!data.accessToken || !data.refreshToken) {
                return false;
            }

            // Save the new tokens
            localStorage.setItem("accessToken", data.accessToken);
            sessionStorage.setItem("refreshToken", data.refreshToken);

            return true;

        } catch (error) {
            console.error("Token refresh error:", error);
            return false;
        }
    })();

    try {
        return await refreshPromise;
    } finally {
        refreshPromise = null;
    }
}


// Send API requests using the current Access Token
async function apiFetch(url, options = {}) {

    const headers = new Headers(options.headers || {});
    const accessToken = localStorage.getItem("accessToken");




    if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    // Send the original request
    const response = await fetch(url, {
        ...options,
        headers
    });

    // If unauthorized, try refreshing the Access Token
    if (response.status !== 401) {
        return response;
    }

    const refreshed = await refreshAccessToken();

    if (!refreshed) {
        // Clear expired or invalid session data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userID");
        localStorage.removeItem("roleName");
        localStorage.removeItem("email");
        sessionStorage.removeItem("refreshToken");

        window.location.href = "Login.html";

        return response;
    }

    // Retry the original request once with the new Access Token
    headers.set(
        "Authorization",
        `Bearer ${localStorage.getItem("accessToken")}`
    );

    const retryResponse = await fetch(url, {
        ...options,
        headers
    });

    // If retry also fails with 401, end the session
    if (retryResponse.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userID");
        localStorage.removeItem("roleName");
        localStorage.removeItem("email");
        sessionStorage.removeItem("refreshToken");

        window.location.href = "Login.html";
    }

    return retryResponse;
}
// Protect pages that require authentication
(function protectPage() {
    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    const publicPages = ["login.html"];

    if (publicPages.includes(currentPage)) {
        return;
    }

    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (!accessToken && !refreshToken) {
        window.location.replace("Login.html");
    }
})();