document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".header");

  // This event listener checks if the user has scrolled more than 10px
  // If yes, it adds the 'scrolled' class to the header (for styling changes like shrinking)
  // If not, it removes the 'scrolled' class
  window.addEventListener("scroll", function () {
    if (window.scrollY > 10) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // sticky nav 
   const navWrapper = document.getElementById("navWrapper");
  const trigger = document.querySelector(".sticky-trigger");

  const observer = new IntersectionObserver(
      (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        navWrapper.classList.add("sticky-nav-wrapper");
      } else {
        navWrapper.classList.remove("sticky-nav-wrapper");
      }
    });
  },
  {
    rootMargin: "-60px 0px 0px 0px", // triggers earlier, avoids flicker
    threshold: 0
  }
  );

  observer.observe(trigger);

  // back to top logic
  const backToTopBtn = document.getElementById("backToTop");

  window.onscroll = function() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      backToTopBtn.style.display = "block";
    } else {
      backToTopBtn.style.display = "none";
    }
  };

  backToTopBtn.onclick = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  document.getElementById("start-quiz-btn").addEventListener("click", () => {
  document.getElementById("quiz-instructions").style.display = "none";
  document.getElementById("quiz-content").style.display = "block";
});
});

// Object to store references to different topic sections by their IDs
let topicElements = {
  aim: document.getElementById("aim"),
  theory: document.getElementById("theory"),
  procedure: document.getElementById("procedure"),
  practice: document.getElementById("practice"),
  code: document.getElementById("code"),
  result: document.getElementById("result"),
  quiz: document.getElementById("quiz"),
  references: document.getElementById("references"),
  tnt: document.getElementById("tnt"),
};

let currentTopic = "aim"; // Track the currently displayed topic
function switchContent(topic) {
    if (topic === currentTopic) {
        return; // Prevent unnecessary updates if the same topic is clicked again
    }

    topicElements[currentTopic].style.display = 'none'; // Hide the previous topic
    topicElements[topic].style.display = 'block'; // Show the selected topic
    currentTopic = topic; // Update the current topic
}

// Generalized function to toggle language-based code blocks
function toggleCode(language) {
  const allCodeBlocks = document.querySelectorAll(".code-block");
  allCodeBlocks.forEach((block) => block.classList.remove("active"));

  const selectedCodeBlock = document.getElementById(language + "Code");
  selectedCodeBlock.classList.add("active");
}

// Clipboard copy function
function copyCode(elementId) {
  const codeBlock = document.getElementById(elementId);
  const code = codeBlock.querySelector("code").innerText;

  // Copy the selected code text to clipboard
  navigator.clipboard
    .writeText(code)
    .then(() => {
      const copyButton = codeBlock.querySelector(".copy-button");
      copyButton.textContent = "Copied!"; // Temporarily change button text
      setTimeout(() => {
        copyButton.textContent = "Copy"; // Reset text after 2 seconds
      }, 2000);
    })
    .catch((err) => {
      console.error("Could not copy text: ", err);
    });
}

// Event listeners for radio buttons
document
  .getElementById("cppRadio")
  .addEventListener("change", () => toggleCode("cpp"));
document
  .getElementById("pythonRadio")
  .addEventListener("change", () => toggleCode("python"));

// Event listener for copy buttons
document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", function () {
    const language = button.closest(".code-block").id.replace("Code", "");
    copyCode(language + "Code");
  });
});

// Quiz Logic
const questions = [
  {
    question: " Q1) Which of the following is/are valid searching algorithms?",
    choices: ["Linear Search", "Bubble Sort", "Binary Search", "Quick Sort"],
    correctAnswers: [0, 2]
  },
  {
    question: " Q2) What is/are the time complexity of linear search?",
    choices: ["O(log n)", "O(n)", "O(n^2)", "O(1)"],
    correctAnswers: [1]
  },
];

let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
const questionElement = document.getElementById("question");
const choicesContainer = document.getElementById("choices");
const nextButton = document.getElementById("next-btn");
const retakeButton = document.getElementById("retake-btn");
const seeAnswersButton = document.getElementById("see-answers-btn");
const quizReport = document.getElementById("quiz-report");

seeAnswersButton.addEventListener("click", displayCorrectAnswers);

