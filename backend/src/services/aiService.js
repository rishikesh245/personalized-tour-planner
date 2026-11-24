import axios from "axios";

const callAIService = async (prompt) => {
  const serviceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000/ai/generate";
  try {
    const response = await axios.post(
      serviceUrl,
      { prompt },
      { timeout: 90000 }
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.error || "AI Service failed without error message");
    }

    return response.data.itinerary;
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      throw new Error("AI microservice is offline. Ensure 'python run.py' is running in ai-service on port 8000.");
    }
    if (error.code === "ECONNABORTED") {
      throw new Error("AI itinerary generation timed out after 90 seconds. Please try again.");
    }
    const message = error.response?.data?.error || error.message;
    throw new Error(message);
  }
};

export default callAIService;
