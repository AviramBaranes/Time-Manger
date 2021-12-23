const addTaskBtn = document.getElementById('addBtn') as HTMLButtonElement;
const modals = document.querySelectorAll(
  '.modal'
) as NodeListOf<HTMLDivElement>;
const formModal = modals[0];
const deleteModal = modals[1];
const approveBtn = deleteModal.children[1].children[0];
const cancelBtn = deleteModal.children[1].children[1];
const form = formModal.children[0] as HTMLFormElement;
const taskNameInput = form.children[1].children[0] as HTMLInputElement;
const taskTimeInput = form.children[2].children[0] as HTMLInputElement;
const errorParagraph = document.getElementById('error') as HTMLParagraphElement;
const tasksList = document.querySelector('.tasks-lists') as HTMLUListElement;
const taskListItemTemplate = document.getElementsByTagName(
  'template'
)[0] as HTMLTemplateElement;

addTaskBtn.addEventListener('click', addTaskHandler);
form.addEventListener('submit', submitFormHandler);

function addTaskHandler() {
  formModal.style.display = 'block';
}

function createListItem(taskName: string) {
  const liEl = document.createElement('li');
  const h4El = document.createElement('h4');
  const pEl = document.createElement('p');
  const playBtn = document.createElement('button');
  const deleteBtn = document.createElement('button');
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

function deleteBtnClickedHandler(this: HTMLButtonElement) {
  deleteModal.style.display = 'block';
  //closure
  approveBtn.addEventListener('click', () => {
    localStorage.removeItem(
      (this.parentElement?.children[0] as HTMLHeadingElement).innerText
    );
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
      const progressTime = newTime.join(':');
      const { goalTime } = JSON.parse(localStorage.getItem(taskName)!);
      (currentListItem.children[1] as HTMLParagraphElement).innerText =
        progressTime;
      const updatedTaskData = JSON.stringify({ goalTime, progressTime });
      localStorage.setItem(taskName, updatedTaskData);
      currentListItem.setAttribute('data-interval', interval.toString());
    }, 10);
    console.log(interval);
  } else {
    this.innerText = 'start';
    clearInterval(+currentListItem.getAttribute('data-interval')!);
  }
}

function submitFormHandler(e: SubmitEvent) {
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

  const newListItem = createListItem(taskName);
  tasksList.appendChild(newListItem);
  taskNameInput.value = '';
  taskTimeInput.value = '';
  formModal.style.display = 'none';
}
