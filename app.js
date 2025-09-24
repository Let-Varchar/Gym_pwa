// Простая локальная база (localStorage)
let exercises = JSON.parse(localStorage.getItem("exercises")) || [];
let plans = JSON.parse(localStorage.getItem("plans")) || [];
let journal = JSON.parse(localStorage.getItem("journal")) || [];

// Сохранение
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
    li.textContent = ex.name;
    exerciseList.appendChild(li);
  });
}

function renderPlans() {
  planList.innerHTML = "";
  plans.forEach(plan => {
    const li = document.createElement("li");
    li.textContent = plan.title;
    planList.appendChild(li);
  });
}

// Добавление
document.getElementById("addExerciseBtn").addEventListener("click", () => {
  openModal("Добавить упражнение", (form) => {
    const name = form.querySelector("#name").value;
    exercises.push({ name });
    saveData();
    renderExercises();
  }, `
    <input id="name" placeholder="Название упражнения" required/>
    <button type="submit">Сохранить</button>
  `);
});

document.getElementById("addPlanBtn").addEventListener("click", () => {
  openModal("Добавить план", (form) => {
    const title = form.querySelector("#title").value;
    plans.push({ title, exercises: [] });
    saveData();
    renderPlans();
  }, `
    <input id="title" placeholder="Название плана" required/>
    <button type="submit">Сохранить</button>
  `);
});

// Модалки
const modal = document.getElementById("modal");
const modalForm = document.getElementById("modalForm");
const modalTitle = document.getElementById("modalTitle");

function openModal(title, onSubmit, formFields) {
  modalTitle.textContent = title;
  modalForm.innerHTML = formFields;
  modal.classList.remove("hidden");
  modalForm.onsubmit = (e) => {
    e.preventDefault();
    onSubmit(modalForm);
    modal.classList.add("hidden");
  };
}

document.getElementById("closeModal").addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Первичная отрисовка
renderExercises();
renderPlans();
