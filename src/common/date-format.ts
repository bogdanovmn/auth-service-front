export function formatDateTime(value: string | Date | null | undefined): string {
    if (!value) {
        return ''
    }
    const date = value instanceof Date ? value : new Date(value)
    if (isNaN(date.getTime())) {
        return String(value)
    }
    const pad = (part: number) => String(part).padStart(2, '0')
    return [
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    ].join(' ')
}
