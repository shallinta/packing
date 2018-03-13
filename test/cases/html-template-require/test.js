import { readFileSync, existsSync } from 'fs';
import rimraf from 'rimraf';
import { exec, getTestCaseName } from '../../util';

describe(getTestCaseName(), async () => {
  let html;
  before(async () => {
    const cmd = 'node_modules/.bin/babel-node src/bin/packing.js build';
    if (process.env.DEBUG) {
      const stdout = await exec(cmd);
      console.log(stdout);
    } else {
      await exec(cmd);
    }
  });

  after(async () => {
    // 删除临时文件
    if (!process.env.DEBUG) {
      rimraf.sync(`${__dirname}/prd`);
    }
  });

  it('应该能正常编译出网页文件', async () => {
    const htmlFile = `${__dirname}/prd/templates/a.html`;
    existsSync(htmlFile).should.be.true();
    html = readFileSync(htmlFile, 'utf8');
  });

  it('应该正确替换网页中的一级目录图片地址', async () => {
    html.should.match(/\/1_\w{8}.jpg/);
  });

  it('应该正确替换网页中的二级目录图片地址', async () => {
    html.should.match(/\/images\/2_\w{8}.jpg/);
  });

  it('应该正确替换不同目录下同名的图片地址', async () => {
    html.should.match(/\/images\/1_\w{8}.jpg/);
  });

  it('网络图片应该保持原有网络地址', async () => {
    html.should.match(/\/\/qzz.com\/images\/2.jpg/);
  });

  it('应该替换同一文件中多次引用的图片地址', async () => {
    const matches = html.match(/"\/1_\w{8}.jpg"/g);
    matches.should.have.length(2);
  });

  it('应该正确替换 favicon 图片地址', async () => {
    html.should.match(/"\/images\/favico_\w{8}.jpg"/);
  });
});
