document.addEventListener('DOMContentLoaded', () => {
    const taskTitleInput = document.getElementById('task-title');
    const taskDueDateInput = document.getElementById('task-due-date');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const showAllBtn = document.getElementById('show-all');
    const showActiveBtn = document.getElementById('show-active');
    const showCompletedBtn = document.getElementById('show-completed');
    const progressBarFill = document.querySelector('.progress-fill');
    const progressText = document.getElementById('progress-text');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all'; // 'all', 'active', 'completed'

    // Function to render tasks
    function renderTasks() {
        taskList.innerHTML = ''; // Clear existing tasks
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') {
                return !task.completed;
            } else if (currentFilter === 'completed') {
                return task.completed;
            }
            return true; // 'all' filter
        });

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.setAttribute('data-id', task.id);
            if (task.completed) {
                li.classList.add('completed');
            }

            li.innerHTML = `
                <div class="task-info">
                    <span class="task-title">${task.title}</span>
                    <span class="task-due-date">${task.dueDate || 'No Due Date'}</span>
                </div>
                <div class="task-actions">
                    <button class="complete-btn" title="${task.completed ? 'Mark Incomplete' : 'Mark Complete'}">
                        ${task.completed ? '&#x2714;' : '&#x2713;'} <!-- Checkmark or Empty Box -->
                    </button>
                    <button class="edit-btn" title="Edit Task">&#x270E;</button>
                    <button class="delete-btn" title="Delete Task">&#x1F5D1;</button>
                </div>
            `;
            taskList.appendChild(li);
        });
        updateProgressBar();
    }

    // Function to add a new task
    addTaskBtn.addEventListener('click', () => {
        const title = taskTitleInput.value.trim();
        const dueDate = taskDueDateInput.value;

        if (title) {
            const newTask = {
                id: Date.now().toString(), // Unique ID
                title,
                dueDate,
                completed: false
            };
            tasks.push(newTask);
            saveTasks();
            taskTitleInput.value = '';
            taskDueDateInput.value = '';
            renderTasks();
        } else {
            alert('Please enter a task title.');
        }
    });

    // Event delegation for task actions (complete, edit, delete)
    taskList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;

        const taskId = li.getAttribute('data-id');

        if (e.target.classList.contains('complete-btn')) {
            toggleTaskComplete(taskId);
        } else if (e.target.classList.contains('edit-btn')) {
            editTask(taskId);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteTask(taskId);
        }
    });

    // Toggle task completion status
    function toggleTaskComplete(id) {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
    }

    // Edit task
    function editTask(id) {
        const taskToEdit = tasks.find(task => task.id === id);
        if (taskToEdit) {
            const newTitle = prompt('Edit task title:', taskToEdit.title);
            if (newTitle !== null) { // User didn't cancel
                taskToEdit.title = newTitle.trim();
                const newDueDate = prompt('Edit due date (YYYY-MM-DD):', taskToEdit.dueDate);
                if (newDueDate !== null) {
                    taskToEdit.dueDate = newDueDate;
                }
                saveTasks();
                renderTasks();
            }
        }
    }

    // Delete task
    function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }
    }

    // Save tasks to local storage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Filter tasks
    function setFilter(filter) {
        currentFilter = filter;
        document.querySelectorAll('.filter-options button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`show-${filter}`).classList.add('active');
        renderTasks();
    }

    showAllBtn.addEventListener('click', () => setFilter('all'));
    showActiveBtn.addEventListener('click', () => setFilter('active'));
    showCompletedBtn.addEventListener('click', () => setFilter('completed'));

    // Update Progress Bar
    function updateProgressBar() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        let percentage = 0;

        if (totalTasks > 0) {
            percentage = (completedTasks / totalTasks) * 100;
        }

        progressBarFill.style.width = `${percentage}%`;
        progressText.textContent = `${Math.round(percentage)}% Complete`;
    }

    // Initial render and set active filter
    renderTasks();
    setFilter(currentFilter); // This will also call renderTasks initially
});