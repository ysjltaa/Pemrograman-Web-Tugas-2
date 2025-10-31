document.addEventListener('DOMContentLoaded', () => {
    // elemen DOM
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const emptyImage = document.querySelector('.empty-image');
    const todosContainer = document.querySelector('.todos-container');
    const progressBar = document.getElementById('progress');
    const progressNumbers = document.getElementById('numbers');
    const form = document.querySelector('.input-area');
    const dateDisplay = document.getElementById('date-display');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const notification = document.getElementById('notification');
    const taskCount = document.getElementById('task-count');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const motivationText = document.getElementById('motivation-text');

    // BOM: Update date display
    const updateDate = () => {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString('en-US', options);
    };

    // BOM: menampilkan notifikasi 
    const showNotification = (message, type = 'info') => {
        notification.textContent = message;
        notification.className = 'notification show';
        
        // warna notif sesuai tipe
        if (type === 'success') {
            notification.style.background = 'rgba(76, 175, 80, 0.8)';
        } else if (type === 'error') {
            notification.style.background = 'rgba(244, 67, 54, 0.8)';
        } else {
            notification.style.background = 'rgba(0, 0, 0, 0.7)';
        }
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    };

    const toggleEmptyState = () => {
        emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none';
        todosContainer.style.width = taskList.children.length > 0 ? '100%' : '';
    };

    // DOM: Update progress bar dan motivation text
    const updateProgress = (checkCompletion = true) => {
        const totalTasks = taskList.querySelectorAll('li').length;
        const completedTasks = taskList.querySelectorAll('.checkbox:checked').length;

        progressBar.style.width = totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%';
        progressNumbers.textContent = `${completedTasks} / ${totalTasks}`;
        taskCount.textContent = `${totalTasks} task${totalTasks !== 1 ? 's' : ''}`;

        if (totalTasks === 0) {
            motivationText.textContent = "Add your first task!";
        } else if (completedTasks === 0) {
            motivationText.textContent = "Let's get started!";
        } else if (completedTasks === totalTasks) {
            motivationText.textContent = "All done! Amazing!";
            if (checkCompletion) {
                Confetti();
                showNotification("Congratulations! You've completed all tasks!", "success");
            }
        } else if (completedTasks / totalTasks > 0.7) {
            motivationText.textContent = "Almost there!";
        } else if (completedTasks / totalTasks > 0.4) {
            motivationText.textContent = "Great progress!";
        } else {
            motivationText.textContent = "Keep it up!";
        }

        // menunjukkan notifikasi saat tugas selesai
        if (completedTasks > 0 && checkCompletion) {
            showNotification(`Task completed! ${completedTasks}/${totalTasks} done`, "success");
        }
    };

    const saveTaskToLocalStorage = () => {
        const tasks = Array.from(taskList.querySelectorAll('li')).map(li => ({
            text: li.querySelector('span').textContent,
            completed: li.querySelector('.checkbox').checked
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const loadTasksFromLocalStorage = () => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        savedTasks.forEach(({ text, completed }) => addTask(text, completed, false));
        toggleEmptyState();
        updateProgress();
    };

    // DOM: menambahkan task function
    const addTask = (text, completed = false, checkCompletion = true) => {
        const taskText = (text !== undefined && text !== null) ? text : taskInput.value.trim();
        if (!taskText) {
            showNotification("Please enter a task!", "error");
            return;
        }

        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" class="checkbox" ${completed ? 'checked' : ''}>
            <span>${taskText}</span>
            <div class="task-buttons">
                <button class="edit-btn" type="button"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn" type="button"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;

        const checkbox = li.querySelector('.checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');

        if (completed) {
            li.classList.add('completed');
            editBtn.disabled = true;
            editBtn.style.opacity = '0.5';
            editBtn.style.pointerEvents = 'none';
        }

        checkbox.addEventListener('change', () => {
            const isChecked = checkbox.checked;
            li.classList.toggle('completed', isChecked);
            editBtn.disabled = isChecked;
            editBtn.style.opacity = isChecked ? '0.5' : '1';
            editBtn.style.pointerEvents = isChecked ? 'none' : 'auto';
            updateProgress();
            saveTaskToLocalStorage();
            filterTasks(currentFilter);
        });

        editBtn.addEventListener('click', () => {
            if (!checkbox.checked) {
                taskInput.value = li.querySelector('span').textContent;
                li.remove();
                toggleEmptyState();
                updateProgress(false);
                saveTaskToLocalStorage();
                taskInput.focus();
                showNotification("Task ready for editing");
            }
        });

        deleteBtn.addEventListener('click', () => {
            li.remove();
            toggleEmptyState();
            updateProgress();
            saveTaskToLocalStorage();
            filterTasks(currentFilter);
            showNotification("Task deleted", "error");
        });

        taskList.appendChild(li);
        taskInput.value = '';
        toggleEmptyState();
        updateProgress(checkCompletion);
        saveTaskToLocalStorage();
        filterTasks(currentFilter);
        
        if (checkCompletion) {
            showNotification("Task added successfully!");
        }
    };

    let currentFilter = 'all';
    
    const filterTasks = (filter) => {
        currentFilter = filter;
        const tasks = taskList.querySelectorAll('li');
        
        tasks.forEach(task => {
            const isCompleted = task.querySelector('.checkbox').checked;
            
            switch(filter) {
                case 'active':
                    task.style.display = isCompleted ? 'none' : 'flex';
                    break;
                case 'completed':
                    task.style.display = isCompleted ? 'flex' : 'none';
                    break;
                default:
                    task.style.display = 'flex';
            }
        });
      
        filterBtns.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    // DOM: clear completed task
    const clearCompletedTasks = () => {
        const completedTasks = taskList.querySelectorAll('.checkbox:checked');
        
        if (completedTasks.length === 0) {
            showNotification("No completed tasks to clear", "error");
            return;
        }
        
        completedTasks.forEach(checkbox => {
            checkbox.closest('li').remove();
        });
        
        toggleEmptyState();
        updateProgress();
        saveTaskToLocalStorage();
        showNotification("Completed tasks cleared", "success");
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addTask();
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask();
        }
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterTasks(btn.dataset.filter);
        });
    });
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);

    // BOM: Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter untuk menambahkan tugas
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            addTask();
        }
        
        if (e.key === 'Escape') {
            taskInput.value = '';
            taskInput.blur();
        }
    });

    // BOM
    window.addEventListener('resize', () => {
        if (window.innerWidth < 600) {
            document.body.style.zoom = "100%";
        }
    });

    // BOM
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            updateDate();
        }
    });

    const init = () => {
        updateDate();
        loadTasksFromLocalStorage();
        filterTasks('all');
        
        taskInput.focus();
    };

    init();
});

// Confetti 
const Confetti = () => {
    const count = 200,
        defaults = {
            origin: { y: 0.7 },
        };

    function fire(particleRatio, opts) {
        confetti(
            Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio),
            })
        );
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });

    fire(0.2, {
        spread: 60,
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
};