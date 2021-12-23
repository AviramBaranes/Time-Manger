"use strict";
var addTaskBtn = document.getElementById('addBtn');
var modals = document.querySelectorAll('.modal');
var formModal = modals[0];
var deleteModal = modals[1];
var approveBtn = deleteModal.children[1].children[0];
var cancelBtn = deleteModal.children[1].children[1];
var form = formModal.children[0];
var taskNameInput = form.children[1].children[0];
var taskTimeInput = form.children[2].children[0];
var errorParagraph = document.getElementById('error');
var tasksList = document.querySelector('.tasks-lists');
var taskListItemTemplate = document.getElementsByTagName('template')[0];
addTaskBtn.addEventListener('click', addTaskHandler);
form.addEventListener('submit', submitFormHandler);
function addTaskHandler() {
    formModal.style.display = 'block';
}
function createListItem(taskName) {
    var liEl = document.createElement('li');
    var h4El = document.createElement('h4');
    var pEl = document.createElement('p');
    var playBtn = document.createElement('button');
    var deleteBtn = document.createElement('button');
    h4El.innerText = taskName;
    pEl.innerText = '00:00:00:00';
    playBtn.innerText = 'start';
    deleteBtn.innerText = 'delete';
    playBtn.addEventListener('click', playBtnClickedHandler);
    deleteBtn.addEventListener('click', deleteBtnClickedHandler);
    liEl.appendChild(h4El);
    liEl.appendChild(pEl);
    liEl.appendChild(playBtn);
    liEl.appendChild(deleteBtn);
    return liEl;
}
function deleteBtnClickedHandler() {
    var _this = this;
    deleteModal.style.display = 'block';
    //closure
    approveBtn.addEventListener('click', function () {
        var _a;
        localStorage.removeItem(((_a = _this.parentElement) === null || _a === void 0 ? void 0 : _a.children[0]).innerText);
        _this.parentElement.remove();
        deleteModal.style.display = 'none';
    });
    cancelBtn.addEventListener('click', function () {
        deleteModal.style.display = 'none';
    });
}
function playBtnClickedHandler() {
    var currentListItem = this.parentElement;
    if (this.innerText === 'start') {
        this.innerText = 'stop';
        var interval_1 = setInterval(function () {
            var currentTime = currentListItem.children[1]
                .innerText;
            var _a = currentTime.split(':'), hours = _a[0], minutes = _a[1], seconds = _a[2], centiseconds = _a[3];
            var newTime = [];
            if (centiseconds === '99') {
                if (seconds === '59') {
                    if (minutes === '59') {
                        var newHours = String(parseInt(hours) + 1).padStart(2, '0');
                        newTime = [newHours, '00', '00', '00'];
                    }
                    else {
                        var newMinutes = String(parseInt(minutes) + 1).padStart(2, '0');
                        newTime = [hours, newMinutes, '00', '00'];
                    }
                }
                else {
                    var newSeconds = String(parseInt(seconds) + 1).padStart(2, '0');
                    newTime = [hours, minutes, newSeconds, '00'];
                }
            }
            else {
                var newCentiseconds = String(parseInt(centiseconds) + 1).padStart(2, '0');
                newTime = [hours, minutes, seconds, newCentiseconds];
            }
            var taskName = currentListItem.children[0]
                .innerText;
            var progressTime = newTime.join(':');
            var goalTime = JSON.parse(localStorage.getItem(taskName)).goalTime;
            currentListItem.children[1].innerText =
                progressTime;
            var updatedTaskData = JSON.stringify({ goalTime: goalTime, progressTime: progressTime });
            localStorage.setItem(taskName, updatedTaskData);
            currentListItem.setAttribute('data-interval', interval_1.toString());
        }, 10);
        console.log(interval_1);
    }
    else {
        this.innerText = 'start';
        clearInterval(+currentListItem.getAttribute('data-interval'));
    }
}
function submitFormHandler(e) {
    e.preventDefault();
    var taskName = taskNameInput.value;
    var taskTime = taskTimeInput.value;
    if (!taskName.length || !taskTime.length) {
        errorParagraph.innerText = 'One of the fields are empty';
        return;
    }
    var taskData = JSON.stringify({
        goalTime: taskTime,
        progressTime: '00:00:00:00',
    });
    localStorage.setItem(taskName, taskData);
    var newListItem = createListItem(taskName);
    tasksList.appendChild(newListItem);
    taskNameInput.value = '';
    taskTimeInput.value = '';
    formModal.style.display = 'none';
}
