export const getPagination = (query, { defaultLimit = 10, maxLimit = 100 } = {}) => {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit) || defaultLimit, 1), maxLimit);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};
