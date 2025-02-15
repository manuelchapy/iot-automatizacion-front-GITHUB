"use client";

import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [records, setRecords] = useState<{ timestamp: string; values: Record<string, number | null> }[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const sensorIds = ["sensor_1", "sensor_2", "sensor_3"];

        interface SensorRecord {
          timestamp: string;
          value: number | null;
          sensorId: string;
        }

        interface SensorResponse {
          sensorId: string;
          records: Omit<SensorRecord, "sensorId">[];
        }

        const fetchedRecords: SensorRecord[] = await Promise.all(
          sensorIds.map(async (id): Promise<SensorRecord[]> => {
            const response = await fetch(`https://iot-automatizacion-api-github.onrender.com/api/sensors/${id}`);
            //const response = await fetch(`http://localhost:4000/api/sensors/${id}`);
            if (!response.ok) throw new Error("Error al obtener datos");

            const result: SensorResponse = await response.json();
            return result.records.map((r) => ({
              timestamp: r.timestamp,
              value: r.value,
              sensorId: id,
            }));
          })
        ).then((results) => results.flat());

        const groupedRecords: { timestamp: string; values: Record<string, number | null> }[] = [];

        fetchedRecords.forEach((record) => {
          let row = groupedRecords.find((r) => r.timestamp === record.timestamp);

          if (!row) {
            row = { timestamp: record.timestamp, values: { sensor_1: null, sensor_2: null, sensor_3: null } };
            groupedRecords.push(row);
          }

          row.values[record.sensorId] = record.value;
        });

        // 📌 Ordenar registros de más antiguos a más recientes
        groupedRecords.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        setRecords(groupedRecords);
      } catch (error) {
        console.error("❌ Error al obtener datos:", error);
      }
    }

    fetchData();
  }, []);

  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">📜 Registros Históricos</h1>
      <div className="w-full max-w-6xl bg-gray-800 p-6 rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-700 text-white">
              <th className="px-4 py-2 text-center">⏱ Hora</th>
              <th className="px-4 py-2 text-center">🔧 Sensor 1</th>
              <th className="px-4 py-2 text-center">🔧 Sensor 2</th>
              <th className="px-4 py-2 text-center">🔧 Sensor 3</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((row, index) => (
                <tr key={index} className="border-b border-gray-600">
                  <td className="px-4 py-2 text-center">{new Date(row.timestamp).toLocaleTimeString()}</td>
                  {["sensor_1", "sensor_2", "sensor_3"].map((sensorId) => (
                    <td key={sensorId} className="px-4 py-2 text-center">
                      {row.values[sensorId] !== null ? `${row.values[sensorId]?.toFixed(1)}°C` : "—"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-400">
                  No hay registros disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <a href="/sensors_fetch" className="mt-6 text-blue-400 hover:underline">
        🔙 Volver al monitoreo
      </a>
    </div>
  );
}
