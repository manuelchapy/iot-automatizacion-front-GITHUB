"use client";

import { useState } from "react";

export default function Home() {
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  // URL Base (automática según entorno)
  const BASE_URL = "https://iot-automatizacion-api-github.onrender.com";

  // Iniciar monitoreo y generación de datos
  const handleStartMonitoring = async () => {
    setLoadingStart(true);
    try {
      await fetch(`${BASE_URL}/api/sensors/start-generation`, { method: "GET" });
      window.location.href = "/sensors_fetch";
    } catch (error) {
      console.error("❌ Error al iniciar la simulación:", error);
    } finally {
      setLoadingStart(false);
    }
  };

  // Reiniciar todo (limpiar DB y resetear sensores)
  const handleResetSimulation = async () => {
    setLoadingReset(true);
    try {
      // 1️⃣ Limpiar la base de datos
      await fetch(`${BASE_URL}/api/sensors/cleanup`, { method: "GET" });

      // 2️⃣ Resetear sensores después de limpiar la DB
      const resetResponse = await fetch(`${BASE_URL}/api/sensors/reset-sensors`, { method: "GET" });
      const resetResult = await resetResponse.json();
      console.log("🔄 Reseteo de sensores:", resetResult);

      alert("✅ Simulación reiniciada. Recarga la página para empezar de nuevo.");
    } catch (error) {
      console.error("❌ Error al reiniciar la simulación:", error);
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-8">🏠 Panel Principal!</h1>

      <div className="flex flex-col gap-6">
        {/* Botón de inicio */}
        <button
          onClick={handleStartMonitoring}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-800 transition text-lg"
          disabled={loadingStart}
        >
          {loadingStart ? "🔄 Iniciando..." : "🚀 Iniciar Monitoreo"}
        </button>

        {/* Botón de reinicio */}
        <button
          onClick={handleResetSimulation}
          className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-800 transition text-lg"
          disabled={loadingReset}
        >
          {loadingReset ? "🔄 Reiniciando..." : "🔄 Reiniciar Simulación"}
        </button>
      </div>
    </div>
  );
}
