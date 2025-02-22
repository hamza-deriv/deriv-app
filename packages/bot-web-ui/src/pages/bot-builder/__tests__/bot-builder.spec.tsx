import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserRouter } from 'react-router-dom';
import { mockStore, StoreProvider } from '@deriv/stores';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen, waitFor } from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import userEvent from '@testing-library/user-event';
import { mock_ws } from 'Utils/mock';
import RootStore from 'Stores/root-store';
import { DBotStoreProvider, mockDBotStore } from 'Stores/useDBotStore';
import BotBuilder from '../bot-builder';

jest.mock('@deriv/bot-skeleton/src/scratch/dbot', () => jest.fn());
jest.mock('../workspace-wrapper', () => jest.fn(() => <div>WorkspaceWrapper</div>));
jest.mock('../quick-strategy', () => jest.fn(() => <div>QuickStrategy</div>));
jest.mock('../../tutorials/dbot-tours/bot-builder-tour', () => jest.fn(() => <div>BotBuilderTourHandler</div>));

jest.mock('@deriv/bot-skeleton', () => ({
    ...jest.requireActual('@deriv/bot-skeleton'),
    onWorkspaceResize: jest.fn(),
    DBot: {
        initWorkspace: jest.fn(() => Promise.resolve()),
        terminateBot: jest.fn(),
        terminateConnection: jest.fn(),
    },
}));

const mockTextToDom = jest.fn(() => {
    const xml_element = document.createElement('xml');
    return xml_element;
});

const mockRemoveChangeListener = jest.fn();

const getMockBlockly = (type: string) => ({
    Xml: {
        textToDom: mockTextToDom,
    },
    derivWorkspace: {
        options: {},
        getGesture: jest.fn(),
        getVariableMap: jest.fn(),
        removeChangeListener: mockRemoveChangeListener,
        dispose: jest.fn(),
        addChangeListener: jest.fn(cb => cb({ type })),
        getAllBlocks: jest.fn(() => []),
    },
    VerticalFlyout: jest.fn(() => ({
        workspace_: {
            createPotentialVariableMap: jest.fn(),
        },
    })),
});

describe('BotBuilder', () => {
    let wrapper: ({ children }: { children: JSX.Element }) => JSX.Element, mock_DBot_store: RootStore | undefined;
    beforeEach(() => {
        Object.defineProperty(window, 'performance', {
            value: {
                clearMeasures: jest.fn(),
            },
        });
        const mock_store = mockStore({
            ui: {
                setAccountSwitcherDisabledMessage: jest.fn(),
            },
        });
        mock_DBot_store = mockDBotStore(mock_store, mock_ws);
        wrapper = ({ children }: { children: JSX.Element }) => (
            <BrowserRouter>
                <StoreProvider store={mock_store}>
                    <DBotStoreProvider ws={mock_ws} mock={mock_DBot_store}>
                        {children}
                    </DBotStoreProvider>
                </StoreProvider>
            </BrowserRouter>
        );
    });
    it('should render BotBuilderTourHandler', () => {
        window.Blockly = getMockBlockly('not-ui');
        mock_DBot_store?.dashboard?.setActiveTab(1);
        render(<BotBuilder />, { wrapper });
        expect(screen.getByText('BotBuilderTourHandler')).toBeInTheDocument();
    });

    it('should render QuickStrategy', () => {
        window.Blockly = getMockBlockly('not-ui');
        mock_DBot_store?.quick_strategy?.setFormVisibility(true);
        render(<BotBuilder />, { wrapper });
        expect(screen.getByText('QuickStrategy')).toBeInTheDocument();
    });

    it('should render BotBuilder with worksapce wrapper', () => {
        window.Blockly = getMockBlockly('not-ui');
        render(<BotBuilder />, { wrapper });
        expect(screen.getByText('WorkspaceWrapper')).toBeInTheDocument();
    });

    it('should show warning on change of block if bot is running', () => {
        window.Blockly = getMockBlockly('not-ui');
        mock_DBot_store?.run_panel.setIsRunning(true);
        mock_DBot_store?.toolbar.setResetButtonState(false);
        render(<BotBuilder />, { wrapper });
        expect(screen.getByText(/Changes you make will not affect your running bot./i)).toBeInTheDocument();
    });

    it('should not show warning on change of block if bot is running but reset is clicked', () => {
        window.Blockly = getMockBlockly('not-ui');
        mock_DBot_store?.run_panel.setIsRunning(true);
        mock_DBot_store?.toolbar.setResetButtonState(true);
        render(<BotBuilder />, { wrapper });
        const el = screen.queryByText(/Changes you make will not affect your running bot./i);
        expect(el).not.toBeInTheDocument();
    });

    it('should remove listeners on component unmount', async () => {
        window.Blockly = getMockBlockly('ui');
        mock_DBot_store?.run_panel.setIsRunning(true);
        mock_DBot_store?.toolbar.setResetButtonState(false);
        const { container } = render(<BotBuilder />, { wrapper });
        unmountComponentAtNode(container);
        await waitFor(() => expect(mockRemoveChangeListener).toHaveBeenCalledTimes(1));
    });

    it('should close the notification on click of notification close button', async () => {
        window.Blockly = getMockBlockly('not-ui');
        mock_DBot_store?.run_panel.setIsRunning(true);
        mock_DBot_store?.toolbar.setResetButtonState(false);
        render(<BotBuilder />, { wrapper });
        const notification_close_button = screen.getByTestId('bot-snackbar-notification-close');
        userEvent.click(notification_close_button);
        const el = screen.queryByText(/Changes you make will not affect your running bot./i);
        await waitFor(() => expect(el).not.toBeInTheDocument());
    });
});
