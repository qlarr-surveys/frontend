module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      }
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }],
    '@babel/preset-typescript'
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          }
        }],
        ['@babel/preset-react', {
          runtime: 'automatic'
        }],
        '@babel/preset-typescript'
      ],
      plugins: [
        // Transform import.meta for Jest compatibility
        function() {
          return {
            visitor: {
              MetaProperty(path) {
                if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
                  path.replaceWithSourceString('process.env');
                }
              }
            }
          };
        }
      ]
    }
  }
};