
const TEACHERS_API_URL = "https://localhost:7147/api/Teachers";
const DEPARTMENTS_API_URL = "https://localhost:7147/api/Departments";

const teachersTableBody = document.getElementById("teachersTableBody");

const addTeacherForm = document.getElementById("addTeacherForm");
const editTeacherForm = document.getElementById("editTeacherForm");

const addTeacherModal = document.getElementById("addTeacherModal");
const viewTeacherModal = document.getElementById("viewTeacherModal");
const editTeacherModal = document.getElementById("editTeacherModal");
const deleteTeacherModal = document.getElementById("deleteTeacherModal");

let allTeachers = [];
let selectedTeacherId = null;
let selectedTeacherForEdit = null;


// ==================== API Helpers ====================

async function readApiResponse(response) {
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function getApiErrorMessage(result, status) {
    if (typeof result === "string" && result.trim()) {
        return result;
    }

    if (result?.message) {
        return result.message;
    }

    if (result?.detail) {
        return result.detail;
    }

    if (result?.title) {
        return result.title;
    }

    if (result?.errors) {
        return Object.values(result.errors)
            .flat()
            .join("\n");
    }

    return `Request failed. HTTP Status: ${status}`;
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "";
    }

    return String(dateValue).split("T")[0];
}

function showModal(modal) {
    modal?.classList.remove("hidden");
}

function hideModal(modal) {
    modal?.classList.add("hidden");
}


// ==================== Departments ====================

async function loadDepartments() {
    const departmentSelects = [
        document.getElementById("teacherDepartmentSelect"),
        document.getElementById("editTeacherDepartment")
    ].filter(Boolean);

    try {
        const response = await apiFetch(DEPARTMENTS_API_URL);
        const result = await readApiResponse(response);

        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(result, response.status)
            );
        }

        const departments = Array.isArray(result)
            ? result
            : [];

        departmentSelects.forEach(select => {
            const previousValue = select.value;

            select.innerHTML =
                '<option value="">Select Department</option>';

            departments.forEach(department => {
                const option = document.createElement("option");

                option.value = department.departmentId;
                option.textContent = department.departmentName;

                select.appendChild(option);
            });

            select.value = previousValue;
        });

    } catch (error) {
        console.error("Error loading departments:", error);

        departmentSelects.forEach(select => {
            select.innerHTML =
                '<option value="">Failed to load departments</option>';
        });
    }
}


// ==================== Load Teachers ====================

async function loadTeachers() {
    teachersTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="py-6 text-center text-slate-500">
                Loading teachers...
            </td>
        </tr>
    `;

    try {
        const response = await apiFetch(TEACHERS_API_URL);
        const result = await readApiResponse(response);

        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(result, response.status)
            );
        }

        allTeachers = Array.isArray(result) ? result : [];

        displayTeachers(allTeachers);

    } catch (error) {
        console.error("Error loading teachers:", error);

        teachersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="py-6 text-center text-rose-500">
                    Failed to load teachers. Check the Console.
                </td>
            </tr>
        `;
    }
}


// ==================== Display Teachers ====================

