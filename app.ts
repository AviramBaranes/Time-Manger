interface TaskDataType {
  goalTime: string;
  progressTime: string;
  description?: string;
}
const addTaskBtn = document.getElementById('addBtn') as HTMLButtonElement;
const backdrop = document.querySelector('.backdrop') as HTMLDivElement;
const modals = document.querySelectorAll(
  '.modal'
) as NodeListOf<HTMLDivElement>;
const formModal = modals[0];
const deleteModal = modals[1];
const taskFinishedModal = modals[2];
const summarizeModal = modals[3];
const detailModal = modals[4];
const closeDetailModalBtn = detailModal.children[3] as HTMLButtonElement;
const approveBtn = deleteModal.children[1].children[0];
const cancelBtn = deleteModal.children[1].children[1];
const summarizeBtn = document.getElementById('summarize') as HTMLButtonElement;
const closeSummarizeBtn = summarizeModal.children[2];
const form = formModal.children[0] as HTMLFormElement;
const taskNameInput = form.children[2].children[0] as HTMLInputElement;
const taskTimeInput = form.children[3].children[0] as HTMLInputElement;
const taskDescriptionInput = form.children[4]
  .children[0] as HTMLTextAreaElement;
const errorParagraph = document.getElementById('error') as HTMLParagraphElement;
const tasksList = document.querySelector('.tasks-list') as HTMLUListElement;
const tasksSummarizeList = document.querySelector(
  '.tasks-summarize'
) as HTMLUListElement;

const audio = new Audio('./assets/taskCompletedSound.ogg');
const storageEvent = new CustomEvent('storageChanged');
const ZERO_TIME = '00:00:00:00';

