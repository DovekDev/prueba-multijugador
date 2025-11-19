require("dotenv").config();
const express = require('express')
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express()
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Conectado a MongoDB Atlas"))
.catch(err => console.log("Error de conexión a MongoDB:", err));

// Ruta de las cartas
const Carta = require("./models/Carta");

let cartasDisponibles = [];

async function resetCartasDisponibles() {
    try {
        const todas = await Carta.find();
        cartasDisponibles = [...todas];
    } catch (err) {
        console.error("Error cargando cartas desde MongoDB:", err);
        cartasDisponibles = [];
    }
}

// API de cartas
app.get("/api/cartas", async (req, res) => {
    try {
        const cartas = await Carta.find();
        res.json(cartas);
    } catch (err) {
        res.status(500).json({ error: "Error al leer cartas"});
    }
});

// --- CRUD de Cartas ---
app.post('/cartas', async (req, res) => {
    const { name, img, thumbnail } = req.body;
    if (!name) return res.status(400).json({ error: "Falta el nombre" });

    const imagenFinal = img && img.trim() !== ""
        ? img
        : "/static/media/vacio.jpg";
        const thumbFinal = thumbnail && thumbnail.trim() !== ""
        ? thumbnail
        : imagenFinal;
    try {
        const nuevaCarta = new Carta({ 
            name, 
            img: imagenFinal,
            thumbnail: thumbFinal
        });
        await nuevaCarta.save();
        res.status(201).json(nuevaCarta);
    } catch (err) {
        res.status(500).json({ error: "Error al guardar carta" });
    }
});

app.delete('/cartas/:id', async (req, res) => {
    try {
        await Carta.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar carta" });
    }
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

    socket.on("startGame", async () => {
        if (players.length >= 2 && !gameStarted) {
            if (cartasDisponibles.length === 0) {
                io.emit("errorMessage", "No quedan cartas disponibles. Reiniciando mazo...");
                resetCartasDisponibles();
                return;
            }

            gameStarted = true;

            // elegir una carta aleatoria
            const chosenIndex = Math.floor(Math.random() * cartasDisponibles.length);
            const chosenCard = cartasDisponibles[chosenIndex];

            // carta impostor
            const impostorCard = { name: "impostor", img: "/static/media/vacio.jpg", thumbnail: "/static/media/vacio.jpg" };

            // repartir: todos reciben el mismo nombre excepto uno
            const impostorIndex = Math.floor(Math.random() * players.length);
            players.forEach((player, i) => {
                io.to(player.id).emit("yourCard", i === impostorIndex ? impostorCard : chosenCard);
            });

            cartasDisponibles.splice(chosenIndex, 1);
        }
    });

    socket.on("nextGame", () => {
        if (players.length >= 2) {
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

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});