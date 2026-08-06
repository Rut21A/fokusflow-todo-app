const addBtn = document.getElementById('add-btn');
const todoInput = document.getElementById('todo-input');
const dueDateInput = document.getElementById('due-date-input');
const errorMsg = document.getElementById('error-msg');
const statusMsg = document.getElementById('status-msg');
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
const aboutBtn = document.getElementById('about-btn');
const aboutModal = document.getElementById('about-modal');
const aboutCloseBtn = document.getElementById('about-close-btn');
const langEnBtn = document.getElementById('lang-en');
const langDeBtn = document.getElementById('lang-de');

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
let feedbackTimer;

const translations = {
    en: {
        about: 'About', aboutTitle: 'About Ruta',
        aboutText: 'Hi, I’m Ruta — a junior developer creating friendly web experiences. Little Wins is one of them.',
        inputPlaceholder: 'Add a to-do item...', newTaskLabel: 'New task', dueDateLabel: 'Optional due date', add: 'Add', markAll: 'Mark All Done',
        title: 'Act Now, Simplify Life. ☕', tipTitle: 'Add Your First To-Do Item! 📝', tips: 'Usage Tips 💡 :',
        tipLines: ['Press Enter to submit actions.', 'Drag to reorder your to-dos (PC only)', 'Double-click to edit slogan and tasks.', 'Access quick actions in the right sidebar.', 'Your data is stored locally in your browser.', 'Supports data download and import.'],
        tasks: 'Tasks', all: 'All', inProgress: 'In Progress', completed: 'Completed', trash: 'Trash', finishAll: 'Finish all', clearCompleted: 'Clear Completed', clearAll: 'Clear All', export: 'Export data', import: 'Import(txt/json)', chooseFile: 'Choose a task file to import', quicks: 'Quicks', open: 'OPEN ✨',
        taskOne: 'task', taskMany: 'tasks', shown: 'shown', open: 'open', completedCount: 'completed', trashed: 'trashed', allCompleted: 'All completed, good job!'
    },
    de: {
        about: 'Über mich', aboutTitle: 'Über Ruta',
        aboutText: 'Hi, ich bin Ruta — Junior Entwicklerin für freundliche Web-Erlebnisse. Little Wins ist eines davon.',
        inputPlaceholder: 'Neue Aufgabe hinzufügen...', newTaskLabel: 'Neue Aufgabe', dueDateLabel: 'Optionales Datum', add: 'Hinzufügen', markAll: 'Alle erledigen',
        title: 'Jetzt handeln, Leben vereinfachen. ☕', tipTitle: 'Füge deine erste Aufgabe hinzu! 📝', tips: 'Tipps 💡 :',
        tipLines: ['Drücke Enter, um eine Aufgabe hinzuzufügen.', 'Ziehe Aufgaben zum Sortieren (nur PC).', 'Doppelklicke zum Bearbeiten von Titel und Aufgaben.', 'Nutze die Schnellaktionen rechts.', 'Deine Daten werden lokal im Browser gespeichert.', 'Du kannst Daten herunterladen und importieren.'],
        tasks: 'Aufgaben', all: 'Alle', inProgress: 'Offen', completed: 'Erledigt', trash: 'Papierkorb', finishAll: 'Alle erledigen', clearCompleted: 'Erledigte löschen', clearAll: 'Alles löschen', export: 'Daten exportieren', import: 'Importieren (txt/json)', chooseFile: 'Datei zum Importieren auswählen', quicks: 'Menü', open: 'OPEN ✨',
        taskOne: 'Aufgabe', taskMany: 'Aufgaben', shown: 'sichtbar', open: 'offen', completedCount: 'erledigt', trashed: 'im Papierkorb', allCompleted: 'Alles erledigt, gut gemacht!'
    }
};

let currentLanguage = localStorage.getItem('todoLanguage') || 'en';
if (!translations[currentLanguage]) currentLanguage = 'en';

