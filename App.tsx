import React, { useState } from 'react';
import { AnnoyingLogin } from './components/AnnoyingLogin';
import { VeoGenerator } from './components/VeoGenerator';
import { AppState } from './types';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.LOGIN_FORM);

    const handleLoginSuccess = () => {
        setAppState(AppState.DASHBOARD);
    };

    return (
        <div className="min-h-screen">
            {appState === AppState.DASHBOARD ? (
                <VeoGenerator />
            ) : (
                <AnnoyingLogin onSuccess={handleLoginSuccess} />
            )}
        </div>
    );
};

export default App;