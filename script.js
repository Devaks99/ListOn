// script.js

document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskContainer = document.getElementById('task-container');
    const calendarContainer = document.getElementById('calendar-container');
  
    // Elementos do Modal de Erro
    const errorModal = document.getElementById('error-modal');
    const errorMessage = document.getElementById('error-message');
    const closeErrorBtn = document.querySelector('.close-error-btn');
  
    // Elementos do Modal de Visualização de Tarefa
    const viewTaskModal = document.getElementById('view-task-modal');
    const viewTaskText = document.getElementById('view-task-text');
    const closeViewTaskBtn = document.querySelector('.close-view-task-btn');
    const deleteTaskBtn = document.getElementById('delete-task-btn');
    let selectedEvent = null; // Referência ao evento selecionado no calendário
  
    // Elementos do Modal
    const modal = document.getElementById('task-modal');
    const modalTaskInput = document.getElementById('modal-task-input');
    const saveTaskBtn = document.getElementById('save-task-btn');
    const closeModalBtn = document.querySelector('.close-btn');
    let selectedDate = null; // Data selecionada no calendário
  
    // Inicializa o calendário usando FullCalendar
    const calendar = new FullCalendar.Calendar(calendarContainer, {
      initialView: 'dayGridMonth',
      locale: 'pt-br', // Configuração para idioma português
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: loadCalendarTasks(), // Carrega tarefas do calendário do localStorage
      editable: true,
      selectable: true,
      
      // Ao clicar em uma data, exibe o modal para adicionar tarefa
      dateClick: function(info) {
        selectedDate = info.dateStr;
        openModal();
      },
      
      // Ao clicar em um evento, exibe o modal de visualização
      eventClick: function(info) {
        selectedEvent = info.event;
        openViewTaskModal(info.event.title);
      }
    });
  
    calendar.render();
  
    // Carrega tarefas manuais e do calendário ao inicializar a página
    loadManualTasks();
  
    // Função para abrir o modal
    function openModal() {
      modal.style.display = 'flex';
      modalTaskInput.value = ''; // Limpa o campo de entrada do modal
      modalTaskInput.focus();
    }
  
    // Função para fechar o modal
    function closeModal() {
      modal.style.display = 'none';
    }
  
    // Evento de fechar o modal
    closeModalBtn.addEventListener('click', closeModal);
  
    // Fecha o modal se clicar fora dele
    window.addEventListener('click', (event) => {
      if (event.target == modal) {
        closeModal();
      } else if (event.target == errorModal) {
        closeErrorModal();
      } else if (event.target == viewTaskModal) {
        closeViewTaskModal();
      }
    });
  
    // Função para abrir o modal de erro com uma mensagem específica
    function openErrorModal(message) {
      errorMessage.textContent = message;
      errorModal.style.display = 'flex';
    }
  
    // Função para fechar o modal de erro
    function closeErrorModal() {
      errorModal.style.display = 'none';
    }
  
    // Evento de fechar o modal de erro
    closeErrorBtn.addEventListener('click', closeErrorModal);
  
    // Salva a tarefa do modal apenas para o calendário
    saveTaskBtn.addEventListener('click', saveCalendarTask);
  
    // Permite salvar a tarefa do modal com a tecla "Enter"
    modalTaskInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        saveCalendarTask();
      }
    });
  
    // Função para salvar a tarefa do calendário
    function saveCalendarTask() {
      const taskText = modalTaskInput.value.trim();
      if (!taskText) {
        // Exibe mensagem de erro se o campo estiver vazio
        openErrorModal('Por favor, digite uma tarefa antes de salvar.');
      } else if (selectedDate) {
        addEventToCalendar(taskText, selectedDate);
        closeModal();
      }
    }
  
    // Função para abrir o modal de visualização de tarefa
    function openViewTaskModal(taskText) {
      viewTaskText.textContent = taskText;
      viewTaskModal.style.display = 'flex';
    }
  
    // Função para fechar o modal de visualização de tarefa
    function closeViewTaskModal() {
      viewTaskModal.style.display = 'none';
    }
  
    // Evento de fechar o modal de visualização
    closeViewTaskBtn.addEventListener('click', closeViewTaskModal);
  
    // Evento para excluir a tarefa do calendário
    deleteTaskBtn.addEventListener('click', () => {
      if (selectedEvent) {
        selectedEvent.remove(); // Remove o evento do calendário
        deleteCalendarTask(selectedEvent); // Remove do localStorage
        closeViewTaskModal(); // Fecha o modal após a exclusão
      }
    });
  
    // Adiciona uma nova tarefa manual à lista
    addTaskBtn.addEventListener('click', addManualTaskHandler);
  
    // Permite adicionar uma nova tarefa manual com a tecla "Enter"
    taskInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        addManualTaskHandler();
      }
    });
  
    // Função para gerenciar a adição de tarefas manuais
    function addManualTaskHandler() {
      const taskText = taskInput.value.trim();
  
      if (!taskText) {
        // Exibe mensagem de erro se o campo estiver vazio
        openErrorModal('Por favor, digite uma tarefa antes de adicionar.');
      } else {
        addManualTask(taskText);
        taskInput.value = ''; // Limpa o campo de entrada
        saveManualTasks(); // Salva no localStorage
      }
    }
  

  // script.js - Ajuste para salvar apenas o estado de conclusão no localStorage