(function () {
  storageChangedHandler();
  for (let i = 0; i < localStorage.length; i++) {
    const taskName = localStorage.key(i)!;
    const { progressTime } = JSON.parse(
      localStorage.getItem(taskName)!
    ) as TaskDataType;
    const listItem = createListItem(localStorage.key(i)!, progressTime);
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
    const taskData = JSON.parse(localStorage.getItem(localStorage.key(i)!)!);
    const modifiedTaskProgress = taskData.progressTime.substring(0, 5);
    const newListItem = createSummarizeListItem(
      localStorage.key(i)!,
      modifiedTaskProgress,
      taskData.goalTime
    );
    tasksSummarizeList.appendChild(newListItem);
  }
  summarizeModal.style.display = 'block';
  backdrop.style.display = 'block';
}

function closeSummarizeBtnClickedHandler() {
  summarizeModal.style.display = 'none';
  backdrop.style.display = 'none';
  const listItems = Array.from(tasksSummarizeList.children);
  listItems.forEach((item) => item.remove());
  summarizeBtn.disabled = false;
}

function deleteBtnClickedHandler(this: HTMLButtonElement) {
  deleteModal.style.display = 'block';
  backdrop.style.display = 'block';
  //closure
  approveBtn.addEventListener('click', () => {
    const listItem = this.parentElement!.parentElement!;
    localStorage.removeItem(listItem.children[0].children[0].innerHTML);
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
  if (this.innerHTML === '<i class="fas fa-play" aria-hidden="true"></i>') {
    this.innerHTML = '<i class="fas fa-pause"></i>';
    const interval = setInterval(() => {
      const resetBtn = currentListItem.children[1]
        .children[2] as HTMLButtonElement;
      resetBtn.style.display = 'none';
      const paragraphElement = currentListItem.children[0].children[1];
      const currentTime = paragraphElement.innerHTML;
      const [hours, minutes, seconds, centiseconds] = currentTime.split(':');
      let newTime: string[] = [];
      if (centiseconds === '99') {
        if (seconds === '59') {
          if (minutes === '59') {
            const newHours = String(parseInt(hours) + 1).padStart(2, '0');
            newTime = [newHours, '00', '00', '00'];
          } else {
            const newMinutes = String(parseInt(minutes) + 1).padStart(2, '0');
            newTime = [hours, newMinutes, '00', '00'];
          }
        } else {
          const newSeconds = String(parseInt(seconds) + 1).padStart(2, '0');
          newTime = [hours, minutes, newSeconds, '00'];
        }
      } else {
        const newCentiseconds = String(parseInt(centiseconds) + 1).padStart(
          2,
          '0'
        );
        newTime = [hours, minutes, seconds, newCentiseconds];
      }
      const taskName = currentListItem.children[0].children[0].innerHTML;

      const { goalTime, description } = JSON.parse(
        localStorage.getItem(taskName)!
      ) as TaskDataType;

      const [hoursGoal, minutesGoal] = goalTime.split(':');
      if (
        hoursGoal === newTime[0] &&
        minutesGoal === newTime[1] &&
        newTime[2] === '00' &&
        newTime[3] === '00'
      ) {
        audio.play();
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
      const progressTime = newTime.join(':');

      paragraphElement.innerHTML = progressTime;
      const taskDataObj: TaskDataType = { goalTime, progressTime };

      if (description) taskDataObj.description = description;

      const updatedTaskData = JSON.stringify(taskDataObj);
      localStorage.setItem(taskName, updatedTaskData);
      window.dispatchEvent(storageEvent);
      currentListItem.setAttribute('data-interval', interval.toString());
    }, 10);
  } else {
    const paragraphElement = currentListItem.children[0].children[1];
    const currentTime = paragraphElement.innerHTML;
    const resetBtn = currentListItem.children[1]
      .children[2] as HTMLButtonElement;
    if (currentTime !== ZERO_TIME) {
      resetBtn.style.display = 'inline';
    }

    this.innerHTML = '<i class="fas fa-play"></i>';
    clearInterval(+currentListItem.getAttribute('data-interval')!);
  }
}

function resetBtnClickedHandler(this: HTMLButtonElement) {
  const listItem = this.parentElement!.parentElement!;
  const taskName = listItem.children[0].children[0].innerHTML;
  listItem.children[0].children[1].innerHTML = ZERO_TIME;
  listItem.children[1].children[0].innerHTML = '<i class="fas fa-play"></i>';
  const { goalTime, description } = JSON.parse(
    localStorage.getItem(taskName)!
  ) as TaskDataType;

  const taskDataObj: TaskDataType = {
    goalTime,
    progressTime: ZERO_TIME,
  };

  if (description) taskDataObj.description = description;

  const updatedTaskData = JSON.stringify(taskDataObj);
  localStorage.setItem(taskName, updatedTaskData);
  window.dispatchEvent(storageEvent);
  clearInterval(+listItem.getAttribute('data-interval')!);
  this.style.display = 'none';
}

function backdropClickedHandler() {
  modals.forEach((modal) => (modal.style.display = 'none'));
  backdrop.style.display = 'none';
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
    goalTime: taskTime,
    progressTime: ZERO_TIME,
  };

  if (taskDescription) taskDataObj.description = taskDescription;

  const taskData = JSON.stringify(taskDataObj);

  localStorage.setItem(taskName, taskData);
  window.dispatchEvent(storageEvent);
  const newListItem = createListItem(taskName);
  tasksList.appendChild(newListItem);
  taskNameInput.value = '';
  taskTimeInput.value = '';
  formModal.style.display = 'none';
  backdrop.style.display = 'none';
}

//create DOM elements
function createListItem(taskName: string, progressTime?: string) {
  const liElement = document.createElement('li');
  const h4Element = document.createElement('h4');
  const pElement = document.createElement('p');
  const playBtn = document.createElement('button');
  const deleteBtn = document.createElement('button');
  const resetBtn = document.createElement('button');
  const textContainer = document.createElement('div');
  const buttonsContainer = document.createElement('div');
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
  liElement.addEventListener('click', (e) => {
    if ((e.target as any).tagName === 'BUTTON') return;

    const { goalTime, progressTime, description } = JSON.parse(
      localStorage.getItem(taskName)!
    ) as TaskDataType;
    (detailModal.children[0] as HTMLHeadingElement).innerText = taskName;
    (
      detailModal.children[1] as HTMLTimeElement
    ).innerText = `${progressTime.substring(0, 5)}/${goalTime}`;
    if (description)
      (detailModal.children[2] as HTMLParagraphElement).innerText = description;
    detailModal.style.display = 'block';
    backdrop.style.display = 'block';
  });
  return liElement;
}

function createSummarizeListItem(
  taskName: string,
  taskProgress: string,
  taskGoal: string
) {
  const liElement = document.createElement('li');
  const h4Element = document.createElement('h4');
  const pElement = document.createElement('p');
  h4Element.innerText = `${taskName}:`;
  pElement.innerText = `${taskProgress}/${taskGoal}`;
  liElement.appendChild(h4Element);
  liElement.appendChild(pElement);
  return liElement;
}
