export default (packing) => {
  const p = packing;

  p.path.entries = {
    a: './a.js',
    b: './b.js',
    'c/d': './c/d.js'
  };
  p.path.src.root = '.';
  p.path.tmpDll = '../dll/.tmp/dll';
  p.template.source = 'templates/pages/default.pug';
  p.runtimeChunk.enable = true;

  p.commonChunks = {
    vendor: ['./v']
  };

  p.rewriteRules = {
    '^/test$': '/a'
  };

  return p;
};