function showQuestion() {
  let currentQuestion = questions[currentQuestionIndex];
  questionElement.textContent = currentQuestion.question;
  choicesContainer.innerHTML = "";
  userAnswers[currentQuestionIndex] = [];

  currentQuestion.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.textContent = choice;
    button.classList.add("choice");
    button.addEventListener("click", () => toggleSelection(index));
    choicesContainer.appendChild(button);
  });

  nextButton.disabled = true; // Disable Next until an answer is selected
  nextButton.style.display = "block";
  retakeButton.style.display = "none";
  seeAnswersButton.style.display = "none";
}

function toggleSelection(selectedIndex) {
  if (!userAnswers[currentQuestionIndex]) {
    userAnswers[currentQuestionIndex] = [];
  }
  const selected = userAnswers[currentQuestionIndex];
  const idx = selected.indexOf(selectedIndex);

  if (idx > -1) {
    selected.splice(idx, 1);
  } else {
    selected.push(selectedIndex);
  }

  // Update button styles
  document.querySelectorAll(".choice").forEach((btn, index) => {
    if (selected.includes(index)) {
      btn.style.backgroundColor = "#4285F4";
      btn.style.color = "white";
    } else {
      btn.style.backgroundColor = "#f1f1f1";
      btn.style.color = "black";
    }
  });

  nextButton.disabled = selected.length === 0;
}

function checkAnswer() {
  const correctAnswers = questions[currentQuestionIndex].correctAnswers;
  const userAnswer = userAnswers[currentQuestionIndex];

  if (arraysEqual(correctAnswers, userAnswer)) {
    score++;
  }

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  } else {
    showResults();
  }
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((val) => b.includes(val));
}

function showResults() {
  questionElement.textContent = `Quiz Completed! \r\n Your Score: ${score} / ${questions.length}`;
  choicesContainer.innerHTML = "";
  nextButton.style.display = "none";
  retakeButton.style.display = "block";
  seeAnswersButton.style.display = "block";
  displayQuizReport();
}

function displayQuizReport() {
  quizReport.style.display = "block";
  quizReport.innerHTML = "<h3>Quiz Report</h3>";

  questions.forEach((q, index) => {
    const userAnswer = userAnswers[index] || [];
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("quiz-report-question");

    const questionText = document.createElement("p");
    questionText.textContent = q.question;
    questionDiv.appendChild(questionText);

    const choicesList = document.createElement("ul");
    q.choices.forEach((choice, i) => {
      const choiceItem = document.createElement("li");
      const isSelected = userAnswer.includes(i);
      const isCorrect = q.correctAnswers.includes(i);

      if (isSelected) {
        choiceItem.style.backgroundColor = isCorrect ? "green" : "red";
        choiceItem.style.color = "white";
      }
      choiceItem.textContent = choice;
      choicesList.appendChild(choiceItem);
    });

    questionDiv.appendChild(choicesList);
    quizReport.appendChild(questionDiv);
  });
}

function displayCorrectAnswers() {
  quizReport.innerHTML = "<h3>Correct Answers</h3>";

  questions.forEach((q) => {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("quiz-correct-answers");

    const questionText = document.createElement("p");
    questionText.textContent = q.question;
    questionDiv.appendChild(questionText);

    const correctList = document.createElement("ul");
    q.correctAnswers.forEach((i) => {
      const li = document.createElement("li");
      li.textContent = q.choices[i];
      li.style.color = "green";
      correctList.appendChild(li);
    });

    questionDiv.appendChild(correctList);
    quizReport.appendChild(questionDiv);
  });

  seeAnswersButton.style.display = "none";
}

retakeButton.addEventListener("click", () => {
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  quizReport.style.display = "none";
  showQuestion();
});

nextButton.addEventListener("click", checkAnswer);

showQuestion();

// Practice Section Logic
const practiceCanvas = document.getElementById("practice-canvas");
const ctx = practiceCanvas.getContext("2d");
const prevStepBtn = document.getElementById("prev-step-btn");
const nextStepBtn = document.getElementById("next-step-btn");
const resetGraphBtn = document.getElementById("reset-graph-btn");
const practiceMessageArea = document.getElementById("practice-message-area");

