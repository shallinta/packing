import { readFileSync } from 'fs';
import glob from 'packing-glob';
import rimraf from 'rimraf';
import { exec } from '../../util';

describe(`build:(${process.env.NODE_ENV})`, async () => {
  let publicPath;

  before(async () => {
    publicPath = process.env.NODE_ENV === 'local' ?
      '/' :
      '//q.qunarzz.com/__xxxx__/prd/';

    rimraf.sync(`${__dirname}/prd`);
    const cmd = 'node_modules/.bin/babel-node src/bin/packing.js build';
    const stdout = await exec(cmd);
    if (process.env.DEBUG) {
      console.log(stdout);
    }
  });

  after(async () => {
    // 删除临时文件
    if (!process.env.DEBUG) {
      rimraf.sync(`${__dirname}/prd`);
    }
  });

  describe('单层目录', async () => {
    let html;
    before(async () => {
      const cwd = `${__dirname}/prd/templates`;
      glob('a.html', { cwd }).forEach((file) => {
        html = readFileSync(`${cwd}/${file}`, { encoding: 'utf-8' });
      });
    });

    it('应该包含网页标题', async () => {
      html.should.match(/<title>Title<\/title>/);
    });

    it('应该包含网页关键字', async () => {
      html.should.match(/<meta name="keywords" content="Keywords">/);
    });

    it('应该包含网页描述', async () => {
      html.should.match(/<meta name="description" content="Description">/);
    });

    it('应该将存在的 __var__ 变量替换为实际变量', async () => {
      html.should.match(/<h1>city<\/h1>/);
    });

    it('应该将不存在的 __var__ 变量替换为空字符串', async () => {
      html.should.match(/<h2><\/h2>/);
    });

    it('应该引用了 vendor.css', async () => {
      const regexp = new RegExp(`<link href="${publicPath}css/vendor.css" rel="stylesheet">`);
      html.should.match(regexp);
    });

    it('应该引用了 a.css', async () => {
      const regexp = new RegExp(`<link href="${publicPath}css/a.css" rel="stylesheet">`);
      html.should.match(regexp);
    });

    it('应该按 vendor.css -> a.css 的顺序引用', async () => {
      const vendorMatches = html.match(new RegExp(`<link href="${publicPath}css/vendor.css" rel="stylesheet">`));
      const aMatches = html.match(new RegExp(`<link href="${publicPath}css/a.css" rel="stylesheet">`));
      (vendorMatches.index < aMatches.index).should.be.true();
    });

    it('应该引用了 vendor.js', async () => {
      const regexp = new RegExp(`<script src="${publicPath}js/vendor.js"></script>`);
      html.should.match(regexp);
    });

    it('应该引用了 a.js', async () => {
      const regexp = new RegExp(`<script src="${publicPath}js/a.js"></script>`);
      html.should.match(regexp);
    });

    it('应该按 vendor.js -> a.js 的顺序引用', async () => {
      const vendorMatches = html.match(new RegExp(`<script src="${publicPath}js/vendor.js"></script>`));
      const aMatches = html.match(new RegExp(`<script src="${publicPath}js/a.js"></script>`));
      (vendorMatches.index < aMatches.index).should.be.true();
    });
  });

  describe('多层目录', async () => {
    let html;
    before(async () => {
      const cwd = `${__dirname}/prd/templates`;
      glob('c/d.html', { cwd }).forEach((file) => {
        html = readFileSync(`${cwd}/${file}`, { encoding: 'utf-8' });
      });
    });

    it('应该使用 master2.html 母模版', async () => {
      html.should.match(/<h1>master2<\/h1>/);
    });

    it('应该包含网页标题', async () => {
      html.should.match(/<title><\/title>/);
    });

    it('应该不包含网页关键字', async () => {
      html.should.not.match(/<meta name="keywords"/);
    });

    it('应该不包含网页描述', async () => {
      html.should.not.match(/<meta name="description"/);
    });

    it('应该不引用 vendor.css', async () => {
      const regexp = new RegExp(`<link href="${publicPath}css/vendor.css" rel="stylesheet">`);
      html.should.not.match(regexp);
    });

    it('应该不引用 a.css', async () => {
      const regexp = new RegExp(`<link href="${publicPath}css/a.css" rel="stylesheet">`);
      html.should.not.match(regexp);
    });

    it('应该不引用 vendor.js', async () => {
      html.should.not.match(new RegExp(`<script src="${publicPath}js/vendor.js"></script>`));
    });

    it('应该引用了 c/d.js', async () => {
      html.should.match(new RegExp(`<script src="${publicPath}js/c/d.js"></script>`));
    });
  });
});
