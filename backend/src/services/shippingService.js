// backend/src/services/shippingService.js
require('dotenv').config();
const axios  = require('axios');
const crypto = require('crypto');

const CLIENT_ID     = process.env.HANJIN_CLIENT_ID;
const CLIENT_SECRET = process.env.HANJIN_CLIENT_SECRET;
const BASE_URL      = process.env.HANJIN_API_BASE_URL || 'https://api.hanjin.com';

// RFC3339 → YYYYMMDDHHMMSS
function getTimestamp() {
  return new Date().toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(0, 14);
}

// method, path, body(json) → { timestamp, signature }
function signRequest(method, path, body = {}) {
  const timestamp  = getTimestamp();
  const bodyString = JSON.stringify(body);
  const bodyHash   = crypto.createHash('sha256')
                           .update(bodyString)
                           .digest('hex');
  const stringToSign = [method, path, timestamp, bodyHash].join('\n');
  const signature    = crypto.createHmac('sha256', CLIENT_SECRET)
                             .update(stringToSign)
                             .digest('base64');
  return { timestamp, signature };
}

/**
 * 한진택배에 운송장 생성 요청
 * @param {{ receiverName: string, receiverTel: string, receiverAddr: string, conditions: object }} args
 * @returns {Promise<{ waybillNo: string }>}
 */
async function createWaybill({ senderName, senderTel, receiverName, receiverTel, receiverAddr, conditions }) {
  const method = 'POST';
  const path   = '/waybill/create';
  const payload = {
    senderName,
    senderTel,
    receiverName,
    receiverTel,
    receiverAddr,
    weight:     conditions.weight,            // JSON에 담긴 무게
    volume:     conditions.volume,            // JSON에 담긴 부피
    // 필요시 더 추가 필드…
  };

  const { timestamp, signature } = signRequest(method, path, payload);
  const headers = {
    'x-api-key':       CLIENT_ID,
    'x-api-timestamp': timestamp,
    'Authorization':   `HMAC ${signature}`,
    'Content-Type':    'application/json',
  };

  const resp = await axios.post(
    `${BASE_URL}${path}`,
    payload,
    { headers }
  );
  // API 문서 기준으로 운송장 번호 필드 이름이 waybillNo라 가정
  return { waybillNo: resp.data.waybillNo };
}

/**
 * 한진택배 Print Waybill (PDF) 요청
 * @param {string} waybillNo
 * @param {string} [printType='NS2P']
 * @param {number} [copyCount=1]
 * @returns {Promise<Buffer>} PDF 바이너리
 */
async function printWaybill(waybillNo, printType = 'NS2P', copyCount = 1) {
  const method = 'POST';
  const path   = '/printwbl';
  const payload = { waybillNo, printType, copyCount };

  const { timestamp, signature } = signRequest(method, path, payload);
  const headers = {
    'x-api-key':       CLIENT_ID,
    'x-api-timestamp': timestamp,
    'Authorization':   `HMAC ${signature}`,
    'Content-Type':    'application/json',
  };

  const resp = await axios.post(
    `${BASE_URL}${path}`,
    payload,
    { headers, responseType: 'arraybuffer' }
  );
  return resp.data;  // PDF Buffer
}

module.exports = {
  createWaybill,
  printWaybill,
};
