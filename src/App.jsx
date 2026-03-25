import { useState, useRef, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export default function App() {
  const [corte, setCorte] = useState("lomo vetado");
  const [grosor, setGrosor] = useState(2.5);
  const [resultado, setResultado] = useState(null);
  const [escala, setEscala] = useState(null); // px por cm

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const modeloRef = useRef(null);

  const start = useRef(null);

  // 🔥 cargar modelo
  useEffect(() => {
    cocoSsd.load().then((model) => {
      modeloRef.current = model;
    });
  }, []);

  // 📸 cámara trasera optimizada
  const iniciarCamara = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 60 },
      },
    });

    videoRef.current.srcObject = stream;
  };

  // 🖐️ empezar selección
  const handleStart = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    start.current = { x, y };
  };

  // 🖐️ dibujar
  const handleMove = (e) => {
    if (!start.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    ctx.strokeStyle = "#00ff99";
    ctx.lineWidth = 2;
    ctx.strokeRect(start.current.x, start.current.y, x - start.current.x, y - start.current.y);
  };

  // 🧠 calcular medida
  const handleEnd = (e) => {
    if (!start.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) - rect.left;
    const y = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - rect.top;

    const width = Math.abs(x - start.current.x);
    const height = Math.abs(y - start.current.y);
    const medidaPx = Math.min(width, height);

    // 🔥 si no hay escala → calibrar con moneda (~2.5 cm)
    if (!escala) {
      const monedaCm = 2.5;
      const pxPorCm = medidaPx / monedaCm;
      setEscala(pxPorCm);
      alert("Escala calibrada ✅ ahora mide la carne");
    } else {
      const cm = (medidaPx / escala).toFixed(2);
      setGrosor(Number(cm));
    }

    start.current = null;
  };

  // 🤖 IA controlada (opcional)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (
        modeloRef.current &&
        videoRef.current &&
        videoRef.current.readyState === 4
      ) {
        const ctx = canvasRef.current.getContext("2d");
        const preds = await modeloRef.current.detect(videoRef.current);

        preds.forEach((p) => {
          if (p.score > 0.6 && p.bbox[2] > 100) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(...p.bbox);
          }
        });
      }
    }, 500); // 🔥 lento = estable

    return () => clearInterval(interval);
  }, []);

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
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#111", color: "white" }}>
      <div style={{ background: "#222", padding: 20, borderRadius: 10, width: 350 }}>
        <h2>🥩 Medición Pro</h2>

        <select value={corte} onChange={(e) => setCorte(e.target.value)} style={{ width: "100%" }}>
          <option value="lomo vetado">Lomo vetado</option>
          <option value="lomo liso">Lomo liso</option>
          <option value="punta picana">Punta picana</option>
          <option value="asado de tira">Asado de tira</option>
          <option value="huachalomo">Huachalomo</option>
        </select>

        <input type="number" value={grosor} onChange={(e) => setGrosor(Number(e.target.value))} style={{ width: "100%", marginTop: 10 }} />

        <button onClick={calcular} style={{ width: "100%", marginTop: 10 }}>Calcular</button>

        <button onClick={iniciarCamara} style={{ width: "100%", marginTop: 10 }}>📸 Cámara</button>

        <p style={{ fontSize: 12 }}>
          👉 Primero mide una moneda para calibrar (1 vez)
        </p>

        <div style={{ position: "relative", marginTop: 10 }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }} />

          <canvas
            ref={canvasRef}
            width="640"
            height="480"
            style={{ position: "absolute", top: 0, left: 0, width: "100%" }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        </div>

        {resultado && (
          <div>
            <p>Total: {resultado.total}</p>
            <p>Por lado: {resultado.porLado}</p>
            <p>Reposo: {resultado.reposo}</p>
          </div>
        )}
      </div>
    </div>
  );
}
