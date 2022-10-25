import React from 'react';
import { fetchBalance } from '../wrapper/index';

const Balance = () => {
    const [balance, setBalance] = React.useState(null);

    const getBalance = React.useCallback(() => {
        fetchBalance().then((balance) => {
            const minimaToken = balance.find(token => token.token === 'Minima');
            setBalance(minimaToken.confirmed);
        });
    }, []);

    React.useEffect(() => {
        getBalance();
    }, [getBalance]);

    return <div>Balance: {balance}</div>
}

export default Balance;