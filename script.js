const addBtns = document.querySelectorAll('.add-new');
const saveItemSolid = document.querySelectorAll('.add-solid');
const saveItemCancel = document.querySelectorAll('.add-cancel');
const addItemContainers = document.querySelectorAll('.add-container');
const addItems = document.querySelectorAll('.add-item');
const modalContainer = document.querySelector('.modal-container');
const modalClose = document.querySelector('.modal-close');
const modalTextArea = document.querySelector('.modal-text');
const modalSave = document.querySelector('.modal-save');
const modalDelete = document.querySelector('.modal-delete');

// Item Lists
const listColumns = document.querySelectorAll('.drag-item-list');
const backlogList = document.getElementById('backlog-list');
const progressList = document.getElementById('progress-list');
const completeList = document.getElementById('complete-list');
const onHoldList = document.getElementById('on-hold-list');

// Items
let updatedOnLoad = false;

// Initialize Arrays
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let onHoldListArray = [];
let listArrays = [];

// Drag Functionality
let draggedItem;
let dragging = false;
let currentColumn;

// Item Selected
let itemSelected;
let itemSelectedColumn;

// Get Arrays from localStorage if available, set default values if not
function getSavedColumns() {
  if (localStorage.getItem('backlogItems')) {
    backlogListArray = JSON.parse(localStorage.backlogItems);
    progressListArray = JSON.parse(localStorage.progressItems);
    completeListArray = JSON.parse(localStorage.completeItems);
    onHoldListArray = JSON.parse(localStorage.onHoldItems);
  } else {
    backlogListArray = [
      ['aquamarine', 'Set User Flow'],
      ['blueviolet', 'Broken UX']
    ];
    progressListArray = [
      ['crimson', 'Research'],
      ['aqua', 'Create Mockup']
    ];
    completeListArray = [
      ['lime', 'Review final design'],
      ['antiquewhite', 'Change Colors'],
      ['blueviolet', 'Gather Team']
    ];
    onHoldListArray = [
      ['aquamarine', 'Assign tasks']
    ];
  }
}

// Set localStorage Arrays
function updateSavedColumns() {
  listArrays = [backlogListArray, progressListArray, completeListArray, onHoldListArray];
  const arrayNames = ['backlog', 'progress', 'complete', 'onHold'];

  arrayNames.forEach( (arrayName, index) => {
    localStorage.setItem(`${arrayName}Items`, JSON.stringify(listArrays[index]));
  });
}

// Filter Arrays to remove empty items
function filterArray(array) {
  const filteredArray = array.filter(item => item !== null);
  return filteredArray;
}

// Create DOM Elements for each list item
function createItemEl(columnEl, column, item, index) {
  // Bar Item
  const barEl = document.createElement('div');
  barEl.classList.add('bar-item');
  barEl.classList.add(item[0]);

  // Paragraph Item
  const pEl = document.createElement('p');
  pEl.classList.add('par-item');
  pEl.textContent = item[1];

  // List Item
  const listEl = document.createElement('li');
  listEl.classList.add('drag-item');
  listEl.draggable = true;
  listEl.addEventListener('click', function() {
    itemSelected = index;
    itemSelectedColumn = column;
    modalTextArea.textContent = listEl.textContent;
    modalTextArea.value = listEl.textContent;

    // Set select option selected
    document.getElementById(item[0]).checked = true;

    // Show Modal
    modalContainer.classList.add('show');
  });
  listEl.id = index;
  // Append
  listEl.appendChild(barEl);
  listEl.appendChild(pEl);
  listEl.setAttribute('ondragstart', 'drag(event)');
  columnEl.appendChild(listEl);
}

// Update Columns in DOM - Reset HTML, Filter Array, Update localStorage
function updateDOM() {
  // Check localStorage once
  if(!updatedOnLoad) {
    getSavedColumns();
  }

  // Backlog Column
  backlogList.textContent = '';
  backlogListArray.forEach( (backlogItem, index) => {
    createItemEl(backlogList, 0, backlogItem, index);
  });
  backlogListArray = filterArray(backlogListArray);

  // Progress Column
  progressList.textContent = '';
  progressListArray.forEach( (progressItem, index) => {
    createItemEl(progressList, 1, progressItem, index);
  });
  progressListArray = filterArray(progressListArray);

  // Complete Column
  completeList.textContent = '';
  completeListArray.forEach( (completeItem, index) => {
    createItemEl(completeList, 2, completeItem, index);
  });
  completeListArray = filterArray(completeListArray);

  // On Hold Column
  onHoldList.textContent = '';
  onHoldListArray.forEach( (onHoldItem, index) => {
    createItemEl(onHoldList, 3, onHoldItem, index);
  });
  onHoldListArray = filterArray(onHoldListArray);

  // Run getSavedColumns only once, Update Local Storage
  updatedOnLoad = true;
  updateSavedColumns();
}

