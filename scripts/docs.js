/* eslint-disable no-undef */

import fastGlob from 'fast-glob';
import shell from 'shelljs';

function exec(command, workDir) {
  if (workDir) {
    shell.pushd('-q', '.');
    shell.cd(workDir);
  }

  shell.exec(command);

  if (workDir) {
    shell.popd('-q');
  }
}

function processPackages() {
  const packagePaths = fastGlob.sync(['packages/*'], {
    onlyDirectories: true,
    ignore: ['packages/examples'],
  });

  console.log('\nCopy LICENSE files...');
  packagePaths.forEach((packagePath) => {
    console.log(`- ${packagePath}`);
    shell.cp('LICENSE', packagePath);
  });

  console.log('\nRun typedoc...');
  packagePaths.forEach((packagePath) => {
    console.log(`- ${packagePath}`);
    exec(`typedoc`, packagePath);
  });
}

processPackages();
