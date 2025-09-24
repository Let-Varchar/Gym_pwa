let exercises = JSON.parse(localStorage.getItem("exercises")) || [];
let plans = JSON.parse(localStorage.getItem("plans")) || [];
let journal = JSON.parse(localStorage.getItem("journal")) || [];

function saveData() {
  localStorage.setItem("exercises", JSON.stringify(exercises));
  localStorage.setItem("plans", JSON.stringify(plans));
  localStorage.setItem("journal", JSON.stringify(journal));
}

// Навигация
const tabs = document.querySelectorAll(".tab");
const tabButtons = document.querySelectorAll(".tab-bar button");
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
    if (btn.dataset.tab === "journal") renderJournal();
  });
});

// Списки
const exerciseList = document.getElementById("exerciseList");
const planList = document.getElementById("planList");

function renderExercises() {
  exerciseList.innerHTML = "";
  exercises.sort((a, b) => a.name.localeCompare(b.name));
  exercises.forEach(ex => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${ex.name}</span>`;
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = (e) => {
      e.stopPropagation();
      editExercise(ex.id);
    };
    li.appendChild(editBtn);
    li.onclick = () => viewExercise(ex.id);
    exerciseList.appendChild(li);
  });
}

function renderPlans() {
  planList.innerHTML = "";
  plans.forEach(plan => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${plan.title}</span>`;
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = (e) => {
      e.stopPropagation();
      editPlan(plan.id);
    };
    li.appendChild(editBtn);
    li.onclick = () => viewPlan(plan.id);
    planList.appendChild(li);
  });
}

// Добавление упражнения
document.getElementById("addExerciseBtn").addEventListener("click", () => {
  openModal("Добавить упражнение", (form) => {
    const name = form.querySelector("#name").value;
    const desc = form.querySelector("#desc").value;
    const file = form.querySelector("#media").files[0];
    let mediaUrl = file ? URL.createObjectURL(file) : null;

    exercises.push({ id: Date.now(), name, description: desc, media: mediaUrl });
    saveData();
    renderExercises();
  }, `
    <input id="name" placeholder="Название" required/>
    <textarea id="desc" placeholder="Описание"></textarea>
    <input type="file" id="media" accept="image/*,video/*,.gif"/>
    <button type="submit">Сохранить</button>
  `);
});

// Редактирование упражнения
function editExercise(exId) {
  const ex = exercises.find(e => e.id === exId);
  openModal("Редактировать упражнение", (form) => {
    ex.name = form.querySelector("#name").value;
    ex.description = form.querySelector("#desc").value;
    const file = form.querySelector("#media").files[0];
    if (file) {
      ex.media = URL.createObjectURL(file);
    }
    saveData();
    renderExercises();
  }, `
    <input id="name" value="${ex.name}" required/>
    <textarea id="desc">${ex.description || ""}</textarea>
    <input type="file" id="media" accept="image/*,video/*,.gif"/>
    <button type="submit">Сохранить</button>
  `);
}

// Просмотр упражнения (карточка + трекинг)
function viewExercise(exId) {
  const ex = exercises.find(e => e.id === exId);
  openModal(ex.name, (form) => {
    const weight = form.querySelector("#weight").value;
    const reps = form.querySelector("#reps").value;
    const date = new Date().toLocaleDateString("ru-RU");

    journal.push({ exerciseId: exId, date, weight, reps });
    saveData();
    renderJournal();
  }, `
    <p>${ex.description || ""}</p>
    ${ex.media ? `<img class="exercise-media" src="${ex.media}"/>` : ""}
    <input id="weight" type="number" placeholder="Вес (кг)"/>
    <input id="reps" type="number" placeholder="Повторы"/>
    <button type="submit">Добавить подход</button>
  `);
}

// Добавление плана
document.getElementById("addPlanBtn").addEventListener("click", () => {
  openModal("Создать план", (form) => {
    const title = form.querySelector("#title").value;
    plans.push({ id: Date.now(), title, exercises: [] });
    saveData();
    renderPlans();
  }, `
    <input id="title" placeholder="Название плана" required/>
    <button type="submit">Сохранить</button>
  `);
});

// Редактирование плана
function editPlan(planId) {
  const plan = plans.find(p => p.id === planId);
  openModal("Редактировать план", (form) => {
    plan.title = form.querySelector("#title").value;
    const selected = [...form.querySelectorAll("input[name='exercise']:checked")]
                      .map(el => Number(el.value));
    plan.exercises = selected;
    saveData();
    renderPlans();
  }, `
    <input id="title" value="${plan.title}" required/>
    <h4>Выбери упражнения:</h4>
    ${exercises.map(ex => `
      <label>
        <input type="checkbox" name="exercise" value="${ex.id}" ${plan.exercises.includes(ex.id) ? "checked" : ""}/>
        ${ex.name}
      </label>
    `).join("<br>")}
    <button type="submit">Сохранить</button>
  `);
}

// Просмотр плана с возможностью трекинга упражнений
function viewPlan(planId) {
  const plan = plans.find(p => p.id === planId);
  openModal(plan.title, null, `
    <h4>Упражнения:</h4>
    <ul>
      ${plan.exercises.map(exId => {
        const ex = exercises.find(e => e.id === exId);
        return `<li onclick="trackExercise(${exId})">${ex.name}</li>`;
      }).join("")}
    </ul>
  `);
}

// Трекинг подходов в упражнении внутри плана
function trackExercise(exId) {
  const ex = exercises.find(e => e.id === exId);
  openModal(ex.name, (form) => {
    const weight = form.querySelector("#weight").value;
    const reps = form.querySelector("#reps").value;
    const date = new Date().toLocaleDateString("ru-RU");

    journal.push({ exerciseId: exId, date, weight, reps });
    saveData();
    renderJournal();
  }, `
    <p>${ex.description || ""}</p>
    ${ex.media ? `<img class="exercise-media" src="${ex.media}"/>` : ""}
    <input id="weight" type="number" placeholder="Вес (кг)"/>
    <input id="reps" type="number" placeholder="Повторы"/>
    <button type="submit">Добавить подход</button>
  `);
}

// Журнал
function renderJournal() {
  const journalDiv = document.getElementById("journalEntries");
  journalDiv.innerHTML = "";
  const grouped = {};
  journal.forEach(j => {
    if (!grouped[j.date]) grouped[j.date] = [];
    grouped[j.date].push(j);
  });
  for (const date in grouped) {
    const block = document.createElement("div");
    block.innerHTML = `<h3>${date}</h3>`;
    grouped[date].forEach(s => {
      const ex = exercises.find(e => e.id === s.exerciseId);
      const p = document.createElement("p");
      p.textContent = `${ex.name}: ${s.weight || "-"} кг × ${s.reps || "-"} повт.`;
      block.appendChild(p);
    });
    journalDiv.appendChild(block);
  }
}

// Модалка
const modal = document.getElementById("modal");
const modalForm = document.getElementById("modalForm");
const modalTitle = document.getElementById("modalTitle");

function openModal(title, onSubmit, formFields) {
  modalTitle.textContent = title;
  modalForm.innerHTML = formFields;
  modal.classList.remove("hidden");
  modalForm.onsubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(modalForm);
    modal.classList.add("hidden");
  };
}
document.getElementById("closeModal").addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Старт
renderExercises();
renderPlans();
