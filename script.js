document.addEventListener('DOMContentLoaded', () => {
  
  // SELEÇÃO DE ELEMENTOS

  const notesContainer = document.querySelector('.notes-container');
  const noteEditorContainer = document.getElementById('note-editor-container');
  const trashContainer = document.getElementById('trash-container');
  const colorContainer = document.getElementById('color-container');
  const customThemeContainer = document.getElementById('custom-theme-container');

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
  const openColorBtn = document.getElementById('openColorBtn');

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
  
  const backBtnColor = document.getElementById('backBtnColor');
  const colorList = document.getElementById('colorList');

  const backBtnCustomTheme = document.getElementById('backBtnCustomTheme');
  const saveCustomThemeBtn = document.getElementById('saveCustomThemeBtn');
  const customizationSections = document.querySelectorAll('.customization-section');

  // ESTADO DO APLICATIVO

  let db;
  let currentFolderId = 'root';
  let navigationStack = ['root'];
  let editMode = false;
  let currentNoteId = null;
  let actionToConfirm = null;

  // LOGICA DE TEMAS E CORES

  const colorPalette = {
    'Vermelho Claro': '#f8d7da',
    'Laranja Claro': '#ffe0b2',
    'Amarelo Claro': '#fff9c4',
    'Verde Claro': '#d0f0d0',
    'Azul Claro': '#cfe8fc',
    'Roxo Claro': '#e1d7f5',
    'Rosa Claro': '#f9d6e2',
    'Bege Claro': '#dec7af',
    'Branco': '#ffffff',
    'Vermelho Médio': '#d46a6a',
    'Laranja Médio': '#e6955c',
    'Amarelo Médio': '#e6d96a',
    'Verde Médio': '#6ca96c',
    'Azul Médio': '#5a8fd6',
    'Roxo Médio': '#9b6fcf',
    'Rosa Médio': '#d66c91',
    'Bege Médio': '#c4a484',
    'Cinza': '#9e9e9e',
    'Vermelho Escuro': '#6b2d2d',
    'Laranja Escuro': '#6e3b1f',
    'Amarelo Escuro': '#6e6422',
    'Verde Escuro': '#2f4f2f',
    'Azul Escuro': '#34375c',
    'Roxo Escuro': '#3b2b4a',
    'Rosa Escuro': '#5a2c3e',
    'Bege Escuro': '#5c4033',
    'Preto': '#2a2a2b',
  };
  
  const themes = {
    'Default': { '--main-bg-color': '#f9f9f9', '--container-bg-color': '#ffffff', '--primary-text-color': '#000000', '--secondary-text-color': 'rgba(0,0,0,0.7)', '--border-color': 'rgba(0,0,0,0.1)', '--placeholder-color': 'rgba(0,0,0,0.5)', '--accent-color': '#6d6d6d' },
    'Dark': { '--main-bg-color': '#282c34', '--container-bg-color': '#353b45', '--primary-text-color': '#f0f0f0', '--secondary-text-color': 'rgba(240,240,240,0.7)', '--border-color': 'rgba(240,240,240,0.2)', '--placeholder-color': 'rgba(240,240,240,0.5)', '--accent-color': '#61afef' },
    'Ocean': { '--main-bg-color': '#e0f7fa', '--container-bg-color': '#ffffff', '--primary-text-color': '#004d40', '--secondary-text-color': 'rgba(0,77,64,0.7)', '--border-color': 'rgba(0,77,64,0.2)', '--placeholder-color': 'rgba(0,77,64,0.5)', '--accent-color': '#009688' },
    'Forest': { '--main-bg-color': '#c8e6c9', '--container-bg-color': '#e8f5e9', '--primary-text-color': '#1b5e20', '--secondary-text-color': 'rgba(27,94,32,0.7)', '--border-color': 'rgba(27,94,32,0.2)', '--placeholder-color': 'rgba(27,94,32,0.5)', '--accent-color': '#4caf50' },
    'Yogurt': { '--main-bg-color': '#fce4ec', '--container-bg-color': '#ffffff', '--primary-text-color': '#880e4f', '--secondary-text-color': 'rgba(136,14,79,0.7)', '--border-color': 'rgba(136,14,79,0.2)', '--placeholder-color': 'rgba(136,14,79,0.5)', '--accent-color': '#e91e63' },
    'Grape': { '--main-bg-color': '#ede7f6', '--container-bg-color': '#ffffff', '--primary-text-color': '#4527a0', '--secondary-text-color': 'rgba(69,39,160,0.7)', '--border-color': 'rgba(69,39,160,0.2)', '--placeholder-color': 'rgba(69,39,160,0.5)', '--accent-color': '#673ab7' },
    'Sunset': { '--main-bg-color': '#fff3e0', '--container-bg-color': '#ffffff', '--primary-text-color': '#e65100', '--secondary-text-color': 'rgba(230,81,0,0.7)', '--border-color': 'rgba(230,81,0,0.2)', '--placeholder-color': 'rgba(230,81,0,0.5)', '--accent-color': '#ff9800' },
  };

  const hexToRgba = (hex, alpha = 1) => {
    if (!hex.startsWith('#')) return hex;
    const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const applyThemeObject = (themeObj) => {
    if (!themeObj) return;
    Object.keys(themeObj).forEach(key => {
      document.documentElement.style.setProperty(key, themeObj[key]);
    });
  };

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (!theme) return;
    applyThemeObject(theme);
    localStorage.setItem('notesAppTheme', themeName);
    updateActiveThemeUI(themeName);
  };

  const loadTheme = () => {
    const savedThemeName = localStorage.getItem('notesAppTheme') || 'Padrão';
    if (savedThemeName === 'Custom') {
      const customThemeJSON = localStorage.getItem('notesAppCustomTheme');
      if (customThemeJSON) {
        applyThemeObject(JSON.parse(customThemeJSON));
        updateActiveThemeUI('Custom');
      } else {
        applyTheme('Padrão');
      }
    } else {
      applyTheme(savedThemeName);
    }
  };
  
  const updateActiveThemeUI = (themeName) => {
    document.querySelectorAll('.color-option').forEach(option => {
      option.classList.toggle('active', option.dataset.theme === themeName);
    });
  };
  
  const populateColorOptions = () => {
    colorList.innerHTML = '';
    Object.keys(themes).forEach(name => {
      const option = document.createElement('div');
      option.className = 'color-option';
      option.dataset.theme = name;
      option.innerHTML = `
        <div class="color-preview">
          <span class="color-swatch" style="background-color: ${themes[name]['--main-bg-color']};"></span>
          <span class="color-swatch" style="background-color: ${themes[name]['--container-bg-color']};"></span>
          <span class="color-swatch" style="background-color: ${themes[name]['--accent-color']};"></span>
        </div>
        <span class="theme-name">${name}</span>`;
      option.addEventListener('click', () => applyTheme(name));
      colorList.appendChild(option);
    });

    const customOption = document.createElement('div');
    customOption.className = 'color-option';
    customOption.dataset.theme = 'Custom';
    customOption.innerHTML = `<div class="theme-name">🔧 Personalizar</div>`;
    customOption.addEventListener('click', showCustomThemeScreen);
    colorList.appendChild(customOption);
  };

  const populateCustomizationPalettes = () => {
    const fragment = document.createDocumentFragment();
    Object.entries(colorPalette).forEach(([name, color]) => {
      const swatch = document.createElement('div');
      swatch.className = 'palette-color-swatch';
      swatch.dataset.color = color;
      swatch.title = name;
      swatch.style.backgroundColor = color;
      fragment.appendChild(swatch);
    });
    customizationSections.forEach(section => {
      section.querySelector('.color-palette-grid').appendChild(fragment.cloneNode(true));
    });
  };

  const handleColorSelection = (e) => {
    if (!e.target.classList.contains('palette-color-swatch')) return;
    const swatch = e.target;
    const section = swatch.closest('.customization-section');
    const color = swatch.dataset.color;
    const targetVar = section.dataset.targetVar;

    section.querySelector('.palette-color-swatch.selected')?.classList.remove('selected');
    swatch.classList.add('selected');

    document.documentElement.style.setProperty(targetVar, color);
    
    if (targetVar === '--primary-text-color') {
      document.documentElement.style.setProperty('--secondary-text-color', hexToRgba(color, 0.7));
      document.documentElement.style.setProperty('--border-color', hexToRgba(color, 0.2));
      document.documentElement.style.setProperty('--placeholder-color', hexToRgba(color, 0.5));
    }
  };

  const saveCustomTheme = () => {
    const customTheme = {};
    customizationSections.forEach(section => {
      const targetVar = section.dataset.targetVar;
      const selectedSwatch = section.querySelector('.palette-color-swatch.selected');
      const color = selectedSwatch ? selectedSwatch.dataset.color : '#000000';
      customTheme[targetVar] = color;
      if (targetVar === '--primary-text-color') {
        customTheme['--secondary-text-color'] = hexToRgba(color, 0.7);
        customTheme['--border-color'] = hexToRgba(color, 0.2);
        customTheme['--placeholder-color'] = hexToRgba(color, 0.5);
      }
    });
    localStorage.setItem('notesAppCustomTheme', JSON.stringify(customTheme));
    localStorage.setItem('notesAppTheme', 'Custom');
    showMainScreen();
  };

  // LOGICA PRINCIPAL
  
  const saveData = () => { localStorage.setItem('notesAppDB', JSON.stringify(db)); };

  const loadData = () => {
    const data = localStorage.getItem('notesAppDB');
    if (data) {
      db = JSON.parse(data);
      if (!db.trash) {
        db.trash = { id: 'trash', type: 'folder', title: 'Lixeira', items: [], modifiedAt: new Date().toISOString() };
      }
    } else {
      db = {
        root: { id: 'root', type: 'folder', title: 'Bloco de Notas', items: [], modifiedAt: new Date().toISOString() },
        trash: { id: 'trash', type: 'folder', title: 'Lixeira', items: [], modifiedAt: new Date().toISOString() }
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
    if (folder.items.includes(childId)) return folder;
    for (const itemId of folder.items) {
      const item = db[itemId];
      if (item && item.type === 'folder') {
        const found = findParentFolder(childId, itemId);
        if (found) return found;
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
      let previewText = item.type === 'note'
        ? (item.content ? item.content.replace(/<[^>]*>/g, ' ') : "Nota vazia")
        : `${item.items?.length || 0} itens`;
      block.innerHTML = `
        <input type="checkbox" class="item-checkbox" data-id="${item.id}">
        <h3>${item.title}</h3>
        <hr>
        <p class="preview">${previewText}</p>
        <span class="timestamp">${formatDate(item.modifiedAt)}</span>`;
      block.addEventListener('click', (e) => {
        if (!editMode && e.target.tagName !== 'INPUT') {
          if (item.type === 'folder') {
            navigationStack.push(item.id);
            currentFolderId = item.id;
            renderCurrentFolder();
          } else if (item.type === 'note') {
            showEditorScreen(item.id);
          }
        }
      });
      contentGrid.appendChild(block);
    });
    backBtnMain.classList.toggle('hidden', navigationStack.length <= 1);
  };

  const renderTrash = () => {
    trashList.innerHTML = '';
    const items = (db.trash.items || []).map(id => db[id]).filter(Boolean);
    if (items.length === 0) {
      trashList.innerHTML = "<p style='text-align:center;color:var(--secondary-text-color)'>Lixeira vazia</p>";
      trashActions.classList.add('hidden');
      restoreSelectedBtn.classList.add('hidden');
      return;
    }
    trashActions.classList.remove('hidden');
    restoreSelectedBtn.classList.remove('hidden');
    items.forEach(item => {
      const block = document.createElement('div');
      block.className = 'item-block';
      block.dataset.id = item.id;
      const previewText = item.type === 'note' ? (item.content || '').replace(/<[^>]*>/g, ' ') : `${item.items?.length || 0} itens`;
      block.innerHTML = `
        <input type="checkbox" class="trash-checkbox" data-id="${item.id}">
        <h3>${item.title}</h3>
        <hr>
        <p class="preview">${previewText}</p>
        <span class="timestamp">${formatDate(item.deletedAt || item.modifiedAt)}</span>`;
      trashList.appendChild(block);
    });
  };

  const showConfirmationDialog = (ids) => {
    actionToConfirm = () => moveToTrash(ids);
    modalSubtext.textContent = ids.length === 1
      ? "O item vai ser movido para a lixeira."
      : `Os ${ids.length} itens vão ser movidos para a lixeira.`;
    customConfirm.style.display = "block";
  };
  
  const hideConfirmationDialog = () => { customConfirm.style.display = 'none'; actionToConfirm = null; };

  const moveToTrash = (ids) => {
    ids.forEach(id => {
      const parent = findParentFolder(id);
      if (parent) {
        parent.items = parent.items.filter(itemId => itemId !== id);
      }
      db.trash.items.push(id);
      db[id].deletedAt = new Date().toISOString();
    });
    saveData();
    renderCurrentFolder();
  };

  const restoreItems = (ids) => {
    ids.forEach(id => {
      db.trash.items = db.trash.items.filter(itemId => itemId !== id);
      db.root.items.push(id);
      delete db[id].deletedAt;
      db[id].modifiedAt = new Date().toISOString();
    });
    saveData();
    renderTrash();
  };

  const deletePermanently = (ids) => {
    ids.forEach(id => {
      db.trash.items = db.trash.items.filter(itemId => itemId !== id);
      delete db[id];
    });
    saveData();
    renderTrash();
  };
  
  // GERENCIAMENTO DE TELAS

  const showMainScreen = () => {
    noteEditorContainer.classList.add('hidden');
    trashContainer.classList.add('hidden');
    colorContainer.classList.add('hidden');
    customThemeContainer.classList.add('hidden');
    notesContainer.classList.remove('hidden');
    renderCurrentFolder();
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
    customThemeContainer.classList.add('hidden');
    trashContainer.classList.remove('hidden');
    renderTrash();
  };

  const showColorScreen = () => {
    notesContainer.classList.add('hidden');
    trashContainer.classList.add('hidden');
    customThemeContainer.classList.add('hidden');
    colorContainer.classList.remove('hidden');
    const savedTheme = localStorage.getItem('notesAppTheme') || 'Padrão';
    updateActiveThemeUI(savedTheme);
  };
  
  const showCustomThemeScreen = () => {
    customizationSections.forEach(section => {
      const targetVar = section.dataset.targetVar;
      const currentColor = getComputedStyle(document.documentElement).getPropertyValue(targetVar).trim();
      section.querySelector('.selected')?.classList.remove('selected');
      const swatches = section.querySelectorAll('.palette-color-swatch');
      let matchingSwatch = Array.from(swatches).find(s => s.dataset.color === currentColor);
      if (matchingSwatch) {
        matchingSwatch.classList.add('selected');
      }
    });
    colorContainer.classList.add('hidden');
    customThemeContainer.classList.remove('hidden');
  };

  function updateCharCounter() { charCounter.textContent = `Caracteres: ${noteContent.textContent.length}`; }

  // EVENT LISTENERS 

  confirmDeleteBtn.addEventListener('click', () => { if (actionToConfirm) actionToConfirm(); hideConfirmationDialog(); });
  cancelDeleteBtn.addEventListener('click', hideConfirmationDialog);
  closeButton.addEventListener('click', hideConfirmationDialog);

  backBtnMain.addEventListener('click', () => {
    if (navigationStack.length > 1) {
      navigationStack.pop();
      currentFolderId = navigationStack[navigationStack.length - 1];
      renderCurrentFolder();
    }
  });

  createFolderBtn.addEventListener('click', () => {
    const title = itemInput.value.trim() || "Nova Pasta";
    const id = generateId();
    db[id] = { id, type: "folder", title, items: [], modifiedAt: new Date().toISOString() };
    db[currentFolderId].items.push(id);
    saveData();
    renderCurrentFolder();
    itemInput.value = "";

    addOptionsMenu.classList.add("hidden");

  navigationStack.push(id);
  currentFolderId = id;
  renderCurrentFolder();
  });

  createNoteBtn.addEventListener('click', () => {
    const title = itemInput.value.trim() || "Nova Nota";
    const id = generateId();
    db[id] = { id, type: "note", title, content: "", modifiedAt: new Date().toISOString() };
    db[currentFolderId].items.push(id);
    saveData();
    renderCurrentFolder();
    itemInput.value = "";
    showEditorScreen(id);
  });

  backBtnEditor.addEventListener('click', () => {
    const note = db[currentNoteId];
    note.title = noteTitle.textContent.trim() || "Nota sem título";
    note.content = noteContent.innerHTML;
    note.modifiedAt = new Date().toISOString();
    saveData();
    showMainScreen();
  });

  editBtn.addEventListener('click', () => {
    editMode = !editMode;
    document.body.classList.toggle("edit-mode", editMode);
    editActions.classList.toggle("hidden", !editMode);
    renderCurrentFolder();
  });

  deleteSelectedBtn.addEventListener('click', () => {
    const selected = Array.from(document.querySelectorAll(".item-checkbox:checked")).map(cb => cb.dataset.id);
    if (selected.length > 0) {
      showConfirmationDialog(selected);
    }
  });

  restoreSelectedBtn.addEventListener('click', () => {
    const selected = Array.from(document.querySelectorAll(".trash-checkbox:checked")).map(cb => cb.dataset.id);
    if (selected.length > 0) {
      restoreItems(selected);
    }
  });

  deleteFromTrashBtn.addEventListener('click', () => {
    const selected = Array.from(document.querySelectorAll(".trash-checkbox:checked")).map(cb => cb.dataset.id);
    if (selected.length > 0) {
      deletePermanently(selected);
    }
  });
  
  configBtn.addEventListener('click', (e) => { e.stopPropagation(); configMenu.classList.toggle('hidden'); });
  openTrashBtn.addEventListener('click', () => { configMenu.classList.add('hidden'); showTrashScreen(); });
  openColorBtn.addEventListener('click', () => { configMenu.classList.add('hidden'); showColorScreen(); });
  
  backBtnTrash.addEventListener('click', showMainScreen);
  backBtnColor.addEventListener('click', showMainScreen);
  backBtnCustomTheme.addEventListener('click', showColorScreen);
  saveCustomThemeBtn.addEventListener('click', saveCustomTheme);

  addBtn.addEventListener('click', (e) => { e.stopPropagation(); addOptionsMenu.classList.toggle('hidden'); });
  noteContent.addEventListener('input', updateCharCounter);
  customThemeContainer.addEventListener('click', handleColorSelection);

  window.addEventListener('click', (e) => {
    if (!addBtn.closest('.menu-container')?.contains(e.target)) addOptionsMenu.classList.add('hidden');
    if (!configBtn.closest('.menu-container')?.contains(e.target)) configMenu.classList.add('hidden');
  });

  // INICIALIZAÇÃO
  
  loadData();
  populateColorOptions();
  populateCustomizationPalettes();
  loadTheme();
  showMainScreen();

});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Service worker registrado com sucesso!', registration);
    })
    .catch(error => {
      console.error('Falha no registro do service worker:', error);
    });
} else {
  console.log('Service workers não são suportados neste navegador.');
}
