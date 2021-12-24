const addTaskBtn = document.getElementById('addBtn') as HTMLButtonElement;
const modals = document.querySelectorAll(
  '.modal'
) as NodeListOf<HTMLDivElement>;
const formModal = modals[0];
const deleteModal = modals[1];
const taskFinishedModal = modals[2];
const summarizeModal = modals[3];
const approveBtn = deleteModal.children[1].children[0];
const cancelBtn = deleteModal.children[1].children[1];
const summarizeBtn = document.getElementById('summarize') as HTMLButtonElement;
const closeSummarizeBtn = summarizeModal.children[2];
const form = formModal.children[0] as HTMLFormElement;
const taskNameInput = form.children[1].children[0] as HTMLInputElement;
const taskTimeInput = form.children[2].children[0] as HTMLInputElement;
const errorParagraph = document.getElementById('error') as HTMLParagraphElement;
const tasksList = document.querySelector('.tasks-lists') as HTMLUListElement;
const tasksSummarizeList = document.querySelector(
  '.tasks-summarize'
) as HTMLUListElement;

const storageEvent = new CustomEvent('storageChanged');

window.addEventListener('storageChanged', storageChangedHandler);
window.addEventListener('storage', storageChangedHandler);
addTaskBtn.addEventListener('click', addTaskHandler);
form.addEventListener('submit', submitFormHandler);
summarizeBtn.addEventListener('click', summarizeBtnClickedHandler);
closeSummarizeBtn.addEventListener('click', closeSummarizeBtnClickedHandler);

//eventListeners

function addTaskHandler() {
  formModal.style.display = 'block';
}

function closeSummarizeBtnClickedHandler() {
  summarizeModal.style.display = 'none';
  const listItems = Array.from(tasksSummarizeList.children);
  listItems.forEach((item) => item.remove());
  summarizeBtn.disabled = false;
}

function storageChangedHandler() {
  if (localStorage.length) summarizeBtn.style.display = 'block';
  else summarizeBtn.style.display = 'none';
}

function summarizeBtnClickedHandler(this: HTMLButtonElement) {
  // if (summarizeModal.style.display === 'block') {
  // } else {
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
  // }
}

function deleteBtnClickedHandler(this: HTMLButtonElement) {
  deleteModal.style.display = 'block';
  //closure
  approveBtn.addEventListener('click', () => {
    localStorage.removeItem(
      (this.parentElement?.children[0] as HTMLHeadingElement).innerText
    );
    window.dispatchEvent(storageEvent);
    this.parentElement!.remove();
    deleteModal.style.display = 'none';
  });
  cancelBtn.addEventListener('click', () => {
    deleteModal.style.display = 'none';
  });
}

function playBtnClickedHandler(this: HTMLButtonElement) {
  const currentListItem = this.parentElement!;
  if (this.innerText === 'start') {
    this.innerText = 'stop';
    const interval = setInterval(() => {
      const currentTime = (currentListItem.children[1] as HTMLParagraphElement)
        .innerText;
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
      const taskName = (currentListItem.children[0] as HTMLHeadingElement)
        .innerText;
      const { goalTime } = JSON.parse(localStorage.getItem(taskName)!);
      const [hoursGoal, minutesGoal] = goalTime.split(':');
      if (hoursGoal === newTime[0] && minutesGoal === newTime[1]) {
        (
          taskFinishedModal.children[1] as HTMLParagraphElement
        ).innerText = `You finished the task: ${taskName}`;
        taskFinishedModal.style.display = 'block';
        taskFinishedModal.children[2].addEventListener('click', () => {
          clearInterval(interval);
          taskFinishedModal.style.display = 'none';
          (taskFinishedModal.children[1] as HTMLParagraphElement).innerText =
            '';
        });
      }
      const progressTime = newTime.join(':');
      (currentListItem.children[1] as HTMLParagraphElement).innerText =
        progressTime;
      const updatedTaskData = JSON.stringify({ goalTime, progressTime });
      localStorage.setItem(taskName, updatedTaskData);
      window.dispatchEvent(storageEvent);
      currentListItem.setAttribute('data-interval', interval.toString());
    }, 10);
  } else {
    this.innerText = 'start';
    clearInterval(+currentListItem.getAttribute('data-interval')!);
  }
}

function submitFormHandler(e: Event) {
  e.preventDefault();

  const taskName = taskNameInput.value;
  const taskTime = taskTimeInput.value;

  if (!taskName.length || !taskTime.length) {
    errorParagraph.innerText = 'One of the fields are empty';
    return;
  }

  const taskData = JSON.stringify({
    goalTime: taskTime,
    progressTime: '00:00:00:00',
  });

  localStorage.setItem(taskName, taskData);
  window.dispatchEvent(storageEvent);
  const newListItem = createListItem(taskName);
  tasksList.appendChild(newListItem);
  taskNameInput.value = '';
  taskTimeInput.value = '';
  formModal.style.display = 'none';
}

//create DOM elements

function createListItem(taskName: string) {
  const liElement = document.createElement('li');
  const h4Element = document.createElement('h4');
  const pElement = document.createElement('p');
  const playBtn = document.createElement('button');
  const deleteBtn = document.createElement('button');
  h4Element.innerText = taskName;
  pElement.innerText = '00:00:00:00';
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
