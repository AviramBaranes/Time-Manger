interface TaskDataType {
  goalTime: string;
  progressTime: string;
  startTime: string;
  description?: string;
}

//Modals
const modals = document.querySelectorAll(
  '.modal'
) as NodeListOf<HTMLDivElement>;
const formModal = modals[0];
const deleteModal = modals[1];
const taskFinishedModal = modals[2];
const summarizeModal = modals[3];
const detailModal = modals[4];
const contactFormModal = modals[5];
const messageModal = modals[6];

//Buttons
//open-buttons:
const addTaskBtn = document.getElementById('addBtn') as HTMLButtonElement;
const summarizeBtn = document.getElementById('summarize') as HTMLButtonElement;
const contactBtn = document.getElementById('contactBtn') as HTMLLIElement;
//close-buttons:
const closeDetailModalBtn = detailModal.children[3] as HTMLButtonElement;
const approveBtn = deleteModal.children[1].children[0];
const cancelBtn = deleteModal.children[1].children[1];
const closeSummarizeBtn = summarizeModal.children[2];
const contactFormSubmitBtn = contactFormModal.querySelector('button')!;
const closeContactMessageBtn = messageModal.children[2] as HTMLButtonElement;

//Forms
const form = formModal.children[0] as HTMLFormElement;
const contactForm = contactFormModal.children[2] as HTMLFormElement;

//Inputs
const emailInput = contactForm.children[0].children[0] as HTMLInputElement;
const contactEmailInput = contactForm.children[1]
  .children[0] as HTMLInputElement;
const taskNameInput = form.children[2].children[0] as HTMLInputElement;
const taskTimeInput = form.children[3].children[0] as HTMLInputElement;
const taskDescriptionInput = form.children[4]
  .children[0] as HTMLTextAreaElement;

//Other DOM elements
const contactFormParagraphError = contactFormModal.children[0]!;
const errorParagraph = document.getElementById('error') as HTMLParagraphElement;
const tasksList = document.querySelector('.tasks-list') as HTMLUListElement;
const tasksSummarizeList = document.querySelector(
  '.tasks-summarize'
) as HTMLUListElement;
const backdrop = document.querySelector('.backdrop') as HTMLDivElement;

//Not a DOM elements
const audio = new Audio('./assets/taskCompletedSound.ogg');
const storageEvent = new CustomEvent('storageChanged');
const ZERO_TIME = '00:00:00:00';