function displayTeachers(teachers) {
    if (!teachers || teachers.length === 0) {
        teachersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="py-6 text-center text-slate-500">
                    No teachers found.
                </td>
            </tr>
        `;
        return;
    }

    teachersTableBody.innerHTML = teachers.map(teacher => `
        <tr>
            <td class="py-3.5 font-medium text-slate-900 dark:text-white">
                ${escapeHtml(teacher.firstName)} ${escapeHtml(teacher.lastName)}
            </td>

            <td class="py-3.5 text-slate-500 dark:text-zinc-400">
                ${escapeHtml(teacher.email)}
            </td>

            <td class="py-3.5 text-slate-500 dark:text-zinc-400">
                ${escapeHtml(teacher.departmentName ?? "—")}
            </td>

            <td class="py-3.5 text-slate-500 dark:text-zinc-400">
                ${escapeHtml(teacher.academicDegree ?? "—")}
            </td>

            <td class="py-3.5 text-slate-500 dark:text-zinc-400">
                ${escapeHtml(teacher.courseName ?? "—")}
            </td>

           <td class="py-3.5 pr-12">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${teacher.isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"}">
                    ${teacher.isActive ? "Active" : "Inactive"}
                </span>
            </td>
<td class="py-3.5 text-right">
    <div class="flex items-center justify-end gap-2 whitespace-nowrap">
        <button
            onclick="viewTeacher(${Number(teacher.teacherId)})"
            class="text-xs px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
            View
        </button>

        <button
            onclick="editTeacher(${Number(teacher.teacherId)})"
            class="text-xs px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
            Edit
        </button>

        <button
            onclick="deleteTeacher(${Number(teacher.teacherId)})"
            class="text-xs px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-rose-500 hover:bg-rose-500/10">
            Delete
        </button>
    </div>
</td>

        </tr>
    `).join("");
}


// ==================== Escape HTML ====================

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}


// ==================== View Teacher ====================

async function viewTeacher(teacherId) {
    try {
        const response = await apiFetch(
            `${TEACHERS_API_URL}/${teacherId}`
        );

        const result = await readApiResponse(response);

        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(result, response.status)
            );
        }

        const teacher = result;
console.log("Teacher course:", teacher.courseName);
console.log("Full teacher details:", teacher);
        document.getElementById("viewTeacherName").textContent =
            `${teacher.firstName ?? ""} ${teacher.lastName ?? ""}`.trim();

        document.getElementById("viewTeacherEmail").textContent =
            teacher.email ?? "—";

        document.getElementById("viewTeacherStatus").textContent =
            teacher.isActive ? "Active" : "Inactive";

        document.getElementById("viewTeacherNationalID").textContent =
            teacher.nationalID ?? teacher.nationalId ?? "—";

        document.getElementById("viewTeacherPhone").textContent =
            teacher.phone ?? "—";

        document.getElementById("viewTeacherDepartment").textContent =
            teacher.departmentName ?? "—";

        document.getElementById("viewTeacherAcademicDegree").textContent =
            teacher.academicDegree ?? "—";

       document.getElementById("viewTeacherCourse").textContent =
    teacher.courseName || "No course assigned";

        document.getElementById("viewTeacherDateOfBirth").textContent =
            formatDate(teacher.dateOfBirth) || "—";

        document.getElementById("viewTeacherHireDate").textContent =
            formatDate(teacher.hireDate) || "—";

        document.getElementById("viewTeacherAddress").textContent =
            teacher.address ?? "—";

        showModal(viewTeacherModal);

    } catch (error) {
        console.error("Error loading teacher details:", error);
        alert(error.message || "Failed to load teacher details.");
    }
}


// ==================== Edit Teacher ====================

async function editTeacher(teacherId) {
    try {
        const response = await apiFetch(
            `${TEACHERS_API_URL}/${teacherId}`
        );

        const result = await readApiResponse(response);

        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(result, response.status)
            );
        }

        selectedTeacherForEdit = result;
console.log("Teacher details:", result);
console.log("Department ID:", result.departmentId);
        document.getElementById("editTeacherFirstName").value =
            result.firstName ?? "";

        document.getElementById("editTeacherLastName").value =
            result.lastName ?? "";

        document.getElementById("editTeacherNationalID").value =
            result.nationalID ?? result.nationalId ?? "";

        document.getElementById("editTeacherEmail").value =
            result.email ?? "";

        document.getElementById("editTeacherPhone").value =
            result.phone ?? "";

        document.getElementById("editTeacherAddress").value =
            result.address ?? "";

       document.getElementById("editTeacherDepartment").value =
    result.departmentID ?? "";

        document.getElementById("editTeacherDegree").value =
            result.academicDegree ?? "";

        document.getElementById("editTeacherHireDate").value =
            formatDate(result.hireDate);

        showModal(editTeacherModal);

    } catch (error) {
        console.error("Error loading teacher for editing:", error);
        alert(error.message || "Failed to load teacher.");
    }
}


editTeacherForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!selectedTeacherForEdit) {
        alert("Please select a teacher first.");
        return;
    }

    const formData = new FormData(editTeacherForm);
    const originalTeacher = selectedTeacherForEdit;

    const teacherData = {
        firstName: String(formData.get("firstName") ?? "").trim(),
        lastName: String(formData.get("lastName") ?? "").trim(),
        nationalID: String(formData.get("nationalId") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        address: String(formData.get("address") ?? "").trim(),
        departmentId: Number(formData.get("departmentId")),
        academicDegree: String(
            formData.get("academicDegree") ?? ""
        ).trim(),
        hireDate: formData.get("hireDate"),

        // Preserve fields not editable in this form.
        dateOfBirth: originalTeacher.dateOfBirth,
        gender: originalTeacher.gender
    };

    try {
        const response = await apiFetch(
            `${TEACHERS_API_URL}/${originalTeacher.teacherId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(teacherData)
            }
        );

        const result = await readApiResponse(response);

        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(result, response.status)
            );
        }

        alert("Teacher updated successfully.");

        hideModal(editTeacherModal);
        selectedTeacherForEdit = null;

        await loadTeachers();

    } catch (error) {
        console.error("Error updating teacher:", error);
        alert(error.message || "Failed to update teacher.");
    }
});


