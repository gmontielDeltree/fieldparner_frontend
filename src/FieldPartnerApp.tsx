import React from 'react';
import { AppTheme } from './themes';
import { AppRouter } from './routers/AppRouter';

const FieldPartnerApp: React.FC = () => {
    return (
        <AppTheme>
            <AppRouter />
        </AppTheme>
    )
}

export default FieldPartnerApp;
