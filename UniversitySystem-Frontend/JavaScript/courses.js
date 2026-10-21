let allCourses = [];

const COURSES_API = "https://localhost:7147/api/Courses";
const DEPARTMENTS_API = "https://localhost:7147/api/Departments";
const TEACHERS_API = "https://localhost:7147/api/Teachers/dropdown";

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("createCourseForm")
        .addEventListener("submit", createCourse);

    document.getElementById("editCourseForm")
        .addEventListener("submit", updateCourse);

    document.getElementById("searchCoursesBtn")
        .addEventListener("click", searchCourses);

    document.getElementById("courseSearchInput")
        .addEventListener("input", searchCourses);

    document.getElementById("courseSearchFilter")
        .addEventListener("change", searchCourses);

    await Promise.all([
        loadCourses(),
        loadCourseFormOptions()
    ]);
});

async function loadCourses() {
    const tableBody = document.getElementById("coursesTableBody");

    try {
        const response = await apiFetch(COURSES_API);

        if (!response.ok) {
            throw new Error(await response.text());
        }

        allCourses = await response.json();
        searchCourses();
    } catch (error) {
        console.error("Error loading courses:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="py-6 text-center text-red-500">
                    Failed to load courses.
                </td>
            </tr>`;
    }
}

async function loadCourseFormOptions() {
    try {
        const [departmentsResponse, teachersResponse] = await Promise.all([
            apiFetch(DEPARTMENTS_API),
            apiFetch(TEACHERS_API)
        ]);

        if (!departmentsResponse.ok) {
            throw new Error("Failed to load departments.");
        }

        if (!teachersResponse.ok) {
            throw new Error("Failed to load teachers.");
        }

        const departments = await departmentsResponse.json();
        const teachers = await teachersResponse.json();

        const departmentOptions = `
            <option value="">Select Department</option>
            ${departments.map(department => `
                <option value="${department.departmentId}">
                    ${escapeHtml(department.departmentName)}
                </option>
            `).join("")}`;

        const teacherOptions = `
            <option value="">Unassigned</option>
            ${teachers.map(teacher => `
                <option value="${teacher.teacherId}">
                    ${escapeHtml(teacher.teacherName)}
                </option>
            `).join("")}`;

        document.getElementById("createDepartmentId").innerHTML =
            departmentOptions;

        document.getElementById("editDepartmentId").innerHTML =
            departmentOptions;

        document.getElementById("createTeacherId").innerHTML =
            teacherOptions;

        document.getElementById("editTeacherId").innerHTML =
            teacherOptions;
    } catch (error) {
        console.error("Error loading form options:", error);
        alert("Failed to load departments or teachers. Check Console.");
    }
}

function renderCourses(courses) {
    const tableBody = document.getElementById("coursesTableBody");

    if (!courses.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="py-6 text-center text-slate-500">
                    No courses found.
                </td>
            </tr>`;
        return;
    }

    tableBody.innerHTML = courses.map(course => `
        <tr>
            <td class="py-4">${escapeHtml(course.courseCode)}</td>
            <td class="py-4 font-medium">${escapeHtml(course.courseName)}</td>
            <td class="py-4">${escapeHtml(course.departmentName)}</td>
            <td class="py-4">${escapeHtml(course.teacherName || "Unassigned")}</td>
            <td class="py-4">${course.creditHours ?? ""}</td>
            <td class="py-4">${escapeHtml(course.description || "")}</td>
            <td class="py-3.5 text-right space-x-2">
                <button type="button"
                    onclick="viewCourse(${Number(course.courseId)})"
                    class="text-xs px-2.5 py-1 rounded-lg border">
                    View
                </button>

                <button type="button"
                    onclick="editCourse(${Number(course.courseId)})"
                    class="text-xs px-2.5 py-1 rounded-lg border">
                    Edit
                </button>

                <button type="button"
                    onclick="openDeleteModal(${Number(course.courseId)}, '${escapeJs(course.courseName)}')"
                    class="text-xs px-2.5 py-1 rounded-lg border text-rose-500 hover:bg-rose-500/10">
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
}

function searchCourses() {
    const input = document.getElementById("courseSearchInput");
    const filter = document.getElementById("courseSearchFilter");

    const term = input.value.trim().toLowerCase();
    const fieldMap = {
        name: "courseName",
        code: "courseCode",
        department: "departmentName",
        teacher: "teacherName"
    };

    const field = fieldMap[filter.value] || "courseName";

    const filteredCourses = allCourses.filter(course =>
        String(course[field] ?? "").toLowerCase().includes(term)
    );

    renderCourses(filteredCourses);
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function escapeJs(value) {
    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n");
}

async function createCourse(event) {
    event.preventDefault();

    const departmentId = document.getElementById("createDepartmentId").value;
    const creditHours = document.getElementById("createCreditHours").value;

    if (!departmentId || !creditHours) {
        alert("Please select a department and enter credit hours.");
        return;
    }

    const courseData = {
        courseCode: document.getElementById("createCourseCode").value.trim(),
        courseName: document.getElementById("createCourseName").value.trim(),
        creditHours: Number(creditHours),
        departmentId: Number(departmentId),
        teacherId: document.getElementById("createTeacherId").value
            ? Number(document.getElementById("createTeacherId").value)
            : null,
        description: document.getElementById("createDescription").value.trim()
    };

    try {
        const response = await apiFetch(COURSES_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(courseData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Create course error:", response.status, errorText);
            alert(`Failed to create course (${response.status}). Check Console.`);
            return;
        }

        alert("Course created successfully!");
        closeCreateModal();
        document.getElementById("createCourseForm").reset();
        await loadCourses();
    } catch (error) {
        console.error("Error creating course:", error);
        alert("An error occurred while creating the course.");
    }
}

async function editCourse(id) {
    try {
        const response = await apiFetch(`${COURSES_API}/${id}`);

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const course = await response.json();

        document.getElementById("editCourseId").value = course.courseId;
        document.getElementById("editCourseCode").value = course.courseCode ?? "";
        document.getElementById("editCourseName").value = course.courseName ?? "";
        document.getElementById("editCreditHours").value = course.creditHours ?? "";
        document.getElementById("editDescription").value = course.description ?? "";

        document.getElementById("editDepartmentId").value =
            course.departmentId == null ? "" : String(course.departmentId);

        document.getElementById("editTeacherId").value =
            course.teacherId == null ? "" : String(course.teacherId);

        openEditModal(
            course.courseId,
            course.courseCode,
            course.courseName,
            course.creditHours,
            course.departmentId,
            course.teacherId,
            course.description
        );
    } catch (error) {
        console.error("Error loading course details:", error);
        alert("Failed to load course details. Check Console.");
    }
}

async function updateCourse(event) {
    event.preventDefault();

    const id = document.getElementById("editCourseId").value;
    const departmentId = document.getElementById("editDepartmentId").value;
    const creditHours = document.getElementById("editCreditHours").value;

    if (!departmentId || !creditHours) {
        alert("Please select a department and enter credit hours.");
        return;
    }

    const courseData = {
        courseCode: document.getElementById("editCourseCode").value.trim(),
        courseName: document.getElementById("editCourseName").value.trim(),
        creditHours: Number(creditHours),
        departmentId: Number(departmentId),
        teacherId: document.getElementById("editTeacherId").value
            ? Number(document.getElementById("editTeacherId").value)
            : null,
        description: document.getElementById("editDescription").value.trim()
    };

    try {
        const response = await apiFetch(`${COURSES_API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(courseData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Update course error:", response.status, errorText);
            alert(`Failed to update course (${response.status}). Check Console.`);
            return;
        }

        alert("Course updated successfully!");
        closeEditModal();
        await loadCourses();
    } catch (error) {
        console.error("Error updating course:", error);
        alert("An error occurred while updating the course.");
    }
}

async function viewCourse(id) {
    try {
        const response = await apiFetch(`${COURSES_API}/${id}`);

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const course = await response.json();

        openDetailsModal(
            course.courseCode,
            course.courseName,
            course.departmentName,
            course.teacherName,
            course.creditHours,
            course.description
        );
    } catch (error) {
        console.error("Error loading course details:", error);
        alert("Failed to load course details. Check Console.");
    }
}

async function confirmDelete() {
    const id = document.getElementById("deleteCourseId").value;

    if (!id) {
        alert("Course ID is missing.");
        return;
    }

    try {
        const response = await apiFetch(`${COURSES_API}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Delete course error:", response.status, errorText);
            alert(`Failed to delete course (${response.status}). Check Console.`);
            return;
        }

        alert("Course deleted successfully!");
        closeDeleteModal();
        await loadCourses();
    } catch (error) {
        console.error("Error deleting course:", error);
        alert("An error occurred while deleting the course.");
    }
}