
const DEPARTMENTS_API_URL = "https://localhost:7147/api/Departments";

const departmentsTableBody = document.getElementById("departmentsTableBody");

let allDepartments = [];

// Load all departments
async function loadDepartments() {
    try {
        departmentsTableBody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-4">Loading departments...</td>
            </tr>
        `;

        const response = await apiFetch(DEPARTMENTS_API_URL);

        if (!response.ok) {
            throw new Error("Failed to load departments.");
        }

        allDepartments = await response.json();

        renderDepartments(allDepartments);
    } catch (error) {
        console.error("Error loading departments:", error);

        departmentsTableBody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-4 text-red-500">
                    Failed to load departments.
                </td>
            </tr>
        `;
    }
}

// Display departments in the table

function renderDepartments(departments) {
    if (!departments || departments.length === 0) {
        departmentsTableBody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-4">
                    No departments found.
                </td>
            </tr>
        `;
        return;
    }

    departmentsTableBody.innerHTML = departments.map(department => `
        <tr>
            <td class="px-6 py-4">
                ${escapeHtml(department.departmentName ?? "")}
            </td>

            <td class="py-3.5 text-right space-x-2">
                <button
                    onclick="editDepartment(${department.departmentId})"
                    class="text-xs px-2.5 py-1 rounded-lg border">
                    Edit
                </button>

                <button
                    onclick="deleteDepartment(${department.departmentId})"
                    class="text-xs px-2.5 py-1 rounded-lg border text-rose-500 hover:bg-rose-500/10">
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
}


// Prevent HTML injection when displaying department names
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Open Edit Modal
function editDepartment(id) {
    const department = allDepartments.find(
        item => item.departmentId === id
    );

    if (!department) {
        alert("Department not found.");
        return;
    }

    openEditModal(
        department.departmentId,
        department.departmentName
    );
}

// Open Delete Modal
function deleteDepartment(id) {
    const department = allDepartments.find(
        item => item.departmentId === id
    );

    if (!department) {
        alert("Department not found.");
        return;
    }

    openDeleteModal(
        department.departmentId,
        department.departmentName
    );
}

// Create department
document.getElementById("createDepartmentForm")
    .addEventListener("submit", async function (event) {
        event.preventDefault();

        const departmentName = document
            .getElementById("createDeptName")
            .value.trim();

        if (!departmentName) {
            alert("Please enter the department name.");
            return;
        }

        try {
            const response = await apiFetch(DEPARTMENTS_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    departmentName: departmentName
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                throw new Error(
                    error?.message || "Failed to create department."
                );
            }

            closeCreateModal();
            this.reset();

            await loadDepartments();

            alert("Department created successfully.");
        } catch (error) {
            console.error("Error creating department:", error);
            alert(error.message || "Failed to create department.");
        }
    });

// Update department
document.getElementById("editDepartmentForm")
    .addEventListener("submit", async function (event) {
        event.preventDefault();

        const id = document.getElementById("editDeptId").value;
        const departmentName = document
            .getElementById("editDeptName")
            .value.trim();

        if (!departmentName) {
            alert("Please enter the department name.");
            return;
        }

        try {
            const response = await apiFetch(
                `${DEPARTMENTS_API_URL}/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        departmentName: departmentName
                    })
                }
            );

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                throw new Error(
                    error?.message || "Failed to update department."
                );
            }

            closeEditModal();

            await loadDepartments();

            alert("Department updated successfully.");
        } catch (error) {
            console.error("Error updating department:", error);
            alert(error.message || "Failed to update department.");
        }
    });

// Delete department
async function confirmDelete() {
    const id = document.getElementById("deleteDeptId").value;

    if (!id) {
        alert("Invalid department ID.");
        return;
    }

    try {
        const response = await apiFetch(
            `${DEPARTMENTS_API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(
                error?.message || "Failed to delete department."
            );
        }

        closeDeleteModal();

        await loadDepartments();

        alert("Department deleted successfully.");
    } catch (error) {
        console.error("Error deleting department:", error);
        alert(error.message || "Failed to delete department.");
    }
}

// Load departments when the page opens
document.addEventListener("DOMContentLoaded", loadDepartments);
