import React, { useState, useEffect } from "react";
import { search } from "../script";
import "../styles/Cartas.css";

function Cartas() {
    const [cartas, setCartas] = useState([]);
    const [nombreDraft, setNombreDraft] = useState("");
    const [imagenDraft, setImagenDraft] = useState("");
    const [results, setResults] = useState([]);
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");
    const [loadingSearch, setLoadingSearch] = useState(false);
    

    useEffect(() => {
        fetch("/api/cartas")
            .then(res => res.json())
            .then(data => setCartas(data))
            .catch(() => setError("No se pudo cargar la lista de cartas"));
    }, []);

    const handleAgregar = async () => {
        setError("");

        const nuevaCarta = { 
            name: nombreDraft.trim(), 
            img: imagenDraft.trim(),
            thumbnail: imagenDraft.trim()
        };

        if (!nuevaCarta.name) {
            setError("El nombre es obligatorio");
            return;
        }

        try {
            const res = await fetch("/cartas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevaCarta),
            });
            if (!res.ok) throw new Error("Error al guardar la carta");
            const cartaGuardada = await res.json();
            setCartas((prev) => [...prev, cartaGuardada]);
            // limpiar drafts
            setNombreDraft("");
            setImagenDraft("");
            setResults([]);
            setQuery("");
        } catch (e) {
            setError(e.message);
        }
    };

    const deleteCarta = async (id) => {
        setError("");
        try {
            const res = await fetch(`/cartas/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error al eliminar la carta");
            setCartas((prev) => prev.filter((c) => c._id !== id));
        } catch (e) {
            setError(e.message)
        }
    };

    const searchImages = async () => {
        setError("");
        if (!query.trim()) return;
        setLoadingSearch(true);
        try {
            const data = await search(query.trim());
            setResults(data.slice(0, 5));
        } catch {
            setError("No se pudo buscar imágenes");
        } finally {
            setLoadingSearch(false);
        }
    };

    const selectImage = (item) => {
        setImagenDraft(item.img);
    };

    return (
        <div style={{ maxWidth: 700, margin: "40px auto", padding: "0 16px" }}>
            <h2>CRUD de Cartas</h2>

            {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

            {/* Formulario principal: Nombre + URL de imagen opcional */}
            <div style={{ marginBottom: 20, display: "grid", gap: 8 }}>
                <input style={{ height: "40px"}} type="text" placeholder="Nombre" value={nombreDraft} onChange={(e) => setNombreDraft(e.target.value)} />
                <input style={{ height: "40px"}} type="text" placeholder="URL de la imagen (opcional)" value={imagenDraft} onChange={(e) => setImagenDraft(e.target.value)} />
                <button onClick={handleAgregar}>Guardar carta</button>
            </div>

            {/* Búsqueda opcional de imágenes para ayudar a elegir una URL */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8 }}>
                    <input style={{ height: "40px"}} type="text" placeholder="Buscar imágenes..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => {
                        if (e.key === "Enter") searchImages();
                    }} />
                    <button onClick={searchImages} disabled={loadingSearch}>
                        {loadingSearch ?  "Buscando..." : "Buscar"}
                    </button>
                </div>

                {results.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginTop: 12 }}>
                        {results.map((r, idx) => (
                            <div key={`${r.img}-${idx}`} class='item dialog-abrir-btn' style={{ border: "1px solid #eee", borderRadius: 8, padding: 8, cursor: "pointer" }} onClick={() => selectImage(r)} title="Usar esta imagen">
                                <img src={r.thumbnail || r.img} alt={r.name}
                                style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 6 }}/>
                                <div class="title" style={{ marginTop: 6 }}>
                                    <h4 style={{ fontSize: 14, margin: 0 }}>{r.name}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lista de cartas persistentes */}
            <ul style={{ listStyle: "none", padding: 0, marginTop: 20 }}>
                {cartas.map(c => (
                    <li key={c._id}
                    style={{ display: "flex",
                    alignItems: "center",
                    gap: 12,
                    border: "1px solid #eee",
                    padding: 8,
                    borderRadius: 8,
                    marginBottom: 8,
                    }}>
                        <img src={c.img} alt={c.name} onError={(e) => { e.target.src = c.thumbnail; }}
                        style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: "#666", wordBreak: "break-all" }}>{c.img}</div>
                        </div>
                        <button onClick={() => deleteCarta(c._id)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Cartas;