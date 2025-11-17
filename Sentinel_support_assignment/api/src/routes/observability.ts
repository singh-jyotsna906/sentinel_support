import express from 'express';

const router = express.Router();

// GET /metrics
router.get('/metrics', (req, res) => {
  // Placeholder: In production, use prom-client or similar
  res.type('text/plain').send(`# HELP api_request_latency_ms API request latency in ms
# TYPE api_request_latency_ms histogram
api_request_latency_ms_bucket{le="50"} 0
api_request_latency_ms_bucket{le="100"} 0
api_request_latency_ms_bucket{le="250"} 0
api_request_latency_ms_bucket{le="500"} 0
api_request_latency_ms_bucket{le="1000"} 0
api_request_latency_ms_bucket{le="+Inf"} 0
api_request_latency_ms_sum 0
api_request_latency_ms_count 0
`);
});

// GET /health
router.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default router;
