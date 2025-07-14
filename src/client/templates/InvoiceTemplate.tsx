import { Page, Document, StyleSheet, View, Text } from '@react-pdf/renderer';

// Updated styles for modern, clean look
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  hotelInfo: {
    width: '55%',
    lineHeight: 1.5,
  },
  hotelName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#22223b',
    marginBottom: 4,
  },
  hotelAddress: {
    marginBottom: 2,
  },
  invoiceInfoBox: {
    width: '40%',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    alignItems: 'flex-start',
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: 9,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    fontSize: 12,
    marginBottom: 8,
  },
  billToLabel: {
    color: '#6366f1',
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    marginTop: 16,
    marginBottom: 2,
  },
  billToValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: '#22223b',
    marginBottom: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginVertical: 12,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    color: '#374151',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    color: '#374151',
  },
  tableRowAlt: {
    backgroundColor: '#f3f4f6',
  },
  description: { width: '32%' },
  checkIn: { width: '13%' },
  checkOut: { width: '13%' },
  nights: { width: '8%', textAlign: 'right' },
  rate: { width: '12%', textAlign: 'right', color: '#111827' },
  vat: { width: '8%', textAlign: 'right' },
  total: { width: '14%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: '#111827' },
  totalsBox: {
    alignSelf: 'flex-end',
    backgroundColor: '#f8fafc',
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: 260,
    marginTop: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    color: '#374151',
  },
  totalLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
  },
  totalValue: {
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
  },
  grandTotal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    color: '#111827',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#6366f1',
  },
  grandTotalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#6366f1',
  },
});

interface InvoiceItem {
  description: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  ratePerNight: number;
  vat: number;
  total: number;
}

interface InvoiceData {
  date: string;
  dueDate: string;
  invoiceNumber: string;
  reservation: string;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  customerName?: string;
}

interface InvoiceProps {
  hotel: string;
  invoiceData: InvoiceData;
}

export const InvoiceTemplate = ({ hotel, invoiceData }: InvoiceProps): JSX.Element => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        {/* Hotel Info */}
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName}>{hotel} Hotel</Text>
          <Text style={styles.hotelAddress}>Kiwengwa-Zanzibar (Tanzania)</Text>
          <Text style={styles.hotelAddress}>P.O Box 2529</Text>
          <Text style={styles.hotelAddress}>TINN: 300-101-496</Text>
          <Text style={styles.hotelAddress}>Registration No: Z0000007238</Text>
          <Text style={styles.hotelAddress}>Phone: 0779-414986</Text>
          <Text style={styles.hotelAddress}>Account No: 0400392000</Text>
          <Text style={styles.hotelAddress}>Swift Code: PBZATZTZ</Text>
        </View>
        {/* Invoice Info Box */}
        <View style={styles.invoiceInfoBox}>
          <Text style={styles.infoLabel}>DATE</Text>
          <Text style={styles.infoValue}>{invoiceData.date}</Text>
          <Text style={styles.infoLabel}>RESERVATION NUMBER</Text>
          <Text style={styles.infoValue}>{invoiceData.reservation}</Text>
        </View>
      </View>

      {/* Bill To Section */}
      <Text style={styles.billToLabel}>Bill To:</Text>
      <Text style={styles.billToValue}>{invoiceData.customerName || ''}</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.description}>DESCRIPTION</Text>
          <Text style={styles.checkIn}>CHECK-IN</Text>
          <Text style={styles.checkOut}>CHECK-OUT</Text>
          <Text style={styles.nights}>NIGHTS</Text>
          <Text style={styles.rate}>RATE/NIGHT</Text>
          <Text style={styles.vat}>VAT</Text>
          <Text style={styles.total}>TOTAL</Text>
        </View>
        {invoiceData.items.map((item: InvoiceItem, idx: number) => (
          <View
            key={idx}
            style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}
          >
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.checkIn}>{item.checkIn}</Text>
            <Text style={styles.checkOut}>{item.checkOut}</Text>
            <Text style={styles.nights}>{item.nights}</Text>
            <Text style={styles.rate}>${item.ratePerNight.toFixed(2)}</Text>
            <Text style={styles.vat}>{item.vat}%</Text>
            <Text style={styles.total}>${item.total.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Totals Box */}
      <View style={styles.totalsBox}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>${invoiceData.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>VAT (15%):</Text>
          <Text style={styles.totalValue}>${invoiceData.vatAmount.toFixed(2)}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>Total:</Text>
          <Text style={styles.grandTotalValue}>${invoiceData.total.toFixed(2)}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default InvoiceTemplate; 