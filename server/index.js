const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const LUMA_API_KEY = process.env.LUMA_API_KEY; // Set in Render environment
const LUMA_API_URL = 'https://api.lumalabs.ai/dream-machine/v1/generations';

// Handle image upload and conversion
app.post('/convert-to-glb', upload.single('image'), async (req, res) => {
  try {
    const image = req.file;
    if (!image) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Send image to Luma AI with optimized prompt
    const formData = new FormData();
    formData.append('image', image.buffer, { filename: 'image.jpg' });
    formData.append('prompt', 'Convert to a low-poly GLB model optimized for fast loading');

    const response = await axios.post(LUMA_API_URL, formData, {
      headers: {
        Authorization: `Bearer ${LUMA_API_KEY}`,
        ...formData.getHeaders(),
      },
    });

    const jobId = response.data.job_id;
    res.json({ jobId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// Poll job status
app.get('/job-status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const response = await axios.get(`${LUMA_API_URL}/${jobId}`, {
      headers: { Authorization: `Bearer ${LUMA_API_KEY}` },
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Status check failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
