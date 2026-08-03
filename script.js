const addBtn = document.getElementById('add-btn');
const todoInput = document.getElementById('todo-input');
const dueDateInput = document.getElementById('due-date-input');
const errorMsg = document.getElementById('error-msg');
const usageTips = document.getElementById('usage-tips'); 
const todolist = document.getElementById('todo-list'); 
const emptyState = document.getElementById('empty-state');

const largeSidebar = document.getElementById('large-sidebar');
const smallSidebar = document.getElementById('small-sidebar');
const openSidebarBtn = document.getElementById('open-sidebar-btn');
const openBtn = document.getElementById('open-btn');
const allBtn = document.getElementById('all-btn');
const trashBtn = document.getElementById('trash-btn');

const markAllDoneBtn = document.getElementById('mark-all-done-btn');
const confirmModal = document.getElementById('confirm-modal');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalOkBtn = document.getElementById('modal-ok-btn');
const trashModal = document.getElementById('trash-modal');
const trashCancelBtn = document.getElementById('trash-cancel-btn');
const trashOkBtn = document.getElementById('trash-ok-btn');

const sideButtons = document.querySelectorAll('.todo-sidebar .side-btn');
const validViews = ['all', 'in-progress', 'completed', 'trash'];
let currentView = localStorage.getItem('todoView') || 'all';
if (!validViews.includes(currentView)) currentView = 'all';
let isQuickMode = window.matchMedia('(max-width: 620px)').matches;
if (isQuickMode && openBtn && largeSidebar) {
    largeSidebar.classList.add('quick-mode');
    openBtn.textContent = 'QUICKS';
}

// Variable, um zu speichern, welche Aktion gerade im Bestätigungsfenster offen ist
let activeDeleteAction = '';

