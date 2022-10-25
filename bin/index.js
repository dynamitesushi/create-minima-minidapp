#! /usr/bin/env node
const log = console.log;
const fs = require('fs');
const fse = require('fs-extra');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const inquirer = require('inquirer');

const myArgs = process.argv.slice(2);
const dir = `./${myArgs[0] || 'create-minima-minidapp'}`;

const npmInstall = () => {
  return exec(`cd ${dir}; npm install --quiet;`);
}

const questions = [
  {
    name: 1,
    message: 'Name of the MiniDApp',
    type: 'input',
    default: 'my-minima-app'
  },
  {
    name: 2,
    message: 'What port is MDS running on?',
    type: 'input',
    default: '9003'
  },
  {
    name: 3,
    message: 'What port is RPC running on?',
    type: 'input',
    default: '9005'
  },
  {
    name: 4,
    message: 'Would you like the cli to set up the .env file for you automatically?',
    type: "confirm",
  }
];

(async () => {
  log(`----------------------------------------`);
  log('Create Minima MiniDApp (v1)');
  log(`----------------------------------------`);

  if (!fs.existsSync(dir)) {
    log('✍️  Copying files');
    log(`----------------------------------------`);

    fs.mkdirSync(dir);

    fse.copySync(__dirname + "/../shell", dir);
    log(`🚚 Installing NPM dependencies`);
    await npmInstall();
    log(`----------------------------------------`);
    log(`✨ Successfully NPM dependencies`);
    log(`----------------------------------------`);

    inquirer
      .prompt(questions)
      .then(async (answers) => {
        if (answers[1] !== questions[0].default) {
          const packageJson = fs.readFileSync(dir + '/package.json', 'utf-8');
          fs.writeFileSync(dir + '/package.json', packageJson.replace(/"my-minima-minidapp"/, `"${answers[1].toLowerCase().replace(' ', '-')}"`));
        }

        if (answers[4]) {
          if (!fs.existsSync(dir + '/.env')) {
            fs.writeFileSync(dir + '/.env', 'REACT_APP_DEBUG=true\nREACT_APP_DEBUG_HOST=localhost\nREACT_APP_DEBUG_MDS_PORT=9003\nREACT_APP_DEBUG_RPC_PORT=9005\nREACT_APP_DEBUG_UID=\n')
          }

          if (answers[2] !== questions[1].default) {
            const envFile = fs.readFileSync(dir + '/.env', 'utf-8');
            fs.writeFileSync(dir + '/.env', envFile.replace(/REACT_APP_DEBUG_MDS_PORT=?.+\n/, `REACT_APP_DEBUG_MDS_PORT=${Number(answers[2]) + 2}\n`));
          }
  
          if (answers[3] !== questions[2].default) {
            const envFile = fs.readFileSync(dir + '/.env', 'utf-8');
            fs.writeFileSync(dir + '/.env', envFile.replace(/REACT_APP_DEBUG_RPC_PORT=?.+\n/, `REACT_APP_DEBUG_RPC_PORT=${Number(answers[2]) + 2}\n`));
          }
        }

        log(`----------------------------------------`);
        log(`Your MiniDApp name: ${myArgs[0][0].toUpperCase()}${myArgs[0].slice(1)}`)
        log(`You can run your MiniDApp by typing the following:`)
        log(`> cd ${myArgs[0]}`)
        log(`> npm run start`);
        log(`----------------------------------------`);
        process.exit();
      })
      .catch((error) => {
        if (error.isTtyError) {
          console.log('An error occurred, please try again with a different name.');
          process.exit(1);
        } else {
            console.log(error);
          console.log('An unknown error occurred, please try again later.');
          process.exit(1);
        }
      });
  } else {
    console.log('File directory already exists! Please specify a different MiniDApp name.');
    process.exit(1);
  }
})();
