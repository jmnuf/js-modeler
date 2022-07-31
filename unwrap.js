const fs = require('fs');
const { join } = require('path');

const TARGET = './dist';

fs.readdirSync(TARGET).forEach((file) => {
  const entry = join(TARGET, file);
  const output = join(__dirname, file);

  if (fs.existsSync(output)) {
    fs.rmSync(output, { force: true });
  }
  
  fs.copyFileSync(entry, output);
});
