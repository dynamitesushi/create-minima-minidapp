import Balance from './index';
import { render, screen, waitFor } from '@testing-library/react';
import * as minima from '../minima/index';

describe('<Balance />', () => {
    beforeEach(() => {
        jest.spyOn(minima, 'fetchBalance').mockResolvedValue([
            {
                "token": "Minima",
                "tokenid": "0x00",
                "confirmed": "1.00",
                "unconfirmed": "0",
                "sendable": "0",
                "coins": "1",
                "total": "1000000000"
            }
        ]);
    });

    test('renders balance', async () => {
        render(<Balance />);
        await waitFor(() => expect(screen.getByText(/1.05/i)).toBeInTheDocument());
    });
});
