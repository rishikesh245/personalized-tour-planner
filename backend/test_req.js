const axios = require('axios');

async function run() {
  try {
    const res = await axios.post('http://localhost:8000/ai/generate', { prompt: "Paris 3 days 50000 INR" });
    console.log("8000 success:", res.data);
  } catch (e) {
    console.log("8000 error:", e.response?.data || e.message);
  }
}
run();
