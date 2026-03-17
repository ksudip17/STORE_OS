import { getAllCustomers } from '@/lib/actions/customers'
import { getStores } from '@/lib/actions/stores'
import CustomersClient from './CustomersClient'

export default async function CustomersPage() {
  const [customers, stores] = await Promise.all([
    getAllCustomers(),
    getStores(),
  ])

  return <CustomersClient customers={customers} stores={stores} />
}