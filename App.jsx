import { useState, useRef, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export default function App() {
  const [corte, setCorte] = useState("lomo vetado");
  const [grosor, setGrosor] = useState(2.5);
  const [termino] = useState("tres_cuartos");
  const [resultado, setResultado] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const modeloRef = useRef(null);

  // 🔥 Cargar modelo IA
  useEffect(() => {
    const cargarModelo = async () => {
      modeloRef.current = await cocoSsd.load();
      console.log("Modelo cargado");
    };
    cargarModelo();
  }, []);

  // 📸 Activar cámara
  const iniciarCamara = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    videoRef.current.srcObject = stream;
  };

  // 🤖 Detectar objetos
  const detectar = async () => {
    if (
      modeloRef.current &&
      videoRef.current &&
      videoRef.current.readyState === 4
    ) {
      const predicciones = await modeloRef.current.detect(videoRef.current);

      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, 640, 480);

      predicciones.forEach((pred) => {
        const [x, y, width, height] = pred.bbox;

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = "red";
        ctx.fillText(pred.class, x, y - 5);
      });
    }

    requestAnimationFrame(detectar);
  };

  // 🥩 Cálculo de cocción
  const calcular = () => {
    const base_tiempos = {
      "lomo vetado": 3,
      "lomo liso": 2.5,
      "punta picana": 3.5,
      "asado de tira": 4,
      huachalomo: 4.5,
    };

    const tiempoPorLado =
      base_tiempos[corte] * grosor * 1.2 * 1.05;

    const tiempoTotal = tiempoPorLado * 2 + 1;
    const reposo = Math.max(2, grosor);

    setResultado({
      total: tiempoTotal.toFixed(2),
      porLado: tiempoPorLado.toFixed(2),
      reposo: reposo.toFixed(2),
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
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          background: "#2a2a40",
          padding: 25,
          borderRadius: 15,
          width: 340,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 20 }}>
          🥩 Cocción Parrilla
        </h1>

        {/* 🔥 FORMULARIO */}
        <label>Tipo de corte</label>
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

        <label>Grosor (cm)</label>
        <input
          type="number"
          min={1}
          max={10}
          value={grosor}
          onChange={(e) => setGrosor(Number(e.target.value))}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <p style={{ fontSize: 12, opacity: 0.7 }}>
          Método: Parrilla 🔥 | Temperatura: Ambiente
        </p>

        <button
          onClick={calcular}
          style={{
            width: "100%",
            padding: 10,
            background: "#ff4d4d",
            border: "none",
            borderRadius: 8,
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            marginBottom: 10,
          }}
        >
          Calcular
        </button>

        {/* 📸 CÁMARA */}
        <button
          onClick={iniciarCamara}
          style={{ width: "100%", marginBottom: 10 }}
        >
          📸 Activar cámara
        </button>

        <div style={{ position: "relative" }}>
          <video
            ref={videoRef}
            autoPlay
            width="100%"
            height="240"
            style={{ borderRadius: 10 }}
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
          />
        </div>

        <button
          onClick={detectar}
          style={{ width: "100%", marginTop: 10 }}
        >
          🤖 Detectar
        </button>

        {/* RESULTADO */}
        {resultado && (
          <div style={{ marginTop: 15 }}>
            <p>⏱️ Total: {resultado.total} min</p>
            <p>🔥 Por lado: {resultado.porLado} min</p>
            <p>🛑 Reposo: {resultado.reposo} min</p>
          </div>
        )}
      </div>
    </div>
  );
}
