// ATENÇÃO: Substitua o seu script.js por este.
// As mudanças estão comentadas como "NOVO" ou "MODIFICADO".

document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÃO DO ENIGMA (permanece igual) ---
    const puzzles = [
        { brandName: "Meta", logoFile: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png", requiredColors: ['meta-blue'], revealedWord: "Bebidas energeticas" },
        { brandName: "Zona Sul", logoFile: "https://classificadosbarra.com.br/wp-content/uploads/2021/04/supermercadosZonaSul.png", requiredColors: ['zona-sul-green'], revealedWord: "ALIMENTA" },
        { brandName: "Parmê", logoFile: "images/parme-logo.png", requiredColors: ['parme-red', 'parme-green'], revealedWord: "NOSSAS" },
        { brandName: "Vale", logoFile: "https://vectorlogoseek.com/wp-content/uploads/2019/12/vale-sa-vector-logo.png", requiredColors: ['vale-green', 'vale-yellow'], revealedWord: "VIDAS," },
        { brandName: "Americanas", logoFile: "images/americanas-logo.png", requiredColors: ['americanas-red'], revealedWord: "TRANSFORMANDO O FUTURO." }
    ];
    const universalHint = "Talvez você deva pensar o contrário, ou melhor dizendo, o que for complementar.";
    const allColors = {
        'meta-blue': { name: 'Azul Meta', hex: '#0064E0', unlocked: true },
        'zona-sul-green': { name: 'Verde Zona Sul', hex: '#009739', unlocked: true },
        'parme-red': { name: 'Vermelho Parmê', hex: '#D92E2E', unlocked: true },
        'parme-green': { name: 'Verde Parmê', hex: '#008A4E', unlocked: true },
        'vale-green': { name: 'Verde Vale', hex: '#269A45', unlocked: true },
        'vale-yellow': { name: 'Amarelo Vale', hex: '#FDB913', unlocked: false },
        'americanas-red': { name: 'Vermelho Americanas', hex: '#E60014', unlocked: false }
    };

    let currentPuzzleIndex = 0;
    let collectedColors = [];
    let revealedWords = [];

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
    const appliedColorsContainer = document.getElementById('applied-colors-container'); // NOVO

    // --- FUNÇÕES DO JOGO ---

    function initializeGame() {
        hintTextEl.textContent = universalHint;
        renderColorPalette();
        loadPuzzle();
    }

    function renderColorPalette() {
        // (Esta função permanece igual)
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
                swatch.addEventListener('dragstart', handleDragStart);
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
        // MODIFICADO: Limpa as fichas do desafio anterior
        if (currentPuzzleIndex >= puzzles.length) {
            brandNameEl.textContent = "Parabéns!";
            logoContainer.innerHTML = "<h2>Enigma Resolvido!</h2>";
            appliedColorsContainer.innerHTML = ''; // Limpa as fichas no final
            revealedWordsEl.textContent = revealedWords.join(' ');
            return;
        }

        const puzzle = puzzles[currentPuzzleIndex];
        collectedColors = []; 
        appliedColorsContainer.innerHTML = ''; // NOVO: Limpa as fichas ao carregar novo puzzle
        brandNameEl.textContent = puzzle.brandName;
        logoContainer.innerHTML = `<img src="${puzzle.logoFile}" alt="Logo ${puzzle.brandName}">`;
        logoContainer.style.borderColor = '#000';
        puzzleCounterEl.textContent = `${currentPuzzleIndex + 1}/${puzzles.length}`;
    }

    function unlockColor(colorId) {
        // (Esta função permanece igual)
        if (allColors[colorId] && !allColors[colorId].unlocked) {
            allColors[colorId].unlocked = true;
            renderColorPalette();
        }
    }

    // --- LÓGICA DE ARRASTAR E SOLTAR ---
    function handleDragStart(e) {
        // (Esta função permanece igual)
        e.dataTransfer.setData('text/plain', e.target.dataset.colorId);
    }

    logoContainer.addEventListener('dragover', (e) => {
        e.preventDefault(); 
        logoContainer.style.borderColor = '#4CAF50';
    });

    logoContainer.addEventListener('dragleave', () => {
        logoContainer.style.borderColor = '#000';
    });

    // MODIFICADO: Agora cria uma ficha de cor ao soltar
    logoContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        const colorId = e.dataTransfer.getData('text/plain');
        
        if (colorId && !collectedColors.includes(colorId)) {
            collectedColors.push(colorId);

            // NOVO: Bloco para criar a ficha visual
            const colorInfo = allColors[colorId];
            const chip = document.createElement('div');
            chip.classList.add('color-chip');
            chip.style.backgroundColor = colorInfo.hex;
            appliedColorsContainer.appendChild(chip);
            
            checkSolution();
        }
        logoContainer.style.borderColor = '#000';
    });

    function checkSolution() {
        // (Esta função permanece igual)
        const puzzle = puzzles[currentPuzzleIndex];
        const required = puzzle.requiredColors.sort();
        const collected = collectedColors.sort();

        if (required.length === collected.length && required.every((val, index) => val === collected[index])) {
            revealedWords.push(puzzle.revealedWord);
            revealedWordsEl.textContent = revealedWords.join(' ');
            logoContainer.querySelector('img').style.filter = 'none';
            setTimeout(() => {
                currentPuzzleIndex++;
                loadPuzzle();
            }, 2000); 
        }
    }

    // --- CONTROLES DO MODAL DE DICA (permanece igual) ---
    hintButton.addEventListener('click', () => { hintModal.style.display = 'block'; });
    closeButton.addEventListener('click', () => { hintModal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if (e.target == hintModal) { hintModal.style.display = 'none'; } });
    
    // --- INICIA O JOGO ---
    initializeGame();
    
    // --- CONEXÃO WEBSOCKET (permanece igual) ---
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen = function(e) { console.log("[open] Conexão estabelecida"); };
    socket.onmessage = function(event) {
        const colorId = String(event.data);
        unlockColor(colorId);
    };
    socket.onclose = function(event) { if (!event.wasClean) { console.log('[close] Conexão caiu'); } };
    
    // --- SIMULAÇÃO PARA TESTES (permanece igual) ---
    window.unlockColor = unlockColor;
});