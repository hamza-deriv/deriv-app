import React from 'react';
import { DesktopWrapper, Div100vhContainer, Modal, MobileWrapper, PageOverlay, UILoader } from '@deriv/components';
import { connect } from '../Stores/connect';
import RootStore from '../Stores/index';
import { localize } from '@deriv/translations';
import { DetailsOfEachMT5Loginid } from '@deriv/api-types';
import { TCFDDashboardContainer } from '../Components/props.types';
import DMT5TradeModal from './dmt5-trade-modal';
import DerivXTradeModal from './derivx-trade-modal';

type TMT5TradeModalProps = {
    mt5_trade_account: Required<DetailsOfEachMT5Loginid>;
    is_eu_user: boolean;
    is_open: boolean;
    onPasswordManager: (
        arg1: string | undefined,
        arg2: string,
        arg3: string,
        arg4: string,
        arg5: string | undefined
    ) => void;
    toggleModal: () => void;
    platform: 'mt5' | 'dxtrade';
    dxtrade_tokens: TCFDDashboardContainer['dxtrade_tokens'];
    is_demo: string;
    show_eu_related_content: boolean;
    setIsAcuityModalOpen: (values: boolean) => void;
};

const MT5TradeModal = ({
    mt5_trade_account,
    is_eu_user,
    is_open,
    setIsAcuityModalOpen,
    onPasswordManager,
    toggleModal,
    dxtrade_tokens,
    platform,
    is_demo,
    show_eu_related_content,
}: TMT5TradeModalProps) => {
    const CFDTradeModal = () => {
        if (platform === 'mt5') {
            return (
                <DMT5TradeModal
                    mt5_trade_account={mt5_trade_account}
                    show_eu_related_content={show_eu_related_content}
                    onPasswordManager={onPasswordManager}
                    toggleModal={toggleModal}
                    setIsAcuityModalOpen={setIsAcuityModalOpen}
                    dxtrade_tokens={dxtrade_tokens}
                />
            );
        }
        return (
            <DerivXTradeModal
                mt5_trade_account={mt5_trade_account}
                is_eu_user={is_eu_user}
                onPasswordManager={onPasswordManager}
                toggleModal={toggleModal}
                dxtrade_tokens={dxtrade_tokens}
                is_demo={is_demo}
            />
        );
    };

    return (
        <React.Suspense fallback={<UILoader />}>
            <DesktopWrapper>
                <Modal
                    is_open={is_open}
                    title={localize('Trade')}
                    toggleModal={toggleModal}
                    should_header_stick_body={false}
                    width='600px'
                    exit_classname='cfd-modal--custom-exit'
                >
                    <CFDTradeModal />
                </Modal>
            </DesktopWrapper>
            <MobileWrapper>
                <PageOverlay
                    is_open={is_open}
                    portal_id='deriv_app'
                    header='Trade'
                    onClickClose={toggleModal}
                    header_classname='cfd-trade-modal__mobile-title'
                >
                    <Div100vhContainer className='cfd-trade-modal__mobile-view-wrapper' height_offset='80px'>
                        <CFDTradeModal />
                    </Div100vhContainer>
                </PageOverlay>
            </MobileWrapper>
        </React.Suspense>
    );
};

export default connect(({ modules: { cfd }, modules, ui, common, traders_hub }: RootStore) => ({
    dxtrade_tokens: cfd.dxtrade_tokens,
    platform: common.platform,
    mt5_trade_account: modules.cfd.mt5_trade_account,
    setIsAcuityModalOpen: ui.setIsAcuityModalOpen,
    show_eu_related_content: traders_hub.show_eu_related_content,
}))(MT5TradeModal);
