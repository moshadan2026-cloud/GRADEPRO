
// ==========================================
// GRADEPRO - STUDENT MANAGEMENT
// Prototype version using browser storage
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("studentModal");
    const openModalBtn = document.getElementById("openStudentModal");
    const closeModalBtn = document.getElementById("closeStudentModal");
    const cancelModalBtn = document.getElementById("cancelStudentModal");

    const form = document.getElementById("studentForm");
    const tableBody = document.getElementById("studentsTableBody");
    const searchInput = document.getElementById("studentSearch");

    const studentCount = document.getElementById("studentCount");
    const activeStudentCount = document.getElementById("activeStudentCount");
    const classCount = document.getElementById("classCount");

    const modalTitle = modal.querySelector(".modal-header h2");
    const submitButton = form.querySelector('button[type="submit"]');

    const STORAGE_KEY = "gradepro_demo_students_v1";

    let students = [];
    let editingStudentId = null;

    // ======================================
    // LOAD DEMO RECORDS
    // ======================================

    function loadStudents() {
        try {
            const savedStudents = localStorage.getItem(STORAGE_KEY);
            students = savedStudents ? JSON.parse(savedStudents) : [];

            if (!Array.isArray(students)) {
                students = [];
            }

        } catch (error) {
            console.error("Could not load student records:", error);
            students = [];
            alert("Student records could not be loaded from this browser.");
        }
    }

    // ======================================
    // SAVE DEMO RECORDS
    // ======================================

    function saveStudents() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(students)
            );
            return true;

        } catch (error) {
            console.error("Could not save student records:", error);
            alert("Unable to save records in this browser.");
            return false;
        }
    }

    // ======================================
    // OPEN REGISTRATION MODAL
    // ======================================

    function openModal() {
        modal.classList.add("active");
    }

    // ======================================
    // CLOSE REGISTRATION MODAL
    // ======================================

    function closeModal() {
        modal.classList.remove("active");
        form.reset();
        editingStudentId = null;

        modalTitle.innerHTML =
            '<i class="fa-solid fa-user-plus"></i> Register Student';

        submitButton.innerHTML =
            '<i class="fa-solid fa-floppy-disk"></i> Register Student';
    }

    openModalBtn.addEventListener("click", function () {
        editingStudentId = null;
        form.reset();

        modalTitle.innerHTML =
            '<i class="fa-solid fa-user-plus"></i> Register Student';

        submitButton.innerHTML =
            '<i class="fa-solid fa-floppy-disk"></i> Register Student';

        openModal();
    });

    closeModalBtn.addEventListener("click", closeModal);
    cancelModalBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.classList.contains("active")) {
            closeModal();
        }
    });

    // ======================================
    // UPDATE STATISTICS
    // ======================================

    function updateStatistics() {

        const activeStudents = students.filter(function (student) {
            return student.status === "Active";
        });

        const classes = new Set(
            students.map(function (student) {
                return student.studentClass;
            })
        );

        studentCount.textContent = students.length;

        activeStudentCount.textContent = activeStudents.length;

        classCount.textContent = classes.size;
    }

    // ======================================
    // CREATE TABLE CELL
    // ======================================

    function createCell(value, className) {

        const cell = document.createElement("td");

        cell.textContent = value;

        if (className) {
            cell.className = className;
        }

        return cell;
    }

    // ======================================
    // RENDER STUDENT RECORDS
    // ======================================

    function renderStudents(searchTerm = "") {

        tableBody.replaceChildren();

        const filteredStudents = students.filter(function (student) {

            const searchableText = [
                student.studentId,
                student.admissionNumber,
                student.firstName,
                student.lastName,
                student.gender,
                student.studentClass,
                student.status
            ].join(" ").toLowerCase();

            return searchableText.includes(
                searchTerm.trim().toLowerCase()
            );
        });

        if (filteredStudents.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;

            const empty = document.createElement("div");
            empty.className = "empty-message";

            const icon = document.createElement("i");
            icon.className = "fa-solid fa-user-graduate";

            const heading = document.createElement("h3");
            heading.textContent = searchTerm
                ? "No matching students found"
                : "No students registered";

            const paragraph = document.createElement("p");
            paragraph.textContent = searchTerm
                ? "Try another search."
                : "Add a student to begin building your records.";

            empty.append(icon, heading, paragraph);
            cell.appendChild(empty);
            row.appendChild(cell);
            tableBody.appendChild(row);

            return;
        }

        filteredStudents.forEach(function (student) {

            const row = document.createElement("tr");

            row.appendChild(createCell(student.studentId));

            const nameCell = createCell(
                student.firstName + " " + student.lastName,
                "student-name"
            );

            row.appendChild(nameCell);
            row.appendChild(createCell(student.gender));
            row.appendChild(createCell(student.studentClass));

            const statusCell = document.createElement("td");
            const badge = document.createElement("span");

            badge.className = "student-badge";
            badge.textContent = student.status;

            statusCell.appendChild(badge);
            row.appendChild(statusCell);

            const actionsCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.setAttribute("aria-label", "Edit student");
            editButton.style.cssText =
                "border:0;background:#EAF1FB;color:#123B73;padding:7px 10px;border-radius:6px;cursor:pointer;margin-right:6px;";

            editButton.addEventListener("click", function () {
                editStudent(student.studentId);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.setAttribute("aria-label", "Delete student");
            deleteButton.style.cssText =
                "border:0;background:#FEECEC;color:#B42318;padding:7px 10px;border-radius:6px;cursor:pointer;";

            deleteButton.addEventListener("click", function () {
                deleteStudent(student.studentId);
            });

            actionsCell.append(editButton, deleteButton);
            row.appendChild(actionsCell);

            tableBody.appendChild(row);
        });
    }

    // ======================================
    // REGISTER OR UPDATE STUDENT
    // ======================================

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const student = {

            studentId: document.getElementById("studentId").value.trim(),

            admissionNumber: document.getElementById("admissionNumber").value.trim(),

            firstName: document.getElementById("firstName").value.trim(),

            lastName: document.getElementById("lastName").value.trim(),

            gender: document.getElementById("gender").value,

            studentClass: document.getElementById("studentClass").value,

            status: document.getElementById("studentStatus").value

        };

        // Check for duplicate student ID or admission number.

        const duplicate = students.find(function (existing) {

            if (existing.studentId === editingStudentId) {
                return false;
            }

            return (
                existing.studentId.toLowerCase() === student.studentId.toLowerCase() ||
                existing.admissionNumber.toLowerCase() === student.admissionNumber.toLowerCase()
            );
        });

        if (duplicate) {
            alert("A student with this Student ID or Admission Number already exists.");
            return;
        }

        if (editingStudentId !== null) {

            const index = students.findIndex(function (item) {
                return item.studentId === editingStudentId;
            });

            if (index === -1) {
                alert("Student record could not be found.");
                return;
            }

            students[index] = student;

        } else {

            students.push(student);
        }

        if (!saveStudents()) {
            loadStudents();
            return;
        }

        closeModal();
        refreshDashboard();

        alert(
            editingStudentId === null
                ? "Student registered successfully!"
                : "Student updated successfully!"
        );
    });

    // ======================================
    // EDIT STUDENT
    // ======================================

    function editStudent(id) {

        const student = students.find(function (item) {
            return item.studentId === id;
        });

        if (!student) {
            alert("Student not found.");
            return;
        }

        editingStudentId = id;

        document.getElementById("studentId").value = student.studentId;
        document.getElementById("admissionNumber").value = student.admissionNumber;
        document.getElementById("firstName").value = student.firstName;
        document.getElementById("lastName").value = student.lastName;
        document.getElementById("gender").value = student.gender;
        document.getElementById("studentClass").value = student.studentClass;
        document.getElementById("studentStatus").value = student.status;

        modalTitle.innerHTML =
            '<i class="fa-solid fa-user-pen"></i> Edit Student';

        submitButton.innerHTML =
            '<i class="fa-solid fa-floppy-disk"></i> Save Changes';

        openModal();
    }

    // ======================================
    // DELETE STUDENT
    // ======================================

    function deleteStudent(id) {

        const student = students.find(function (item) {
            return item.studentId === id;
        });

        if (!student) {
            alert("Student not found.");
            return;
        }

        const confirmed = confirm(
            "Are you sure you want to delete " +
            student.firstName + " " + student.lastName + "?"
        );

        if (!confirmed) {
            return;
        }

        const previousStudents = [...students];

        students = students.filter(function (item) {
            return item.studentId !== id;
        });

        if (!saveStudents()) {
            students = previousStudents;
            return;
        }

        refreshDashboard();

        alert("Student record deleted.");
    }

    // ======================================
    // SEARCH STUDENTS
    // ======================================

    searchInput.addEventListener("input", function () {

        renderStudents(searchInput.value);

    });

    // ======================================
    // REFRESH PAGE DATA
    // ======================================

    function refreshDashboard() {

        updateStatistics();
        renderStudents(searchInput.value);

    }

    // ======================================
    // INITIALIZE
    // ======================================

    loadStudents();
    refreshDashboard();

});

