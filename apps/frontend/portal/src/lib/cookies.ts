
/**
 * Utility to manage session cookies for GFTB Bridge.
 */
export const setSessionCookie = (token: string) => {
    document.cookie = `gftb-session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
};

export const removeSessionCookie = () => {
    document.cookie = 'gftb-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};
