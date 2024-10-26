document.addEventListener('DOMContentLoaded', () => {
  const taskInput = document.getElementById('new-task');
  const addTaskBtn = document.getElementById('add-task-btn');
  const taskContainer = document.getElementById('task-container');
  const calendarContainer = document.getElementById('calendar-container');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');

  // Elementos para Exportar e Importar Tarefas
  const exportTasksBtn = document.getElementById('export-tasks-btn');
  const importTasksBtn = document.getElementById('import-tasks-btn');
  const importTasksInput = document.getElementById('import-tasks-input');

  // Elementos do Modal de Erro
  const errorModal = document.getElementById('error-modal');
  const errorMessage = document.getElementById('error-message');
  const closeErrorBtn = document.querySelector('.close-error-btn');

  // Elementos do Modal de Visualização de Tarefa
  const viewTaskModal = document.getElementById('view-task-modal');
  const viewTaskText = document.getElementById('view-task-text');
  const closeViewTaskBtn = document.querySelector('.close-view-task-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');
  let selectedEvent = null;

  // Elementos do Modal
  const modal = document.getElementById('task-modal');
  const modalTaskInput = document.getElementById('modal-task-input');
  const saveTaskBtn = document.getElementById('save-task-btn');
  const closeModalBtn = document.querySelector('.close-btn');
  let selectedDate = null;

  // Inicializa o calendário usando FullCalendar
  const calendar = new FullCalendar.Calendar(calendarContainer, {
    initialView: 'dayGridMonth',
    locale: 'pt-br',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: loadCalendarTasks(),
    editable: true,
    selectable: true,
    
    dateClick: function(info) {
      selectedDate = info.dateStr;
      openModal();
    },
    
    eventClick: function(info) {
      selectedEvent = info.event;
      openViewTaskModal(info.event.title);
    }
  });

  calendar.render();
  loadManualTasks();

  // Função para abrir o modal com animação
  function openModal() {
    modal.classList.remove('modal-close');
    modal.classList.add('modal-open');
    modalTaskInput.value = ''; // Limpa o campo de entrada do modal
    modalTaskInput.focus();
  }

  // Função para fechar o modal com animação
  function closeModal() {
    modal.classList.remove('modal-open');
    modal.classList.add('modal-close');
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

  // Função para adicionar uma tarefa manual com animação
  function addManualTask(text, index = null) {
    if (!text || text === 'ded') return; // Evita adicionar tarefas inválidas

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

    // Evento de remover tarefa manual com animação
    deleteBtn.addEventListener('click', () => {
      taskItem.classList.add('removed'); // Adiciona classe para animação de remoção
      setTimeout(() => {
        taskItem.remove();
        removeManualTaskFromStorage(text); // Remove a tarefa do localStorage
        updateNoTasksMessage(); // Atualiza a mensagem após remover
      }, 500); // Delay para a animação
    });

    // Adiciona elementos ao item da lista
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskLabel);
    taskItem.appendChild(deleteBtn);
    taskContainer.appendChild(taskItem);

    updateNoTasksMessage(); // Atualiza a mensagem ao adicionar uma nova tarefa
  }

  // Função para salvar tarefas manuais no localStorage
  function saveManualTasks() {
    const tasks = [];
    taskContainer.querySelectorAll('li').forEach((item) => {
      const taskText = item.querySelector('.task-label').textContent;
      if (taskText && taskText !== 'ded') {
        tasks.push(taskText);
      }
    });
    localStorage.setItem('manualTasks', JSON.stringify(tasks));
  }

  // Função para remover uma tarefa do localStorage
  function removeManualTaskFromStorage(taskText) {
    const tasks = JSON.parse(localStorage.getItem('manualTasks')) || [];
    const updatedTasks = tasks.filter((task) => task !== taskText);
    localStorage.setItem('manualTasks', JSON.stringify(updatedTasks));
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

  // Função para alternar tema claro/escuro
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDarkMode = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // Alterar ícone do botão conforme o tema
    themeToggleBtn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });

  // Carregar tema ao inicializar a página
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
  }

  // Evento para Exportar Tarefas
  exportTasksBtn.addEventListener('click', () => {
    const tasks = JSON.parse(localStorage.getItem('manualTasks')) || [];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tarefas.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  });

  // Evento para Importar Tarefas
  importTasksBtn.addEventListener('click', () => {
    importTasksInput.click();
  });

  // Função para Ler Arquivo de Importação
  importTasksInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const importedTasks = JSON.parse(e.target.result);
          if (Array.isArray(importedTasks)) {
            importedTasks.forEach(task => addManualTask(task));
            saveManualTasks();
          } else {
            openErrorModal('O arquivo não está no formato correto.');
          }
        } catch (error) {
          openErrorModal('Erro ao ler o arquivo. Verifique se é um arquivo JSON válido.');
        }
      };
      reader.readAsText(file);
    }
  });

  // Atualização para fechar o modal de erro
  closeErrorBtn.addEventListener('click', closeErrorModal);
});
