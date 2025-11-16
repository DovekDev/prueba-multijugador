import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "../styles/ChatBubble.css"

const socket = io();

function ChatBubble() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const name = localStorage.getItem("playerName");

    useEffect(() => {
        socket.on("chatHistory", (msgs) => setMessages(msgs));
        socket.on("chatMessage", (msg) => setMessages((prev) => [...prev, msg]));
        return () => {
            socket.off("chatHistory");
            socket.off("chatMessage");
        };
    }, []);

    const sendMessage = () => {
        if (!name) {
            alert("Debes tener un nombre para escribir en el chat");
            return;
        }
        if (text.trim()) {
            socket.emit("chatMessage", { name, text });
            setText("");
        }
    };

    return (
        <div>
            {/* Burbuja flotante */}
            <div onClick={() => setOpen(!open)}
            style={{
                position:"fixed",
                bottom: "20px",
                right: "20px",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#25D366",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "24px",
                cursor: "pointer",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
            }}>
                💬
            </div>

            {/* Ventana de chat */}
            {open && (
                <div id="chat" style={{
                    position: "fixed",
                    bottom: "90px",
                    right: "20px",
                    width: "300px",
                    height: "400px",
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                }}>
                    <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                        {messages.map((m) => (
                            <div key={m.id} style={{ marginBottom: "8px" }}>
                                <strong>{m.name}: </strong>
                                <span>{m.text}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "flex", borderTop: "1px solid #ccc" }}>
                        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje..." style={{ flex: 1, border: "none", padding: "8px" }} />
                        <button onClick={sendMessage} style={{ padding: "8px" }}>
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatBubble;