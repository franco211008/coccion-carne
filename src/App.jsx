import { useState } from "react";

export default function App() {
  const [corte, setCorte] = useState("lomo vetado");
  const [grosor, setGrosor] = useState(2.5);
  const [termino, setTermino] = useState("tres_cuartos");
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    const base_tiempos = {
      "lomo vetado": 3,
      "lomo liso": 2.5,
      "punta picana": 3.5,
      "asado de tira": 4,
      "huachalomo": 4.5,
    };

    const termino_factor = {
      tres_cuartos: 1.2,
    };

    const metodo_factor = 1.05; // parrilla fija
    const temp_factor = 1; // ambiente fija

    const tiempoPorLado =
      base_tiempos[corte] *
      grosor *
      termino_factor[termino] *
      metodo_factor *
      temp_factor;

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
          width: 320,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 20, lineHeight: 1.2 }}>
          🥩 Cocción<br/>Parrilla
        </h1>

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
        <select value={termino} disabled style={{ width: "100%", marginBottom: 15 }}>
          <option value="tres_cuartos">Tres cuartos</option>
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
          }}
        >
          Calcular
        </button>

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

