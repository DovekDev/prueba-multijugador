import React from "react";
import { Link } from "react-router-dom";
import "../styles/Inicio.css";

function Inicio() {
    return (
        <div className="container" style={{ textAlign: "center" }}>
            <div className="separador"></div>
            <h1>El Impostor</h1>
            <p>Selecciona un modo de juego:</p>
            <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
                <Link to="/local">
                    <button>Juego Local</button>
                </Link>
                <Link to="/game">
                    <button>Juego Online</button>
                </Link>
            </div>
        </div>
    );
}

export default Inicio;