(function () {
  storageChangedHandler();
  for (let i = 0; i < localStorage.length; i++) {
    const taskName = localStorage.key(i)!;
    const { progressTime, goalTime } = JSON.parse(
      localStorage.getItem(taskName)!
    ) as TaskDataType;
    const [progressHours, progressMinutes] = progressTime.split(':');
    const [goalHours, goalMinutes] = goalTime.split(':');
    const isFinished =
      +progressHours >= +goalHours && +progressMinutes >= +goalMinutes;
    const listItem = createListItem(
      localStorage.key(i)!,
      isFinished,
      progressTime
    );
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
  closeDetailModalBtn.addEventListener(
    'click',
    closeDetailModalBtnClickedHandler
  );
  backdrop.addEventListener('click', backdropClickedHandler);
  contactBtn.addEventListener('click', contactBtnClickedHandler);
  contactForm.addEventListener('submit', submitContactFormHandler);
  emailInput.addEventListener('change', inputChangedHandler);
  contactEmailInput.addEventListener('change', inputChangedHandler);
  closeContactMessageBtn.addEventListener('click', closeContactMessageHandler);
})();

//eventListeners

function addTaskHandler(this: HTMLButtonElement) {
  this.classList.remove('hover');
  formModal.style.display = 'block';
  backdrop.style.display = 'block';
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
  let isProgressTime = false;
  for (let i = 0; i < localStorage.length; i++) {
    const { progressTime } = JSON.parse(
      localStorage.getItem(localStorage.key(i)!)!
    );
    if (progressTime !== ZERO_TIME) isProgressTime = true;
  }
  if (isProgressTime) summarizeBtn.style.display = 'block';
  else summarizeBtn.style.display = 'none';
}

function summarizeBtnClickedHandler(this: HTMLButtonElement) {
  this.disabled = true;
  for (let i = 0; i < localStorage.length; i++) {
    const { progressTime, goalTime } = JSON.parse(
      localStorage.getItem(localStorage.key(i)!)!
    ) as TaskDataType;
    const modifiedTaskProgress = progressTime.substring(0, 5);
    const [progressHours, progressMinutes] = progressTime.split(':');
    const [goalHours, goalMinutes] = goalTime.split(':');
    const isFinished =
      +progressHours >= +goalHours && +progressMinutes >= +goalMinutes;
    const newListItem = createSummarizeListItem(
      localStorage.key(i)!,
      modifiedTaskProgress,
      goalTime,
      isFinished
    );
    tasksSummarizeList.appendChild(newListItem);
  }
  summarizeModal.style.display = 'block';
  backdrop.style.display = 'block';
}

function contactBtnClickedHandler() {
  contactFormModal.style.display = 'block';
  backdrop.style.display = 'block';
}

function closeSummarizeBtnClickedHandler() {
  summarizeModal.style.display = 'none';
  backdrop.style.display = 'none';
  const listItems = Array.from(tasksSummarizeList.children);
  listItems.forEach((item) => item.remove());
  summarizeBtn.disabled = false;
}

function closeContactMessageHandler() {
  messageModal.style.display = 'none';
  backdrop.style.display = 'none';
}

function deleteBtnClickedHandler(this: HTMLButtonElement) {
  deleteModal.style.display = 'block';
  backdrop.style.display = 'block';
  //closure
  approveBtn.addEventListener('click', () => {
    const listItem = this.parentElement!.parentElement!;
    localStorage.removeItem(listItem.children[1].children[0].innerHTML);
    window.dispatchEvent(storageEvent);
    listItem.remove();
    deleteModal.style.display = 'none';
    backdrop.style.display = 'none';
  });
  cancelBtn.addEventListener('click', () => {
    deleteModal.style.display = 'none';
    backdrop.style.display = 'none';
  });
}

function playBtnClickedHandler(this: HTMLButtonElement) {
  const currentListItem = this.parentElement!.parentElement!;
  const paragraphElement = currentListItem.children[1].children[1];
  const taskName = currentListItem.children[1].children[0].innerHTML;
  const resetBtn = currentListItem.children[2].children[2] as HTMLButtonElement;
  const { startTime, goalTime, progressTime, description } = JSON.parse(
    localStorage.getItem(taskName)!
  ) as TaskDataType;
  const updatedStartTime = startTime === 'NONE' ? Date.now() : startTime;
  let [hours, minutes, seconds, centiseconds] = progressTime.split(':');

  if (this.innerHTML === '<i class="fas fa-play" aria-hidden="true"></i>') {
    this.innerHTML = '<i class="fas fa-pause"></i>';
    resetBtn.style.display = 'none';

    const interval = setInterval(() => {
      const extraTime =
        +centiseconds + 100 * +seconds + 6000 * +minutes + 3600 * +hours;
      const timePassed = (Date.now() - +updatedStartTime) / 10 + extraTime; //in centiseconds
      const newCentiseconds = Math.floor(timePassed % 100)
        .toString()
        .padStart(2, '0');
      const newSeconds = Math.floor((timePassed / 100) % 60)
        .toString()
        .padStart(2, '0');
      const newMinutes = Math.floor((timePassed / 100 / 60) % 60)
        .toString()
        .padStart(2, '0');
      const newHours = Math.floor((timePassed / 100 / 60 / 60) % 60)
        .toString()
        .padStart(2, '0');

      const currentTime = [
        newHours,
        newMinutes,
        newSeconds,
        newCentiseconds,
      ].join(':');

      paragraphElement.innerHTML = currentTime;
      addToLocalHost(
        taskName,
        goalTime,
        ZERO_TIME,
        updatedStartTime,
        description
      );
      const [hoursGoal, minutesGoal] = goalTime.split(':');
      if (
        hoursGoal === newHours &&
        minutesGoal === newMinutes &&
        newSeconds === '00' &&
        newCentiseconds === '00'
      ) {
        if (hoursGoal <= newHours && minutesGoal <= newMinutes) {
          currentListItem.classList.add('finished');
        }
        audio.play();
        const checkIconDiv = currentListItem.children[0] as HTMLDivElement;
        checkIconDiv.style.display = 'block';
        taskFinishedModal.children[1].innerHTML = `You finished the task: ${taskName}`;
        taskFinishedModal.style.display = 'block';
        backdrop.style.display = 'block';
        taskFinishedModal.children[2].addEventListener('click', () => {
          clearInterval(interval);
          this.innerHTML = '<i class="fas fa-play"></i>';
          taskFinishedModal.style.display = 'none';
          backdrop.style.display = 'none';
          (taskFinishedModal.children[1] as HTMLParagraphElement).innerText =
            '';
        });
      }
    }, 10);
    currentListItem.setAttribute('data-interval', interval.toString());
  } else {
    const currentTime = paragraphElement.innerHTML;
    addToLocalHost(taskName, goalTime, currentTime, 'NONE', description);
    if (currentTime !== ZERO_TIME) {
      resetBtn.style.display = 'inline';
    }

    this.innerHTML = '<i class="fas fa-play"></i>';
    clearInterval(+currentListItem.getAttribute('data-interval')!);
  }
}

function resetBtnClickedHandler(this: HTMLButtonElement) {
  const listItem = this.parentElement!.parentElement!;
  const taskName = listItem.children[1].children[0].innerHTML;
  (listItem.children[0] as HTMLDivElement).style.display = 'none';
  listItem.children[1].children[1].innerHTML = ZERO_TIME;
  listItem.children[2].children[0].innerHTML = '<i class="fas fa-play"></i>';
  // checkIconContainer.style.display = 'none';
  listItem.classList.remove('finished');
  const { goalTime, description } = JSON.parse(
    localStorage.getItem(taskName)!
  ) as TaskDataType;

  addToLocalHost(taskName, goalTime, ZERO_TIME, 'NONE', description);

  clearInterval(+listItem.getAttribute('data-interval')!);
  this.style.display = 'none';
}

function backdropClickedHandler() {
  modals.forEach((modal) => (modal.style.display = 'none'));
  closeDetailModalBtnClickedHandler();
  closeSummarizeBtnClickedHandler();
}

function inputChangedHandler(this: HTMLInputElement) {
  const label = this.nextElementSibling!;
  if (this.value.length) label.className = 'active';
  else label.className = '';
}

function submitFormHandler(e: Event) {
  e.preventDefault();

  const taskName = taskNameInput.value;
  const taskTime = taskTimeInput.value;
  const taskDescription = taskDescriptionInput.value;

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
  const taskDataObj: TaskDataType = {
    startTime: 'NONE',
    goalTime: taskTime,
    progressTime: ZERO_TIME,
  };

  if (taskDescription) taskDataObj.description = taskDescription;

  const taskData = JSON.stringify(taskDataObj);

  localStorage.setItem(taskName, taskData);
  window.dispatchEvent(storageEvent);
  const newListItem = createListItem(taskName, false);
  tasksList.appendChild(newListItem);
  taskNameInput.nextElementSibling!.className = '';
  taskDescriptionInput!.className = '';
  taskNameInput.value = '';
  taskTimeInput.value = '00:10';
  taskDescriptionInput.value = '';
  errorParagraph.innerText = '';
  formModal.style.display = 'none';
  backdrop.style.display = 'none';
}

function submitContactFormHandler(event: Event) {
  event.preventDefault();

  const data = new FormData(event.target as HTMLFormElement);

  if ((data.get('message') as string).length < 5) {
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
    .then((response) => {
      if (response.status !== 200) throw '';
      contactFormModal.style.display = 'none';
      messageModal.children[0].innerHTML = 'Thanks for the email!';
      messageModal.children[1].innerHTML =
        'Your email has been sent successfully';
      messageModal.style.display = 'block';
      contactFormParagraphError.innerHTML = '';
      contactForm.reset();
    })
    .catch((_) => {
      contactFormModal.style.display = 'none';
      messageModal.children[0].innerHTML = 'Oops...';
      messageModal.children[1].innerHTML =
        'Something went wrong please try again later';
      messageModal.style.display = 'block';
      contactFormParagraphError.innerHTML = '';
    });
}

//utility
function createListItem(
  taskName: string,
  finished: boolean,
  progressTime?: string
) {
  console.log(finished);

  const liElement = document.createElement('li');
  const h4Element = document.createElement('h4');
  const pElement = document.createElement('p');
  const playBtn = document.createElement('button');
  const deleteBtn = document.createElement('button');
  const resetBtn = document.createElement('button');
  const checkIconContainer = document.createElement('div');
  const textContainer = document.createElement('div');
  const buttonsContainer = document.createElement('div');
  textContainer.className = 'text-container';
  buttonsContainer.className = 'buttons-container';
  checkIconContainer.className = 'check-icon-container';
  h4Element.innerText = taskName;
  pElement.innerText = progressTime || ZERO_TIME;
  if (!finished) {
    checkIconContainer.style.display = 'none';
    liElement.classList.remove('finished');
  } else {
    liElement.classList.add('finished');
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
  h4Element.addEventListener('click', () => {
    const { goalTime, progressTime, description } = JSON.parse(
      localStorage.getItem(taskName)!
    ) as TaskDataType;
    detailModal.children[0].innerHTML = taskName;
    detailModal.children[1].innerHTML = `${progressTime.substring(
      0,
      5
    )}/${goalTime}`;
    if (description) detailModal.children[2].innerHTML = description;
    detailModal.style.display = 'block';
    backdrop.style.display = 'block';
  });
  return liElement;
}

function createSummarizeListItem(
  taskName: string,
  taskProgress: string,
  taskGoal: string,
  finished: boolean
) {
  const liElement = document.createElement('li');
  const textContainer = document.createElement('div');
  const checkIconContainer = document.createElement('div');
  const h4Element = document.createElement('h4');
  const pElement = document.createElement('p');
  if (finished) {
    liElement.classList.add('finished');
    checkIconContainer.innerHTML = '<i class="fas fa-check"></i>';
  }
  h4Element.innerText = `${taskName}:`;
  pElement.innerText = `${taskProgress}/${taskGoal}`;
  textContainer.appendChild(h4Element);
  textContainer.appendChild(pElement);
  liElement.appendChild(textContainer);
  liElement.appendChild(checkIconContainer);
  return liElement;
}

function addToLocalHost(
  taskName: string,
  goalTime: string,
  progressTime: string,
  startTime: string | number,
  description?: string
) {
  const taskDataObj: TaskDataType = {
    goalTime,
    progressTime,
    startTime: startTime.toString(),
  };

  if (description) taskDataObj.description = description;

  const updatedTaskData = JSON.stringify(taskDataObj);
  localStorage.setItem(taskName, updatedTaskData);
  window.dispatchEvent(storageEvent);
}
