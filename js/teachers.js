
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("teacherModal");
    const form = document.getElementById("teacherForm");
    const tableBody = document.getElementById("teachersTableBody");
    const searchInput = document.getElementById("teacherSearch");

    const openBtn = document.getElementById("openTeacherModal");
    const closeBtn = document.getElementById("closeTeacherModal");
    const cancelBtn = document.getElementById("cancelTeacherModal");
    const modalTitle = document.getElementById("teacherModalTitle");
    const saveBtn = document.getElementById("saveTeacherBtn");

    const STORAGE_KEY = "gradepro_demo_teachers_v1";

    let teachers = [];
    let editingTeacherId = null;

    function loadTeachers() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const parsed = saved ? JSON.parse(saved) : [];

            teachers = Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Could not load teacher records:", error);
            teachers = [];
            alert("Teacher records could not be loaded from this browser.");
        }
    }

    function saveTeachers() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
            return true;
        } catch (error) {
            console.error("Could not save teacher records:", error);
            alert("Could not save records. Check your browser storage.");
            return false;
        }
    }

    function openModal() {
        form.reset();
        editingTeacherId = null;
        modalTitle.textContent = "Register New Teacher";
        saveBtn.textContent = "Save Teacher";
        modal.classList.add("show");
        document.getElementById("teacherId").focus();
    }

    function closeModal() {
        modal.classList.remove("show");
        form.reset();
        editingTeacherId = null;
    }

    function updateStatistics() {
        document.getElementById("teacherCount").textContent = teachers.length;

        const active = teachers.filter(
            teacher => teacher.status === "Active"
        ).length;

        document.getElementById("activeTeacherCount").textContent = active;

        const subjects = new Set(
            teachers
                .map(teacher => teacher.subject.trim().toLowerCase())
                .filter(Boolean)
        );

        document.getElementById("teacherSubjectCount").textContent =
            subjects.size;
    }

    function addCell(row, value) {
        const cell = document.createElement("td");
        cell.textContent = value || "—";
        row.appendChild(cell);
        return cell;
    }

    function renderTeachers(filter = "") {
        tableBody.innerHTML = "";

        const term = filter.trim().toLowerCase();

        const filtered = teachers.filter(teacher => {
            const searchable = [
                teacher.teacherId,
                teacher.staffNumber,
                teacher.firstName,
                teacher.lastName,
                teacher.gender,
                teacher.subject,
                teacher.phone,
                teacher.email,
                teacher.status
            ].join(" ").toLowerCase();

            return searchable.includes(term);
        });

        if (filtered.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 7;
            cell.className = "empty-state";
            cell.textContent = term
                ? "No matching teachers found."
                : "No teachers registered yet.";

            row.appendChild(cell);
            tableBody.appendChild(row);
            updateStatistics();
            return;
        }

        filtered.forEach(teacher => {
            const row = document.createElement("tr");

            addCell(row, teacher.teacherId);
            addCell(row, teacher.firstName + " " + teacher.lastName);
            addCell(row, teacher.gender);
            addCell(row, teacher.subject);
            addCell(row, teacher.phone);

            const statusCell = document.createElement("td");
            const status = document.createElement("span");

            status.textContent = teacher.status;
            status.className = teacher.status === "Active"
                ? "status-active"
                : "status-inactive";

            statusCell.appendChild(status);
            row.appendChild(statusCell);

            const actionsCell = document.createElement("td");

            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.className = "action-btn";
            editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
            editBtn.setAttribute("aria-label", "Edit teacher");
            editBtn.addEventListener("click", () => editTeacher(teacher.teacherId));

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.className = "action-btn";
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            deleteBtn.setAttribute("aria-label", "Delete teacher");
            deleteBtn.addEventListener("click", () => deleteTeacher(teacher.teacherId));

            actionsCell.append(editBtn, deleteBtn);
            row.appendChild(actionsCell);

            tableBody.appendChild(row);
        });

        updateStatistics();
    }

    function editTeacher(id) {
        const teacher = teachers.find(item => item.teacherId === id);
        if (!teacher) return;

        editingTeacherId = id;

        document.getElementById("teacherId").value = teacher.teacherId;
        document.getElementById("staffNumber").value = teacher.staffNumber;
        document.getElementById("teacherFirstName").value = teacher.firstName;
        document.getElementById("teacherLastName").value = teacher.lastName;
        document.getElementById("teacherGender").value = teacher.gender;
        document.getElementById("teacherPhone").value = teacher.phone;
        document.getElementById("teacherEmail").value = teacher.email;
        document.getElementById("teacherSubject").value = teacher.subject;
        document.getElementById("teacherStatus").value = teacher.status;

        modalTitle.textContent = "Edit Teacher";
        saveBtn.textContent = "Update Teacher";
        modal.classList.add("show");
    }

    function deleteTeacher(id) {
        const teacher = teachers.find(item => item.teacherId === id);
        if (!teacher) return;

        const confirmed = confirm(
            "Are you sure you want to delete " +
            teacher.firstName + " " + teacher.lastName + "?"
        );

        if (!confirmed) return;

        const previous = teachers;
        teachers = teachers.filter(item => item.teacherId !== id);

        if (!saveTeachers()) {
            teachers = previous;
            return;
        }

        renderTeachers(searchInput.value);
        alert("Teacher deleted successfully.");
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const teacher = {
            teacherId: document.getElementById("teacherId").value.trim(),
            staffNumber: document.getElementById("staffNumber").value.trim(),
            firstName: document.getElementById("teacherFirstName").value.trim(),
            lastName: document.getElementById("teacherLastName").value.trim(),
            gender: document.getElementById("teacherGender").value,
            phone: document.getElementById("teacherPhone").value.trim(),
            email: document.getElementById("teacherEmail").value.trim(),
            subject: document.getElementById("teacherSubject").value.trim(),
            status: document.getElementById("teacherStatus").value
        };

        const duplicateId = teachers.some(item =>
            item.teacherId.toLowerCase() === teacher.teacherId.toLowerCase() &&
            item.teacherId !== editingTeacherId
        );

        const duplicateStaffNumber = teachers.some(item =>
            item.staffNumber.toLowerCase() === teacher.staffNumber.toLowerCase() &&
            item.teacherId !== editingTeacherId
        );

        if (duplicateId) {
            alert("This Teacher ID is already registered.");
            return;
        }

        if (duplicateStaffNumber) {
            alert("This Staff Number is already registered.");
            return;
        }

        const wasEditing = editingTeacherId !== null;
        const previous = teachers;

        if (wasEditing) {
            teachers = teachers.map(item =>
                item.teacherId === editingTeacherId ? teacher : item
            );
        } else {
            teachers.push(teacher);
        }

        if (!saveTeachers()) {
            teachers = previous;
            return;
        }

        closeModal();
        renderTeachers(searchInput.value);

        alert(wasEditing
            ? "Teacher updated successfully."
            : "Teacher registered successfully."
        );
    });

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", function (event) {
        if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.classList.contains("show")) {
            closeModal();
        }
    });

    searchInput.addEventListener("input", function () {
        renderTeachers(searchInput.value);
    });

    loadTeachers();
    renderTeachers();
});

