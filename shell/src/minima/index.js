export function fetchBalance() {
    return new Promise((resolve, reject) => {
        window.MDS.cmd('balance', function (balance) {
            if (balance.response) {
                return resolve(balance.response);
            }

            return reject();
        });
    });
}
