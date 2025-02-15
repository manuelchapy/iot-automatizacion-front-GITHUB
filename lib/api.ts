export const fetchSensorData = async () => {
    try {
      const response = await fetch("https://iot-automatizacion-api-github.onrender.com/api/sensors/sensor-data");
      if (!response.ok) {
        throw new Error("Error al obtener datos de los sensores");
      }
      const data = await response.json();
      return data.data; // Retorna solo los datos de los sensores
    } catch (error) {
      console.error("❌ Error al obtener datos:", error);
      return [];
    }
  };  