const nodes = [
  { x: 50, y: 50,  name: "A" },
  { x: 100, y: 170,  name: "B" },
  { x: 220, y: 90,  name: "C" },
  { x: 60, y: 350,  name: "D" },
  { x: 400, y: 250,  name: "E" },
  { x: 420, y: 100,  name: "F" },
  { x: 550, y: 300,  name: "G" },
  { x: 530, y: 40,  name: "H" },
  { x: 380, y: 390,  name: "I" },
  { x: 565, y: 450,  name: "J" },
  { x: 230, y: 350,  name: "K" },
  { x: 250, y: 470,  name: "L" },
  { x: 40, y: 450,  name: "M" },
  { x: 135, y: 565,  name: "N" },
  { x: 400, y: 550,  name: "O" },

];

const edges = [
  { start: 0, end: 1, cost: 13 },
  { start: 0, end: 2, cost: 17 },
  { start: 1, end: 3, cost: 18 },
  { start: 1, end: 10, cost: 22 },
  { start: 1, end: 2, cost: 14 },
  { start: 1, end: 4, cost: 31 }, 
  { start: 2, end: 4, cost: 24 },
  { start: 2, end: 5, cost: 20 },
  { start: 3, end: 10, cost: 17 },
  { start: 3, end: 12, cost: 10 },
  { start: 4, end: 10, cost: 19 },
  { start: 4, end: 5, cost: 15 },
  { start: 4, end: 6, cost: 15 },
  { start: 4, end: 8, cost: 14 },
  { start: 5, end: 7, cost: 12 },
  { start: 6, end: 5, cost: 23 },
  { start: 6, end: 9, cost: 15 },
  { start: 7, end: 6, cost: 26 },
  { start: 8, end: 6, cost: 19 },
  { start: 8, end: 10, cost: 15 },
  { start: 8, end: 11, cost: 15 },
  { start: 8, end: 14, cost: 16 },
  { start: 9, end: 8, cost: 19 },
  { start: 9, end: 14, cost: 19 },
  { start: 10, end: 11, cost: 12 },
  { start: 11, end: 13, cost: 14 },
  { start: 11, end: 14, cost: 17 },
  { start: 12, end: 13, cost: 14 },
  { start: 13, end: 14, cost: 26 },
  
];

let startNode = null;
let endNode = null;
let astarStates = [];
let currentStateIndex = 0;

function drawGraph() {
  ctx.clearRect(0, 0, practiceCanvas.width, practiceCanvas.height);

  // Draw edges
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 2;
  edges.forEach(edge => {
    const start = nodes[edge.start];
    const end = nodes[edge.end];
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    
    // Draw edge cost
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(edge.cost, (start.x + end.x) / 2, (start.y + end.y) / 2 - 10);
  });

  // Draw nodes
  nodes.forEach((node, index) => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "lightblue"; // Undiscovered
    if (index === startNode) ctx.fillStyle = "green";
    if (index === endNode) ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.name, node.x, node.y);
    ctx.font = "12px Arial";
    ctx.fillText(`h=${node.h}`, node.x, node.y + 15);
  });
}

function getClickedNode(event) {
  const rect = practiceCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
    if (distance < 20) {
      return i;
    }
  }
  return null;
}

practiceCanvas.addEventListener("click", (event) => {
  const clickedNode = getClickedNode(event);
  if (clickedNode !== null) {
    if (startNode === null) {
      startNode = clickedNode;
      practiceMessageArea.textContent = `Start node selected: ${nodes[startNode].name}`;
    } else if (endNode === null) {
      endNode = clickedNode;
      practiceMessageArea.textContent = `End node selected: ${nodes[endNode].name}. Click 'Next Step' to start the algorithm.`;
      runAStar();
    }
    drawGraph();
  }
});

function calculateHeuristics(goalNodeIndex) {
  const goalNode = nodes[goalNodeIndex];
  nodes.forEach((node, index) => {
    const dx = node.x - goalNode.x;
    const dy = node.y - goalNode.y;
    // integer division after scaling
    nodes[index].h = Math.round(Math.sqrt(Math.sqrt((dx * dx) + (dy * dy)) / 10));
  });
}


