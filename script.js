document.addEventListener('DOMContentLoaded', () => {
  
  const notesContainer = document.querySelector('.notes-container');
  const noteEditorContainer = document.getElementById('note-editor-container');
  const trashContainer = document.getElementById('trash-container');

  
  const addBtn = document.getElementById('addBtn');
  const itemInput = document.getElementById('itemInput');
  const editBtn = document.getElementById('editBtn');
  const addOptionsMenu = document.getElementById('addOptionsMenu');
  const createNoteBtn = document.getElementById('createNoteBtn');
  const createFolderBtn = document.getElementById('createFolderBtn');
  const contentGrid = document.getElementById('contentGrid');
  const backBtnMain = document.getElementById('backBtnMain');
  const currentFolderName = document.getElementById('currentFolderName');
  const editActions = document.getElementById('editActions');
  const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');

  
  const configBtn = document.getElementById('configBtn');
  const configMenu = document.getElementById('configMenu');
  const openTrashBtn = document.getElementById('openTrashBtn');

  
  const trashList = document.getElementById('trashList');
  const backBtnTrash = document.getElementById('backBtnTrash');
  const deleteFromTrashBtn = document.getElementById('deleteFromTrashBtn');
  const restoreSelectedBtn = document.getElementById('restoreSelectedBtn');
  const trashActions = document.getElementById('trashActions');

  
  const backBtnEditor = document.getElementById('backBtnEditor');
  const noteTitle = document.getElementById('noteTitle');
  const noteContent = document.getElementById('noteContent');
  const charCounter = document.getElementById('charCounter');

  
  const customConfirm = document.getElementById('customConfirm');
  const confirmDeleteBtn = document.getElementById('confirmDelete');
  const cancelDeleteBtn = document.getElementById('cancelDelete');
  const closeButton = document.querySelector('.close-button');
  const modalSubtext = document.getElementById('modalSubtext');
  const modalText = document.getElementById('modalText');

  
  let db;
  let currentFolderId = 'root';
  let navigationStack = ['root'];
  let editMode = false;
  let currentNoteId = null;
  let actionToConfirm = null;

  
  const saveData = () => {
    localStorage.setItem('notesAppDB', JSON.stringify(db));
  };

  const loadData = () => {
    const data = localStorage.getItem('notesAppDB');
    if (data) {
      db = JSON.parse(data);
      if (!db.trash) {
        db.trash = { id: 'trash', type: 'folder', title: 'Lixeira', items: [], modifiedAt: new Date().toISOString() };
      }
    } else {
      db = {
        root: {
          id: 'root',
          type: 'folder',
          title: 'Bloco de Notas',
          items: [],
          modifiedAt: new Date().toISOString()
        },
        trash: {
          id: 'trash',
          type: 'folder',
          title: 'Lixeira',
          items: [],
          modifiedAt: new Date().toISOString()
        }
      };
      saveData();
    }
  };

  
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit'
    });
  };

  const generateId = () => 'item_' + Date.now() + Math.random().toString(36).substr(2, 9);

  const findParentFolder = (childId, folderId = 'root') => {
    const folder = db[folderId];
    if (!folder || !folder.items) return null;
    if (folder.items.includes(childId)) {
      return folder;
    }
    for (const itemId of folder.items) {
      const item = db[itemId];
      if (item && item.type === 'folder') {
        const found = findParentFolder(childId, itemId);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  
  const renderCurrentFolder = () => {
    const folder = db[currentFolderId];
    currentFolderName.textContent = folder.title;
    contentGrid.innerHTML = '';
    const items = folder.items || [];
    const sortedItems = items.map(id => db[id]).filter(Boolean).sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return new Date(b.modifiedAt) - new Date(a.modifiedAt);
    });

    sortedItems.forEach(item => {
      const block = document.createElement('div');
      block.className = 'item-block';
      block.dataset.id = item.id;
      let previewText = '';
      if (item.type === 'note') {
        previewText = item.content ? item.content.replace(/<[^>]*>/g, ' ') : "Nota vazia";
      } else {
        const itemCount = item.items ? item.items.length : 0;
        if (itemCount === 0) previewText = "Pasta vazia";
        else if (itemCount === 1) previewText = "1 item na pasta";
        else previewText = `${itemCount} itens na pasta`;
      }
      block.innerHTML = `
        <input type="checkbox" class="item-checkbox" data-id="${item.id}">
        <h3>${item.title}</h3><hr>
        <p class="preview">${previewText}</p>
        <span class="timestamp">${formatDate(item.modifiedAt)}</span>`;
      contentGrid.appendChild(block);
    });
    backBtnMain.classList.toggle('hidden', navigationStack.length <= 1);
  };

  const renderTrash = () => {
    trashList.innerHTML = '';
    const items = (db.trash.items || []).map(id => db[id]).filter(Boolean);
    if (items.length === 0) {
      trashList.innerHTML = "<p style='text-align:center;color:#888'>Lixeira vazia</p>";
      trashActions.classList.add('hidden');
      restoreSelectedBtn.classList.add('hidden');
      deleteFromTrashBtn.classList.add('hidden');
      return;
    }
    trashActions.classList.remove('hidden');
    restoreSelectedBtn.classList.remove('hidden');
    deleteFromTrashBtn.classList.remove('hidden');
    items.forEach(item => {
      const block = document.createElement('div');
      block.className = 'item-block';
      block.dataset.id = item.id;
      const previewText = item.type === 'note' ? (item.content || '').replace(/<[^>]*>/g, ' ') : `${item.items?.length || 0} itens`;
      block.innerHTML = `
        <input type="checkbox" class="trash-checkbox" data-id="${item.id}">
        <h3>${item.title}</h3><hr>
        <p class="preview">${previewText}</p>
        <span class="timestamp">${formatDate(item.deletedAt || item.modifiedAt)}</span>`;
      trashList.appendChild(block);
    });
  };

  
  const showMainScreen = () => {
    noteEditorContainer.classList.add('hidden');
    trashContainer.classList.add('hidden');
    notesContainer.classList.remove('hidden');
    renderCurrentFolder();

    
    deleteFromTrashBtn.classList.add('hidden');
    restoreSelectedBtn.classList.add('hidden');
    trashActions.classList.add('hidden');
  };

  const showEditorScreen = (noteId) => {
    currentNoteId = noteId;
    const note = db[noteId];
    noteTitle.textContent = note.title;
    noteContent.innerHTML = note.content;
    updateCharCounter();
    notesContainer.classList.add('hidden');
    noteEditorContainer.classList.remove('hidden');
  };

  const showTrashScreen = () => {
    notesContainer.classList.add('hidden');
    trashContainer.classList.remove('hidden');
    renderTrash();

    
    deleteFromTrashBtn.classList.remove('hidden');
    restoreSelectedBtn.classList.remove('hidden');
    trashActions.classList.remove('hidden');
  };

  
  const moveToTrash = (ids) => {
    ids.forEach(id => {
      const parent = findParentFolder(id);
      if (parent) {
        parent.items = parent.items.filter(itemId => itemId !== id);
      }
      if (!db.trash.items.includes(id)) {
        db.trash.items.push(id);
        if (db[id]) db[id].deletedAt = new Date().toISOString();
      }
    });
    saveData();
    renderCurrentFolder();
  };

  const restoreItems = (ids) => {
    ids.forEach(id => {
      db.trash.items = db.trash.items.filter(itemId => itemId !== id);
      db.root.items.push(id); 
    });
    saveData();
    renderTrash(); 
  };

  const deletePermanently = (ids) => {
    ids.forEach(id => {
      db.trash.items = db.trash.items.filter(itemId => itemId !== id);
      const item = db[id];
      if (item && item.type === 'folder' && item.items) {
        
        deletePermanently([...item.items]);
      }
      delete db[id];
    });
    saveData();
    renderTrash();
  };

  
const showConfirmationDialog = (ids) => {
  actionToConfirm = () => moveToTrash(ids); // define a ação
  modalSubtext.textContent =
    ids.length === 1
      ? "O item vai ser movido para a lixeira."
      : `Os ${ids.length} itens vão ser movidos para a lixeira.`;
  customConfirm.style.display = "block";
};

  const hideConfirmationDialog = () => {
    customConfirm.style.display = 'none';
    actionToConfirm = null;
  };

  confirmDeleteBtn.addEventListener('click', () => {
    if (actionToConfirm) {
      actionToConfirm();
    }
    hideConfirmationDialog();
  });

  cancelDeleteBtn.addEventListener('click', hideConfirmationDialog);
  closeButton.addEventListener('click', hideConfirmationDialog);

  
  contentGrid.addEventListener('click', (e) => {
    const block = e.target.closest('.item-block');
    if (!block) return;
    const id = block.dataset.id;
    if (editMode) {
      if (e.target.tagName === 'H3') {
        const titleElement = e.target;
        const originalTitle = db[id].title;
        titleElement.setAttribute('contenteditable', 'true');
        titleElement.focus();
        document.execCommand('selectAll', false, null);

        const saveChanges = () => {
          titleElement.setAttribute('contenteditable', 'false');
          const newTitle = titleElement.textContent.trim();
          if (newTitle && newTitle !== originalTitle) {
            db[id].title = newTitle;
            db[id].modifiedAt = new Date().toISOString();
            saveData();
          } else {
            titleElement.textContent = originalTitle;
          }
          titleElement.removeEventListener('blur', saveChanges);
          titleElement.removeEventListener('keydown', handleKeydown);
        };
        const handleKeydown = (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            saveChanges();
          } else if (event.key === 'Escape') {
            titleElement.textContent = originalTitle;
            saveChanges();
          }
        };
        titleElement.addEventListener('blur', saveChanges);
        titleElement.addEventListener('keydown', handleKeydown);
      }
    } else {
      const item = db[id];
      if (item.type === 'folder') {
        navigationStack.push(id);
        currentFolderId = id;
        renderCurrentFolder();
      } else {
        showEditorScreen(id);
      }
    }
  });

  backBtnMain.addEventListener('click', () => {
    if (navigationStack.length > 1) {
      navigationStack.pop();
      currentFolderId = navigationStack[navigationStack.length - 1];
      renderCurrentFolder();
    }
  });

  createFolderBtn.addEventListener('click', () => {
    const title = itemInput.value.trim();
    if (!title) return alert("Digite o titulo");
    const id = generateId();
    db[id] = { id, type: 'folder', title, items: [], modifiedAt: new Date().toISOString() };
    db[currentFolderId].items.push(id);
    saveData();
    navigationStack.push(id);
    currentFolderId = id;
    renderCurrentFolder();
    itemInput.value = "";
    addOptionsMenu.classList.add('hidden');
  });

  createNoteBtn.addEventListener('click', () => {
    const title = itemInput.value.trim() || 'Nova Nota';
    const id = generateId();
    db[id] = { id, type: 'note', title, content: '', modifiedAt: new Date().toISOString() };
    db[currentFolderId].items.push(id);
    saveData();
    renderCurrentFolder();
    itemInput.value = "";
    addOptionsMenu.classList.add('hidden');
    showEditorScreen(id);
  });

  backBtnEditor.addEventListener('click', () => {
    const note = db[currentNoteId];
    if (note) {
      note.title = noteTitle.textContent.trim() || "Sem Título";
      note.content = noteContent.innerHTML;
      note.modifiedAt = new Date().toISOString();
      saveData();
    }
    showMainScreen();
  });

  editBtn.addEventListener('click', () => {
    editMode = !editMode;
    document.body.classList.toggle('edit-mode', editMode);
    editActions.classList.toggle('hidden', !editMode);
    editBtn.textContent = editMode ? '✔️' : '✏️';
    if (!editMode) {
      document.querySelectorAll('.item-checkbox:checked').forEach(cb => cb.checked = false);
    }
  });

  
  deleteSelectedBtn.addEventListener('click', () => {
    const selectedIds = Array.from(document.querySelectorAll('.item-checkbox:checked')).map(cb => cb.dataset.id);
    if (selectedIds.length > 0) {
      showConfirmationDialog(selectedIds);
    } else {
      alert('Selecione pelo menos um item');
    }
  });

  
  restoreSelectedBtn.addEventListener('click', () => {
    const selectedIds = Array.from(document.querySelectorAll('.trash-checkbox:checked')).map(cb => cb.dataset.id);
    if (selectedIds.length > 0) {
      restoreItems(selectedIds);
    } else {
      alert("Selecione itens para restaurar.");
    }
  });

  
  deleteFromTrashBtn.addEventListener('click', () => {
    const selectedIds = Array.from(document.querySelectorAll('.trash-checkbox:checked')).map(cb => cb.dataset.id);
    if (selectedIds.length > 0) {
      deletePermanently(selectedIds);
    } else {
      alert("Selecione itens para excluir permanentemente.");
    }
  });

  configBtn.addEventListener('click', (e) => { e.stopPropagation(); configMenu.classList.toggle('hidden'); });
  openTrashBtn.addEventListener('click', () => { configMenu.classList.add('hidden'); showTrashScreen(); });
  backBtnTrash.addEventListener('click', showMainScreen);
  addBtn.addEventListener('click', (e) => { e.stopPropagation(); addOptionsMenu.classList.toggle('hidden'); });
  noteContent.addEventListener('input', updateCharCounter);
  function updateCharCounter() { charCounter.textContent = `Caracteres: ${noteContent.textContent.length}`; }

  window.addEventListener('click', (e) => {
    if (!addBtn.closest('.menu-container').contains(e.target)) addOptionsMenu.classList.add('hidden');
    if (!configBtn.closest('.menu-container').contains(e.target)) configMenu.classList.add('hidden');
  });

  
  loadData();
  showMainScreen();
});