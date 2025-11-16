const express = require('express')
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express()
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));

// Ruta del archivo JSON
const cartasFile = path.join(__dirname, "cartas.json");

// Funcion para leer cartas desde el archivo
function loadCartas() {
    try {
        const data = fs.readFileSync(cartasFile, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function saveCartas(cartas) {
    fs.writeFileSync(cartasFile, JSON.stringify(cartas, null, 2));
}

let cartas = loadCartas();
let cartasDisponibles = [...cartas];
let nextId = cartas.length > 0 ? Math.max(...cartas.map(c => c.id)) + 1 : 1;

// API de cartas
app.get("/api/cartas", (req, res) => {
    fs.readFile(cartasFile, "utf-8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "No se pudo leer el archivo de cartas" });
        }
        res.json(JSON.parse(data));
    });
});

// --- CRUD de Cartas ---

app.post('/cartas', function (req, res) {
    const { name, img } = req.body;
    if (!name || !img) return res.status(400).json({ error: "Faltan datos" });
    const nuevaCarta = { id: nextId++, name, img };
    cartas.push(nuevaCarta);
    saveCartas(cartas);
    res.json(nuevaCarta);
});

app.delete('/cartas/:id', function(req, res) {
    const id = parseInt(req.params.id);
    cartas = cartas.filter(c => c.id !== id);
    saveCartas(cartas);
    res.json({ success: true });
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// --- Juego ---
let players = [];
let gameStarted = false;
let messages = [];

io.on("connection", (socket) => {
    console.log("Jugador conectado:", socket.id);

    // enviar historial al nuevo cliente
    socket.emit("chatHistory", messages);

    socket.on("chatMessage", ({ name, text }) => {
        if(!name || !text.trim()) return;
        const msg = { id: Date.now(), name, text };
        messages.push(msg);
        io.emit("chatMessage", msg);
    });

    socket.on("clearChat", () => {
        messages = [];
        io.emit("chatHistory", messages);
    });

    socket.on("joinGame", ({ name }) => {
        if (!gameStarted) {
            // Evitar duplicados: si ya existe el jugador, no lo agregamos
            const exists = players.some(p => p.id === socket.id);
            if (!exists) {
                players.push({ id: socket.id, name });
                console.log("Players:", players);
                io.emit("waitingRoom", players);
            }
        }
    });

    socket.on("leaveGame", () => {
        players = players.filter(p => p.id !== socket.id);
        io.emit("waitingRoom", players);
        if (players.length <= 1) {
            gameStarted = false;
            io.emit("gameEnded");
        }
    });

    socket.on("startGame", () => {
        if (players.length >= 2 && !gameStarted) {
            if (cartas.length < 6) {
                io.emit("errorMessage", "Necesitas al menos 6 cartas creadas");
                return;
            }

            gameStarted = true;

            // elegir 6 cartas aleatorias
            const shuffled = shuffleArray(cartasDisponibles);
            const selected = shuffled.slice(0, 6);

            // elegir una carta para todos
            const chosenCard = selected[Math.floor(Math.random() * selected.length)];

            // carta impostor
            const impostorCard = { name: "impostor", img: "/static/media/vacio.jpg" };

            // repartir: todos reciben el mismo nombre excepto uno
            const impostorIndex = Math.floor(Math.random() * players.length);
            players.forEach((player, i) => {
                io.to(player.id).emit("yourCard", i === impostorIndex ? impostorCard : chosenCard);
            });

            cartasDisponibles = cartasDisponibles.filter(c => !selected.includes(c));
        }
    });

    socket.on("nextGame", () => {
        if (players.length >= 2) {
            if (cartasDisponibles.length < 6) {
                cartasDisponibles = [...cartas];
            }
            gameStarted = false;
            io.emit("waitingRoom", players);
        }
    });

    socket.on("disconnect", () => {
        console.log("Jugador desconectado:", socket.id);
        players = players.filter((p) => p.id !== socket.id);
        io.emit("waitingRoom", players);
        if (players.length <= 1) {
            gameStarted = false;
            io.emit("gameEnded");
        }
    });
});

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});