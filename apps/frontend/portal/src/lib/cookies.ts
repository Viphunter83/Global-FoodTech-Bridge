/**
 * Utility to manage session cookies for GFTB Bridge.
 */
export const removeSessionCookie = () => {
    document.cookie = 'gftb-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};
