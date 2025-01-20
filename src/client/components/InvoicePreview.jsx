import React, { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Font } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';

// Register fonts - using a simpler font setup
Font.register({
  family: 'Helvetica'
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 8,
    lineHeight: 1.4,
    backgroundColor: '#ffffff',
    color: '#1e293b'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0'
  },
  companyInfo: {
    flex: 2.5,
    marginRight: 20,
    marginBottom: 0
  },
  invoiceSection: {
    width: 220,
    alignItems: 'flex-end'
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#0f172a'
  },
  hotelName: {
    fontSize: 20,
    marginBottom: 12,
    color: '#475569'
  },
  companyLocation: {
    fontSize: 12,
    marginBottom: 8,
    color: '#475569'
  },
  companyDetails: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 10,
    lineHeight: 1.6
  },
  detailRow: {
    marginBottom: 3
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0f172a',
    textAlign: 'right'
  },
  invoiceBox: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4
  },
  invoiceRow: {
    flexDirection: 'row',
    marginBottom: 3
  },
  invoiceLabel: {
    width: 70,
    color: '#64748b',
    fontSize: 8
  },
  table: {
    marginTop: 0,
    marginBottom: 16
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 8,
    borderRadius: 4
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0'
  },
  description: { 
    width: '35%',
    fontSize: 8
  },
  date: { 
    width: '12%', 
    textAlign: 'center',
    fontSize: 8
  },
  nights: { 
    width: '10%', 
    textAlign: 'center',
    fontSize: 8
  },
  rate: { 
    width: '12%', 
    textAlign: 'right',
    fontSize: 8
  },
  vat: { 
    width: '8%', 
    textAlign: 'center',
    fontSize: 8
  },
  total: { 
    width: '11%', 
    textAlign: 'right',
    fontSize: 8
  },
  totalsBox: {
    alignSelf: 'flex-end',
    width: 180,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    fontSize: 8
  },
  totalDivider: {
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 6,
    marginTop: 6
  },
  notes: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    fontSize: 8,
    color: '#64748b'
  }
});

const sanitizeText = (text) => {
  if (text === null || text === undefined) return '';
  // Simplify text sanitization to basic ASCII
  return String(text)
    .replace(/[^\x00-\x7F]/g, '') // Remove all non-ASCII characters
    .trim();
};

