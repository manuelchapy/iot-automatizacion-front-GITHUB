"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ timestamp: string; values: Record<string, number | null> }[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [allSensorsDown, setAllSensorsDown] = useState(false); // ✅ Estado para detectar si todos están dañados

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    async function fetchData() {
      try {
        const response = await fetch("https://iot-automatizacion-api-github.onrender.com/api/sensors/sensor-data");
        if (!response.ok) throw new Error("Error al obtener datos");
        const result = await response.json();

        console.log("🔹 Datos recibidos en Next.js:", result);
        setData(result.data || []);
        setError(null);

        // ✅ Verificar si todos los sensores están dañados
        const allDown = result.data.every((sensor: any) => sensor.lastValue === null);
        setAllSensorsDown(allDown); // ✅ Actualiza el estado

        const newLogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          values: result.data.reduce((acc: Record<string, number | null>, sensor: any) => {
            acc[sensor.id] = sensor.lastValue;
            return acc;
          }, {}),
        };

        setLogs((prevLogs) => [...prevLogs.slice(-50), newLogEntry]);
      } catch (error) {
        console.error("❌ Error al obtener datos:", error);
        setError("Error al obtener datos del servidor");
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [isClient]);

  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-center mb-8">📊 Panel de Monitoreo IoT</h1>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        {data.map((sensor) => (
          <div key={sensor.id} className={`p-6 rounded-lg shadow-lg border-4 ${getBorderColor(sensor.lastValue)}`}>
            <h2 className="text-xl font-semibold text-center">🔧 Sensor {sensor.location}</h2>
            <p className="text-lg text-center mt-2">
              🌡️ <strong>{sensor.lastValue ? `${sensor.lastValue.toFixed(1)}°C` : "⚠️ No disponible"}</strong>
            </p>
            <p className="text-sm opacity-75 text-center mt-1">🆔 {sensor.id}</p>

            {sensor.lastValue === null && (
              <div className="mt-4 flex justify-center gap-4">
                <a href="/statistics" className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition">
                  📈 Ver Estadísticas
                </a>
                <a href="/history" className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition">
                  📜 Ver Registros
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ✅ Botón para volver a la página principal cuando todos los sensores están dañados */}
      {allSensorsDown && (
        <div className="mt-8">
          <a href="/" className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-800 transition text-lg">
            🔄 Volver al Panel de Inicio
          </a>
        </div>
      )}

      <div className="mt-10 w-full max-w-6xl">
        <h2 className="text-2xl font-semibold text-center mb-4">📜 Registros Históricos</h2>
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="px-4 py-2">⏱ Hora</th>
                {data.map((sensor) => (
                  <th key={sensor.id} className="px-4 py-2">🔧 {sensor.location}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index} className="border-b border-gray-600">
                  <td className="px-4 py-2 text-center">{log.timestamp}</td>
                  {data.map((sensor) => (
                    <td key={sensor.id} className="px-4 py-2 text-center">
                      {log.values[sensor.id] !== null ? `${log.values[sensor.id]?.toFixed(1)}°C` : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 🔹 Función para definir el color del borde según la temperatura
function getBorderColor(temp: number | null) {
  if (temp === null) return "border-gray-600"; // ⚫ Gris (Sensor muerto)
  if (temp >= 50) return "border-red-500"; // 🔴 Rojo (Temperatura crítica)
  if (temp >= 40) return "border-yellow-500"; // 🟡 Amarillo (Temperatura media)
  return "border-green-500"; // 🟢 Verde (Temperatura normal)
}
