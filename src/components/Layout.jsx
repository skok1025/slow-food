import React from 'react';
import Header from './Header';

const Layout = ({ children, onLoginClick, onLogoutClick, user, onUploadClick, onManageIngredientsClick, viewMode, onViewModeChange }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header
                onLoginClick={onLoginClick}
                onLogoutClick={onLogoutClick}
                user={user}
                onUploadClick={onUploadClick}
                onManageIngredientsClick={onManageIngredientsClick}
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
            />
            <main style={{ flex: 1, padding: '2rem 0' }}>
                <div className="container">
                    {children}
                </div>
            </main>
            <footer style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                padding: '2rem 0',
                marginTop: 'auto'
            }}>
                <div className="container text-center">
                    <p>&copy; 2024 슬로우 푸드. 잘 먹고, 더 잘 살자.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
