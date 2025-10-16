// Elements
const startBtn = document.getElementById('start-training');
const landingPage = document.getElementById('landing-page');
const dashboard = document.getElementById('dashboard');
const navButtons = document.querySelectorAll('.nav-btn');
const moduleContent = document.getElementById('module-content');

// Stats
let streak = localStorage.getItem('streak') || 0;
let points = localStorage.getItem('points') || 0;
let completion = localStorage.getItem('completion') || 0;
let badges = JSON.parse(localStorage.getItem('badges')) || [];

// Update Stats UI
function updateStats() {
  document.getElementById('streak').textContent = streak;
  document.getElementById('points').textContent = points;
  document.getElementById('completion').textContent = completion + '%';
  document.getElementById('badges').textContent = badges.length ? badges.join(', ') : 'None';
}
updateStats();

// Start Training
startBtn.addEventListener('click', () => {
  landingPage.classList.add('hidden');
  dashboard.classList.remove('hidden');
});

// Modules Data
const modules = {
  quiz: { name: "Quiz", questions: generateDummyQuestions("Quiz") },
  phishing: { name: "Phishing Simulation", questions: generateDummyQuestions("Phishing") },
  password: { name: "Password Training", questions: generateDummyQuestions("Password Training") },
  keymessage: { name: "Key Message", questions: generateDummyQuestions("Key Message") },
  deepfake: { name: "Deepfake Awareness", questions: generateDummyQuestions("Deepfake Awareness") },
  reporting: { name: "Reporting Security Incidents", questions: generateDummyQuestions("Reporting") },
  culture: { name: "Culture Survey", questions: generateDummyQuestions("Culture Survey") },
  social: { name: "Social Engineering", questions: generateDummyQuestions("Social Engineering") }
};

function generateDummyQuestions(moduleName) {
  let questions = [];
  for (let i = 1; i <= 10; i++) {
    questions.push({
      question: `${moduleName} Question ${i}: What is the correct answer?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      answer: "Option A"
    });
  }
  return questions;
}

// Navigation Buttons
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const module = btn.getAttribute('data-module');
    loadModule(module);
  });
});

// Load Module
let currentModule = null;
let currentQuestion = 0;

function loadModule(module) {
  if (module === 'dashboard') {
    moduleContent.innerHTML = "<p>Select a module to start training.</p>";
    return;
  }

  currentModule = modules[module];
  currentQuestion = 0;
  renderQuestion();
}

// Render Question
function renderQuestion() {
  if (!currentModule) return;
  const q = currentModule.questions[currentQuestion];

  let html = `
    <div class="question-card">
      <h3>${q.question}</h3>
      <div class="options">
        ${q.options.map(opt => `<button onclick="selectOption('${opt}')">${opt}</button>`).join('')}
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width:${((currentQuestion+1)/currentModule.questions.length)*100}%"></div>
      </div>
    </div>
  `;

  if (currentQuestion < currentModule.questions.length - 1) {
    html += `<button class="next-btn" onclick="nextQuestion()">Next Question</button>`;
  } else {
    html += `<button class="next-btn" onclick="finishModule()">Finish Module</button>`;
  }

  moduleContent.innerHTML = html;
}

// Option Selection
function selectOption(option) {
  points = parseInt(points) + 10;
  streak = parseInt(streak) + 1;
  updateCompletion();
  saveStats();
  updateStats();
}

// Next Question
function nextQuestion() {
  if (currentQuestion < currentModule.questions.length -1) {
    currentQuestion++;
    renderQuestion();
  }
}

// Finish Module
function finishModule() {
  badges.push(currentModule.name);
  alert(`🎄 Congratulations! You completed ${currentModule.name}! 🎄`);
  updateCompletion();
  saveStats();
  updateStats();
  moduleContent.innerHTML = `<p>Module Completed! Print your certificate below:</p>
  <button onclick="printCertificate('${currentModule.name}')">Print Certificate</button>`;
}

// Update Completion
function updateCompletion() {
  const totalModules = Object.keys(modules).length;
  const completed = badges.length;
  completion = Math.round((completed/totalModules)*100);
}

// Save to localStorage
function saveStats() {
  localStorage.setItem('streak', streak);
  localStorage.setItem('points', points);
  localStorage.setItem('completion', completion);
  localStorage.setItem('badges', JSON.stringify(badges));
}

// Print Certificate
function printCertificate(moduleName) {
  const certWindow = window.open('', '', 'width=600,height=400');
  certWindow.document.write(`
    <html><head><title>Certificate</title></head><body style="text-align:center;font-family:Arial;">
      <h1>Certificate of Completion</h1>
      <p>This certifies that you have completed the module:</p>
      <h2>${moduleName}</h2>
      <p>Congratulations!</p>
      <button onclick="window.print()">Print</button>
    </body></html>
  `);
  certWindow.document.close();
}