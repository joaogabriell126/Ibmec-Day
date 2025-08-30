document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÃO DO ENIGMA ---
    const puzzles = [
        { brandName: "Meta", logoFile: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Meta-Logo.png/1200px-Meta-Logo.png", requiredColors: ['meta-blue'], revealedWord: "TECNOLOGIA" },
        { brandName: "Zona Sul", logoFile: "https://cdn.prod.website-files.com/672409b074922677cd2f729e/6760ddb18a27cf335cd3093a_zonasul-logo.png", requiredColors: ['zona-sul-green'], revealedWord: "ALIMENTA" },
        { brandName: "Parmê", logoFile: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxmCb110xICx6HK25XqGgH7FIYieexyQHXSsoIrlLM5CntaH2ZUM1HsQdfiwH6h4hxzQE&usqp=CAU", requiredColors: ['parme-red', 'parme-green'], revealedWord: "NOSSAS" },
        { brandName: "Vale", logoFile: "images/vale-logo.png", requiredColors: ['vale-green', 'vale-yellow'], revealedWord: "VIDAS," },
        { brandName: "Americanas", logoFile: "images/americanas-logo.png", requiredColors: ['americanas-red'], revealedWord: "TRANSFORMANDO O FUTURO." }
    ];
    const universalHint = "Talvez você deva pensar o contrário, ou melhor dizendo, o que for complementar.";
    const allColors = {
        'meta-blue': { name: 'Azul', hex: '#0064E0', unlocked: true},
        'zona-sul-green': { name: 'Verde ', hex: '#009739', unlocked: true},
        'parme-red': { name: 'Vermelho', hex: '#D92E2E', unlocked: true },
        'parme-green': { name: 'Verde ', hex: '#008A4E', unlocked: true },
        'vale-green': { name: 'Verde ', hex: '#269A45', unlocked: true },
        'vale-yellow': { name: 'Amarelo', hex: '#FDB913', unlocked: true },
        'americanas-red': { name: 'Vermelho', hex: '#E60014', unlocked: true }
    };

    // --- VARIÁVEIS DE ESTADO DO JOGO ---
    let currentPuzzleIndex;
    let collectedColors;
    let revealedWords;
    let livesLeft;
    let isGameOver;

    // --- ELEMENTOS DO HTML ---
    const colorPalette = document.getElementById('color-palette');
    const logoContainer = document.getElementById('logo-container');
    const brandNameEl = document.getElementById('brand-name');
    const revealedWordsEl = document.getElementById('revealed-words');
    const puzzleCounterEl = document.getElementById('puzzle-counter');
    const hintButton = document.getElementById('hint-button');
    const hintModal = document.getElementById('hint-modal');
    const hintTextEl = document.getElementById('hint-text');
    const closeButton = document.querySelector('.close-button');
    const appliedColorsContainer = document.getElementById('applied-colors-container');
    const livesCounterEl = document.getElementById('lives-counter');
    const gameOverModalEl = document.getElementById('game-over-modal');
    const restartButton = document.getElementById('restart-button');

    // --- FUNÇÕES DE CONTROLE DO JOGO ---

    function startGame() {
        isGameOver = false;
        livesLeft = 3;
        currentPuzzleIndex = 0;
        revealedWords = [];
        gameOverModalEl.style.display = 'none';
        hintTextEl.textContent = universalHint;
        revealedWordsEl.textContent = '-';
        
        updateLivesDisplay();
        renderColorPalette();
        loadPuzzle();
    }

    function updateLivesDisplay() {
        livesCounterEl.innerHTML = '';
        for (let i = 0; i < livesLeft; i++) {
            livesCounterEl.innerHTML += '❤️';
        }
    }

    function renderColorPalette() {
        colorPalette.innerHTML = '';
        for (const colorId in allColors) {
            const color = allColors[colorId];
            const li = document.createElement('li');
            const swatch = document.createElement('div');
            swatch.classList.add('color-swatch');
            swatch.dataset.colorId = colorId;
            if (color.unlocked) {
                swatch.style.backgroundColor = color.hex;
                swatch.draggable = true;
                swatch.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', e.target.dataset.colorId));
            } else {
                swatch.classList.add('locked');
                swatch.draggable = false;
            }
            li.appendChild(swatch);
            li.append(color.name);
            colorPalette.appendChild(li);
        }
    }

    function loadPuzzle() {
        if (currentPuzzleIndex >= puzzles.length) {
            brandNameEl.textContent = "Parabéns!";
            logoContainer.innerHTML = "<h2>Enigma Resolvido!</h2>";
            appliedColorsContainer.innerHTML = '';
            revealedWordsEl.textContent = revealedWords.join(' ');
            return;
        }
        const puzzle = puzzles[currentPuzzleIndex];
        collectedColors = []; 
        appliedColorsContainer.innerHTML = '';
        brandNameEl.textContent = puzzle.brandName;
        logoContainer.innerHTML = `<img src="${puzzle.logoFile}" alt="Logo ${puzzle.brandName}">`;
        logoContainer.style.borderColor = '#000';
        puzzleCounterEl.textContent = `${currentPuzzleIndex + 1}/${puzzles.length}`;
    }

    function unlockColor(colorId) {
        if (allColors[colorId] && !allColors[colorId].unlocked) {
            allColors[colorId].unlocked = true;
            renderColorPalette();
        }
    }

    // --- LÓGICA DE ARRASTAR E SOLTAR ---
    logoContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!isGameOver) logoContainer.style.borderColor = '#4CAF50';
    });
    logoContainer.addEventListener('dragleave', () => logoContainer.style.borderColor = '#000');
    logoContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        logoContainer.style.borderColor = '#000';
        if (isGameOver) return;

        const colorId = e.dataTransfer.getData('text/plain');
        const puzzle = puzzles[currentPuzzleIndex];
        const required = puzzle.requiredColors;

        if (required.includes(colorId)) {
            if (!collectedColors.includes(colorId)) {
                collectedColors.push(colorId);
                const colorInfo = allColors[colorId];
                const chip = document.createElement('div');
                chip.classList.add('color-chip');
                chip.style.backgroundColor = colorInfo.hex;
                appliedColorsContainer.appendChild(chip);
                checkSolution();
            }
        } else {
            handleIncorrectAttempt();
        }
    });

    function handleIncorrectAttempt() {
        livesLeft--;
        updateLivesDisplay();
        
        logoContainer.classList.add('shake-error');
        setTimeout(() => logoContainer.classList.remove('shake-error'), 820);

        if (livesLeft <= 0) {
            triggerGameOver();
        }
    }

    function triggerGameOver() {
        isGameOver = true;
        gameOverModalEl.style.display = 'block';
    }

    function checkSolution() {
        const puzzle = puzzles[currentPuzzleIndex];
        const requiredSorted = [...puzzle.requiredColors].sort();
        const collectedSorted = [...collectedColors].sort();

        if (JSON.stringify(requiredSorted) === JSON.stringify(collectedSorted)) {
            revealedWords.push(puzzle.revealedWord);
            revealedWordsEl.textContent = revealedWords.join(' ');
            logoContainer.querySelector('img').style.filter = 'none';
            setTimeout(() => {
                currentPuzzleIndex++;
                loadPuzzle();
            }, 2000); 
        }
    }

    // --- CONTROLES DOS MODAIS E BOTÕES ---
    hintButton.addEventListener('click', () => hintModal.style.display = 'block');
    closeButton.addEventListener('click', () => hintModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target == hintModal) hintModal.style.display = 'none'; });
    restartButton.addEventListener('click', startGame);

    // --- INICIA O JOGO ---
    startGame();

    // --- SIMULAÇÃO E WEBSOCKET ---
    window.unlockColor = unlockColor; // Para testes no console

    // (O código do WebSocket permanece o mesmo e pode ser colado aqui se necessário)
    // Exemplo: const socket = new WebSocket('ws://localhost:8080'); ...
});