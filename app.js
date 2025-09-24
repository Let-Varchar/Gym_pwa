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

const exerciseList = document.getElementById("exerciseList");
const planList = document.getElementById("planList");
const screen = document.getElementById("screen");

// ------------------- Упражнения -------------------
function renderExercises() {
  exerciseList.innerHTML = "";
  exercises.sort((a, b) => a.name.localeCompare(b.name));
  exercises.forEach(ex => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${ex.name}</span>`;
    exerciseList.appendChild(li);
  });
}

// ------------------- Планы -------------------
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

// Экран конкретного плана
function viewPlan(planId) {
  const plan = plans.find(p => p.id === planId);
  screen.innerHTML = `
    <h3>${plan.title}</h3>
    <ul>
      ${plan.exercises.map(exId => {
        const ex = exercises.find(e => e.id === exId);
        return `<li onclick="viewExercise(${exId}, ${planId})">${ex.name}</li>`;
      }).join("") || "<p>Нет упражнений</p>"}
    </ul>
  `;
}

// Экран конкретного упражнения внутри плана
function viewExercise(exId, planId) {
  const ex = exercises.find(e => e.id === exId);
  screen.innerHTML = `
    <h3>${ex.name}</h3>
    <p>${ex.description || ""}</p>
    ${ex.media ? `<img class="exercise-media" src="${ex.media}"/>` : ""}
    <input id="weight" type="number" placeholder="Вес (кг)"/>
    <input id="reps" type="number" placeholder="Повторы"/>
    <button onclick="addSet(${exId}, ${planId})">➕ Добавить подход</button>
    <div id="sets">${renderExerciseJournal(exId)}</div>
    <button onclick="viewPlan(${planId})">⬅️ Назад к плану</button>
  `;
}

// Добавление подхода
function addSet(exId, planId) {
  const weight = document.getElementById("weight").value;
  const reps = document.getElementById("reps").value;
  const now = new Date();
  const date = now.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

  journal.push({ exerciseId: exId, date, weight, reps });
  saveData();
  viewExercise(exId, planId); // перерисовать экран
}

// Журнал по упражнению
function renderExerciseJournal(exId) {
  let html = "";
  const grouped = {};
  journal.filter(j => j.exerciseId === exId).forEach(j => {
    if (!grouped[j.date]) grouped[j.date] = [];
    grouped[j.date].push(j);
  });
  for (const date in grouped) {
    html += `<h4>${date}</h4>`;
    grouped[date].forEach(s => {
      html += `<p>${s.weight || "-"} кг × ${s.reps || "-"} повт.</p>`;
    });
  }
  return html || "<p>Нет записей</p>";
}

// ------------------- Журнал -------------------
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

// ------------------- Добавление -------------------
document.getElementById("addExerciseBtn").addEventListener("click", () => {
  const name = prompt("Название упражнения:");
  if (name) {
    exercises.push({ id: Date.now(), name, description: "", media: "" });
    saveData();
    renderExercises();
  }
});

document.getElementById("addPlanBtn").addEventListener("click", () => {
  const title = prompt("Название плана:");
  if (title) {
    plans.push({ id: Date.now(), title, exercises: [] });
    saveData();
    renderPlans();
  }
});

// ------------------- Старт -------------------
renderExercises();
renderPlans();
