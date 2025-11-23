
import React from 'react';
import '../styles/index.css'; // Ensure styles are loaded

const Header = ({ user, onLoginClick, onSignupClick, onLogoutClick, onUploadClick, onManageIngredientsClick, viewMode, onViewModeChange }) => {
    return (
        <header style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)',
            padding: '1rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1.5rem' }}>🌱</span>
                    <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>슬로우 푸드</h1>
                </div>
                <nav>
                    <ul style={{ display: 'flex', gap: '1rem', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0 }}>
                        <li>
                            {user ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onViewModeChange(viewMode === 'favorites' ? 'all' : 'favorites')}
                                        style={{
                                            marginRight: '1rem',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: viewMode === 'favorites' ? '#FFF3E0' : 'transparent',
                                            color: viewMode === 'favorites' ? 'var(--color-primary)' : 'inherit',
                                            borderRadius: 'var(--radius-md)',
                                            fontWeight: 500,
                                            border: viewMode === 'favorites' ? '1px solid var(--color-primary)' : 'none'
                                        }}
                                    >
                                        {viewMode === 'favorites' ? '★ 찜한 레시피' : '☆ 찜한 레시피'}
                                    </button>
                                    <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{user.name}님</span>
                                    <button
                                        onClick={onLogoutClick}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            border: '1px solid #ddd',
                                            borderRadius: 'var(--radius-md)',
                                            backgroundColor: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={onLoginClick}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            backgroundColor: 'var(--color-primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            fontWeight: 500
                                        }}
                                    >
                                        로그인
                                    </button>
                                    <button
                                        onClick={onSignupClick}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            backgroundColor: 'white',
                                            color: 'var(--color-primary)',
                                            border: '1px solid var(--color-primary)',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            fontWeight: 500
                                        }}
                                    >
                                        회원가입
                                    </button>
                                </div>
                            )}
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
