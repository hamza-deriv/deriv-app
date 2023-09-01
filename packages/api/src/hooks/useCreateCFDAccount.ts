// import { useMemo } from 'react';
import useAuthorize from './useAuthorize';

type TCFD_Platform = 'mt5' | 'dxtrade' | 'derivez' | 'ctrader';

type TCreateCFDAccount = {
    platform: TCFD_Platform;
    account_type: {
        category: 'demo' | 'real';
        type: 'all' | 'synthetic' | 'financial';
    };
};
/** A custom hook that create CFD Account and accepts the CFD Platform, Account Type as param. */
const useCreateCFDAccount = ({ platform, account_type }: TCreateCFDAccount) => {
    const { data: authorize_data, ...rest } = useAuthorize();
    // console.log(authorize_data);
};

export default useCreateCFDAccount;