// PDF Document component with error handling
export const InvoicePDF = ({ invoice }) => {
  // Add error boundary for invoice data
  const safeInvoice = {
    property: sanitizeText(invoice?.property),
    location: sanitizeText(invoice?.location),
    poBox: sanitizeText(invoice?.poBox),
    tinnNumber: sanitizeText(invoice?.tinnNumber),
    registrationNumber: sanitizeText(invoice?.registrationNumber),
    phone: sanitizeText(invoice?.phone),
    accountNumber: sanitizeText(invoice?.accountNumber),
    swiftCode: sanitizeText(invoice?.swiftCode),
    invoiceNumber: sanitizeText(invoice?.invoiceNumber),
    reservationNumber: sanitizeText(invoice?.reservationNumber),
    date: invoice?.date || new Date(),
    dueDate: invoice?.dueDate || new Date(),
    items: (invoice?.items || []).map(item => ({
      ...item,
      description: sanitizeText(item.description),
      checkIn: item.checkIn || new Date(),
      checkOut: item.checkOut || new Date(),
      nights: item.nights || 0,
      ratePerNight: item.ratePerNight || 0,
      total: item.total || 0
    })),
    subtotal: invoice?.subtotal || 0,
    tax: invoice?.tax || 0,
    total: invoice?.total || 0
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Veraclub Zanzibar LTD</Text>
            <Text style={styles.hotelName}>{safeInvoice.property}</Text>
            <Text style={styles.companyLocation}>{safeInvoice.location}</Text>
            <View style={styles.companyDetails}>
              <Text>P.O Box {safeInvoice.poBox}</Text>
              <Text>TINN: {safeInvoice.tinnNumber}</Text>
              <Text>Reg No: {safeInvoice.registrationNumber}</Text>
              <Text>Tel: {safeInvoice.phone}</Text>
              <Text>Account: {safeInvoice.accountNumber}</Text>
              <Text>Swift: {safeInvoice.swiftCode}</Text>
            </View>
          </View>

          <View style={styles.invoiceSection}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={styles.invoiceBox}>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Date:</Text>
                <Text>{new Date(safeInvoice.date).toLocaleDateString('en-GB')}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Due Date:</Text>
                <Text>{new Date(safeInvoice.dueDate).toLocaleDateString('en-GB')}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Invoice #:</Text>
                <Text>{safeInvoice.invoiceNumber}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Reservation #:</Text>
                <Text>{safeInvoice.reservationNumber}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.description}>Description</Text>
            <Text style={styles.date}>Check-in</Text>
            <Text style={styles.date}>Check-out</Text>
            <Text style={styles.nights}>Nights</Text>
            <Text style={styles.rate}>Rate/Night</Text>
            <Text style={styles.vat}>VAT</Text>
            <Text style={styles.total}>Total</Text>
          </View>
          {safeInvoice.items?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.date}>{new Date(item.checkIn).toLocaleDateString('en-GB')}</Text>
              <Text style={styles.date}>{new Date(item.checkOut).toLocaleDateString('en-GB')}</Text>
              <Text style={styles.nights}>{item.nights}</Text>
              <Text style={styles.rate}>${item.ratePerNight.toFixed(2)}</Text>
              <Text style={styles.vat}>15%</Text>
              <Text style={styles.total}>${item.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>${safeInvoice.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>VAT (15%):</Text>
            <Text>${safeInvoice.tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalDivider]}>
            <Text style={{ fontWeight: 'bold' }}>Total:</Text>
            <Text style={{ fontWeight: 'bold' }}>${safeInvoice.total.toFixed(2)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

function InvoicePreview({ invoice, onClose }) {
  const [isFullPage, setIsFullPage] = useState(false);
  
  if (!invoice) return null;

  const handleDownloadPDF = async () => {
    try {
      console.log('Starting PDF generation...');
      const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
      console.log('PDF generated successfully');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleSendEmail = async () => {
    try {
      console.log('Starting email send process...');
      const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
      console.log('PDF generated for email');
      
      // Get default emails and clean them
      const apiUrl = 'http://37.27.142.148:5171';  // Force absolute URL
      const defaultEmailsResponse = await fetch(`${apiUrl}/settings/emails`, {
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'text/plain'
        },
        credentials: 'include'
      });
      console.log('Email settings response status:', defaultEmailsResponse.status);
      const defaultEmailsText = await defaultEmailsResponse.text();
      console.log('Email settings text:', defaultEmailsText);
      const defaultEmails = defaultEmailsText
        .split('\n')
        .map(email => email.trim())
        .filter(email => email && email.includes('@')); // Only keep valid-looking emails
      
      console.log('Parsed email addresses:', defaultEmails);
      
      if (defaultEmails.length === 0) {
        throw new Error('No valid email addresses found in settings');
      }
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        
        // Send to all recipients from settings
        for (const recipient of defaultEmails) {
          console.log('Sending email to:', recipient);
          
          const emailData = {
            to: recipient,
            subject: `Invoice #${invoice.invoiceNumber} from ${invoice.property}`,
            text: `Please find attached your Invoice #${invoice.invoiceNumber}.`,
            attachments: [{
              filename: `invoice-${invoice.invoiceNumber}.pdf`,
              content: base64data,
              encoding: 'base64',
              contentType: 'application/pdf'
            }]
          };

          console.log('Sending email to:', recipient);
          const response = await fetch('http://37.27.142.148:3000/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(emailData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
        }

        console.log('Emails sent successfully to all recipients');
        alert('Emails sent successfully!');
      };
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      {/* Action Buttons */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center print:hidden">
        <h2 className="text-xl font-bold text-gray-800">Invoice #{invoice.invoiceNumber}</h2>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download PDF
          </button>
          <button
            onClick={handleSendEmail}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Send Email
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Close
          </button>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="p-4" style={{ height: 'calc(100vh - 100px)' }}>
        <PDFViewer style={{ width: '100%', height: '100%' }}>
          <InvoicePDF invoice={invoice} />
        </PDFViewer>
      </div>
    </div>
  );
}

export default InvoicePreview; 