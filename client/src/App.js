import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Inicio from "./components/Inicio";
import Game from "./components/Game";
import LocalGame from "./components/LocalGame";
import Cartas from "./components/Cartas";
import ChatBubble from "./components/ChatBubble";
import logo from "./assets/logo.png";
import "./styles/App.css";

function Navigation() {
    const location = useLocation();
    const playerName = localStorage.getItem("playerName");

    if (location.pathname === "/") return null;

    return (
        <nav style={{
            color: "white",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
        }}>
            <div style={{ fontWeight: "bold", fontSize: "18px" }}>
            <a href="/">
                <img src={ logo } alt="KunturTech" className="logo-img transition-soft" width="500" height="239"></img>
            </a>
            </div>
            <div id="no-logo" className="logo-text-container hidden">
                <h1><a href="/" className="logo-text h3">El Impostor</a></h1>
            </div>
            <div style={{ display: "flex" }}>
                <Link to="/local" style={{ marginRight: "10px" }}>Juego Local</Link>
                <Link to="/game" style={{ marginRight: "10px" }}>Juego Online</Link>
                {playerName === "Dovek" && (
                    <Link to="/cartas" style={{ marginRight: "10px" }}>Cartas</Link>
                )}
            </div>
        </nav>
    );
}

function App() {
    return(
        <Router>
            <Navigation />
            <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/local" element={<LocalGame />} />
                <Route path="/game" element={<Game />} />
                <Route path="/cartas" element={<Cartas />} />
            </Routes>
            <ChatBubble />
        </Router>
    );
}

export default App;