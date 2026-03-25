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

  // 🔥 Cargar modelo
  useEffect(() => {
    const cargar = async () => {
      modeloRef.current = await cocoSsd.load();
      console.log("Modelo listo");
    };
    cargar();
  }, []);

  // 📸 Activar cámara
  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }

      // iniciar detección automática
      setTimeout(() => detectar(), 1000);
    } catch (error) {
      console.error("Error cámara:", error);
    }
  };

  // 🤖 Detectar
  const detectar = async () => {
    if (
      modeloRef.current &&
      videoRef.current &&
      videoRef.current.readyState === 4
    ) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // ajustar tamaño dinámico
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const predicciones = await modeloRef.current.detect(video);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      predicciones.forEach((pred) => {
        const [x, y, width, height] = pred.bbox;

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = "red";
        ctx.fillText(pred.class, x, y > 10 ? y - 5 : 10);
      });
    }

    requestAnimationFrame(detectar);
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

        {/* 📸 CAMARA */}
        <button
          onClick={iniciarCamara}
          style={{ width: "100%", marginTop: 10 }}
        >
          📸 Activar cámara
        </button>

        <div
          style={{
            position: "relative",
            width: "100%",
            height: 250,
            marginTop: 10,
            background: "black",
            borderRadius: 10,
            overflow: "hidden",
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