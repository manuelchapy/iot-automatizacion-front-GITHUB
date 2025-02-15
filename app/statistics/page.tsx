"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function StatisticsPage() {
  const [logs, setLogs] = useState<{ timestamp: string; values: Record<string, number | null> }[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    async function fetchData() {
      try {
        const sensorIds = ["sensor_1", "sensor_2", "sensor_3"];
        const fetchedRecords = await Promise.all(
          sensorIds.map(async (id) => {
            const response = await fetch(`https://iot-automatizacion-api-github.onrender.com/api/sensors/${id}`);
            //const response = await fetch(`http://localhost:4000/api/sensors/${id}`);
            if (!response.ok) throw new Error("Error al obtener datos");
            const result = await response.json();
            return result.records.map((r: any) => ({
              timestamp: r.timestamp,
              sensorId: id,
              value: r.value,
            }));
          })
        );

        // Aplanar los datos en una sola estructura
        const allRecords = fetchedRecords.flat();

        // Agrupar registros por timestamp
        const groupedRecords: { timestamp: string; values: Record<string, number | null> }[] = [];

        allRecords.forEach((record) => {
          let row = groupedRecords.find((r) => r.timestamp === record.timestamp);

          // Si no existe una fila con el mismo timestamp, la creamos
          if (!row) {
            row = { timestamp: record.timestamp, values: {} };
            groupedRecords.push(row);
          }

          // Asegurar que `row.values` está inicializado antes de asignar valores
          row.values[record.sensorId] = record.value;
        });

        setLogs(groupedRecords.reverse()); // 🔹 Solución: Revertir registros antes de guardarlos
      } catch (error) {
        console.error("❌ Error al obtener datos:", error);
      }
    }

    fetchData();
  }, [isClient]);

  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>;
  }

  const sensorIds = ["sensor_1", "sensor_2", "sensor_3"];

  const chartData = {
    labels: logs.map((log) => log.timestamp), // ✅ Ahora el orden es correcto
    datasets: sensorIds.map((sensorId) => ({
      label: `Sensor ${sensorId}`,
      data: logs.map((log) => log.values[sensorId] || null),
      borderColor: sensorId === "sensor_1" ? "red" : sensorId === "sensor_2" ? "blue" : "green",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      tension: 0.4,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">📈 Estadísticas de Sensores</h1>
      <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-lg">
        <Line data={chartData} />
      </div>
      <a href="/sensors_fetch" className="mt-6 text-blue-400 hover:underline">
        🔙 Volver al monitoreo
      </a>
    </div>
  );
}