function applyLanguage(language) {
    currentLanguage = language;
    localStorage.setItem('todoLanguage', language);
    document.documentElement.lang = language;
    const copy = translations[language];
    const setText = (id, text) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    };

    if (todoInput) {
        todoInput.placeholder = copy.inputPlaceholder;
        todoInput.setAttribute('aria-label', copy.newTaskLabel);
    }
    if (dueDateInput) dueDateInput.setAttribute('aria-label', copy.dueDateLabel);
    if (addBtn) addBtn.textContent = copy.add;
    if (markAllDoneBtn) markAllDoneBtn.textContent = copy.markAll;
    if (todolist) todolist.setAttribute('aria-label', copy.tasks);
    if (document.querySelector('.title')) document.querySelector('.title').textContent = copy.title;
    if (usageTips) {
        const tipTitle = usageTips.querySelector('h3');
        const tipSubtitle = usageTips.querySelector('.tips-sub');
        if (tipTitle) tipTitle.textContent = copy.tipTitle;
        if (tipSubtitle) tipSubtitle.textContent = copy.tips;
        usageTips.querySelectorAll('li').forEach((item, index) => {
            const icon = item.querySelector('span');
            item.textContent = copy.tipLines[index] || '';
            if (icon) item.prepend(icon, ' ');
        });
    }
    setText('about-btn', copy.about);
    setText('about-title', copy.aboutTitle);
    setText('about-text', copy.aboutText);
    setText('all-btn', copy.all);
    setText('in-progress-btn', copy.inProgress);
    setText('completed-btn', copy.completed);
    setText('trash-btn', copy.trash);
    setText('finish-all-btn', copy.finishAll);
    setText('clear-completed-btn', copy.clearCompleted);
    setText('clear-all-btn', copy.clearAll);
    setText('export-btn', copy.export);
    setText('import-btn', copy.import);
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.setAttribute('aria-label', copy.chooseFile);
    if (openBtn) {
        openBtn.dataset.quickLabel = copy.quicks;
        openBtn.textContent = isQuickMode ? copy.quicks : copy.open;
    }

    if (langEnBtn) langEnBtn.setAttribute('aria-pressed', String(language === 'en'));
    if (langDeBtn) langDeBtn.setAttribute('aria-pressed', String(language === 'de'));
    updateMarkAllDoneVisibility();
}

function t(key) {
    return translations[currentLanguage][key] || key;
}

