"use strict";
var addTaskBtn = document.getElementById('addBtn');
var backdrop = document.querySelector('.backdrop');
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
var tasksList = document.querySelector('.tasks-list');
var tasksSummarizeList = document.querySelector('.tasks-summarize');
var audio = new Audio('./assets/taskCompletedSound.ogg');
var storageEvent = new CustomEvent('storageChanged');
var ZERO_TIME = '00:00:00:00';
(function () {
    storageChangedHandler();
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
    backdrop.addEventListener('click', backdropClickedHandler);
})();
//eventListeners
function addTaskHandler() {
    formModal.style.display = 'block';
    backdrop.style.display = 'block';
}
function closeDetailModalBtnClickedHandler() {
    backdrop.style.display = 'none';
    detailModal.style.display = 'none';
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
    this.disabled = true;
    for (var i = 0; i < localStorage.length; i++) {
        var taskData = JSON.parse(localStorage.getItem(localStorage.key(i)));
        var modifiedTaskProgress = taskData.progressTime.substring(0, 5);
        var newListItem = createSummarizeListItem(localStorage.key(i), modifiedTaskProgress, taskData.goalTime);
        tasksSummarizeList.appendChild(newListItem);
    }
    summarizeModal.style.display = 'block';
    backdrop.style.display = 'block';
}
function closeSummarizeBtnClickedHandler() {
    summarizeModal.style.display = 'none';
    backdrop.style.display = 'none';
    var listItems = Array.from(tasksSummarizeList.children);
    listItems.forEach(function (item) { return item.remove(); });
    summarizeBtn.disabled = false;
}
function deleteBtnClickedHandler() {
    var _this = this;
    deleteModal.style.display = 'block';
    backdrop.style.display = 'block';
    //closure
    approveBtn.addEventListener('click', function () {
        var listItem = _this.parentElement.parentElement;
        localStorage.removeItem(listItem.children[0].children[0].innerHTML);
        window.dispatchEvent(storageEvent);
        listItem.remove();
        deleteModal.style.display = 'none';
        backdrop.style.display = 'none';
    });
    cancelBtn.addEventListener('click', function () {
        deleteModal.style.display = 'none';
        backdrop.style.display = 'none';
    });
}
function playBtnClickedHandler() {
    var _this = this;
    var currentListItem = this.parentElement.parentElement;
    if (this.innerHTML === '<i class="fas fa-play" aria-hidden="true"></i>') {
        this.innerHTML = '<i class="fas fa-pause"></i>';
        var interval_1 = setInterval(function () {
            var resetBtn = currentListItem.children[1]
                .children[2];
            resetBtn.style.display = 'none';
            var paragraphElement = currentListItem.children[0].children[1];
            var currentTime = paragraphElement.innerHTML;
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
            var taskName = currentListItem.children[0].children[0].innerHTML;
            var _b = JSON.parse(localStorage.getItem(taskName)), goalTime = _b.goalTime, description = _b.description;
            var _c = goalTime.split(':'), hoursGoal = _c[0], minutesGoal = _c[1];
            if (hoursGoal === newTime[0] &&
                minutesGoal === newTime[1] &&
                newTime[2] === '00' &&
                newTime[3] === '00') {
                audio.play();
                taskFinishedModal.children[1].innerHTML = "You finished the task: " + taskName;
                taskFinishedModal.style.display = 'block';
                backdrop.style.display = 'block';
                taskFinishedModal.children[2].addEventListener('click', function () {
                    clearInterval(interval_1);
                    _this.innerHTML = '<i class="fas fa-play"></i>';
                    taskFinishedModal.style.display = 'none';
                    backdrop.style.display = 'none';
                    taskFinishedModal.children[1].innerText =
                        '';
                });
            }
            var progressTime = newTime.join(':');
            paragraphElement.innerHTML = progressTime;
            var taskDataObj = { goalTime: goalTime, progressTime: progressTime };
            if (description)
                taskDataObj.description = description;
            var updatedTaskData = JSON.stringify(taskDataObj);
            localStorage.setItem(taskName, updatedTaskData);
            window.dispatchEvent(storageEvent);
            currentListItem.setAttribute('data-interval', interval_1.toString());
        }, 10);
    }
    else {
        var paragraphElement = currentListItem.children[0].children[1];
        var currentTime = paragraphElement.innerHTML;
        var resetBtn = currentListItem.children[1]
            .children[2];
        if (currentTime !== ZERO_TIME) {
            resetBtn.style.display = 'inline';
        }
        this.innerHTML = '<i class="fas fa-play"></i>';
        clearInterval(+currentListItem.getAttribute('data-interval'));
    }
}
function resetBtnClickedHandler() {
    var listItem = this.parentElement.parentElement;
    var taskName = listItem.children[0].children[0].innerHTML;
    listItem.children[0].children[1].innerHTML = ZERO_TIME;
    listItem.children[1].children[0].innerHTML = '<i class="fas fa-play"></i>';
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
function backdropClickedHandler() {
    modals.forEach(function (modal) { return (modal.style.display = 'none'); });
    backdrop.style.display = 'none';
    closeSummarizeBtnClickedHandler();
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
    if (taskName.length > 15) {
        errorParagraph.innerText = 'Task name needs to be under 15 characters';
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
    backdrop.style.display = 'none';
}
//create DOM elements
function createListItem(taskName, progressTime) {
    var liElement = document.createElement('li');
    var h4Element = document.createElement('h4');
    var pElement = document.createElement('p');
    var playBtn = document.createElement('button');
    var deleteBtn = document.createElement('button');
    var resetBtn = document.createElement('button');
    var textContainer = document.createElement('div');
    var buttonsContainer = document.createElement('div');
    textContainer.className = 'text-container';
    buttonsContainer.className = 'buttons-container';
    h4Element.innerText = taskName;
    pElement.innerText = progressTime || ZERO_TIME;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    resetBtn.innerHTML = '<i class="fas fa-redo-alt"></i>';
    if (!progressTime || progressTime === ZERO_TIME)
        resetBtn.style.display = 'none';
    playBtn.addEventListener('click', playBtnClickedHandler);
    deleteBtn.addEventListener('click', deleteBtnClickedHandler);
    resetBtn.addEventListener('click', resetBtnClickedHandler);
    textContainer.appendChild(h4Element);
    textContainer.appendChild(pElement);
    buttonsContainer.appendChild(playBtn);
    buttonsContainer.appendChild(deleteBtn);
    buttonsContainer.appendChild(resetBtn);
    liElement.appendChild(textContainer);
    liElement.appendChild(buttonsContainer);
    liElement.addEventListener('click', function (e) {
        if (e.target.tagName === 'BUTTON')
            return;
        var _a = JSON.parse(localStorage.getItem(taskName)), goalTime = _a.goalTime, progressTime = _a.progressTime, description = _a.description;
        detailModal.children[0].innerText = taskName;
        detailModal.children[1].innerText = progressTime.substring(0, 5) + "/" + goalTime;
        if (description)
            detailModal.children[2].innerText = description;
        detailModal.style.display = 'block';
        backdrop.style.display = 'block';
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
