console.log("Passo 1: Iniciando o script server.js...");

const express = require("express");
console.log("Passo 2: Módulo 'express' carregado.");

const { SerialPort } = require("serialport");
console.log("Passo 3: Módulo 'serialport' carregado.");

const { ReadlineParser } = require("@serialport/parser-readline");
console.log("Passo 4: Módulo 'parser-readline' carregado.");

const http = require("http");
console.log("Passo 5: Módulo 'http' carregado.");

const socketIo = require("socket.io");
console.log("Passo 6: Módulo 'socket.io' carregado.");

const path = require("path");
console.log("Passo 7: Módulo 'path' carregado.");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// --- CONFIGURAÇÃO ---
// Altere "COM12" para a porta serial correta do seu ESP32/Arduino.
const SERIAL_PORT_PATH = "COM12"; 
// --------------------

console.log("Passo 8: Servindo arquivos estáticos da pasta 'public'.");
app.use(express.static(path.join(__dirname, "public")));

console.log(`Passo 9: Tentando configurar a porta serial em '${SERIAL_PORT_PATH}'...`);
try {
  const port = new SerialPort({ path: SERIAL_PORT_PATH, baudRate: 115200 });
  const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

  port.on('open', () => {
    console.log(`--- SUCESSO: Conectado à porta serial ${SERIAL_PORT_PATH} ---`);
  });

  // Quando chegar um dado do ESP32, envia para o navegador
  parser.on("data", (data) => {
    const cleanData = data.trim();
    if (cleanData) {
      console.log("DADO RECEBIDO -> ESP32 enviou a cor:", cleanData);
      io.emit("color-data", cleanData); // Envia o nome da cor para o cliente
    }
  });

  port.on('error', (err) => {
    console.error("--- ERRO: Erro na porta serial:", err.message);
    io.emit("serial-error", err.message);
  });

} catch (err) {
  console.error(`--- ERRO CRÍTICO: Falha ao tentar abrir a porta ${SERIAL_PORT_PATH}. Verifique se a porta está correta e disponível.`, err);
}

// Evento para quando um novo cliente (navegador) se conecta
io.on("connection", (socket) => {
  console.log("--- INFO: Cliente do jogo conectado via WebSocket. ---");
  socket.on("disconnect", () => {
    console.log("--- INFO: Cliente do jogo desconectado. ---");
  });
});

// Inicia o servidor web
const PORT = 3000;
console.log("Passo 10: Iniciando o servidor web na porta", PORT);

server.listen(PORT, () => {
  console.log(`--- SUCESSO: Servidor rodando em http://localhost:${PORT} ---`);
  console.log("Aguardando dados de cor do ESP32...");
});

