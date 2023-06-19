import React from 'react';
import { useHistory } from 'react-router-dom';
import { Text, Icon, PageOverlay, DesktopWrapper, MobileWrapper, CFDCompareAccountsCarousel } from '@deriv/components';
import { routes, CFD_PLATFORMS } from '@deriv/shared';
import { Localize, localize } from '@deriv/translations';
import { observer, useStore } from '@deriv/stores';
import CFDCompareAccountsCard from './cfd-compare-accounts-card';
import {
    getSortedAvailableAccounts,
    getDxtradeAccountAvailabaility,
    prepareDxtradeData,
} from '../../Helpers/compare-accounts-config';

const CompareCFDs = observer(() => {
    const history = useHistory();
    const store = useStore();
    const { client, traders_hub } = store;
    const { trading_platform_available_accounts } = client;
    const { available_cfd_accounts } = traders_hub;

    const sorted_available_accounts = getSortedAvailableAccounts(trading_platform_available_accounts);

    const has_dxtrade_account_available = getDxtradeAccountAvailabaility(available_cfd_accounts);

    const dxtrade_data = available_cfd_accounts.filter(accounts => accounts.platform === CFD_PLATFORMS.DXTRADE);
    const { name, market_type } = dxtrade_data[0];
    const dxtrade_account = prepareDxtradeData(name, market_type);

    const all_sorted_available_accounts = has_dxtrade_account_available
        ? [...sorted_available_accounts, dxtrade_account]
        : [...sorted_available_accounts];

    const DesktopHeader = (
        <div className='compare-cfd-header'>
            <div
                className='compare-cfd-header-navigation'
                onClick={() => {
                    history.push(routes.traders_hub);
                }}
            >
                <Icon icon='IcArrowLeftBold' />
                <Text size='xs' weight='bold' color='prominent'>
                    <Localize i18n_default_text="Trader's hub" />
                </Text>
            </div>
            <h1 className='compare-cfd-header-title'>
                <Text size='m' weight='bold' color='prominent'>
                    <Localize i18n_default_text='Compare CFDs accounts' />
                </Text>
            </h1>
        </div>
    );

    return (
        <React.Fragment>
            <DesktopWrapper>
                <div className='compare-cfd-account'>
                    <PageOverlay header={DesktopHeader} is_from_app={routes.traders_hub} />
                    <div className='compare-cfd-account-container'>
                        <div className='card-list'>
                            <CFDCompareAccountsCarousel>
                                {all_sorted_available_accounts.map(item => (
                                    <CFDCompareAccountsCard
                                        trading_platforms={item}
                                        key={item.market_type + item.shortcode}
                                    />
                                ))}
                            </CFDCompareAccountsCarousel>
                        </div>
                    </div>
                </div>
                {/* <CFDPasswordModal context={store} platform={platform} /> */}
            </DesktopWrapper>
            <MobileWrapper>
                <PageOverlay
                    header={localize('Compare CFDs accounts')}
                    header_classname='compare-cfd-header-title'
                    is_from_app={!routes.traders_hub}
                    onClickClose={() => history.push(routes.traders_hub)}
                >
                    mobile wrapper
                </PageOverlay>
            </MobileWrapper>
        </React.Fragment>
    );
});

export default CompareCFDs;
