const bible = document.getElementById('bible');
const resultDisplay = document.getElementById('resultName');
const statsDisplay = document.getElementById('statsDisplay');
const historyList = document.getElementById('historyList');
const drawBtn = document.getElementById('drawBtn');

let alreadyDrawn = [];
let isDrawing = false;

function updateStats() {
    const names = getNames();
    const available = names.filter(n => !alreadyDrawn.includes(n));
    statsDisplay.innerText = `Disponíveis: ${available.length} | Sorteados: ${alreadyDrawn.length}`;
    
    // Salva o estado do sorteio
    localStorage.setItem('alreadyDrawn', JSON.stringify(alreadyDrawn));
}

function getNames() {
    const textArea = document.getElementById('nameList');
    if (!textArea) return [];
    return textArea.value.split(/[\n,]+/).map(n => n.trim()).filter(n => n !== "");
}

function autoResize(textarea) {
  textarea.style.height = "auto";
  const newHeight = textarea.scrollHeight;
  textarea.style.height = newHeight + "px";

  // Se a altura atingir o max-height (definido como 250px no CSS)
  if (newHeight >= 250) {
    textarea.style.overflowY = "auto";
  } else {
    textarea.style.overflowY = "hidden";
  }
  
  // Salva a lista de nomes toda vez que mudar
  localStorage.setItem('nameList', textarea.value);
  
  updateStats();
}

function showAlert() {
    const alert = document.getElementById('customAlert');
    alert.classList.add('show');
    setTimeout(() => alert.classList.remove('show'), 3000);
}

function drawName() {
    if (isDrawing) return;

    const names = getNames();
    const available = names.filter(n => !alreadyDrawn.includes(n));

    if (names.length === 0) return;
    if (available.length === 0) {
        showAlert();
        return;
    }

    isDrawing = true;
    drawBtn.disabled = true;

    // Se estiver aberta, fecha primeiro
    if (bible.classList.contains('open')) {
        bible.classList.remove('open');
        setTimeout(() => performDrawing(available), 700);
    } else {
        performDrawing(available);
    }
}

function performDrawing(available) {
    let iterations = 0;
    const maxIterations = 12;
    
    const interval = setInterval(() => {
        const tempWinner = available[Math.floor(Math.random() * available.length)];
        resultDisplay.innerText = tempWinner;
        iterations++;
        
        if (iterations >= maxIterations) {
            clearInterval(interval);
            const finalWinner = available[Math.floor(Math.random() * available.length)];
            resultDisplay.innerText = finalWinner;
            
            alreadyDrawn.push(finalWinner);
            updateHistory(finalWinner);
            
            bible.classList.add('open');
            updateStats();

            // Libera o botão após a animação de abertura
            setTimeout(() => {
                isDrawing = false;
                drawBtn.disabled = false;
            }, 600);
        }
    }, 50);
}

function updateHistory(name) {
    if (alreadyDrawn.length === 1) historyList.innerHTML = "";
    const item = document.createElement('div');
    item.innerText = `${alreadyDrawn.length}. ${name}`;
    historyList.prepend(item);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const namesInput = document.getElementById('nameList');
    
    // Recupera nomes salvos
    const savedNames = localStorage.getItem('nameList');
    if (savedNames && namesInput) {
        namesInput.value = savedNames;
    }

    // Recupera sorteados e reconstrói o histórico
    const savedDrawn = localStorage.getItem('alreadyDrawn');
    if (savedDrawn) {
        alreadyDrawn = JSON.parse(savedDrawn);
        historyList.innerHTML = "";
        alreadyDrawn.forEach((name, index) => {
            const item = document.createElement('div');
            item.innerText = `${index + 1}. ${name}`;
            historyList.prepend(item);
        });
    }

    if (namesInput) {
        autoResize(namesInput);
    }
});

// --- Reset com modal HTML customizado (sem confirm() nativo) ---
function openResetModal() {
    document.getElementById('resetModal').style.display = 'flex';
}

function closeResetModal() {
    document.getElementById('resetModal').style.display = 'none';
}

function confirmReset() {
    closeResetModal();

    // Limpa estado
    alreadyDrawn = [];
    localStorage.setItem('alreadyDrawn', JSON.stringify([]));

    // Atualiza UI
    historyList.innerHTML = 'Lista de sorteados...';
    resultDisplay.innerText = '...';
    bible.classList.remove('open');

    updateStats();
}

// Expose functions to global scope for HTML onclick handlers
window.drawName = drawName;
window.autoResize = autoResize;
window.openResetModal = openResetModal;
window.closeResetModal = closeResetModal;
window.confirmReset = confirmReset;
