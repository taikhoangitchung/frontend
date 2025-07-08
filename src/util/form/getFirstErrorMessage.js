export const getFirstErrorMessage = (errors) => {
    for (const value of Object.values(errors)) {
        if (typeof value === "string") return value;
        if (Array.isArray(value)) {
            for (const item of value) {
                if (typeof item === "string") return item;
                if (typeof item === "object" && item !== null) {
                    const nested = getFirstErrorMessage(item);
                    if (nested) return nested;
                }
            }
        }
        if (typeof value === "object" && value !== null) {
            const nested = getFirstErrorMessage(value);
            if (nested) return nested;
        }
    }
    return null;
};