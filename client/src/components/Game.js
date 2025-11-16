import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "../styles/Game.css";

const socket = io();

function Game() {
  const [players, setPlayers] = useState([]);
  const [card, setCard] = useState(null);
  const [name, setName] = useState(localStorage.getItem("playerName") || "");
  const [showDialog, setShowDialog] = useState(!localStorage.getItem("playerName"))

  useEffect(() => {
    socket.on("waitingRoom", (playersList) => setPlayers(playersList));
    socket.on("yourCard", (cardObj) => setCard(cardObj));
    socket.on("gameEnded", () => {
      setCard(null);
    });

    // Si ya hay nombre guardado, entrar automaticamente
    if (name) {
      socket.emit("joinGame", { name });
    }

    return () => {
      socket.off("waitingRoom");
      socket.off("yourCard");
      socket.off("gameEnded");
    };
  }, [name]);

  const saveName = () => {
    localStorage.setItem("playerName", name);
    setShowDialog(false);
    socket.emit("joinGame", { name });
  };

  const startGame = () => socket.emit("startGame");

  const leaveGame = () => {
    socket.emit("leaveGame");
    setCard(null);
  };

  const nextGame = () => {
    socket.emit("nextGame");
    setCard(null);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {showDialog && (
        <div style={{ border: "1px solid black", padding: "20px", display: "inline-block" }}>
          <h3>Ingresa tu nombre</h3>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
          <button onClick={saveName}>Guardar</button>
        </div>
      )}

      {card ? (
        <>
          <div style={{
            border: "2px solid black",
            borderRadius: "10px",
            width: "220px",
            margin: "20px auto",
            padding: "10px",
            textAlign: "center"
          }}>
            <img src={card.img || "/static/media/vacio.jpg"} alt={card.name} style={{ width: "100%", borderRadius: "10px" }} />
            <h2 style={{ color: card.name === "impostor" ? "red" : "green" }}>
              {card.name}
            </h2>
          </div>
          <button onClick={leaveGame}>Salir del juego</button>
          <button onClick={nextGame}>Siguente partida</button>
        </>
      ) : (
        <>
          <h2>Jugadores en sala de espera:</h2>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "12", justifyContent: "center" }}>
            {players.map((p) => (
              <li key={p.id} style={{ display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid #cfcfcf",
              padding: "8px 100px",
              borderRadius: 8
              }}>{p.name}</li>
            ))}
          </ul>

          {players.length >= 2 && (
            <button onClick={startGame}>Iniciar juego</button>
          )}
        </>
      )}
    </div>
  );
};

export default Game;