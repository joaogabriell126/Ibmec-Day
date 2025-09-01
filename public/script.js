document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÃO DO ENIGMA ---
    const puzzles = [
        { brandName: "Meta", logoFile: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Meta-Logo.png/1200px-Meta-Logo.png", requiredColors: ['orange'], revealedWord: "Novo" },
        { brandName: "Michelin", logoFile: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5S4BsoRcvzT2n4qhnlo5MiwAtY6SkqJZZeA&s", requiredColors: ['black', 'purple'], revealedWord: "energético" },
        { brandName: "Zona Sul", logoFile: "https://cdn.prod.website-files.com/672409b074922677cd2f729e/6760ddb18a27cf335cd3093a_zonasul-logo.png", requiredColors: ['green'], revealedWord: "sustentavel" },
        { brandName: "Parmê", logoFile: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxmCb110xICx6HK25XqGgH7FIYieexyQHXSsoIrlLM5CntaH2ZUM1HsQdfiwH6h4hxzQE&usqp=CAU", requiredColors: ['green', 'purple'], revealedWord: "feito" },
        { brandName: "Transfero", logoFile: "https://media.licdn.com/dms/image/v2/D4D0BAQEDvtBzGpPCjA/company-logo_200_200/company-logo_200_200/0/1702063736083/transfero_group_logo?e=2147483647&v=beta&t=_L9gfMwpX8dZP36CjqXJqEyQM0gSYobOfhcFjd11-Jc", requiredColors: ['black', 'yellow'], revealedWord: "com" },
        { brandName: "Americanas", logoFile: "https://play-lh.googleusercontent.com/sVOx267sxWUnIOyxMNxyKF_GbJdqt0BbFOvVHmHbP6Vn2FfWGg_B9SOBo18ExsCLaGM=w600-h300-pc0xffffff-pd", requiredColors: ['green'], revealedWord: "Guaraná da Amazônia." }
    ];
    const universalHint = "Talvez você deva pensar o contrário, ou melhor dizendo, o que for complementar.\nObservação: Algumas marcas, possuem duas cores como principais, por isso, será necessário usar duas cores.";

    const allColors = {
        'purple': { name: 'Magenta', hex: '#FF00FF', unlocked: false },
        'green': { name: 'Verde', hex: '#009739', unlocked: false },
        'blue': { name: 'Azul', hex: '#0064E0', unlocked: false },
        'black': { name: 'Preto', hex: '#000', unlocked: false },
        'red': { name: 'Vermelho', hex: '#D92E2E', unlocked: false },
        'orange': { name: 'Laranja', hex: '#FF8C00', unlocked: false },
        'yellow': { name: 'Amarelo', hex: '#FDB913', unlocked: false }
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
    const puzzleCounterEl = document.getElementById('puzzle-counter'); // Presumindo que este elemento existe no HTML
    const hintButton = document.getElementById('hint-button');
    const hintModal = document.getElementById('hint-modal');
    const hintTextEl = document.getElementById('hint-text');
    const closeButton = hintModal.querySelector('.close-button');
    const appliedColorsContainer = document.getElementById('applied-colors-container');
    const livesCounterEl = document.getElementById('lives-counter');
    const gameOverModalEl = document.getElementById('game-over-modal');
    const restartButton = document.getElementById('restart-button');
    // ADICIONADO: Elementos para o painel de status do WebSocket
    const wsStatusEl = document.getElementById('ws-status');
    const lastDataEl = document.getElementById('last-data');

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
            const nameSpan = document.createElement('span');
            nameSpan.textContent = color.name;
            li.appendChild(nameSpan);
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
        if (puzzleCounterEl) {
            puzzleCounterEl.textContent = `${currentPuzzleIndex + 1}/${puzzles.length}`;
        }
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
    logoContainer.addEventListener('dragleave', () => logoContainer.style.borderColor = 'transparent');
    logoContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        logoContainer.style.borderColor = 'transparent';
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

    // ======================================================================
    // --- LÓGICA DE WEBSOCKET (Adicionada sem alterar o código acima) ---
    // ======================================================================

    const espColorToGameId = {
        'Vermelho': 'red',
        'Azul': 'blue',
        'Verde': 'green',
        'Amarelo': 'yellow',
        'Branco': 'white',
        'Preto': 'black',
        'Ciano': 'steve'
    };

    const socket = io();

    socket.on('connect', () => {
        wsStatusEl.textContent = 'Conectado';
        wsStatusEl.style.color = 'lightgreen';
    });

    socket.on('disconnect', () => {
        wsStatusEl.textContent = 'Desconectado';
        wsStatusEl.style.color = 'tomato';
    });

    socket.on('color-data', (espColorName) => {
        lastDataEl.textContent = `"${espColorName}"`;
        const gameColorId = espColorToGameId[espColorName];
        if (gameColorId) {
            unlockColor(gameColorId);
        }
    });
});