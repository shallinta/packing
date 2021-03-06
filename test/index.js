const cp = require('child_process');
const chalk = require('chalk');
const glob = require('glob');
const path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'local';

const files = glob.sync('cases/**/index.js', { cwd: __dirname });
files.sort((a, b) => path.dirname(a) > path.dirname(b));

const errors = [];
files.forEach((file, i) => {
  const cmd = `node_modules/.bin/mocha test/${file}`;
  const title = `[${i + 1}/${files.length}] ${cmd}`;
  console.log(chalk.yellow(title));
  try {
    const stdout = cp.execSync(cmd, { encoding: 'utf-8' });
    console.log(stdout);
  } catch (e) {
    errors.push(title);
    console.log(chalk.red(e.stdout));
  }
});

const output = ['done:'];

if (errors.length === 0) {
  output.push('  all passing');
  console.log(output.join('\n'));
} else {
  output.push(`  ${files.length - errors.length} passing`);
  output.push(chalk.red(`  ${errors.length} failing`));
  errors.forEach(title => output.push(chalk.red(`    - ${title}`)));
  console.log(output.join('\n'));
  process.exit(1);
}
