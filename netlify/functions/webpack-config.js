const path = require('path');

module.exports = {
  entry: './chat.js',
  target: 'node',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'chat.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    'openai': 'commonjs openai'
  }
}; 