import { useState, useRef, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export default function App() {
  const [corte, setCorte] = useState("lomo vetado");
  const [grosor, setGrosor] = useState(2.5);
  const [resultado, setResultado] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const modeloRef = useRef(null);

  // 🔥 cargar modelo
  useEffect(() => {
    const cargar = async () => {
      modeloRef.current = await cocoSsd.load();
      console.log("Modelo IA listo");
    };
    cargar();
  }, []);

  // 📸 cámara trasera + 60fps
  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 60, max: 60 }, // 🔥 intento 60fps
        },
        audio: false,
      });

      const video = videoRef.current;
      video.srcObject = stream;

      video.onloadedmetadata = () => {
        video.play();
      };

      iniciarLoop();
    } catch (err) {
      console.error("Error cámara:", err);
    }
  };

  // 🔥 LOOP ULTRA FLUIDO
  const iniciarLoop = () => {
    const loop = async () => {
      await detectar();
      requestAnimationFrame(loop); // fluidez visual
    };
    loop();
  };

  // 🤖 detección optimizada
  let ultimaDeteccion = 0;

  const detectar = async () => {
    const ahora = Date.now();

    // 🔥 IA solo cada 300ms (clave para fluidez)
    if (ahora - ultimaDeteccion < 300) return;
    ultimaDeteccion = ahora;

    if (
      modeloRef.current &&
      videoRef.current &&
      videoRef.current.readyState === 4
    ) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const predicciones = await modeloRef.current.detect(video);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      predicciones.forEach((pred) => {
        const [x, y, width, height] = pred.bbox;

        ctx.strokeStyle = "#ff4d4d";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        const grosorPx = Math.min(width, height);
        const grosorCm = (grosorPx / 50).toFixed(1);

        // 🔥 evita re-render innecesario
        if (Math.abs(grosor - grosorCm) > 0.2) {
          setGrosor(Number(grosorCm));
        }

        ctx.fillStyle = "#ff4d4d";
        ctx.font = "14px Arial";
        ctx.fillText(`${pred.class} ~ ${grosorCm} cm`, x, y - 5);
      });
    }
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

        {/* FORM */}
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

        <label>Término</label>
        <select disabled style={{ width: "100%", marginBottom: 10 }}>
          <option>Tres cuartos</option>
        </select>

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

        {/* CAMARA */}
        <button
          onClick={iniciarCamara}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
            border: "none",
            background: "#3a86ff",
            color: "white",
            fontWeight: "bold",
          }}
        >
          📸 Cámara automática (IA)
        </button>

        <div
          style={{
            position: "relative",
            width: "100%",
            height: 240,
            borderRadius: 10,
            overflow: "hidden",
            background: "black",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>

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
