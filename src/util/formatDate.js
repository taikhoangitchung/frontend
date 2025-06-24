export const formatDate = (isoString) => {
    if (!isoString) return "—"
    const date = new Date(isoString)
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })
}