const fs = require('fs');
const axios = require('axios');
const https = require('https');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const jsdom = require("jsdom");

const envFile = './.env';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const env = fs.readFileSync('./.env', 'utf-8');

const mdsPort = Number(env.match(/(?<=REACT_APP_DEBUG_MDS_PORT=).*/)[0]);
const rpcPort = Number(env.match(/(?<=REACT_APP_DEBUG_RPC_PORT=).*/)[0]);

const orderRecentFiles = (dir) =>
    fs.readdirSync(dir)
        .filter(f => fs.lstatSync(dir + '/' + f).isFile())
        .map(file => ({ file, mtime: fs.lstatSync(dir + '/' + file).mtime }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

const getMostRecentFile = (dir) => {
    const files = orderRecentFiles(dir);
    return files.length ? files[0] : undefined;
};

async function checkIfAppIsInstalled(appName){
    const mds = await axios.get(`http://127.0.0.1:${rpcPort}/mds`).catch(() => {
        console.log('Skipping automatic enviorment setup, please check RPC is running on port 9005.');
        console.log('Please fill out "REACT_APP_DEBUG_UID" manually.')
    });
    return mds.data.response.minidapps.find(app => app.conf.name === appName);
}

function getMinimaMDSPassword() {
    return axios({
        url: `http://127.0.0.1:${rpcPort}/mds`,
    }).then(function (response) {
        return response.data.response.password;
    });
}

function installMinmaApp() {
    const { file } = getMostRecentFile('./minidapp');
    const command = `mds action:install file:${__dirname}/../minidapp/${file}`;

    return axios({
        url: `http://127.0.0.1:${rpcPort}/${command}`,
    });
}

function getMinimaAppUID(password, appName) {
    return axios({
        url: `https://127.0.0.1:${mdsPort}/login.html`,
        method: 'post',
        data: `password=${password}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        httpsAgent,
    }).then(function (response) {
        const document = new jsdom.JSDOM(response.data);
        const anchors = document.window.document.querySelectorAll('.app-title');
        let appUid = '';
        anchors.forEach(function(anchor) {
            if (anchor.textContent === appName) {
                appUid = anchor.parentNode.parentNode.href.match(/(?<==).*/)[0];
            }
        });
        return appUid;
    });
}

(async () => {
    const dAppConf = fs.readFileSync('./public/dapp.conf');
    const conf = JSON.parse(dAppConf);
    const isAppInstalled = await checkIfAppIsInstalled(conf.name);

    if (!fs.existsSync(envFile)) {
        fs.writeFileSync(envFile, 'REACT_APP_DEBUG=true\nREACT_APP_DEBUG_HOST=localhost\nREACT_APP_DEBUG_PORT=9003\nREACT_APP_DEBUG_UID=\n')
    }

    if (!isAppInstalled) {
        try {
            await exec('npm run zip');
            await installMinmaApp();
        } catch {
            // silently exit
        }
    }

    try {
        const password = await getMinimaMDSPassword();
        const appUID = await getMinimaAppUID(password, conf.name);
        const file = fs.readFileSync(envFile, 'utf-8');
        fs.writeFileSync(envFile, file.replace(/REACT_APP_DEBUG_UID=?.+\n/, `REACT_APP_DEBUG_UID=${appUID}\n`));
    } catch {
        console.log('There was an issue setting up the env file, please create an issue in the github repository.');
    }
})();
