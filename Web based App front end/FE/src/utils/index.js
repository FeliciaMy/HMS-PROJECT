import dayjs from 'dayjs'
export const fmtDate = (iso) => iso ? dayjs(iso).format('YYYY-MM-DD HH:mm') : '-'
export default fmtDate