// Função para adicionar uma tarefa manual
function addManualTask(text, index = null) {
    const taskItem = document.createElement('li');
  
    // Cria elementos de tarefa manual
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('task-checkbox');
    checkbox.dataset.index = index !== null ? index : taskContainer.children.length; // Define o índice do checkbox
  
    const taskLabel = document.createElement('span');
    taskLabel.textContent = text;
    taskLabel.classList.add('task-label');
  
    // Carregar o estado de conclusão da tarefa do localStorage
    const taskStatus = localStorage.getItem(`task-${checkbox.dataset.index}`);
    if (taskStatus === 'completed') {
      checkbox.checked = true;
      taskLabel.classList.add('completed');
    }
  
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Ícone de lixeira
    deleteBtn.classList.add('delete-btn');
  
    // Evento de marcar tarefa como concluída diretamente pelo checkbox
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        taskLabel.classList.add('completed');
        localStorage.setItem(`task-${checkbox.dataset.index}`, 'completed');
      } else {
        taskLabel.classList.remove('completed');
        localStorage.removeItem(`task-${checkbox.dataset.index}`);
      }
    });
  
    // Evento de remover tarefa manual
    deleteBtn.addEventListener('click', () => {
      taskItem.remove();
      localStorage.removeItem(`task-${checkbox.dataset.index}`); // Remove o estado do localStorage
    });
  
    // Adiciona elementos ao item da lista
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskLabel);
    taskItem.appendChild(deleteBtn);
    taskContainer.appendChild(taskItem);
  }
      
  
    // Adiciona evento ao calendário
    function addEventToCalendar(task, date) {
      const newEvent = calendar.addEvent({
        title: task,
        start: date,
        allDay: true
      });
      saveCalendarTasks(); // Salva no localStorage
    }
  
    // Função para salvar tarefas manuais no localStorage
    function saveManualTasks() {
      const tasks = [];
      taskContainer.querySelectorAll('li').forEach((item) => {
        tasks.push(item.querySelector('.task-label').textContent);
      });
      localStorage.setItem('manualTasks', JSON.stringify(tasks));
    }
  
    // Função para carregar tarefas manuais do localStorage
    function loadManualTasks() {
      const tasks = JSON.parse(localStorage.getItem('manualTasks')) || [];
      tasks.forEach((task) => addManualTask(task));
    }
  
    // Função para salvar tarefas do calendário no localStorage
    function saveCalendarTasks() {
      const events = calendar.getEvents().map((event) => ({
        title: event.title,
        start: event.startStr
      }));
      localStorage.setItem('calendarTasks', JSON.stringify(events));
    }
  
    // Função para carregar tarefas do calendário do localStorage
    function loadCalendarTasks() {
      const events = JSON.parse(localStorage.getItem('calendarTasks')) || [];
      return events.map((event) => ({
        title: event.title,
        start: event.start,
        allDay: true
      }));
    }
  
    // Função para excluir tarefas do calendário do localStorage
    function deleteCalendarTask(event) {
      const events = calendar.getEvents().filter((e) => e !== event).map((e) => ({
        title: e.title,
        start: e.startStr
      }));
      localStorage.setItem('calendarTasks', JSON.stringify(events));
    }
  });







