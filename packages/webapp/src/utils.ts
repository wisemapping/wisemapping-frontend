export const getCsrfToken = (): string | null => {
    const meta = document.head.querySelector('meta[name="_csrf"]');
    if (!meta) {
        return null;
    }
    return meta.getAttribute('content');
};

export const getCsrfTokenParameter = (): string | null => {
    const meta = document.head.querySelector('meta[name="_csrf_parameter"]');
    if (!meta) {
        return null;
    }
    return meta.getAttribute('content');
};