const app = require('./app');
const { port } = require('./config');

app.listen(port, () => {
  console.log(`TaskFlow API çalışıyor: http://localhost:${port}`);
});
