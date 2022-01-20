"use strict";
//Modals
var modals = document.querySelectorAll('.modal');
var formModal = modals[0];
var deleteModal = modals[1];
var taskFinishedModal = modals[2];
var summarizeModal = modals[3];
var detailModal = modals[4];
var contactFormModal = modals[5];
var messageModal = modals[6];
//Buttons
//open-buttons:
var addTaskBtn = document.getElementById('addBtn');
var summarizeBtn = document.getElementById('summarize');
var contactBtn = document.getElementById('contactBtn');
//close-buttons:
var closeDetailModalBtn = detailModal.children[3];
var approveBtn = deleteModal.children[1].children[0];
var cancelBtn = deleteModal.children[1].children[1];
var closeSummarizeBtn = summarizeModal.children[2];
var contactFormSubmitBtn = contactFormModal.querySelector('button');
var closeContactMessageBtn = messageModal.children[2];
//Forms
var form = formModal.children[0];
var contactForm = contactFormModal.children[2];
//Inputs
var emailInput = contactForm.children[0].children[0];
var contactEmailInput = contactForm.children[1]
    .children[0];
var taskNameInput = form.children[2].children[0];
var taskTimeInput = form.children[3].children[0];
var taskDescriptionInput = form.children[4]
    .children[0];
//Other DOM elements
var contactFormParagraphError = contactFormModal.children[0];
var errorParagraph = document.getElementById('error');
var tasksList = document.querySelector('.tasks-list');
var tasksSummarizeList = document.querySelector('.tasks-summarize');
var backdrop = document.querySelector('.backdrop');
//Not a DOM elements
var audio = new Audio('./assets/taskCompletedSound.ogg');
var storageEvent = new CustomEvent('storageChanged');
var ZERO_TIME = '00:00:00:00';
(function () {
    storageChangedHandler();
    for (var i = 0; i < localStorage.length; i++) {
        var taskName = localStorage.key(i);
        var _a = JSON.parse(localStorage.getItem(taskName)), progressTime = _a.progressTime, goalTime = _a.goalTime;
        var _b = progressTime.split(':'), progressHours = _b[0], progressMinutes = _b[1];
        var _c = goalTime.split(':'), goalHours = _c[0], goalMinutes = _c[1];
        var progressTimeNumber = +progressHours * 60 + +progressMinutes;
        var goalTimeNumber = +goalHours * 60 + +goalMinutes;
        var isFinished = progressTimeNumber >= goalTimeNumber;
        var listItem = createListItem(localStorage.key(i), isFinished, progressTime);
        tasksList.appendChild(listItem);
    }
    window.addEventListener('storageChanged', storageChangedHandler);
    window.addEventListener('storage', storageChangedHandler);
    addTaskBtn.addEventListener('click', addTaskHandler);
    form.addEventListener('submit', submitFormHandler);
    taskNameInput.addEventListener('change', inputChangedHandler);
    taskTimeInput.addEventListener('change', inputChangedHandler);
    taskDescriptionInput.addEventListener('change', inputChangedHandler);
    summarizeBtn.addEventListener('click', summarizeBtnClickedHandler);
    closeSummarizeBtn.addEventListener('click', closeSummarizeBtnClickedHandler);
    closeDetailModalBtn.addEventListener('click', closeDetailModalBtnClickedHandler);
    backdrop.addEventListener('click', backdropClickedHandler);
    contactBtn.addEventListener('click', contactBtnClickedHandler);
    contactForm.addEventListener('submit', submitContactFormHandler);
    emailInput.addEventListener('change', inputChangedHandler);
    contactEmailInput.addEventListener('change', inputChangedHandler);
    closeContactMessageBtn.addEventListener('click', closeContactMessageHandler);
})();
//eventListeners
function addTaskHandler() {
    openModal(formModal);
}
function closeDetailModalBtnClickedHandler() {
    detailModal.children[0].innerHTML = '';
    detailModal.children[1].innerHTML = '';
    detailModal.children[2].innerHTML = '';
    backdrop.style.display = 'none';
    detailModal.style.display = 'none';
    taskFinishedModal.style.display = 'none';
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
        var _a = JSON.parse(localStorage.getItem(localStorage.key(i))), progressTime = _a.progressTime, goalTime = _a.goalTime;
        var modifiedTaskProgress = progressTime.substring(0, 5);
        var _b = progressTime.split(':'), progressHours = _b[0], progressMinutes = _b[1];
        var _c = goalTime.split(':'), goalHours = _c[0], goalMinutes = _c[1];
        var isFinished = +progressHours >= +goalHours && +progressMinutes >= +goalMinutes;
        var newListItem = createSummarizeListItem(localStorage.key(i), modifiedTaskProgress, goalTime, isFinished);
        tasksSummarizeList.appendChild(newListItem);
    }
    openModal(summarizeModal);
}
function contactBtnClickedHandler() {
    openModal(contactFormModal);
}
function closeSummarizeBtnClickedHandler() {
    summarizeModal.style.display = 'none';
    backdrop.style.display = 'none';
    var listItems = Array.from(tasksSummarizeList.children);
    listItems.forEach(function (item) { return item.remove(); });
    summarizeBtn.disabled = false;
}
function closeContactMessageHandler() {
    messageModal.style.display = 'none';
    backdrop.style.display = 'none';
}
function deleteBtnClickedHandler() {
    var _this = this;
    openModal(deleteModal);
    //closure
    approveBtn.addEventListener('click', function () {
        var listItem = _this.parentElement.parentElement;
        localStorage.removeItem(listItem.children[1].children[0].innerHTML);
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
    var paragraphElement = currentListItem.children[1].children[1];
    var taskName = currentListItem.children[1].children[0].innerHTML;
    var resetBtn = currentListItem.children[2].children[2];
    var _a = JSON.parse(localStorage.getItem(taskName)), startTime = _a.startTime, goalTime = _a.goalTime, progressTime = _a.progressTime, description = _a.description;
    var updatedStartTime = startTime === 'NONE' ? Date.now() : startTime;
    var _b = progressTime.split(':'), hours = _b[0], minutes = _b[1], seconds = _b[2], centiseconds = _b[3];
    if (this.innerHTML === '<i class="fas fa-play" aria-hidden="true"></i>') {
        this.innerHTML = '<i class="fas fa-pause"></i>';
        resetBtn.style.display = 'none';
        var interval_1 = setInterval(function () {
            var extraTime = +centiseconds + 100 * +seconds + 6000 * +minutes + 360000 * +hours;
            var timePassed = (Date.now() - +updatedStartTime) / 10 + extraTime; //in centiseconds
            var newCentiseconds = Math.floor(timePassed % 100)
                .toString()
                .padStart(2, '0');
            var newSeconds = Math.floor((timePassed / 100) % 60)
                .toString()
                .padStart(2, '0');
            var newMinutes = Math.floor((timePassed / 100 / 60) % 60)
                .toString()
                .padStart(2, '0');
            var newHours = Math.floor((timePassed / 100 / 60 / 60) % 60)
                .toString()
                .padStart(2, '0');
            var currentTime = [
                newHours,
                newMinutes,
                newSeconds,
                newCentiseconds,
            ].join(':');
            paragraphElement.innerHTML = currentTime;
            addToLocalHost(taskName, goalTime, ZERO_TIME, updatedStartTime, description);
            var _a = goalTime.split(':'), hoursGoal = _a[0], minutesGoal = _a[1];
            if (hoursGoal <= newHours && minutesGoal <= newMinutes) {
                currentListItem.setAttribute('id', 'finished');
            }
            if (hoursGoal === newHours &&
                minutesGoal === newMinutes &&
                newSeconds === '00' &&
                newCentiseconds === '00') {
                audio.play();
                var checkIconDiv = currentListItem.children[0];
                checkIconDiv.style.display = 'block';
                taskFinishedModal.children[1].innerHTML = "You finished the task: " + taskName;
                openModal(taskFinishedModal);
                taskFinishedModal.children[2].addEventListener('click', function () {
                    clearInterval(interval_1);
                    addToLocalHost(taskName, goalTime, currentTime, 'NONE', description);
                    _this.innerHTML = '<i class="fas fa-play"></i>';
                    taskFinishedModal.style.display = 'none';
                    backdrop.style.display = 'none';
                    taskFinishedModal.children[1].innerText =
                        '';
                });
            }
        }, 10);
        currentListItem.setAttribute('data-interval', interval_1.toString());
    }
    else {
        var currentTime = paragraphElement.innerHTML;
        addToLocalHost(taskName, goalTime, currentTime, 'NONE', description);
        if (currentTime !== ZERO_TIME) {
            resetBtn.style.display = 'inline';
        }
        this.innerHTML = '<i class="fas fa-play"></i>';
        clearInterval(+currentListItem.getAttribute('data-interval'));
    }
}
function resetBtnClickedHandler() {
    var listItem = this.parentElement.parentElement;
    listItem.removeAttribute('id');
    var taskName = listItem.children[1].children[0].innerHTML;
    listItem.children[0].style.display = 'none';
    listItem.children[1].children[1].innerHTML = ZERO_TIME;
    listItem.children[2].children[0].innerHTML = '<i class="fas fa-play"></i>';
    listItem.classList.remove('finished');
    var _a = JSON.parse(localStorage.getItem(taskName)), goalTime = _a.goalTime, description = _a.description;
    addToLocalHost(taskName, goalTime, ZERO_TIME, 'NONE', description);
    clearInterval(+listItem.getAttribute('data-interval'));
    this.style.display = 'none';
}
function backdropClickedHandler() {
    modals.forEach(function (modal) { return (modal.style.display = 'none'); });
    closeDetailModalBtnClickedHandler();
    closeSummarizeBtnClickedHandler();
}
function inputChangedHandler() {
    var label = this.nextElementSibling;
    if (this.value.length)
        label.className = 'active';
    else
        label.className = '';
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
        startTime: 'NONE',
        goalTime: taskTime,
        progressTime: ZERO_TIME,
    };
    if (taskDescription)
        taskDataObj.description = taskDescription;
    var taskData = JSON.stringify(taskDataObj);
    localStorage.setItem(taskName, taskData);
    window.dispatchEvent(storageEvent);
    var newListItem = createListItem(taskName, false);
    tasksList.appendChild(newListItem);
    taskNameInput.nextElementSibling.className = '';
    taskDescriptionInput.className = '';
    taskNameInput.value = '';
    taskTimeInput.value = '00:10';
    taskDescriptionInput.value = '';
    errorParagraph.innerText = '';
    formModal.style.display = 'none';
    backdrop.style.display = 'none';
}
function submitContactFormHandler(event) {
    event.preventDefault();
    var data = new FormData(event.target);
    if (data.get('message').length < 5) {
        contactFormParagraphError.innerHTML = 'Email message too short';
        return;
    }
    fetch('https://formspree.io/f/xbjwlloo', {
        method: 'POST',
        body: data,
        headers: {
            Accept: 'application/json',
        },
    })
        .then(function (response) {
        if (response.status !== 200)
            throw '';
        contactFormModal.style.display = 'none';
        messageModal.children[0].innerHTML = 'Thanks for the email!';
        messageModal.children[1].innerHTML =
            'Your email has been sent successfully';
        messageModal.style.display = 'block';
        contactFormParagraphError.innerHTML = '';
        contactForm.reset();
    })
        .catch(function (_) {
        contactFormModal.style.display = 'none';
        messageModal.children[0].innerHTML = 'Oops...';
        messageModal.children[1].innerHTML =
            'Something went wrong please try again later';
        messageModal.style.display = 'block';
        contactFormParagraphError.innerHTML = '';
    });
}
//utility
function createListItem(taskName, finished, progressTime) {
    console.log(finished);
    var liElement = document.createElement('li');
    var h4Element = document.createElement('h4');
    var pElement = document.createElement('p');
    var playBtn = document.createElement('button');
    var deleteBtn = document.createElement('button');
    var resetBtn = document.createElement('button');
    var checkIconContainer = document.createElement('div');
    var textContainer = document.createElement('div');
    var buttonsContainer = document.createElement('div');
    textContainer.className = 'text-container';
    buttonsContainer.className = 'buttons-container';
    checkIconContainer.className = 'check-icon-container';
    h4Element.innerText = taskName;
    pElement.innerText = progressTime || ZERO_TIME;
    if (!finished) {
        checkIconContainer.style.display = 'none';
        liElement.classList.remove('finished');
    }
    else {
        liElement.setAttribute('id', 'finished');
        console.log('here');
    }
    checkIconContainer.innerHTML = '<i class="fas fa-check"></i>';
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    resetBtn.innerHTML = '<i class="fas fa-redo-alt"></i>';
    playBtn.className = 'task-button';
    deleteBtn.className = 'task-button delete-btn';
    resetBtn.className = 'task-button';
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
    liElement.appendChild(checkIconContainer);
    liElement.appendChild(textContainer);
    liElement.appendChild(buttonsContainer);
    h4Element.addEventListener('click', function () {
        var _a = JSON.parse(localStorage.getItem(taskName)), goalTime = _a.goalTime, progressTime = _a.progressTime, description = _a.description;
        detailModal.children[0].innerHTML = taskName;
        detailModal.children[1].innerHTML = progressTime.substring(0, 5) + "/" + goalTime;
        if (description)
            detailModal.children[2].innerHTML = description;
        detailModal.style.display = 'block';
        backdrop.style.display = 'block';
    });
    return liElement;
}
function createSummarizeListItem(taskName, taskProgress, taskGoal, finished) {
    var liElement = document.createElement('li');
    var textContainer = document.createElement('div');
    var checkIconContainer = document.createElement('div');
    var h4Element = document.createElement('h4');
    var pElement = document.createElement('p');
    if (finished) {
        liElement.setAttribute('id', 'finished-tasks-summary');
        checkIconContainer.innerHTML = '<i class="fas fa-check"></i>';
    }
    h4Element.innerText = taskName + ":";
    pElement.innerText = taskProgress + "/" + taskGoal;
    textContainer.appendChild(h4Element);
    textContainer.appendChild(pElement);
    liElement.appendChild(textContainer);
    liElement.appendChild(checkIconContainer);
    return liElement;
}
function addToLocalHost(taskName, goalTime, progressTime, startTime, description) {
    var taskDataObj = {
        goalTime: goalTime,
        progressTime: progressTime,
        startTime: startTime.toString(),
    };
    if (description)
        taskDataObj.description = description;
    var updatedTaskData = JSON.stringify(taskDataObj);
    localStorage.setItem(taskName, updatedTaskData);
    window.dispatchEvent(storageEvent);
}
function openModal(modal) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    modal.style.display = 'block';
    backdrop.style.display = 'block';
}
