const appendChildTo = function(childInnerHtml, {parent, child}) {
  const parentElement = document.querySelector(parent);
  const template = document.createElement(child);
  template.innerHTML = childInnerHtml;
  parentElement.appendChild(template);
};

const itemsInHtml = function(task) {
  const {item, id, isDone} = task;
  const isChecked = isDone ? 'checked' : '';
  return `
   <div class="item" id="${id}">
       <input type="checkbox" name="isDone" editable="true" class="TickItem" ${isChecked} />
       <p class="task" contenteditable="true" onkeyDown="editTask()">${item}</p>
       <img src="../img/minus.png" class="close" onclick="deleteItem()" />
   </div><br/>`;
};

const todoDetailInHtml = function(resText, todoItems) {
  return `
  <h1 class="titleHeading">${resText[0].title}</h1>
  <div class="showItems">${todoItems.join('')}</div><br>
  <img src="../img/plus.png" alt="add" class="icon" onclick="addTask(event)" id="__id__"/>
  <input name="item" class="input" id="addMoreTask" autocomplete="off" required type="text" onkeydown="addTask(event)" placeholder="tasks..." ></input >
  <button class="add" onclick="updateIsDoneStatus()">Save changes</button>`;
};

const addInputBox = function(event) {
  if (event.keyCode === 13 || event.target.alt === 'addTodo') {
    const input = `<input name="todoItem"  class="input" autocomplete="off" required type="text" onkeydown="addInputBox(event)" placeholder="tasks..." ></input ><br /><br />`;
    appendChildTo(input, {parent: '.list', child: 'li'});
  }
};

const removeInputBox = function() {
  const form = document.querySelector('.list');
  form.removeChild(form.lastChild);
};

const getXmlHttpRequest = function(url, callback, args) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if (this.status === 200) {
      callback(this.responseText, args);
    }
  };
  xhr.open('GET', url, true);
  xhr.send();
};

const postXmlHttpRequest = function(url, body, callback, args) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if (this.status === 200) {
      callback(args);
    }
  };
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send(body);
};

const showTasks = function() {
  const todoId = event.target.parentElement.id;
  getXmlHttpRequest('/todoList.json', showTodoItems, {todoId});
};

const editTitle = function() {
  if (event.keyCode == 13) {
    event.target.blur();
    const newTitle = event.target.innerText;
    const todoId = event.target.parentElement.id;
    const body = `todoId=${todoId}&newTitle=${newTitle}`;
    postXmlHttpRequest('/editTitle', body, requestForScreenContent, {
      url: '/showList.html',
      callback: updateTodoList
    });
  }
};

const editTask = function() {
  if (event.keyCode == 13) {
    event.target.blur();
    const newTask = event.target.innerText;
    const taskId = event.target.parentElement.id;
    const todoId = document.querySelector('.todoDetail').getAttribute('id');
    console.log(newTask, taskId, todoId);
    const body = `taskId=${taskId}&newTask=${newTask}&todoId=${todoId}`;
    postXmlHttpRequest('/editTask', body, showTodoItems, {todoId});
  }
};

const addTask = function(event) {
  if (event.keyCode === 13 || event.target.alt === 'add') {
    const detail = document.querySelector('.todoDetail');
    const todoId = detail.getAttribute('id');
    const inputValue = document.querySelector('#addMoreTask').value;
    if (inputValue === '') return;
    const body = `todoId=${todoId}&item=${inputValue}`;
    postXmlHttpRequest('/addItem', body, updateItemList, {todoId});
  }
};

const deleteTodo = function() {
  const todoId = event.target.parentElement.id;
  const body = `todoId=${todoId}`;
  postXmlHttpRequest('/deleteTodo', body, requestForScreenContent, {
    url: '/showList.html',
    callback: updateTodoList
  });
};

const deleteItem = function() {
  const ItemId = event.target.parentElement.id;
  const todoId = document.querySelector('.todoDetail').getAttribute('id');
  const body = `itemId=${ItemId}&todoId=${todoId}`;
  postXmlHttpRequest('/deleteItem', body, updateItemList, {todoId});
};

const updateIsDoneStatus = function() {
  const checkboxes = document.getElementsByTagName('input');
  const todoId = document.querySelector('.todoDetail').getAttribute('id');
  const checkedItem = [...checkboxes].filter(checkbox => checkbox.checked);
  const ids = checkedItem.map(box => box.parentElement.id);
  const body = `ids=${ids}&todoId=${todoId}`;
  postXmlHttpRequest('/updateStatus', body, removeDetail);
};

const requestForScreenContent = function(args) {
  getXmlHttpRequest(args.url, args.callback);
};

const updateTodoList = function(resText) {
  document.getElementById('todo').innerHTML = resText;
};

const updateItemList = function({todoId}) {
  getXmlHttpRequest('/todoList.json', showTodoItems, {todoId});
};

const removeDetail = function() {
  getXmlHttpRequest('/showList.html', updateTodoList);
  const detail = document.querySelector('.todoDetail');
  detail.style.display = 'none';
  const todoList = document.querySelector('.todo');
  todoList.style.display = 'block';
};

const showTodoItems = function(resText, args) {
  const detail = document.querySelector('.todoDetail');
  detail.id = args.todoId;
  detail.style.transform = 'scale(1)';
  resText = JSON.parse(resText, args.todoId)
    .filter(todo => todo.id === +args.todoId)
    .flat();
  const todoItems = resText[0].todoItems.map(task => itemsInHtml(task));
  detail.innerHTML = todoDetailInHtml(resText, todoItems);
};

const showAddForm = function() {
  const todoList = document.querySelector('.todoDetail');
  todoList.style.display = 'none';
  const form = document.querySelector('.form');
  form.style.transform = 'scaleZ(1)';
};

// const filterTodo = function(todo) {
//   const title = todo.children[0].innerText.toLowerCase();
//   return title.includes(this.toLowerCase());
// };

// const searchTodo = function(todos, input) {
//   const requiredTodo = todos.filter(filterTodo.bind(input));
//   requiredTodo.forEach(todo => (todo.style.display = 'block'));
// };

// const searchItem = function(todos, input) {
//   const requiredTodo = todos.filter();
// };

// const search = function() {
//   const input = document.querySelector('.searchBar');
//   const titles = document.getElementsByClassName('showTitle');
//   let todos = Array.from(titles);
//   todos.forEach(todo => (todo.style.display = 'none'));
//   if (toggleSearch()) {
//     searchTodo(todos, input.value);
//   } else {
//     searchItem(todos, input.value);
//   }
// };

// const toggleSearch = function() {
//   return document.querySelector('#toggle').checked;
// };

// const toggleSearchStatus = function() {
//   const input = document.querySelector('.searchBar');
//   if (toggleSearch()) input.placeholder = 'search for todo ...';
//   else input.placeholder = 'search for task ...';
// };