
document.addEventListener("DOMContentLoaded", function () {
    const STORAGE_KEY = "gradepro_demo_classes_v1";

    const classForm = document.getElementById("classForm");
    const classModal = document.getElementById("classModal");
    const openModalBtn = document.getElementById("openClassModal");
    const closeModalBtn = document.getElementById("closeClassModal");
    const cancelModalBtn = document.getElementById("cancelClassModal");
    const searchInput = document.getElementById("classSearch");
    const tableBody = document.getElementById("classesTableBody");

    const totalClasses = document.getElementById("totalClasses");
    const assignedTeachers = document.getElementById("assignedTeachers");
    const totalCapacity = document.getElementById("totalCapacity");

    const classNameInput = document.getElementById("className");
    const classTeacherInput = document.getElementById("classTeacher");
    const classCapacityInput = document.getElementById("classCapacity");
    const academicLevelInput = document.getElementById("academicLevel");
    const modalTitle = document.getElementById("classModalTitle");

    if (!classForm || !classModal || !tableBody) return;

    let classes = loadClasses();
    let editingId = null;

    function loadClasses() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error("Could not load classes:", error);
            return [];
        }
    }

    function saveClasses() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
            return true;
        } catch (error) {
            alert("Unable to save records in this browser.");
            console.error(error);
            return false;
        }
    }

    function openModal() {
        classModal.classList.add("active");
    }

    function closeModal() {
        classModal.classList.remove("active");
        classForm.reset();
        editingId = null;
        modalTitle.textContent = "Add New Class";
    }

    function updateStats() {
        totalClasses.textContent = classes.length;

        assignedTeachers.textContent = classes.filter(
            item => item.teacher && item.teacher.trim() !== ""
        ).length;

        totalCapacity.textContent = classes.reduce(
            (sum, item) => sum + Number(item.capacity || 0), 0
        );
    }

    function createCell(value) {
        const cell = document.createElement("td");
        cell.textContent = value;
        return cell;
    }

    function renderClasses(searchTerm = "") {
        tableBody.replaceChildren();

        const term = searchTerm.trim().toLowerCase();

        const filtered = classes.filter(item =>
            [
                item.name,
                item.teacher,
                item.level,
                item.capacity
            ].some(value =>
                String(value).toLowerCase().includes(term)
            )
        );

        if (filtered.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;
            cell.className = "empty-message";
            cell.textContent = classes.length === 0
                ? "No classes added yet."
                : "No matching classes found.";

            row.appendChild(cell);
            tableBody.appendChild(row);
            updateStats();
            return;
        }

        filtered.forEach(item => {
            const row = document.createElement("tr");

            row.appendChild(createCell(item.name));
            row.appendChild(createCell(item.teacher || "Not assigned"));
            row.appendChild(createCell(item.capacity));
            row.appendChild(createCell(item.level));

            const actionsCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "action-btn edit-btn";
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.title = "Edit class";
            editButton.setAttribute("aria-label", "Edit " + item.name);

            editButton.addEventListener("click", function () {
                editClass(item.id);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "action-btn delete-btn";
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.title = "Delete class";
            deleteButton.setAttribute("aria-label", "Delete " + item.name);

            deleteButton.addEventListener("click", function () {
                deleteClass(item.id);
            });

            actionsCell.append(editButton, deleteButton);
            row.appendChild(actionsCell);
            tableBody.appendChild(row);
        });

        updateStats();
    }

    function editClass(id) {
        const item = classes.find(record => record.id === id);
        if (!item) return;

        editingId = id;

        classNameInput.value = item.name;
        classTeacherInput.value = item.teacher;
        classCapacityInput.value = item.capacity;
        academicLevelInput.value = item.level;

        modalTitle.textContent = "Edit Class";
        openModal();
    }

    function deleteClass(id) {
        const item = classes.find(record => record.id === id);
        if (!item) return;

        if (!confirm("Are you sure you want to delete " + item.name + "?")) {
            return;
        }

        const previousClasses = [...classes];
        classes = classes.filter(record => record.id !== id);

        if (!saveClasses()) {
            classes = previousClasses;
            return;
        }

        renderClasses(searchInput.value);
        alert("Class deleted successfully.");
    }

    classForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = classNameInput.value.trim();
        const teacher = classTeacherInput.value.trim();
        const capacity = Number(classCapacityInput.value);
        const level = academicLevelInput.value;

        if (!name || !Number.isInteger(capacity) || capacity < 1 || !level) {
            alert("Please enter a valid class name, capacity and academic level.");
            return;
        }

        const duplicate = classes.some(item =>
            item.name.toLowerCase() === name.toLowerCase() &&
            item.id !== editingId
        );

        if (duplicate) {
            alert("A class with this name already exists.");
            return;
        }

        const previousClasses = [...classes];

        if (editingId) {
            classes = classes.map(item =>
                item.id === editingId
                    ? { ...item, name, teacher, capacity, level }
                    : item
            );
        } else {
            classes.push({
                id: Date.now().toString(),
                name,
                teacher,
                capacity,
                level
            });
        }

        if (!saveClasses()) {
            classes = previousClasses;
            return;
        }

        closeModal();
        renderClasses(searchInput.value);

        alert(editingId ? "Class updated successfully." : "Class added successfully.");
    });

    openModalBtn.addEventListener("click", function () {
        closeModal();
        openModal();
    });

    closeModalBtn.addEventListener("click", closeModal);
    cancelModalBtn.addEventListener("click", closeModal);

    classModal.addEventListener("click", function (event) {
        if (event.target === classModal) {
            closeModal();
        }
    });

    searchInput.addEventListener("input", function () {
        renderClasses(searchInput.value);
    });

    renderClasses();
});
