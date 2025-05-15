// Kulcs a localStorage-hoz
const STORAGE_KEY = 'taskManagerTasks';

// Globális feladat tömb
let tasks = [];

// Elemszelekciók
const columns = document.querySelectorAll('.column');
const modal = document.getElementById('modal');
const closeModalBtn = document.querySelector('.close-button');
const taskForm = document.getElementById('task-form');
const taskIdInput = document.getElementById('task-id');
const taskStatusInput = document.getElementById('task-status');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');

// Betöltéskor: lokálisan tárolt adatok betöltése
window.addEventListener('load', () => {
  const storedTasks = localStorage.getItem(STORAGE_KEY);
  if (storedTasks) {
    tasks = JSON.parse(storedTasks);
  }
  renderTasks();
});

// Feladatok mentése a localStorage-ba
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Feladat renderelése az oszlopokba
function renderTasks() {
  // Minden oszlop üritése
  columns.forEach(column => {
    const taskList = column.querySelector('.task-list');
    taskList.innerHTML = '';
  });
  
  // Minden feladathoz létrehozunk egy dobozt
  tasks.forEach(task => {
    const taskEl = document.createElement('div');
    taskEl.classList.add('task');
    taskEl.setAttribute('draggable', 'true');
    taskEl.dataset.id = task.id;
    taskEl.innerHTML = `<strong>${task.title}</strong><br><small>${task.desc || ''}</small>`;
    
    // Drag események
    taskEl.addEventListener('dragstart', dragStart);
    taskEl.addEventListener('dragend', dragEnd);
    
    // Dupla kattintás szerkesztéshez
    taskEl.addEventListener('dblclick', () => openModal(task));
    
    // Hozzáadás a megfelelő oszlophoz
    const columnEl = document.querySelector(`.column[data-status="${task.status}"] .task-list`);
    if (columnEl) {
      columnEl.appendChild(taskEl);
    }
  });
}

// Drag események kezelése
let draggedTaskId = null;
function dragStart(e) {
  draggedTaskId = e.target.dataset.id;
  e.target.classList.add('dragging');
}
function dragEnd(e) {
  e.target.classList.remove('dragging');
}

// Oszlop drop események
columns.forEach(column => {
  const taskList = column.querySelector('.task-list');
  taskList.addEventListener('dragover', (e) => {
    e.preventDefault();
    taskList.classList.add('dragover');
  });
  taskList.addEventListener('dragleave', () => {
    taskList.classList.remove('dragover');
  });
  taskList.addEventListener('drop', (e) => {
    e.preventDefault();
    taskList.classList.remove('dragover');
    if (draggedTaskId) {
      // Frissítjük a feladat státuszát az adott oszlop szerint
      const newStatus = column.dataset.status;
      tasks = tasks.map(task => {
        if (task.id === draggedTaskId) {
          return { ...task, status: newStatus, updatedAt: Date.now() };
        }
        return task;
      });
      saveTasks();
      renderTasks();
      draggedTaskId = null;
    }
  });
});

// Új feladat gombok kezelése
document.querySelectorAll('.add-task').forEach(button => {
  button.addEventListener('click', () => {
    openModal({
      id: '',
      title: '',
      desc: '',
      status: button.dataset.status
    });
  });
});

// Modal megjelenítése (új feladat, szerkesztés)
function openModal(task) {
  taskIdInput.value = task.id;      // üres, ha újat adunk hozzá
  taskTitleInput.value = task.title;
  taskDescInput.value = task.desc;
  taskStatusInput.value = task.status;
  modal.classList.remove('hidden');
}

// Modal bezárása
function closeModal() {
  modal.classList.add('hidden');
  taskForm.reset();
}
closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Feladat űrlap beküldése
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = taskIdInput.value || generateId();
  const title = taskTitleInput.value.trim();
  const desc = taskDescInput.value.trim();
  const status = taskStatusInput.value;
  
  // Ha már létezik, frissítjük
  const existingIndex = tasks.findIndex(task => task.id === id);
  if (existingIndex > -1) {
    tasks[existingIndex] = { ...tasks[existingIndex], title, desc, updatedAt: Date.now() };
  } else {  // egyébként új feladatot adunk hozzá
    tasks.push({
      id,
      title,
      desc,
      status,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
  saveTasks();
  renderTasks();
  closeModal();
});

// Egyedi azonosító generálása
function generateId() {
  return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}
