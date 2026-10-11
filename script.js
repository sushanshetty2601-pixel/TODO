const STORAGE_KEY = 'todo-app-tasks';

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let activeFilter = 'all';
let editingTaskId = null;

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const tasksContainer = document.getElementById('tasksContainer');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const remainingTasksEl = document.getElementById('remainingTasks');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const filterButtons = document.querySelectorAll('.filter-btn');
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const closeModal = document.querySelector('.close');

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const remaining = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    remainingTasksEl.textContent = remaining;
}

function getFilteredTasks() {
    if (activeFilter === 'active') {
        return tasks.filter(task => !task.completed);
    }

    if (activeFilter === 'completed') {
        return tasks.filter(task => task.completed);
    }

    return tasks;
}

function renderTasks() {
    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>${tasks.length === 0 ? 'No tasks yet. Add one to get started!' : 'No tasks in this view.'}</p>
            </div>
        `;
        updateStats();
        return;
    }

    tasksContainer.innerHTML = filteredTasks
        .map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-main">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${task.completed ? 'checked' : ''}
                        aria-label="Mark task as complete"
                    >
                    <span class="task-text">${escapeHtml(task.text)}</span>
                </div>
                <div class="task-actions">
                    <button class="task-action edit-task" data-action="edit" data-id="${task.id}" title="Edit task">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="task-action delete-task" data-action="delete" data-id="${task.id}" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `)
        .join('');

    updateStats();
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function addTask() {
    const text = taskInput.value.trim();

    if (!text) {
        taskInput.focus();
        return;
    }

    tasks.unshift({
        id: Date.now(),
        text,
        completed: false,
    });

    taskInput.value = '';
    saveTasks();
    renderTasks();
    taskInput.focus();
}

function toggleTaskComplete(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });

    saveTasks();
    renderTasks();
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

function openEditModal(taskId) {
    const task = tasks.find(item => item.id === taskId);

    if (!task) return;

    editingTaskId = taskId;
    editInput.value = task.text;
    editModal.classList.add('show');
    editInput.focus();
    editInput.select();
}

function closeEditModal() {
    editingTaskId = null;
    editInput.value = '';
    editModal.classList.remove('show');
}

function saveEditedTask() {
    const newText = editInput.value.trim();

    if (!newText || editingTaskId === null) {
        editInput.focus();
        return;
    }

    tasks = tasks.map(task => {
        if (task.id === editingTaskId) {
            return { ...task, text: newText };
        }
        return task;
    });

    saveTasks();
    closeEditModal();
    renderTasks();
}

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        addTask();
    }
});

clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
});

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        activeFilter = button.dataset.filter;

        filterButtons.forEach(btn => btn.classList.toggle('active', btn === button));

        renderTasks();
    });
});

tasksContainer.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');

    if (!target) {
        const checkbox = event.target.closest('.task-checkbox');

        if (checkbox) {
            const taskItem = checkbox.closest('.task-item');
            if (taskItem) {
                toggleTaskComplete(Number(taskItem.dataset.id));
            }
        }
        return;
    }

    const taskId = Number(target.dataset.id);
    const action = target.dataset.action;

    if (action === 'edit') {
        openEditModal(taskId);
    }

    if (action === 'delete') {
        deleteTask(taskId);
    }
});

tasksContainer.addEventListener('change', event => {
    const checkbox = event.target.closest('.task-checkbox');

    if (checkbox) {
        const taskItem = checkbox.closest('.task-item');
        if (taskItem) {
            toggleTaskComplete(Number(taskItem.dataset.id));
        }
    }
});

saveEditBtn.addEventListener('click', saveEditedTask);
cancelEditBtn.addEventListener('click', closeEditModal);
closeModal.addEventListener('click', closeEditModal);

editInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        saveEditedTask();
    }

    if (event.key === 'Escape') {
        closeEditModal();
    }
});

editModal.addEventListener('click', event => {
    if (event.target === editModal) {
        closeEditModal();
    }
});

renderTasks();
