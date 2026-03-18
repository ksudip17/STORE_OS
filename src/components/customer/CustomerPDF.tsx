'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from '@react-pdf/renderer'
import { format } from 'date-fns'
import type { Customer, Transaction, Store } from '@/lib/types'
import { FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  appName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
  },
  appTagline: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  invoiceDate: {
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  customerBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 4,
  },
  customerName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  customerDetail: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  balanceBox: {
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceDue: {
    backgroundColor: '#fef2f2',
  },
  balanceAdvance: {
    backgroundColor: '#f0fdf4',
  },
  balanceClear: {
    backgroundColor: '#f8fafc',
  },
  balanceLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  balanceAmount: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
  },
  balanceDueText: {
    color: '#dc2626',
  },
  balanceAdvanceText: {
    color: '#16a34a',
  },
  balanceClearText: {
    color: '#94a3b8',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: '6 8',
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '6 8',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  colDate:    { width: '18%', fontSize: 9 },
  colType:    { width: '12%', fontSize: 9 },
  colProduct: { width: '30%', fontSize: 9 },
  colQty:     { width: '10%', fontSize: 9, textAlign: 'right' },
  colRate:    { width: '12%', fontSize: 9, textAlign: 'right' },
  colAmount:  { width: '18%', fontSize: 9, textAlign: 'right' },
  headerText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  saleText:    { color: '#dc2626' },
  paymentText: { color: '#16a34a' },
  footer: {
    marginTop: 30,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
})

interface Props {
  customer: Customer
  transactions: Transaction[]
  store: Store
}

function KhataDocument({ customer, transactions, store }: Props) {
  const isDue     = customer.balance < 0
  const isAdvance = customer.balance > 0
  const sortedTx  = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>StoreOS</Text>
            <Text style={styles.appTagline}>Store Management System</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>Account Statement</Text>
            <Text style={styles.invoiceDate}>
              Generated: {format(new Date(), 'dd MMM yyyy')}
            </Text>
            <Text style={styles.invoiceDate}>Store: {store.name}</Text>
          </View>
        </View>

        {/* Customer info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.customerBox}>
            <Text style={styles.customerName}>{customer.name}</Text>
            {customer.phone && (
              <Text style={styles.customerDetail}>Phone: {customer.phone}</Text>
            )}
            {customer.address && (
              <Text style={styles.customerDetail}>Address: {customer.address}</Text>
            )}
            <Text style={styles.customerDetail}>
              Member since: {format(new Date(customer.created_at), 'dd MMM yyyy')}
            </Text>
          </View>
        </View>

        {/* Balance */}
        <View style={[
          styles.balanceBox,
          isDue ? styles.balanceDue : isAdvance ? styles.balanceAdvance : styles.balanceClear
        ]}>
          <Text style={styles.balanceLabel}>
            {isDue ? 'Outstanding Due' : isAdvance ? 'Advance Balance' : 'Account Status'}
          </Text>
          <Text style={[
            styles.balanceAmount,
            isDue ? styles.balanceDueText : isAdvance ? styles.balanceAdvanceText : styles.balanceClearText
          ]}>
            {customer.balance === 0
              ? 'Clear'
              : `₹${Math.abs(customer.balance).toLocaleString('en-IN')}`
            }
          </Text>
        </View>

        {/* Transactions table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Transaction History ({transactions.length} entries)
          </Text>

          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colDate, styles.headerText]}>Date</Text>
            <Text style={[styles.colType, styles.headerText]}>Type</Text>
            <Text style={[styles.colProduct, styles.headerText]}>Product / Note</Text>
            <Text style={[styles.colQty, styles.headerText]}>Qty</Text>
            <Text style={[styles.colRate, styles.headerText]}>Rate</Text>
            <Text style={[styles.colAmount, styles.headerText]}>Amount</Text>
          </View>

          {/* Table rows */}
          {sortedTx.map((tx, i) => (
            <View
              key={tx.id}
              style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={styles.colDate}>
                {format(new Date(tx.date), 'dd MMM yy')}
              </Text>
              <Text style={[
                styles.colType,
                tx.type === 'sale' ? styles.saleText : styles.paymentText
              ]}>
                {tx.type === 'sale' ? 'Sale' : 'Paid'}
              </Text>
              <Text style={styles.colProduct}>
                {tx.product || tx.description || '—'}
              </Text>
              <Text style={styles.colQty}>
                {tx.quantity ?? '—'}
              </Text>
              <Text style={styles.colRate}>
                {tx.rate ? `₹${tx.rate}` : '—'}
              </Text>
              <Text style={[
                styles.colAmount,
                tx.type === 'sale' ? styles.saleText : styles.paymentText
              ]}>
                {tx.type === 'sale' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            StoreOS — Smart Store Management
          </Text>
          <Text style={styles.footerText}>
            Statement generated on {format(new Date(), 'dd MMM yyyy, hh:mm a')}
          </Text>
        </View>

      </Page>
    </Document>
  )
}

export default function DownloadPDFButton({ customer, transactions, store }: Props) {
  const fileName = `${customer.name.replace(/\s+/g, '_')}_statement.pdf`

  return (
    <PDFDownloadLink
      document={
        <KhataDocument
          customer={customer}
          transactions={transactions}
          store={store}
        />
      }
      fileName={fileName}
    >
      {({ loading }) => (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50"
          disabled={loading}
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <FileDown className="w-4 h-4" />
          }
          {loading ? 'Generating PDF...' : 'Download Statement'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}