// Update Item - Delete if necessary, or update Array value
function updateItem(id, column, text) {
  const selectedArray = listArrays[column];
  const selectedColumnEl = listColumns[column].children;
  if(!dragging) {
    if(!text) {
      delete selectedArray[id];
    } else {
      const labelSelected = document.querySelector('input[name="input-label-option"]:checked').value;
      selectedArray[id] = [ labelSelected, text];
    }
    updateDOM();
  }
}

// Add to Column List, Reset Textbox
function addToColumn(column) {
  if(addItems[column].textContent) {
    hideInputBox(column);
    const itemText = addItems[column].textContent;
    const selectedArray = listArrays[column];
    selectedArray.push(['antiquewhite', itemText]);
    addItems[column].textContent = '';
    updateDOM();
  }
}

// Show Add Item Input Box
function showInputBox(column) {
  addItems[column].textContent = '';
  addBtns[column].style.display = 'none';
  saveItemSolid[column].style.display = 'flex';
  saveItemCancel[column].style.display = 'flex';
  addItemContainers[column].style.display = 'flex';
}

// Hide Item Input Box
function hideInputBox(column) {
  addBtns[column].style.display = 'block';
  saveItemSolid[column].style.display = 'none';
  saveItemCancel[column].style.display = 'none';
  addItemContainers[column].style.display = 'none';
}

// Allows arrays to reflect Drag and Drop items
function rebuildArrays() {
  backlogListArray = [];
  progressListArray = [];
  completeListArray = [];
  onHoldListArray = [];

  function getItemData(data, index) {
    const itemClass = data.children[index].children[0].classList[1];
    const itemText = data.children[index].children[1].textContent;
    return [itemClass, itemText];
  };

  for (let i=0; i<backlogList.children.length; i++) {
    backlogListArray.push(getItemData(backlogList, i));
  }
  for (let i=0; i<progressList.children.length; i++) {
    progressListArray.push(getItemData(progressList, i));
  }
  for (let i=0; i<completeList.children.length; i++) {
    completeListArray.push(getItemData(completeList, i));
  }
  for (let i=0; i<onHoldList.children.length; i++) {
    onHoldListArray.push(getItemData(onHoldList, i));
  }
  updateDOM();
}

// When Item Stars Dragging
function drag(e) {
  draggedItem = e.target;
  dragging = true;
}

// Column Allows for Item to Drop
function allowDrop(e) {
  e.preventDefault();
}

// When Item Enters Column Area
function dragEnter(column) {
  // Remove Background Color/Padding
  listColumns.forEach((column) => {
    column.classList.remove('over');
  })

  listColumns[column].classList.add('over');
  currentColumn = column;
}

// Dropping Item in Column
function drop(e) {
  e.preventDefault();

  // Remove Background Color/Padding
  listColumns.forEach((column) => {
    column.classList.remove('over');
  });

  // Add Item to Column
  const parent = listColumns[currentColumn];
  parent.appendChild(draggedItem);

  // Dragging complete
  dragging = false;
  rebuildArrays();
}

// Modal
modalClose.addEventListener('click', function() {
  modalContainer.classList.remove('show');
  itemSelected = null;
  itemSelectedColumn = null;
  modalTextArea.textContent = '';
});

modalContainer.addEventListener('click', function(e) {
  if(e.target.classList.contains('show')) {
    modalContainer.classList.remove('show');
    itemSelected = null;
    itemSelectedColumn = null;
    modalTextArea.textContent = '';
  }
});

modalSave.addEventListener('click', function() {
  if(modalTextArea.value) {
    updateItem(itemSelected, itemSelectedColumn, modalTextArea.value);
    itemSelected = null;
    itemSelectedColumn = null;
    modalTextArea.textContent = '';
    modalTextArea.value = '';
    modalContainer.classList.remove('show');
  }
});

modalDelete.addEventListener('click', function() {
  updateItem(itemSelected, itemSelectedColumn, '');
  itemSelected = null;
  itemSelectedColumn = null;
  modalTextArea.textContent = '';
  modalTextArea.value = '';
  modalContainer.classList.remove('show');
});

// On Load
updateDOM();