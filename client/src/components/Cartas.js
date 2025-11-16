import React, { useState, useEffect } from "react";
import { search } from "../script";
import "../styles/Cartas.css";

function Cartas() {
    const [cartas, setCartas] = useState([]);
    const [results, setResults] = useState([]);
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");

    useEffect(() => {
        fetch("/api/cartas")
            .then(res => res.json())
            .then(data => setCartas(data))
            .catch(() => setError("No se pudo cargar la lista de cartas"));
    }, []);

    const searchImages = async () => {
        const data = await search(query);
        setResults(data.slice(0, 5));
    };

    const saveCard = async () => {
        if (!selected) return;
        try {
            const res = await fetch("/cartas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selected),
            });
            if (!res.ok) throw new Error("Error al guardar la carta");
            const nuevaCarta = await res.json();
            setCartas([...cartas, nuevaCarta]);
            alert("Carta guardada!");
            setSelected(null);
        } catch (e) {
            setError(e.message);
        }
    };

    const deleteCarta = async (id) => {
        setError("");
        try {
            const res = await fetch(`/cartas/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error al eliminar la carta");
            setCartas(cartas.filter(c => c.id !== id));
        } catch (e) {
            setError(e.message)
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px" }}>
            <h2>CRUD de Cartas</h2>

            {error && (
                <div style={{ color: "red", marginBottom: 12 }}>
                    {error}
                </div>
            )}
            <div style={{ marginBottom: "20px" }}>
                <input style={{ height: "40px"}} type="text" placeholder="Buscar carta..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => {
                    if (e.key === "Enter") searchImages();
                }} />
                <button onClick={searchImages}>
                    Buscar
                </button>
            </div>

            <div style={{ display: "flex", gap: "10px", flexDirection: "column", justifyContent: "center" }}>
                {results.map((r, idx) => (
                    <div class='item dialog-abrir-btn'>
                        <img key={idx} src={r.thumbnail} alt={r.name}
                        style={{ width: "120px", cursor: "pointer", borderRadius: "8px" }}
                        onClick={() => setSelected(r)} />
                        <div class='title'><h4>{r.name}</h4></div>
                    </div>
                ))}
            </div>

            {selected && (
                <dialog id="dialog" open className={selected ? "show" : ""}>
                    <h3>{selected.name}</h3>
                    <img src={selected.img} alt={selected.name} style={{ borderRadius: "10px" }}/>
                    <div style={{ marginTop: "20px" }}>
                        <button onClick={saveCard}>Guardar</button>
                        <button onClick={() => {
                            const dlg = document.querySelector("dialog");
                            dlg.classList.remove("show");
                            dlg.addEventListener(
                                "transitionend",
                                () => setSelected(null),
                                { once: true }
                            );
                        }}>Cancelar</button>
                    </div>
                </dialog>
            )}

            <ul style={{ listStyle: "none", padding: 0, marginTop: 20 }}>
                {cartas.map(c => (
                    <li key={c.id}
                    style={{ display: "flex",
                    alignItems: "center",
                    gap: 12,
                    border: "1px solid #eee",
                    padding: 8,
                    borderRadius: 8,
                    marginBottom: 8,
                    }}>
                        <img src={c.img} alt={c.name} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: "#666", wordBreak: "break-all" }}>{c.img}</div>
                        </div>
                        <button onClick={() => deleteCarta(c.id)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Cartas;