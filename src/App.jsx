import { useState, useRef } from "react";
import { Analytics } from "@vercel/analytics/next"
export default MyApp;
export default function App() {
  const [corte, setCorte] = useState("lomo vetado");
  const [grosor, setGrosor] = useState(2.5);
  const [resultado, setResultado] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const start = useRef(null);

  // 📸 cámara trasera
  const iniciarCamara = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    });

    videoRef.current.srcObject = stream;
  };

  // 🖐️ iniciar selección
  const handleStart = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    start.current = { x, y };
  };

  // 🖐️ dibujar selección
  const handleMove = (e) => {
    if (!start.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    ctx.strokeStyle = "#00ff99";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      start.current.x,
      start.current.y,
      x - start.current.x,
      y - start.current.y
    );
  };

  // 🧠 calcular grosor al soltar
  const handleEnd = (e) => {
    if (!start.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) - rect.left;
    const y = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - rect.top;

    const width = Math.abs(x - start.current.x);
    const height = Math.abs(y - start.current.y);

    const grosorPx = Math.min(width, height);

    // 🔥 conversión aproximada
    const grosorCm = (grosorPx / 50).toFixed(1);

    setGrosor(Number(grosorCm));

    start.current = null;
  };

  // 🥩 cálculo
  const calcular = () => {
    const base = {
      "lomo vetado": 3,
      "lomo liso": 2.5,
      "punta picana": 3.5,
      "asado de tira": 4,
      huachalomo: 4.5,
    };

    const tiempo = base[corte] * grosor * 1.2 * 1.05;

    setResultado({
      total: (tiempo * 2 + 1).toFixed(2),
      porLado: tiempo.toFixed(2),
      reposo: Math.max(2, grosor).toFixed(2),
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1e1e2f, #3a3a5f)",
        color: "white",
      }}
    >
      <div
        style={{
          background: "#2a2a40",
          padding: 20,
          borderRadius: 15,
          width: 350,
        }}
      >
        <h2 style={{ textAlign: "center" }}>🥩 Cocción Parrilla</h2>

        <select
          value={corte}
          onChange={(e) => setCorte(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        >
          <option value="lomo vetado">Lomo vetado</option>
          <option value="lomo liso">Lomo liso</option>
          <option value="punta picana">Punta picana</option>
          <option value="asado de tira">Asado de tira</option>
          <option value="huachalomo">Huachalomo</option>
        </select>

        <input
          type="number"
          min={1}
          max={10}
          value={grosor}
          onChange={(e) => setGrosor(Number(e.target.value))}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <button onClick={calcular} style={{ width: "100%" }}>
          Calcular
        </button>

        <button
          onClick={iniciarCamara}
          style={{ width: "100%", marginTop: 10 }}
        >
          📸 Activar cámara
        </button>

        {/* 🎯 ZONA INTERACTIVA */}
        <div style={{ position: "relative", marginTop: 10 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "100%", borderRadius: 10 }}
          />

          <canvas
            ref={canvasRef}
            width="640"
            height="480"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        </div>

        {resultado && (
          <div style={{ marginTop: 10 }}>
            <p>Total: {resultado.total} min</p>
            <p>Por lado: {resultado.porLado} min</p>
            <p>Reposo: {resultado.reposo} min</p>
          </div>
        )}
      </div>
    </div>
  );
}
