"use strict";
var addTaskBtn = document.getElementById('addBtn');
var modals = document.querySelectorAll('.modal');
var formModal = modals[0];
var deleteModal = modals[1];
var taskFinishedModal = modals[2];
var summarizeModal = modals[3];
var detailModal = modals[4];
var closeDetailModalBtn = detailModal.children[3];
var approveBtn = deleteModal.children[1].children[0];
var cancelBtn = deleteModal.children[1].children[1];
var summarizeBtn = document.getElementById('summarize');
var closeSummarizeBtn = summarizeModal.children[2];
var form = formModal.children[0];
var taskNameInput = form.children[1].children[0];
var taskTimeInput = form.children[2].children[0];
var taskDescriptionInput = form.children[3]
    .children[0];
var errorParagraph = document.getElementById('error');
var tasksList = document.querySelector('.tasks-lists');
var tasksSummarizeList = document.querySelector('.tasks-summarize');
var audio = new Audio('./assets/taskCompletedSound.ogg');
var storageEvent = new CustomEvent('storageChanged');
var ZERO_TIME = '00:00:00:00';
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
    closeDetailModalBtn.addEventListener('click', closeDetailModalBtnClickedHandler);
})();
//eventListeners
function addTaskHandler() {
    formModal.style.display = 'block';
}
function closeDetailModalBtnClickedHandler() {
    detailModal.style.display = 'none';
}
function closeSummarizeBtnClickedHandler() {
    summarizeModal.style.display = 'none';
    var listItems = Array.from(tasksSummarizeList.children);
    listItems.forEach(function (item) { return item.remove(); });
    summarizeBtn.disabled = false;
}
function storageChangedHandler() {
    var isProgressTime = false;
    for (var i = 0; i < localStorage.length; i++) {
        var progressTime = JSON.parse(localStorage.getItem(localStorage.key(i))).progressTime;
        if (progressTime !== ZERO_TIME)
            isProgressTime = true;
    }
    if (isProgressTime)
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
            if (currentListItem.children[1].innerText !==
                ZERO_TIME) {
                currentListItem.children[4].style.display =
                    'inline';
            }
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
            var _b = JSON.parse(localStorage.getItem(taskName)), goalTime = _b.goalTime, description = _b.description;
            var _c = goalTime.split(':'), hoursGoal = _c[0], minutesGoal = _c[1];
            if (hoursGoal === newTime[0] && minutesGoal === newTime[1]) {
                audio.play();
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
            var taskDataObj = { goalTime: goalTime, progressTime: progressTime };
            if (description)
                taskDataObj.description = description;
            var updatedTaskData = JSON.stringify(taskDataObj);
            localStorage.setItem(taskName, updatedTaskData);
            window.dispatchEvent(storageEvent);
            currentListItem.setAttribute('data-interval', interval_1.toString());
        }, 1);
    }
    else {
        this.innerText = 'start';
        clearInterval(+currentListItem.getAttribute('data-interval'));
    }
}
function resetBtnClickedHandler() {
    var listItem = this.parentElement;
    var taskName = listItem.children[0].innerText;
    listItem.children[1].innerText = ZERO_TIME;
    listItem.children[2].innerText = 'start';
    var _a = JSON.parse(localStorage.getItem(taskName)), goalTime = _a.goalTime, description = _a.description;
    var taskDataObj = {
        goalTime: goalTime,
        progressTime: ZERO_TIME,
    };
    if (description)
        taskDataObj.description = description;
    var updatedTaskData = JSON.stringify(taskDataObj);
    localStorage.setItem(taskName, updatedTaskData);
    window.dispatchEvent(storageEvent);
    clearInterval(+listItem.getAttribute('data-interval'));
    this.style.display = 'none';
}
function submitFormHandler(e) {
    e.preventDefault();
    var taskName = taskNameInput.value;
    var taskTime = taskTimeInput.value;
    var taskDescription = taskDescriptionInput.value;
    if (!taskName.length || !taskTime.length) {
        errorParagraph.innerText = 'One of the fields are empty';
        return;
    }
    if (!!localStorage.getItem(taskName)) {
        errorParagraph.innerText = 'Task already Exist';
        return;
    }
    var taskDataObj = {
        goalTime: taskTime,
        progressTime: ZERO_TIME,
    };
    if (taskDescription)
        taskDataObj.description = taskDescription;
    var taskData = JSON.stringify(taskDataObj);
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
    var resetBtn = document.createElement('button');
    h4Element.innerText = taskName;
    pElement.innerText = progressTime || ZERO_TIME;
    playBtn.innerText = 'start';
    deleteBtn.innerText = 'delete';
    resetBtn.innerText = 'reset';
    if (!progressTime || progressTime === ZERO_TIME)
        resetBtn.style.display = 'none';
    playBtn.addEventListener('click', playBtnClickedHandler);
    deleteBtn.addEventListener('click', deleteBtnClickedHandler);
    resetBtn.addEventListener('click', resetBtnClickedHandler);
    liElement.appendChild(h4Element);
    liElement.appendChild(pElement);
    liElement.appendChild(playBtn);
    liElement.appendChild(deleteBtn);
    liElement.appendChild(resetBtn);
    liElement.addEventListener('click', function (e) {
        if (e.target.tagName === 'BUTTON')
            return;
        var _a = JSON.parse(localStorage.getItem(taskName)), goalTime = _a.goalTime, progressTime = _a.progressTime, description = _a.description;
        detailModal.children[0].innerText = taskName;
        detailModal.children[1].innerText = progressTime.substring(0, 5) + "/" + goalTime;
        if (description)
            detailModal.children[2].innerText = description;
        detailModal.style.display = 'block';
    });
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
