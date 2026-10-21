
const ENROLLMENTS_API_URL = "https://localhost:7147/api/Enrollments";

const enrollmentsTableBody = document.getElementById("enrollmentsTableBody");

let allEnrollments = [];

const STUDENTS_API_URL = "https://localhost:7147/api/Students";
const COURSES_API_URL = "https://localhost:7147/api/Courses";

async function loadEnrollmentOptions() {
    const studentSelect = document.getElementById("addStudentId");
    const courseSelect = document.getElementById("addCourseId");

    try {
        const [studentsResponse, coursesResponse] = await Promise.all([
            apiFetch(STUDENTS_API_URL),
            apiFetch(COURSES_API_URL)
        ]);

        if (!studentsResponse.ok || !coursesResponse.ok) {
            throw new Error("Failed to load students or courses.");
        }

        const students = await studentsResponse.json();
        const courses = await coursesResponse.json();

        studentSelect.innerHTML = `
            <option value="">Choose Student</option>
            ${students.map(student => `
                <option value="${student.studentId}">
                    ${escapeHtml(`${student.firstName} ${student.lastName}`)}
                </option>
            `).join("")}
        `;

        courseSelect.innerHTML = `
            <option value="">Choose Course</option>
            ${courses.map(course => `
                <option value="${course.courseId}">
                    ${escapeHtml(course.courseCode)} - ${escapeHtml(course.courseName)}
                </option>
            `).join("")}
        `;

    } catch (error) {
        console.error("Error loading enrollment options:", error);

        studentSelect.innerHTML =
            `<option value="">Failed to load students</option>`;

        courseSelect.innerHTML =
            `<option value="">Failed to load courses</option>`;
    }
}

loadEnrollmentOptions();

async function loadEnrollments() {
    try {
        const response = await apiFetch(ENROLLMENTS_API_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        allEnrollments = await response.json();

        displayEnrollments(allEnrollments);

    } catch (error) {
        console.error("Error loading enrollments:", error);

        enrollmentsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="py-6 text-center text-rose-500">
                    Failed to load enrollments. Check the Console.
                </td>
            </tr>
        `;
    }
}

function displayEnrollments(enrollments) {
    if (enrollments.length === 0) {
        enrollmentsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="py-6 text-center">
                    No enrollments found.
                </td>
            </tr>
        `;
        return;
    }

    enrollmentsTableBody.innerHTML = enrollments.map(enrollment => `
        <tr>
            <td class="py-4 font-medium text-slate-900 dark:text-white">
                ${escapeHtml(enrollment.studentName)}
            </td>

            <td class="py-4 text-slate-700 dark:text-slate-300">
                ${escapeHtml(enrollment.courseName)}
            </td>

            <td class="py-4 text-slate-500 dark:text-slate-400">
                ${escapeHtml(enrollment.teacherName || "Unassigned")}
            </td>

            <td class="py-4 text-slate-500 dark:text-slate-400">
                Semester ${enrollment.semester}
            </td>

            <td class="py-4 text-slate-500 dark:text-slate-400">
                ${escapeHtml(enrollment.academicYear)}
            </td>

            <td class="py-4">
                <span class="px-2.5 py-1 rounded-xl
                    bg-slate-100 dark:bg-slate-800
                    text-slate-600 dark:text-slate-400
                    border border-slate-200 dark:border-slate-700/50
                    text-xs font-medium">
                    ${escapeHtml(enrollment.grade || "Pending")}
                </span>
            </td>

            <td class="py-4 text-right">
                <div class="flex items-center justify-end gap-2 whitespace-nowrap">
                    <button
                        onclick="viewEnrollment(${Number(enrollment.enrollmentId)})"
                        class="text-xs px-2.5 py-1 rounded-lg border">
                        View
                    </button>

                    <button
                        onclick="editEnrollment(${Number(enrollment.enrollmentId)})"
                        class="text-xs px-2.5 py-1 rounded-lg border">
                        Edit
                    </button>

                    <button
                        onclick="deleteEnrollment(${Number(enrollment.enrollmentId)})"
                        class="text-xs px-2.5 py-1 rounded-lg border text-rose-500 hover:bg-rose-500/10">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

loadEnrollments();

document.getElementById("createEnrollmentForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const studentId = Number(document.getElementById("addStudentId").value);
    const courseId = Number(document.getElementById("addCourseId").value);

    if (!studentId || !courseId) {
        alert("Please select a student and a course.");
        return;
    }

    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        const response = await apiFetch(ENROLLMENTS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                studentId: studentId,
                courseId: courseId
            })
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage || `HTTP Error: ${response.status}`);
        }

        closeCreateModal();
        this.reset();

        await loadEnrollments();

        alert("Enrollment created successfully.");

    } catch (error) {
        console.error("Error creating enrollment:", error);
       alert(error.message);
    } finally {
        submitButton.disabled = false;
    }
});

function viewEnrollment(enrollmentId) {
    const enrollment = allEnrollments.find(
        e => Number(e.enrollmentId) === enrollmentId
    );

    if (!enrollment) {
        alert("Enrollment not found.");
        return;
    }

    openDetailsModal(
        enrollment.studentName,
        enrollment.courseName,
        enrollment.courseCode || "N/A",
        enrollment.departmentName || "N/A",
        enrollment.teacherName || "Unassigned",
        enrollment.creditHours ?? "N/A",
        enrollment.semester,
        enrollment.academicYear,
        enrollment.grade || "Pending"
    );
}
function editEnrollment(enrollmentId) {
    const enrollment = allEnrollments.find(
        e => Number(e.enrollmentId) === enrollmentId
    );

    if (!enrollment) {
        alert("Enrollment not found.");
        return;
    }

    document.getElementById("editEnrollmentId").value =
        enrollment.enrollmentId;

    document.getElementById("editSemester").value =
        enrollment.semester;

    document.getElementById("editAcademicYear").value =
        enrollment.academicYear;

    document.getElementById("editGrade").value =
        enrollment.grade || "";

    openEditModal();
}


document.getElementById("editEnrollmentForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const enrollmentId = Number(
        document.getElementById("editEnrollmentId").value
    );

    const semester = Number(
        document.getElementById("editSemester").value
    );

    const academicYear =
        document.getElementById("editAcademicYear").value.trim();

    const grade =
        document.getElementById("editGrade").value.trim();

    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        const response = await apiFetch(
            `${ENROLLMENTS_API_URL}/${enrollmentId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    semester: semester,
                    academicYear: academicYear,
                    grade: grade || null
                })
            }
        );

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(
                errorMessage || `HTTP Error: ${response.status}`
            );
        }

        closeEditModal();
        await loadEnrollments();

        alert("Enrollment updated successfully.");

    } catch (error) {
        console.error("Error updating enrollment:", error);
        alert(`Failed to update enrollment: ${error.message}`);
    } finally {
        submitButton.disabled = false;
    }
});

function deleteEnrollment(enrollmentId) {
    const enrollment = allEnrollments.find(
        e => Number(e.enrollmentId) === enrollmentId
    );

    if (!enrollment) {
        alert("Enrollment not found.");
        return;
    }

    openDeleteModal(
        enrollment.enrollmentId,
        enrollment.studentName,
        enrollment.courseName
    );
}
