try {
  require('node-ical');
  console.log('node-ical OK');
  require('axios');
  console.log('axios OK');
  process.exit(0);
} catch (e) {
  console.error('Smoke test failed:', e && e.message ? e.message : e);
  process.exit(2);
}
