
const STUDENTS_API_URL = "https://localhost:7147/api/Students";
const DEPARTMENTS_API_URL = "https://localhost:7147/api/Departments";

const studentsTableBody = document.getElementById("studentsTableBody");
let allStudents = [];

async function loadStudents() {
    try {
        const response = await apiFetch(STUDENTS_API_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

       allStudents = await response.json();
       const students = allStudents; 
     displayStudents(students);
    } catch (error) {
        console.error("Error loading students:", error);

        studentsTableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="py-6 text-center text-rose-500">
                    Failed to load students.
                    Check the Console.
                </td>
            </tr>
        `;
    }
}


async function loadDepartments() {
    const departmentSelects = [
        document.getElementById("addDepartmentId"),
        document.getElementById("editDepartmentId")
    ];

    try {
        const response = await apiFetch(DEPARTMENTS_API_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const departments = await response.json();

        departmentSelects.forEach(select => {
            if (!select) return;

            select.innerHTML = `
                <option value="" selected disabled>
                    Select Department
                </option>
            `;

            departments.forEach(department => {
                select.innerHTML += `
                    <option value="${department.departmentId}">
                        ${escapeHtml(department.departmentName)}
                    </option>
                `;
            });
        });

    } catch (error) {
        console.error("Error loading departments:", error);

        departmentSelects.forEach(select => {
            if (select) {
                select.innerHTML = `
                    <option value="" selected disabled>
                        Failed to load departments
                    </option>
                `;
            }
        });
    }
}

function displayStudents(students) {

        if (students.length === 0) {
            studentsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="py-6 text-center">
                        No students found.
                    </td>
                </tr>
            `;
            return;
        }

        studentsTableBody.innerHTML = students.map(student => {
            const fullName =
                `${student.firstName} ${student.lastName}`;

            const level = Number(student.level);

            const statusClass = student.isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";

            const statusText = student.isActive
                ? "Active"
                : "Inactive";

            return `
                <tr>
                    <td class="py-3.5 font-mono text-xs text-slate-500 dark:text-zinc-400">
                        ${escapeHtml(student.studentCode)}
                    </td>

                    <td class="py-3.5 font-medium text-slate-900 dark:text-white">
                        ${escapeHtml(fullName)}
                    </td>

                    <td class="py-3.5 text-slate-500 dark:text-zinc-400">
                        ${escapeHtml(student.email)}
                    </td>

                    <td class="py-3.5 text-slate-500 dark:text-zinc-400">
                        ${escapeHtml(student.departmentName)}
                    </td>

                    <td class="py-3.5 text-slate-500 dark:text-zinc-400">
                        Level ${level}
                    </td>

                    <td class="py-3.5">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass}">
                            ${statusText}
                        </span>
                    </td>

                    <td class="py-3.5 text-right space-x-2">
                        <button
                            onclick="viewStudent(${student.studentId})"
                            class="text-xs px-2.5 py-1 rounded-lg border">
                            View
                        </button>

                        
                         <button
                           onclick="editStudent(${student.studentId})"
                          class="text-xs px-2.5 py-1 rounded-lg border">
                              Edit
                        </button>

                        <button
                           onclick="deleteStudent(${student.studentId})"
                            class="text-xs px-2.5 py-1 rounded-lg border text-rose-500 hover:bg-rose-500/10">
                               Delete
                             </button>
                    </td>
                </tr>
            `;
        }).join("");
}
const searchFilter = document.getElementById("searchFilter");
const searchInput = document.getElementById("searchFilterInput");
const searchStudentsBtn = document.getElementById("searchStudentsBtn");

function searchStudents()
 {
    const filter = searchFilter.value;
    const searchText = searchInput.value.trim().toLowerCase();

    const filteredStudents = allStudents.filter(student => {
        let value = "";

        switch (filter) {
            case "name":
                value = `${student.firstName ?? ""} ${student.lastName ?? ""}`;
                break;

            case "studentCode":
                value = student.studentCode ?? "";
                break;

            case "email":
                value = student.email ?? "";
                break;

            case "department":
                value = student.departmentName ?? "";
                break;
        }

        return value.toLowerCase().includes(searchText);
    });

    displayStudents(filteredStudents);
}

searchStudentsBtn.addEventListener("click", searchStudents);

searchInput.addEventListener("input", searchStudents);

searchFilter.addEventListener("change", searchStudents);

searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchStudents();
    }
});

searchStudentsBtn.addEventListener("click", searchStudents);

searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchStudents();
    }
});
async function viewStudent(studentId) {
    try {
        const response = await apiFetch(
            `${STUDENTS_API_URL}/${studentId}`
        );

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const student = await response.json();

        document.getElementById("viewStudentCode").textContent =
            student.studentCode ?? "—";

        document.getElementById("viewStudentName").textContent =
            `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() || "—";

        document.getElementById("viewStudentNationalID").textContent =
            student.nationalID ?? "—";

        document.getElementById("viewStudentEmail").textContent =
            student.email ?? "—";

        document.getElementById("viewStudentPhone").textContent =
            student.phone ?? "—";

       const genderValue = Number(student.gender);

document.getElementById("viewStudentGender").textContent =
    genderValue === 0 ? "Male" :
    genderValue === 1 ? "Female" : "—";

        document.getElementById("viewStudentDepartment").textContent =
            student.departmentName ?? "—";

        document.getElementById("viewStudentLevel").textContent =
            `Level ${student.level ?? "—"}`;

        document.getElementById("viewStudentEnrollmentDate").textContent =
            student.enrollmentDate
                ? student.enrollmentDate.split("T")[0]
                : "—";

        document.getElementById("viewStudentAddress").textContent =
            student.address ?? "—";

        document.getElementById("viewStudentStatus").textContent =
            student.isActive ? "Active" : "Inactive";

        openViewModal();

    } catch (error) {
        console.error("Error loading student details:", error);
        alert("Failed to load student details.");
    }
}

async function editStudent(studentId) {
    window.currentEditingStudentId = studentId;
    try {
        const response = await apiFetch(
            `${STUDENTS_API_URL}/${studentId}`
        );

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const student = await response.json();

        document.getElementById("editFirstName").value =
            student.firstName ?? "";

        document.getElementById("editLastName").value =
            student.lastName ?? "";

        document.getElementById("editNationalID").value =
            student.nationalID ?? "";

        document.getElementById("editEmail").value =
            student.email ?? "";

        document.getElementById("editPhone").value =
            student.phone ?? "";

        document.getElementById("editDateOfBirth").value =
            student.dateOfBirth
                ? student.dateOfBirth.split("T")[0]
                : "";

        const genderValue = Number(student.gender);

        document.getElementById("editGender").value =
            genderValue === 0 ? "Male" :
            genderValue === 1 ? "Female" : "";

        document.getElementById("editDepartmentId").value =
            student.departmentID ?? "";

        document.getElementById("editLevel").value =
            student.level ?? "";

        document.getElementById("editAddress").value =
            student.address ?? "";

        openEditModal();

    } catch (error) {
        console.error("Error loading student for edit:", error);
        alert("Failed to load student information.");
    }
}


document.getElementById("editStudentForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const studentId = window.currentEditingStudentId;

    if (!studentId) {
        alert("Student ID is missing.");
        return;
    }

    const studentData = {
        firstName: document.getElementById("editFirstName").value.trim(),
        lastName: document.getElementById("editLastName").value.trim(),
        nationalID: document.getElementById("editNationalID").value.trim(),
        email: document.getElementById("editEmail").value.trim(),
        phone: document.getElementById("editPhone").value.trim(),
        dateOfBirth: document.getElementById("editDateOfBirth").value,
        gender: document.getElementById("editGender").value === "Male" ? 0 : 1,
        departmentId: Number(document.getElementById("editDepartmentId").value),
        level: Number(document.getElementById("editLevel").value),
        address: document.getElementById("editAddress").value.trim()
    };

    const button = this.querySelector('button[type="submit"]');
    button.disabled = true;

    try {
        const response = await apiFetch(`${STUDENTS_API_URL}/${studentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(errorDetails || `HTTP Error: ${response.status}`);
        }

        closeEditModal();
        await loadStudents();

        alert("Student updated successfully.");

    } catch (error) {
        console.error("Error updating student:", error);
        alert("Failed to update student. Check the Console.");
    } finally {
        button.disabled = false;
    }
});



let selectedStudentId = null;

function deleteStudent(studentId) {
    selectedStudentId = studentId;

    const studentRow = [...studentsTableBody.querySelectorAll("tr")]
        .find(row =>
            row.querySelector("button[onclick^='deleteStudent']")?.getAttribute("onclick")
                === `deleteStudent(${studentId})`
        );

    const studentName = studentRow?.querySelectorAll("td")[1]?.textContent.trim();

    document.getElementById("deleteStudentName").textContent =
        studentName || "this student";

    openDeleteModal();
}

document.getElementById("confirmDeleteBtn").addEventListener("click", async function () {
    if (selectedStudentId === null) {
        return;
    }

    const button = this;
    button.disabled = true;

    try {
        const response = await apiFetch(
            `${STUDENTS_API_URL}/${selectedStudentId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        closeDeleteModal();
        selectedStudentId = null;

        await loadStudents();

        alert("Student deleted successfully.");

    } catch (error) {
        console.error("Error deleting student:", error);
        alert("Failed to delete student. Check the Console.");
    } finally {
        button.disabled = false;
    }
});


function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

loadStudents();
loadDepartments();


document.getElementById("addStudentForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const form = this;
    const button = form.querySelector('button[type="submit"]');

    if (button.disabled) return;

    const studentData = {
        firstName: document.getElementById("addFirstName").value.trim(),
        lastName: document.getElementById("addLastName").value.trim(),
        nationalID: document.getElementById("addNationalID").value.trim(),
        phone: document.getElementById("addPhone").value.trim(),
        address: document.getElementById("addAddress").value.trim(),
        dateOfBirth: document.getElementById("addDateOfBirth").value,
        gender: Number(document.getElementById("addGender").value),
        departmentId: Number(document.getElementById("addDepartmentId").value),
        level: Number(document.getElementById("addLevel").value),
        email: document.getElementById("addEmail").value.trim(),
        password: document.getElementById("addPassword").value
    };

    button.disabled = true;

    try {
        const response = await apiFetch(STUDENTS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(errorDetails || `HTTP Error: ${response.status}`);
        }

        alert("Student created successfully.");

    } catch (error) {
        console.error("Error creating student:", error);
        alert("Failed to create student. Check the Console.");
    } finally {
        button.disabled = false;
    }
});
