
const API_BASE_URL = "https://localhost:7147/api/AdminDashboard";

document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        loadStatistics(),
        loadRecentEnrollments()
    ]);
});

async function loadStatistics() {
    try {
        const response = await apiFetch(
            `${API_BASE_URL}/statistics`
        );

        if (!response.ok) {
            throw new Error("Failed to load dashboard statistics.");
        }

        const data = await response.json();

        document.getElementById("totalStudents").textContent =
            data.totalStudents;

        document.getElementById("totalTeachers").textContent =
            data.totalTeachers;

        document.getElementById("totalCourses").textContent =
            data.totalCourses;

        document.getElementById("totalEnrollments").textContent =
            data.totalEnrollments;

    } catch (error) {
        console.error("Statistics error:", error);
    }
}

async function loadRecentEnrollments() {
    const tbody = document.getElementById("recentEnrollmentsBody");

    try {
        const response = await apiFetch(
           
            `${API_BASE_URL}/recent-enrollments`
        );
 console.log("API status:", response.status);

        if (!response.ok) {
            throw new Error("Failed to load recent enrollments.");
        }

        const enrollments = await response.json();

        tbody.replaceChildren();

        if (enrollments.length === 0) {
            showTableMessage("No enrollments found.");
            return;
        }

        enrollments.forEach(enrollment => {
            const row = document.createElement("tr");
            row.className = "hover:bg-slate-800/30 transition-colors";

            appendCell(row, enrollment.studentName ?? "N/A",
                "py-3.5 font-medium dark:text-white text-slate-900");

            appendCell(row, enrollment.courseName ?? "N/A",
                "py-3.5");

            appendCell(row, enrollment.teacherName ?? "Not assigned",
                "py-3.5 text-slate-400");

            const term = `Semester ${enrollment.semester} - ${enrollment.academicYear}`;

            appendCell(row, term, "py-3.5 text-slate-400");

            const gradeCell = document.createElement("td");
            gradeCell.className = "py-3.5";

            const gradeBadge = document.createElement("span");
            gradeBadge.className =
                "px-2.5 py-1 rounded-full text-xs font-bold " +
                "bg-indigo-500/10 text-indigo-400";

            gradeBadge.textContent = enrollment.grade ?? "Not graded";

            gradeCell.appendChild(gradeBadge);
            row.appendChild(gradeCell);

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("Recent enrollments error:", error);
        showTableMessage("Could not load enrollments.");
    }

    function showTableMessage(message) {
        tbody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "py-6 text-center text-slate-400";
        cell.textContent = message;

        row.appendChild(cell);
        tbody.appendChild(row);
    }
}

function appendCell(row, value, className) {
    const cell = document.createElement("td");

    cell.className = className;
    cell.textContent = value;

    row.appendChild(cell);
}
