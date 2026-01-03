/**
 * Documentation Validation Script
 * Verifies that the actual API matches the documented API Reference.
 */
import fetch from 'node-fetch';

const BASE_URL = process.env.PUBLIC_API_URL || 'http://localhost:3020/api';

const endpoints = [
  { path: '/health', method: 'GET', expectedStatus: 200 },
  { path: '/wallet', method: 'GET', expectedStatus: 200 }, // Under dev bypass
  { path: '/settings', method: 'GET', expectedStatus: 200 },
  { path: '/strategies', method: 'GET', expectedStatus: 200 }
];

async function validate() {
  console.log('--- Starting Documentation Validation ---');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method
      });
      
      if (response.status === endpoint.expectedStatus) {
        console.log(`✅ ${endpoint.method} ${endpoint.path} matches documentation.`);
      } else {
        console.log(`❌ ${endpoint.method} ${endpoint.path} returned ${response.status}, expected ${endpoint.expectedStatus}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.method} ${endpoint.path} failed: ${error.message}`);
    }
  }
}

// Note: This script assumes the server is running.
// validate();