// Das exakte, geschwungene SVG-Kreuz (X)
const svgCross = `<svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" style="width:13px; height:13px; display:block;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

// Das exakte, freihändig geschwungene SVG-Häkchen
const svgCheck = `<svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px; display:block;"><path d="M20 6L9 17l-5-5"/></svg>`;
const svgEdit = `<svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px; display:block;"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;

function updateTaskButtonLabels(li) {
    const taskText = li.querySelector('.todo-content')?.innerText.trim() || 'task';
    const isCompleted = li.classList.contains('checked');
    const checkButton = li.querySelector('.check-circle');
    const editButton = li.querySelector('.edit-btn');
    const deleteButton = li.querySelector('.delete-btn');

    if (checkButton) {
        checkButton.setAttribute('aria-label', `Mark ${taskText} as ${isCompleted ? 'incomplete' : 'completed'}`);
        checkButton.setAttribute('aria-pressed', String(isCompleted));
    }
    if (editButton) editButton.setAttribute('aria-label', `Edit ${taskText}`);
    if (deleteButton) deleteButton.setAttribute('aria-label', `Delete ${taskText}`);
}

// Speichert den Zustand aller Aufgaben im lokalen Speicher des Browsers
function saveToLocalStorage() {
    if (!todolist) return;
    const allTodos = document.querySelectorAll('.todo-list li');
    const todoData = [];
    allTodos.forEach(li => {
        const textDiv = li.querySelector('.todo-content');
        if (textDiv) {
            todoData.push({
                text: textDiv.innerText,
                checked: li.classList.contains('checked'),
                inTrash: li.classList.contains('in-trash'),
                dueDate: li.dataset.dueDate || ''
            });
        }
    });
    localStorage.setItem('todoItems', JSON.stringify(todoData));
} 

// Lädt die gespeicherten Aufgaben beim Laden der Seite
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('todoItems');
    if (!savedData || !todolist) return;
    
    const todoData = JSON.parse(savedData);
    if (todoData.length > 0 && usageTips) {
        usageTips.classList.add('hidden');
    }

    todoData.forEach(item => {
        const li = document.createElement('li');
        if (item.checked) li.classList.add('checked');
        if (item.inTrash) li.classList.add('in-trash');
        if (item.dueDate) li.dataset.dueDate = item.dueDate;

        li.innerHTML = `
            <button class="check-circle" type="button" aria-label="Mark task as completed" aria-pressed="${item.checked ? 'true' : 'false'}">${item.checked ? svgCheck : ''}</button>
            <div class="task-main">
                <div class="todo-content">${item.text}</div>
                ${item.dueDate ? `<span class="due-date">Due date: ${item.dueDate}</span>` : ''}
            </div>
            <div class="task-actions">
                <button class="edit-btn" type="button" aria-label="Edit task">${svgEdit}</button>
                <button class="delete-btn" type="button" aria-label="Delete task">${svgCross}</button>
            </div>
        `;
        todolist.appendChild(li);
        updateTaskButtonLabels(li);
    });
}

// Steuert das Ein- und Ausblenden der Menü-Schaltflächen
function updateMarkAllDoneVisibility() {
    const todoFooter = document.querySelector('.todo-footer'); 
    const allTodos = document.querySelectorAll('.todo-list li');
    const visibleTodos = document.querySelectorAll('.todo-list li:not(.hidden)');
    const remainingTodos = document.querySelectorAll('.todo-list li:not(.checked):not(.in-trash)');

    // 1. "Mark All Done" oben links im Kasten steuern
    if (markAllDoneBtn) {
        if (currentView === 'all' && remainingTodos.length > 0) {
            markAllDoneBtn.classList.remove('btn-hidden');
        } else {
            markAllDoneBtn.classList.add('btn-hidden');
        }
    }

    // 2. Footer-Text mit verbleibenden Elementen berechnen
    if (todoFooter) {
        if (allTodos.length > 0) {
            const visibleCount = visibleTodos.length;
            const unit = visibleCount === 1 ? 'task' : 'tasks';
            const filterSummary = {
                all: `${visibleCount} ${unit} shown`,
                'in-progress': `${visibleCount} open ${unit} shown`,
                completed: `${visibleCount} completed ${unit} shown`,
                trash: `${visibleCount} trashed ${unit} shown`
            };
            const openUnit = remainingTodos.length === 1 ? 'task' : 'tasks';
            todoFooter.textContent = `${filterSummary[currentView] || `${visibleCount} ${unit} shown`} (${remainingTodos.length} ${openUnit} open)`;
            todoFooter.classList.remove('hidden');
            todoFooter.style.setProperty('display', 'flex', 'important'); 
        } else {
            todoFooter.textContent = ""; 
            todoFooter.style.setProperty('display', 'none', 'important'); 
        }
    }

    if (emptyState) {
        const emptyMessages = {
            all: 'No tasks yet. Add your first task above.',
            'in-progress': 'No open tasks. Nice work!',
            completed: 'No completed tasks yet.',
            trash: 'Your trash is empty.'
        };
        const showEmptyState = allTodos.length > 0 && visibleTodos.length === 0;
        emptyState.textContent = showEmptyState ? emptyMessages[currentView] : '';
        emptyState.classList.toggle('hidden', !showEmptyState);
    }

    // 3. WICHTIG: Filter-Buttons in der Sidebar IMMER sichtbar machen!
    const mainFilterButtons = ['all-btn', 'in-progress-btn', 'completed-btn', 'trash-btn', 'export-btn', 'open-btn', 'import-btn'];
    mainFilterButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove('btn-hidden');
    });

    // 4. Reine Aktionsknöpfe nur einblenden, wenn To-Dos in der Liste existieren
    const actionButtons = ['finish-all-btn', 'clear-completed-btn', 'clear-all-btn'];
    const hasItems = allTodos.length > 0;
    if (largeSidebar) largeSidebar.classList.toggle('has-tasks', hasItems);
    actionButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            if (hasItems) btn.classList.remove('btn-hidden');
            else btn.classList.add('btn-hidden');
        }
    });
}

// Filtert die Aufgabenliste nach dem ausgewählten Zustand
function switchView(view) {
    currentView = view;
    localStorage.setItem('todoView', currentView);
    const allTodos = document.querySelectorAll('.todo-list li');
    
    allTodos.forEach(li => {
        const isChecked = li.classList.contains('checked');
        const isInTrash = li.classList.contains('in-trash');

        if (currentView === 'all') {
            if (!isInTrash) li.classList.remove('hidden');
            else li.classList.add('hidden');
        } 
        else if (currentView === 'in-progress') {
            if (!isChecked && !isInTrash) li.classList.remove('hidden');
            else li.classList.add('hidden');
        } 
        else if (currentView === 'completed') {
            if (isChecked && !isInTrash) li.classList.remove('hidden');
            else li.classList.add('hidden');
        } 
        else if (currentView === 'trash') {
            if (isInTrash) li.classList.remove('hidden');
            else li.classList.add('hidden');
        }
    });
    updateMarkAllDoneVisibility();
}

// Fügt ein neues To-Do-Element hinzu
function checkInput() {
    if (!todoInput || !todolist) return;
    const text = todoInput.value.trim();
    const dueDate = dueDateInput ? dueDateInput.value : '';

    if (text === "") {
        if (errorMsg) errorMsg.classList.remove('hidden');
    } else {
        if (errorMsg) errorMsg.classList.add('hidden');
        if (usageTips) usageTips.classList.add('hidden');

        const li = document.createElement('li');
        if (dueDate) li.dataset.dueDate = dueDate;
        li.innerHTML = `
            <button class="check-circle" type="button" aria-label="Mark task as completed" aria-pressed="false"></button>
            <div class="task-main">
                <div class="todo-content">${text}</div>
                ${dueDate ? `<span class="due-date">Due date: ${dueDate}</span>` : ''}
            </div>
            <div class="task-actions">
                <button class="edit-btn" type="button" aria-label="Edit task">${svgEdit}</button>
                <button class="delete-btn" type="button" aria-label="Delete task">${svgCross}</button>
            </div>
        `;
        
        todolist.appendChild(li);
        updateTaskButtonLabels(li);
        todoInput.value = "";
        if (dueDateInput) dueDateInput.value = "";
        saveToLocalStorage();
        switchView(currentView);
    }
}

if (addBtn) addBtn.addEventListener('click', checkInput);
if (openBtn && largeSidebar) {
    openBtn.addEventListener('click', function() {
        isQuickMode = !isQuickMode;
        largeSidebar.classList.toggle('quick-mode', isQuickMode);
        openBtn.textContent = isQuickMode ? 'QUICKS' : 'OPEN ✨';

        // Beim Öffnen alle verfügbaren Schnellaktionen zeigen.
        if (!isQuickMode) {
            sideButtons.forEach(button => button.classList.remove('btn-hidden'));
        }
    });
}
if (todoInput) {
    todoInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') { checkInput(); }
    });
}

// Überwacht Klicks auf die Liste (Abhaken und Löschen)
if (todolist) {
    todolist.addEventListener('click', function(event) {
        const target = event.target;
        const li = target.closest('li');
        if (!li) return;

        // Aufgabe bearbeiten
        if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
            if (currentView !== 'trash') {
                const textDiv = li.querySelector('.todo-content');
                if (!textDiv) return;

                const originalText = textDiv.innerText;
                const editInput = document.createElement('input');
                editInput.type = 'text';
                editInput.className = 'todo-edit-input';
                editInput.value = originalText;
                editInput.setAttribute('aria-label', `Edit ${originalText}`);
                textDiv.replaceWith(editInput);
                editInput.focus();
                editInput.select();

                const taskActions = li.querySelector('.task-actions');
                const editButton = target.closest('.edit-btn');
                const cancelButton = document.createElement('button');
                cancelButton.type = 'button';
                cancelButton.className = 'cancel-edit-btn';
                cancelButton.textContent = 'Cancel';
                cancelButton.setAttribute('aria-label', `Cancel editing ${originalText}`);
                if (taskActions) taskActions.prepend(cancelButton);
                if (editButton) editButton.classList.add('hidden');

                let isEditing = true;
                const finishEditing = (saveChanges) => {
                    if (!isEditing) return;
                    isEditing = false;
                    const updatedText = editInput.value.trim();
                    textDiv.textContent = saveChanges && updatedText ? updatedText : originalText;
                    editInput.replaceWith(textDiv);
                    cancelButton.remove();
                    if (editButton) editButton.classList.remove('hidden');
                    updateTaskButtonLabels(li);
                    if (saveChanges && updatedText) saveToLocalStorage();
                };

                editInput.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') finishEditing(true);
                    if (event.key === 'Escape') finishEditing(false);
                });
                editInput.addEventListener('blur', () => finishEditing(true));
                cancelButton.addEventListener('mousedown', (event) => {
                    event.preventDefault();
                    finishEditing(false);
                });
                cancelButton.addEventListener('click', () => finishEditing(false));
            }
            return;
        }

        // Aufgabe abhaken
        if (target.classList.contains('check-circle') || target.closest('.check-circle') || target.classList.contains('todo-content')) {
            if (currentView !== 'trash') {
                li.classList.toggle('checked');
                const circle = li.querySelector('.check-circle');
                if (circle) {
                    circle.innerHTML = li.classList.contains('checked') ? svgCheck : '';
                    circle.setAttribute('aria-pressed', String(li.classList.contains('checked')));
                }
                updateTaskButtonLabels(li);
                saveToLocalStorage();
                switchView(currentView);
            }
        }

        // Aufgabe löschen / in Papierkorb verschieben
        if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
            li.style.animation = "popIn 0.2s ease-in reverse"; 
            setTimeout(() => {
                li.style.animation = ""; 
                if (currentView === 'trash') {
                    li.remove(); 
                } else {
                    li.classList.add('in-trash'); 
                }
                saveToLocalStorage(); 
                switchView(currentView); 
            }, 200);
        }
    });
}

// Die beiden Aktions-Buttons auch zuverlässig per Enter oder Leertaste auslösen.
if (todolist) {
    todolist.addEventListener('keydown', function(event) {
        const actionButton = event.target.closest('.check-circle, .delete-btn');
        if (!actionButton || (event.key !== 'Enter' && event.key !== ' ')) return;

        event.preventDefault();
        actionButton.click();
    });
}

// Wechselt das aktive optische Design in der Sidebar
function handleSidebarActive(activeBtn) {
    if (sideButtons) {
        sideButtons.forEach(btn => btn.classList.remove('active'));
    }
    if (activeBtn) activeBtn.classList.add('active');
}

// Klick-Events für Navigations-Buttons
if (allBtn) { allBtn.addEventListener('click', function() { handleSidebarActive(this); switchView('all'); }); }
if (trashBtn) { trashBtn.addEventListener('click', function() { handleSidebarActive(this); switchView('trash'); }); }

const inProgressBtn = document.getElementById('in-progress-btn');
if (inProgressBtn) { inProgressBtn.addEventListener('click', function() { handleSidebarActive(this); switchView('in-progress'); }); }

const completedBtn = document.getElementById('completed-btn');
if (completedBtn) { completedBtn.addEventListener('click', function() { handleSidebarActive(this); switchView('completed'); }); }


// ==========================================================================
// ZENTRALE STEUERUNG FÜR DAS BESTÄTIGUNGSFENSTER (MODAL)
// ==========================================================================

// Oben Links: Mark All Done Button klick
if (markAllDoneBtn && confirmModal) {
    markAllDoneBtn.addEventListener('click', function() {
        const modalText = confirmModal.querySelector('p');
        if (modalText) modalText.textContent = "Confirm to mark all as completed?";
        activeDeleteAction = 'mark-done';
        confirmModal.classList.remove('hidden');
    });
}

// Sidebar: Clear Completed Button klick
const clearCompletedBtn = document.getElementById('clear-completed-btn');
if (clearCompletedBtn && confirmModal) {
    clearCompletedBtn.addEventListener('click', function() {
        const modalText = confirmModal.querySelector('p');
        if (modalText) modalText.textContent = "Confirm to clear all completed items?";
        activeDeleteAction = 'clear-completed';
        confirmModal.classList.remove('hidden');
    });
}

// Sidebar: Clear All Button klick
const clearAllBtn = document.getElementById('clear-all-btn');
if (clearAllBtn && confirmModal) {
    clearAllBtn.addEventListener('click', function() {
        const modalText = confirmModal.querySelector('p');
        if (modalText) modalText.textContent = "Confirm to clear all todo items?";
        activeDeleteAction = 'clear-all';
        confirmModal.classList.remove('hidden');
    });
}

// Modal schliessen bei Abbruch
if (confirmModal && modalCancelBtn) {
    modalCancelBtn.addEventListener('click', function() {
        confirmModal.classList.add('hidden');
        activeDeleteAction = '';
    });
}

// Modal abschicken bei OK
if (confirmModal && modalOkBtn) {
    modalOkBtn.addEventListener('click', function() {
        if (activeDeleteAction === 'mark-done') {
            const visibleTodos = document.querySelectorAll('.todo-list li:not(.hidden)');
            visibleTodos.forEach(li => {
                li.classList.add('checked');
                const circle = li.querySelector('.check-circle');
                if (circle) {
                    circle.innerHTML = svgCheck;
                    circle.setAttribute('aria-pressed', 'true');
                }
            });
        } else if (activeDeleteAction === 'clear-completed') {
            const completedTodos = document.querySelectorAll('.todo-list li.checked');
            completedTodos.forEach(li => {
                li.classList.add('in-trash');
            });
        } else if (activeDeleteAction === 'clear-all') {
            const allTodos = document.querySelectorAll('.todo-list li');
            allTodos.forEach(li => {
                li.classList.add('in-trash');
            });
        }
        confirmModal.classList.add('hidden');
        activeDeleteAction = '';
        saveToLocalStorage();
        switchView(currentView);
    });
}

// ==========================================================================
// LOGIK FÜR DIE UNTEREN MENÜ-AKTIONEN (OHNE MODAL)
// ==========================================================================

// Finish all: Alle sichtbaren Aufgaben direkt abhaken
const finishAllBtn = document.getElementById('finish-all-btn');
if (finishAllBtn) {
    finishAllBtn.addEventListener('click', function() {
        const visibleTodos = document.querySelectorAll('.todo-list li:not(.hidden)');
        visibleTodos.forEach(li => {
            li.classList.add('checked');
            const circle = li.querySelector('.check-circle');
            if (circle) {
                circle.innerHTML = svgCheck;
                circle.setAttribute('aria-pressed', 'true');
            }
        });
        saveToLocalStorage();
        switchView(currentView);
    });
}

// Export data: Daten als JSON-Datei herunterladen
const exportBtn = document.getElementById('export-btn');
if (exportBtn) {
    exportBtn.addEventListener('click', function() {
        const allTodos = document.querySelectorAll('.todo-list li');
        const todoData = [];
        allTodos.forEach(li => {
            const textDiv = li.querySelector('.todo-content');
            if (textDiv) {
                todoData.push({
                    text: textDiv.innerText,
                    checked: li.classList.contains('checked'),
                    inTrash: li.classList.contains('in-trash'),
                    dueDate: li.dataset.dueDate || ''
                });
            }
        });
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(todoData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "todo-export.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });
}

// Import data: JSON- oder TXT-Datei einlesen
const fileInput = document.getElementById('file-input');
const importBtn = document.getElementById('import-btn');
if (importBtn && fileInput) {
    importBtn.addEventListener('click', function() {
        fileInput.click();
    });
}

if (fileInput) {
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const todoData = JSON.parse(e.target.result);
                if (Array.isArray(todoData) && todolist) {
                    todolist.innerHTML = "";
                    if (todoData.length > 0 && usageTips) usageTips.classList.add('hidden');
                    
                    todoData.forEach(item => {
                        const li = document.createElement('li');
                        if (item.checked) li.classList.add('checked');
                        if (item.inTrash) li.classList.add('in-trash');
                        if (item.dueDate) li.dataset.dueDate = item.dueDate;
                        
                        // KORREKTUR: Backticks für Template-Literal eingesetzt
                        li.innerHTML = `
                            <button class="check-circle" type="button" aria-label="Mark task as completed" aria-pressed="${item.checked ? 'true' : 'false'}">${item.checked ? svgCheck : ''}</button>
                            <div class="task-main">
                                <div class="todo-content">${item.text}</div>
                                ${item.dueDate ? `<span class="due-date">Due date: ${item.dueDate}</span>` : ''}
                            </div>
                            <div class="task-actions">
                                <button class="edit-btn" type="button" aria-label="Edit task">${svgEdit}</button>
                                <button class="delete-btn" type="button" aria-label="Delete task">${svgCross}</button>
                            </div>
                        `;
                        todolist.appendChild(li);
                        updateTaskButtonLabels(li);
                    });
                    saveToLocalStorage();
                    switchView(currentView);
                }
            } catch (err) {
                alert("Fehler beim Importieren der Datei. Ungültiges Format!");
            }
        };
        reader.readAsText(file);
    });
}

// Initialer Start beim Laden der App
loadFromLocalStorage();
switchView(currentView);
updateMarkAllDoneVisibility();
