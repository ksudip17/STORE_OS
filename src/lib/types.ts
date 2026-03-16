export type StoreType = 'Retail' | 'Wholesale' | 'Online' | 'Service'
export type TransactionType = 'sale' | 'payment'

export interface Profile {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  updated_at: string
}

export interface Store {
  id: string
  user_id: string
  name: string
  type: StoreType
  description: string | null
  created_at: string
}

export interface Customer {
  id: string
  store_id: string
  name: string
  phone: string | null
  address: string | null
  balance: number
  created_at: string
}

export interface Transaction {
  id: string
  customer_id: string
  type: TransactionType
  amount: number
  description: string | null
  product: string | null
  quantity: number | null
  rate: number | null
  date: string
}

// Extended types with joined data
export interface CustomerWithStore extends Customer {
  store?: Store
}

export interface TransactionWithCustomer extends Transaction {
  customer?: Customer
}