import React from 'react';
import { observer, useStore } from '@deriv/stores';
import { CFD_PLATFORMS } from '../Helpers/cfd-config';
import { Form, Formik, FormikErrors, FormikHelpers, FormikValues } from 'formik';
import { FormSubmitButton, PasswordInput, Text } from '@deriv/components';
import { getErrorMessages, isDesktop, validLength, validPassword, WS } from '@deriv/shared';
import { Localize, localize } from '@deriv/translations';

export type TCFDPasswordFormValues = { password: string };
export type TCFDPasswordFormChangeValues = { old_password: string; new_password: string };

type TCFDPasswordFormReusedProps = {
    platform: typeof CFD_PLATFORMS[keyof typeof CFD_PLATFORMS];
    error_message: string;
    validatePassword: (values: TCFDPasswordFormValues) => FormikErrors<TCFDPasswordFormValues>;
};

type TCFDPasswordChangeProps = TCFDPasswordFormReusedProps & {
    error_type?: string;
    form_error?: string;
    onCancel: () => void;
    onForgotPassword: () => void;
    is_success_password_change?: boolean;
    setIsSuccessPasswordChange?: React.Dispatch<React.SetStateAction<boolean>>;
    is_success_flag?: boolean;
    setIsSuccessFlag?: React.Dispatch<React.SetStateAction<boolean>>;
    setNewPasswordValue?: React.Dispatch<React.SetStateAction<string>>;
    should_set_trading_password: boolean;
};

type TOnSubmitPasswordChange = (
    values: TCFDPasswordFormChangeValues,
    actions: FormikHelpers<TCFDPasswordFormChangeValues>
) => void;

function validatePassword(password: string): string | undefined {
    const pattern = '^(?=.*[!@#$%^&*()+\\-=[\\]{};\':"|,.<>/?_~])[ -~]{8,16}$';
    const regex = new RegExp(pattern);
    if (
        !validLength(password, {
            min: 8,
            max: 16,
        })
    ) {
        return localize('You should enter {{min_number}}-{{max_number}} characters.', {
            min_number: 8,
            max_number: 16,
        });
    } else if (!validPassword(password)) {
        return getErrorMessages().password();
    } else if (!regex.test(password)) {
        return localize('Please include at least 1 special character such as ( _ @ ? ! / # ) in your password.');
    }
}

const CFDPasswordChange = observer(
    ({
        error_type,
        form_error,
        onCancel,
        onForgotPassword,
        setIsSuccessPasswordChange,
        setIsSuccessFlag,
        setNewPasswordValue,
        should_set_trading_password,
    }: TCFDPasswordChangeProps) => {
        const { ui } = useStore();
        const { is_mobile } = ui;
        const has_cancel_button = (isDesktop() ? !should_set_trading_password : true) || error_type === 'PasswordReset';

        const handleCancel = () => {
            if (!has_cancel_button) {
                return undefined;
            }
            if (should_set_trading_password) {
                return onCancel();
            }

            return onForgotPassword();
        };

        const validate = (values: FormikValues) => {
            const errors: FormikErrors<{
                old_password: string;
                new_password: string;
            }> = {};

            if (!values.old_password) {
                errors.old_password = localize('This field is required');
            }
            if (!values.new_password) {
                errors.new_password = localize('This field is required');
            }

            if (validatePassword(values.new_password)) errors.new_password = validatePassword(values.new_password);

            return errors;
        };

        const handleSubmit: TOnSubmitPasswordChange = async (values, actions) => {
            const response = await WS.tradingPlatformPasswordChange({
                old_password: values.old_password,
                new_password: values.new_password,
                platform: CFD_PLATFORMS.MT5,
            });
            if (response.error) {
                if (response.error.code === 'PasswordError')
                    actions.setFieldError('old_password', response.error.message);
                if (response.error.code === 'InputValidationFailed')
                    actions.setFieldError(
                        'new_password',
                        'Please include at least 1 special character such as ( _ @ ? ! / # ) in your password.'
                    );
            }
            if (!response.error) {
                setIsSuccessPasswordChange?.(true);
                setIsSuccessFlag?.(true);
                setNewPasswordValue?.(values.new_password);
            }
        };
        return (
            <React.Fragment>
                <Formik
                    initialValues={{
                        old_password: '',
                        new_password: '',
                    }}
                    validateOnBlur
                    validateOnChange
                    validate={validate}
                    onSubmit={handleSubmit}
                >
                    {({ errors, isSubmitting, handleBlur, handleChange, touched, values, isValid }) => {
                        return (
                            <Form>
                                <div className='cfd-password-modal__content dc-modal__container_cfd-password-modal__body'>
                                    <div className={'cfd-password-change-modal-description'}>
                                        <Text as='p' size='xs'>
                                            <Localize i18n_default_text='Following the latest password policy update by MetaQuotes, your password now needs to meet the following criteria:' />
                                        </Text>
                                        <ol className='cfd-password-change-list-container'>
                                            <li className='cfd-password-change-list'>
                                                <Text as='p' size='xs'>
                                                    <Localize i18n_default_text='8 to 16 characters' />
                                                </Text>
                                            </li>
                                            <li className='cfd-password-change-list'>
                                                <Text as='p' size='xs'>
                                                    <Localize i18n_default_text='A special character such as ( _ @ ? ! / # )' />
                                                </Text>
                                            </li>
                                            <li className='cfd-password-change-list'>
                                                <Text as='p' size='xs'>
                                                    <Localize i18n_default_text='An uppercase letter' />
                                                </Text>
                                            </li>
                                            <li className='cfd-password-change-list'>
                                                <Text as='p' size='xs'>
                                                    <Localize i18n_default_text='An lowercase letter' />
                                                </Text>
                                            </li>
                                            <li className='cfd-password-change-list'>
                                                <Text as='p' size='xs'>
                                                    <Localize i18n_default_text='A number' />
                                                </Text>
                                            </li>
                                        </ol>
                                        <Text as='p' size='xs'>
                                            <Localize i18n_default_text='Please update your password accordingly.' />
                                        </Text>
                                    </div>
                                    <div className='input-element'>
                                        <PasswordInput
                                            autoComplete='old-password'
                                            label={localize('Current password')}
                                            error={touched.old_password && errors.old_password}
                                            name='old_password'
                                            value={values.old_password}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            data_testId={`dt_mt5_old_password`}
                                        />
                                    </div>
                                    <div className='input-element'>
                                        <PasswordInput
                                            autoComplete='new-password'
                                            label={localize('New password')}
                                            error={touched.new_password && errors.new_password}
                                            name='new_password'
                                            value={values.new_password}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            data_testId={`dt_mt5_new_password`}
                                        />
                                    </div>
                                </div>
                                <FormSubmitButton
                                    is_disabled={!values.old_password || !values.new_password || !isValid}
                                    has_cancel={has_cancel_button}
                                    is_absolute={is_mobile}
                                    cancel_label={localize('Forgot password?')}
                                    onCancel={handleCancel}
                                    is_loading={isSubmitting}
                                    label={localize('Change my password')}
                                    is_center={should_set_trading_password}
                                    form_error={form_error}
                                />
                            </Form>
                        );
                    }}
                </Formik>
            </React.Fragment>
        );
    }
);

export default CFDPasswordChange;
