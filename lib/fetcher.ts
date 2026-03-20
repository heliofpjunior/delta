export const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error: any = new Error('Ocorreu um erro ao buscar os dados.');
        error.info = await res.json().catch(() => ({}));
        error.status = res.status;
        throw error;
    }
    return res.json();
};
