module.exports = {
  pageShots: {
    pages: [
      { path: '/', name: 'model-validator-home' },
      { path: '/rpde', name: 'rpde-validator-home' },
      { path: '/?url=https%3A%2F%2Fopenactive.io%2Fdata-models%2Fversions%2F2.x%2Fexamples%2Fsessionseries-split_example_1.json&version=2.x', name: 'sessionseries' },
      { path: '/?url=https%3A%2F%2Fopenactive.io%2Fdata-models%2Fversions%2F2.x%2Fexamples%2Fscheduledsession-split_example_1.json&version=2.x', name: 'scheduledsession' },
    ],
    baseUrl: 'http://172.17.0.1:8080',
  },
  lostPixelProjectId: 'clzitt4s52b6dlcoguswodrsj',
  failOnDifference: true,
  apiKey: process.env.LOST_PIXEL_API_KEY,
};