function runAStar() {
  if (startNode === null || endNode === null) return;

  calculateHeuristics(endNode);

  let openList = [{ index: startNode, g: 0, f: nodes[startNode].h, parent: null }];
  let closedList = [];
  astarStates = [];
  currentStateIndex = 0;
  let algorithmStepsHTML = "<h2>Algorithm Steps</h2>";

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const currentNode = openList.shift();
    closedList.push(currentNode.index);

    astarStates.push({
      openList: [...openList],
      closedList: [...closedList],
      currentNode: currentNode,
      path: reconstructPath(currentNode)
    });
    
    algorithmStepsHTML += generateAlgorithmSteps(astarStates.length - 1);

    if (currentNode.index === endNode) {
      practiceMessageArea.textContent = "Goal reached!";
      const finalState = astarStates[astarStates.length - 1];
      finalState.finalPath = finalState.path;
      updateVisualization(); 
      break;
    }

    const neighbors = edges.filter(edge => edge.start === currentNode.index || edge.end === currentNode.index)
      .map(edge => edge.start === currentNode.index ? edge.end : edge.start);

    neighbors.forEach(neighborIndex => {
      if (closedList.includes(neighborIndex)) return;

      const g = currentNode.g + edges.find(edge => (edge.start === currentNode.index && edge.end === neighborIndex) || (edge.start === neighborIndex && edge.end === currentNode.index)).cost;
      const h = nodes[neighborIndex].h;
      const f = g + h;

      const existingOpen = openList.find(node => node.index === neighborIndex);
      if (!existingOpen || g < existingOpen.g) {
        if (existingOpen) {
          existingOpen.g = g;
          existingOpen.f = f;
          existingOpen.parent = currentNode;
        } else {
          openList.push({ index: neighborIndex, g: g, f: f, parent: currentNode });
        }
      }
    });
  }
  document.getElementById("algorithm-steps").innerHTML = algorithmStepsHTML;
  updateVisualization();
}

function generateAlgorithmSteps(iteration) {
  const state = astarStates[iteration];
  let stepsHTML = `<h3>Iteration ${iteration + 1}</h3>`;
  stepsHTML += `<p>Current Node: ${nodes[state.currentNode.index].name}</p>`;
  stepsHTML += `<p>Open List: ${state.openList.map(n => nodes[n.index].name).join(", ")}</p>`;
  stepsHTML += `<p>Closed List: ${state.closedList.map(i => nodes[i].name).join(", ")}</p>`;
  return stepsHTML;
}

function reconstructPath(node) {
  const path = [];
  let current = node;
  while (current) {
    path.unshift(current.index);
    current = current.parent;
  }
  return path;
}

function updateVisualization() {
  const state = astarStates[currentStateIndex];
  if (!state) return;

  drawGraph();

  // Highlight open list
  state.openList.forEach(node => {
    const n = nodes[node.index];
    ctx.beginPath();
    ctx.arc(n.x, n.y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255, 255, 0, 0.5)"; // Yellow
    ctx.fill();
  });

  // Highlight closed list
  state.closedList.forEach(index => {
    const n = nodes[index];
    ctx.beginPath();
    ctx.arc(n.x, n.y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255, 165, 0, 0.5)"; // Orange
    ctx.fill();
  });

  // Highlight current node
  const currentNode = nodes[state.currentNode.index];
  ctx.beginPath();
  ctx.arc(currentNode.x, currentNode.y, 20, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(144, 238, 144, 0.5)"; // Light Green
  ctx.fill();

  // Draw path
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < state.path.length; i++) {
    const node = nodes[state.path[i]];
    if (i === 0) {
      ctx.moveTo(node.x, node.y);
    } else {
      ctx.lineTo(node.x, node.y);
    }
  }
  ctx.stroke();

  // Draw final path in red
  if (state.finalPath) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < state.finalPath.length; i++) {
      const node = nodes[state.finalPath[i]];
      if (i === 0) {
        ctx.moveTo(node.x, node.y);
      } else {
        ctx.lineTo(node.x, node.y);
      }
    }
    ctx.stroke();
  }
  
  practiceMessageArea.textContent = `Current Node: ${nodes[state.currentNode.index].name}, f=${state.currentNode.f.toFixed(2)}, g=${state.currentNode.g.toFixed(2)}, h=${nodes[state.currentNode.index].h.toFixed(2)}`;
}

nextStepBtn.addEventListener("click", () => {
  if (currentStateIndex < astarStates.length - 1) {
    currentStateIndex++;
    updateVisualization();
  }
});

prevStepBtn.addEventListener("click", () => {
  if (currentStateIndex > 0) {
    currentStateIndex--;
    updateVisualization();
  }
});

resetGraphBtn.addEventListener("click", () => {
  startNode = null;
  endNode = null;
  astarStates = [];
  currentStateIndex = 0;
  practiceMessageArea.textContent = "Select a start node.";
  drawGraph();
});

drawGraph();
practiceMessageArea.textContent = "Select a start node.";