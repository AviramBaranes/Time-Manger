"use strict";
var addTaskBtn = document.getElementById('addBtn');
var modals = document.querySelectorAll('.modal');
var formModal = modals[0];
var deleteModal = modals[1];
var taskFinishedModal = modals[2];
var summarizeModal = modals[3];
var approveBtn = deleteModal.children[1].children[0];
var cancelBtn = deleteModal.children[1].children[1];
var summarizeBtn = document.getElementById('summarize');
var closeSummarizeBtn = summarizeModal.children[2];
var form = formModal.children[0];
var taskNameInput = form.children[1].children[0];
var taskTimeInput = form.children[2].children[0];
var errorParagraph = document.getElementById('error');
var tasksList = document.querySelector('.tasks-lists');
var tasksSummarizeList = document.querySelector('.tasks-summarize');
var storageEvent = new CustomEvent('storageChanged');
(function () {
    for (var i = 0; i < localStorage.length; i++) {
        var taskName = localStorage.key(i);
        var progressTime = JSON.parse(localStorage.getItem(taskName)).progressTime;
        var listItem = createListItem(localStorage.key(i), progressTime);
        tasksList.appendChild(listItem);
    }
    window.addEventListener('storageChanged', storageChangedHandler);
    window.addEventListener('storage', storageChangedHandler);
    addTaskBtn.addEventListener('click', addTaskHandler);
    form.addEventListener('submit', submitFormHandler);
    summarizeBtn.addEventListener('click', summarizeBtnClickedHandler);
    closeSummarizeBtn.addEventListener('click', closeSummarizeBtnClickedHandler);
})();
//eventListeners
function addTaskHandler() {
    formModal.style.display = 'block';
}
function closeSummarizeBtnClickedHandler() {
    summarizeModal.style.display = 'none';
    var listItems = Array.from(tasksSummarizeList.children);
    listItems.forEach(function (item) { return item.remove(); });
    summarizeBtn.disabled = false;
}
function storageChangedHandler() {
    if (localStorage.length)
        summarizeBtn.style.display = 'block';
    else
        summarizeBtn.style.display = 'none';
}
function summarizeBtnClickedHandler() {
    // if (summarizeModal.style.display === 'block') {
    // } else {
    this.disabled = true;
    for (var i = 0; i < localStorage.length; i++) {
        var taskData = JSON.parse(localStorage.getItem(localStorage.key(i)));
        var modifiedTaskProgress = taskData.progressTime.substring(0, 5);
        var newListItem = createSummarizeListItem(localStorage.key(i), modifiedTaskProgress, taskData.goalTime);
        tasksSummarizeList.appendChild(newListItem);
    }
    summarizeModal.style.display = 'block';
    // }
}
function deleteBtnClickedHandler() {
    var _this = this;
    deleteModal.style.display = 'block';
    //closure
    approveBtn.addEventListener('click', function () {
        var _a;
        localStorage.removeItem(((_a = _this.parentElement) === null || _a === void 0 ? void 0 : _a.children[0]).innerText);
        window.dispatchEvent(storageEvent);
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
            var goalTime = JSON.parse(localStorage.getItem(taskName)).goalTime;
            var _b = goalTime.split(':'), hoursGoal = _b[0], minutesGoal = _b[1];
            if (hoursGoal === newTime[0] && minutesGoal === newTime[1]) {
                taskFinishedModal.children[1].innerText = "You finished the task: " + taskName;
                taskFinishedModal.style.display = 'block';
                taskFinishedModal.children[2].addEventListener('click', function () {
                    clearInterval(interval_1);
                    taskFinishedModal.style.display = 'none';
                    taskFinishedModal.children[1].innerText =
                        '';
                });
            }
            var progressTime = newTime.join(':');
            currentListItem.children[1].innerText =
                progressTime;
            var updatedTaskData = JSON.stringify({ goalTime: goalTime, progressTime: progressTime });
            localStorage.setItem(taskName, updatedTaskData);
            window.dispatchEvent(storageEvent);
            currentListItem.setAttribute('data-interval', interval_1.toString());
        }, 10);
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
    window.dispatchEvent(storageEvent);
    var newListItem = createListItem(taskName);
    tasksList.appendChild(newListItem);
    taskNameInput.value = '';
    taskTimeInput.value = '';
    formModal.style.display = 'none';
}
//create DOM elements
function createListItem(taskName, progressTime) {
    var liElement = document.createElement('li');
    var h4Element = document.createElement('h4');
    var pElement = document.createElement('p');
    var playBtn = document.createElement('button');
    var deleteBtn = document.createElement('button');
    h4Element.innerText = taskName;
    pElement.innerText = progressTime || '00:00:00:00';
    playBtn.innerText = 'start';
    deleteBtn.innerText = 'delete';
    playBtn.addEventListener('click', playBtnClickedHandler);
    deleteBtn.addEventListener('click', deleteBtnClickedHandler);
    liElement.appendChild(h4Element);
    liElement.appendChild(pElement);
    liElement.appendChild(playBtn);
    liElement.appendChild(deleteBtn);
    return liElement;
}
function createSummarizeListItem(taskName, taskProgress, taskGoal) {
    var liElement = document.createElement('li');
    var h4Element = document.createElement('h4');
    var pElement = document.createElement('p');
    h4Element.innerText = taskName + ":";
    pElement.innerText = taskProgress + "/" + taskGoal;
    liElement.appendChild(h4Element);
    liElement.appendChild(pElement);
    return liElement;
}