// Das exakte, geschwungene SVG-Kreuz (X)
const svgCross = `<svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" style="width:13px; height:13px; display:block;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

// Das exakte, freihändig geschwungene SVG-Häkchen
const svgCheck = `<svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px; display:block;"><path d="M20 6L9 17l-5-5"/></svg>`;
const svgEdit = `<svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px; display:block;"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;

function showFeedback(message) {
    if (!statusMsg) return;
    statusMsg.textContent = message;
    statusMsg.classList.remove('hidden');
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => statusMsg.classList.add('hidden'), 4000);
}

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
    const activeTodos = document.querySelectorAll('.todo-list li:not(.in-trash)');
    const showWelcomeTips = currentView === 'all' && activeTodos.length === 0;

    if (usageTips) usageTips.classList.toggle('hidden', !showWelcomeTips);

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
        if (allTodos.length > 0 && !showWelcomeTips) {
            const visibleCount = visibleTodos.length;
            const unit = visibleCount === 1 ? t('taskOne') : t('taskMany');
            const filterSummary = {
                all: `${visibleCount} ${unit} ${t('shown')}`,
                'in-progress': `${visibleCount} ${t('open')} ${unit} ${t('shown')}`,
                completed: `${visibleCount} ${t('completedCount')} ${unit} ${t('shown')}`,
                trash: `${visibleCount} ${t('trashed')} ${unit} ${t('shown')}`
            };
            const openUnit = remainingTodos.length === 1 ? t('taskOne') : t('taskMany');
            todoFooter.textContent = `${filterSummary[currentView] || `${visibleCount} ${unit} ${t('shown')}`} (${remainingTodos.length} ${openUnit} ${t('open')})`;
            todoFooter.classList.remove('hidden');
            todoFooter.style.setProperty('display', 'flex', 'important'); 
        } else {
            todoFooter.textContent = t('allCompleted');
            todoFooter.classList.remove('hidden');
            todoFooter.style.setProperty('display', 'flex', 'important');
        }
    }

    if (emptyState) {
        const emptyMessages = {
            all: 'No tasks yet. Add your first task above.',
            'in-progress': 'No open tasks. Nice work!',
            completed: 'No completed tasks yet.',
            trash: 'Your trash is empty.'
        };
        const showEmptyState = !showWelcomeTips && allTodos.length > 0 && visibleTodos.length === 0;
        emptyState.textContent = showEmptyState ? emptyMessages[currentView] : '';
        emptyState.classList.toggle('hidden', !showEmptyState);
    }

    // 3. In der leeren Ansicht bleiben nur die drei sinnvollen Schnellaktionen sichtbar.
    const hasItems = allTodos.length > 0 && !showWelcomeTips;
    const emptyStateButtons = ['all-btn', 'trash-btn', 'open-btn', 'import-btn'];
    const mainFilterButtons = ['all-btn', 'in-progress-btn', 'completed-btn', 'trash-btn', 'export-btn', 'open-btn', 'import-btn'];
    mainFilterButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.toggle('btn-hidden', !hasItems && !emptyStateButtons.includes(id));
    });

    // 4. Reine Aktionsknöpfe nur einblenden, wenn To-Dos in der Liste existieren
    const actionButtons = ['finish-all-btn', 'clear-completed-btn', 'clear-all-btn'];
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
    const filterButtonByView = {
        all: 'all-btn',
        'in-progress': 'in-progress-btn',
        completed: 'completed-btn',
        trash: 'trash-btn'
    };
    Object.entries(filterButtonByView).forEach(([filter, id]) => {
        const button = document.getElementById(id);
        if (button) {
            const isActive = filter === currentView;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        }
    });
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

        // Auf dem Handy öffnet sich Quicks nach der ersten Aufgabe automatisch.
        if (window.matchMedia('(max-width: 620px)').matches && isQuickMode && largeSidebar && openBtn) {
            isQuickMode = false;
            largeSidebar.classList.remove('quick-mode');
            openBtn.textContent = t('open');
        }
        switchView(currentView);
        showFeedback('Task added.');
    }
}

if (addBtn) addBtn.addEventListener('click', checkInput);
if (openBtn && largeSidebar) {
    openBtn.addEventListener('click', function() {
        isQuickMode = !isQuickMode;
        largeSidebar.classList.toggle('quick-mode', isQuickMode);
        openBtn.textContent = isQuickMode ? t('quicks') : t('open');

        // Beim Öffnen die zu den vorhandenen Aufgaben passenden Aktionen zeigen.
        if (!isQuickMode) {
            updateMarkAllDoneVisibility();
        }
    });
}

if (aboutBtn && aboutModal) {
    aboutBtn.addEventListener('click', () => {
        aboutModal.classList.remove('hidden');
        if (aboutCloseBtn) aboutCloseBtn.focus();
    });
}

if (aboutCloseBtn && aboutModal) {
    aboutCloseBtn.addEventListener('click', () => aboutModal.classList.add('hidden'));
}

if (aboutModal) {
    aboutModal.addEventListener('click', event => {
        if (event.target === aboutModal) aboutModal.classList.add('hidden');
    });
}

if (langEnBtn) langEnBtn.addEventListener('click', () => applyLanguage('en'));
if (langDeBtn) langDeBtn.addEventListener('click', () => applyLanguage('de'));

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && aboutModal && !aboutModal.classList.contains('hidden')) {
        aboutModal.classList.add('hidden');
        if (aboutBtn) aboutBtn.focus();
    }
});

if (todoInput) {
    todoInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkInput();
        }
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
                    if (saveChanges && updatedText) {
                        saveToLocalStorage();
                        showFeedback('Task updated.');
                    }
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
                showFeedback(li.classList.contains('checked') ? 'Task completed.' : 'Task reopened.');
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
                showFeedback(currentView === 'trash' ? 'Task permanently deleted.' : 'Task moved to Trash.');
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

// Alle sichtbaren Buttons können auch zuverlässig mit Enter oder Leertaste ausgelöst werden.
document.addEventListener('keydown', function(event) {
    if (event.defaultPrevented || (event.key !== 'Enter' && event.key !== ' ')) return;
    const button = event.target.closest('button');
    if (!button || button.disabled) return;

    event.preventDefault();
    button.click();
});

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
applyLanguage(currentLanguage);
loadFromLocalStorage();
switchView(currentView);
updateMarkAllDoneVisibility();