// ==================== Delete Teacher ====================

function deleteTeacher(teacherId) {
    const teacher = allTeachers.find(
        t => Number(t.teacherId) === Number(teacherId)
    );

    if (!teacher) {
        alert("Teacher not found.");
        return;
    }

    selectedTeacherId = teacherId;

    document.getElementById("deleteTeacherName").textContent =
        `${teacher.firstName ?? ""} ${teacher.lastName ?? ""}`.trim();

    showModal(deleteTeacherModal);
}


document.getElementById("confirmDeleteTeacherBtn")
    .addEventListener("click", async function () {
        if (selectedTeacherId === null) {
            return;
        }

        const teacherId = selectedTeacherId;

        try {
            const response = await apiFetch(
                `${TEACHERS_API_URL}/${teacherId}`,
                {
                    method: "DELETE"
                }
            );

            const result = await readApiResponse(response);

            if (!response.ok) {
                throw new Error(
                    getApiErrorMessage(result, response.status)
                );
            }

            alert("Teacher deleted successfully.");

            hideModal(deleteTeacherModal);
            selectedTeacherId = null;

            await loadTeachers();

        } catch (error) {
            console.error("Error deleting teacher:", error);
            alert(error.message || "Failed to delete teacher.");
        }
    });


// ==================== Add Teacher ====================

addTeacherForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(addTeacherForm);

    const teacherData = {
        firstName: String(formData.get("firstName") ?? "").trim(),
        lastName: String(formData.get("lastName") ?? "").trim(),
        nationalID: String(formData.get("nationalId") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        address: String(formData.get("address") ?? "").trim(),
        dateOfBirth: formData.get("dateOfBirth"),
        gender: Number(formData.get("gender")),
        departmentId: Number(formData.get("departmentId")),
        academicDegree: String(
            formData.get("academicDegree") ?? ""
        ).trim(),
        hireDate: formData.get("hireDate"),
        password: formData.get("password")
    };

    try {
        const response = await apiFetch(TEACHERS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(teacherData)
        });

        const result = await readApiResponse(response);

        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(result, response.status)
            );
        }

        alert("Teacher added successfully.");

        addTeacherForm.reset();
        hideModal(addTeacherModal);

        await loadTeachers();

    } catch (error) {
        console.error("Error adding teacher:", error);
        alert(error.message || "Failed to add teacher.");
    }
});


// ==================== Initialize Page ====================

loadTeachers();
loadDepartments();
setTimeout(() => {
    console.table(allTeachers);
}, 2000);