"use client"; // 🔹 Asegurar que solo se renderiza en el cliente

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ timestamp: string; values: Record<string, number | null> }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch("https://iot-automatizacion-api-github.onrender.com/api/sensors/sensor-data");
        if (!response.ok) throw new Error("Error al obtener datos");
        const result = await response.json();

        console.log("🔹 Datos recibidos en Next.js:", result);
        setData(result.data || []);
        setError(null);

        if (result.data.length > 0) {
          const newLogEntry = {
            timestamp: new Date().toLocaleTimeString(),
            values: result.data.reduce((acc: Record<string, number | null>, sensor: any) => {
              acc[sensor.id] = sensor.lastValue;
              return acc;
            }, {}),
          };

          setLogs((prevLogs) => [...prevLogs.slice(-50), newLogEntry]);
        }
      } catch (error) {
        console.error("❌ Error al obtener datos:", error);
        setError("Error al obtener datos del servidor");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-center mb-8">📊 Panel de Monitoreo IoT</h1>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        {data.length > 0 ? (
          data.map((sensor) => (
            <div key={sensor.id} className={`p-6 rounded-lg shadow-lg border-4 ${getBorderColor(sensor.lastValue)}`}>
              <h2 className="text-xl font-semibold text-center">🔧 Sensor {sensor.location}</h2>
              <p className="text-lg text-center mt-2">
                🌡️ <strong>{sensor.lastValue ? `${sensor.lastValue.toFixed(1)}°C` : "⚠️ No disponible"}</strong>
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">⚠️ No hay datos disponibles</p>
        )}
      </div>

      {/* ✅ Evitar renderizar la tabla si no hay registros */}
      {logs.length > 0 && (
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
      )}

      {/* 🔹 Botones para ver Estadísticas e Historial */}
      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <a
          href="/statistics"
          className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-800 transition text-lg text-center"
        >
          📈 Ver Estadísticas
        </a>
        <a
          href="/history"
          className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-800 transition text-lg text-center"
        >
          📜 Ver Historial de Registros
        </a>
      </div>

      {/* 🔙 Botón para volver al menú principal */}
      <a href="/" className="mt-6 text-blue-400 hover:underline">
        🔙 Volver al Inicio
      </a>
    </div>
  );
}

// 🔹 Función para definir el color del borde según la temperatura
function getBorderColor(temp: number | null) {
  if (temp === null) return "border-gray-600";
  if (temp >= 50) return "border-red-500";
  if (temp >= 40) return "border-yellow-500";
  return "border-green-500";
}
