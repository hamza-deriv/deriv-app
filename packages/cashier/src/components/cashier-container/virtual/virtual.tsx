import classNames from 'classnames';
import React from 'react';
import { withRouter, useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Text } from '@deriv/components';
import { isMobile, routes } from '@deriv/shared';
import { Localize } from '@deriv/translations';
import { useStore } from '@deriv/stores';
import './virtual.scss';

type TVirtual = {
    is_pre_appstore: boolean;
};

const Virtual = ({ is_pre_appstore }: TVirtual) => {
    const {
        ui: { is_dark_mode_on, toggleAccountsDialog },
    } = useStore();
    const history = useHistory();

    return (
        <div className='cashier__wrapper' data-testid='dt_cashier_wrapper_id'>
            <React.Fragment>
                <div
                    data-testid={
                        is_dark_mode_on
                            ? 'dt_virtual_account_switch_icon_dark_id'
                            : 'dt_virtual_account_switch_icon_light_id'
                    }
                    className={classNames(
                        'virtual__account-switch-icon',
                        is_dark_mode_on ? 'virtual__account-switch-icon--dark' : 'virtual__account-switch-icon--light'
                    )}
                />
                <Text as='h2' align='center' weight='bold' color='prominent' className='virtual__header'>
                    <Localize i18n_default_text={'You are using a demo account'} />
                </Text>
                <Text
                    as='p'
                    size={isMobile() ? 'xxs' : 'xs'}
                    line_height='s'
                    align='center'
                    className='cashier__paragraph cashier__text'
                >
                    <Localize
                        i18n_default_text='You need to switch to a real money account to use this feature.<0/>You can do this by selecting a real account from the <1>Account Switcher.</1>'
                        components={[
                            <br key={0} />,
                            <span
                                key={1}
                                className='virtual__account-switch-text'
                                onClick={() => {
                                    if (is_pre_appstore) {
                                        history.push(routes.trade);
                                        toggleAccountsDialog();
                                    } else {
                                        toggleAccountsDialog();
                                    }
                                }}
                            />,
                        ]}
                    />
                </Text>
            </React.Fragment>
        </div>
    );
};

export default observer(withRouter(Virtual));
