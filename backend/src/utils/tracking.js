const { v4: uuidv4 } = require('uuid');

function generateTrackingNumber(prefix) {
  const date = new Date();
  const ymd = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');
  const short = uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
  return `${prefix}-${ymd}-${short}`;
}

module.exports = { generateTrackingNumber };
