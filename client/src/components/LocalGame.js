import React, { useState, useEffect } from "react";
import "../styles/LocalGame.css";
import impostor from "../assets/vacio.jpg";

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

let cartasIniciales = [];

function LocalGame() {

    const [numPlayers, setNumPlayers] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [cartasDisponibles, setCartasDisponibles] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        const savedPlayers = localStorage.getItem("numPlayers");
        if (savedPlayers) {
            setNumPlayers(parseInt(savedPlayers));
        }
        fetch("/api/cartas")
        .then((res) => res.json())
        .then((data) => setCartasDisponibles(data))
        .then((data) => cartasIniciales = data)
        .catch((err) => console.error("Error cargando cartas:", err));
    }, []);

    const startGame = () => {
        if (numPlayers < 3) {
            alert("Debe haber al menos 3 jugadores");
            return;
        }

        localStorage.setItem("numPlayers", numPlayers);

        if (cartasDisponibles.length < 1) {
            alert("No hay suficientes cartas. Reiniciando lista de cartas.");
            setCartasDisponibles(cartasIniciales);
            return;
        }

        const shuffledPool = shuffleArray(cartasDisponibles);
        const realCard = shuffledPool[0];

        const impostorCard = { name: "impostor", img: "/static/media/vacio.jpg"};

        const roundCards = Array(numPlayers - 1).fill(realCard).concat(impostorCard);

        const finalShuffle = shuffleArray(roundCards);

        setSelectedCards(finalShuffle);
        setCurrentPlayer(0);
        setRevealed(false);

        setCartasDisponibles(prev => prev.filter(c => c !== realCard));
    };

    const revealCard = () => setRevealed(true);

    const nextPlayer = () => {
        if (currentPlayer < numPlayers - 1) {
            setCurrentPlayer(currentPlayer + 1);
            setRevealed(false);
        } else {
            alert("Fin de la ronda");
            setSelectedCards([]);
            setCurrentPlayer(0);
            setRevealed(false);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            {selectedCards.length === 0 ? (
                <div>
                    <h2>Juego Local</h2>
                    <input style={{ height: "40px"}} type="number" value={numPlayers} onChange={(e) => setNumPlayers(parseInt(e.target.value))} placeholder="Número de jugadores" />
                    <button onClick={startGame}>Jugar</button>
                </div>
            ) : (
                <div>
                    <h3>Jugador {currentPlayer + 1}</h3>
                    {!revealed ? (
                        <div style={{
                            border: "2px solid black",
                            borderRadius: "10px",
                            width: "220px",
                            height: "320px",
                            margin: "20px auto",
                            backgroundColor: "#444",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            cursor: "pointer"
                        }} onClick={revealCard}>
                            <span>Carta volteada</span>
                        </div>
                    ) : (
                        <div>
                            <img 
                            src={selectedCards[currentPlayer].name === "impostor"
                            ? impostor
                            : selectedCards[currentPlayer].img }
                            onError={(e) => { e.target.src = selectedCards[currentPlayer].thumbnail; }}
                            alt={selectedCards[currentPlayer].name}
                            style={{ width: "100%", borderRadius: "10px"}}
                            />
                            <h2 style={{ color: selectedCards[currentPlayer].name === "impostor"
                            ? "red"
                            : "green" }}>
                                {selectedCards[currentPlayer].name}
                            </h2>
                        </div>
                    )}
                    
                    {revealed && (
                        <button onClick={nextPlayer}>Siguiente jugador</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default LocalGame;