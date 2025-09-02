const promBundle = require('express-prom-bundle');

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  promClient: { collectDefaultMetrics: {} },
  metricsPath: '/metrics', // GET /metrics
});

module.exports = { metricsMiddleware };
