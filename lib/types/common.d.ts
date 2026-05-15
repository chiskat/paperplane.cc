/** 分页的数据 */
interface Pagination<TData = any> {
  list: TData[]
  page: number
  pageSize: number
  total: number
  totalPage: number
}
