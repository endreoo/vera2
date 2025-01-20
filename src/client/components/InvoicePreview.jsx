import React, { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Font } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';

// Register fonts - using multiple fonts for better typography
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 }
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Roboto',
    fontSize: 10,
    lineHeight: 1.6,
    backgroundColor: '#ffffff',
    color: '#1e293b'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderBottomStyle: 'solid',
    alignItems: 'flex-start'
  },
  companyInfo: {
    flex: 1,
    marginRight: 40,
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 8,
    minWidth: '45%',
    maxWidth: '45%'
  },
  invoiceSection: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '45%',
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  companyName: {
    fontSize: 16,
    letterSpacing: 0.5,
    fontWeight: 700,
    marginBottom: 16,
    color: '#0f172a'
  },
  detailText: {
    fontSize: 11,
    marginBottom: 8,
    color: '#475569',
    fontWeight: 400,
    lineHeight: 1.4
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 24,
    color: '#0f172a',
    textAlign: 'center'
  },
  invoiceBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
    alignItems: 'center'
  },
  invoiceLabel: {
    color: '#475569',
    fontSize: 11,
    marginRight: 16,
    width: '30%',
    textAlign: 'left'
  },
  invoiceValue: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: 500,
    textAlign: 'left',
    width: '70%'
  },
  table: {
    marginTop: 20,
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 14,
    borderRadius: 8,
    fontWeight: 500
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderBottomStyle: 'solid'
  },
  description: { 
    width: '35%',
    fontSize: 10,
    color: '#0f172a',
    fontWeight: 400
  },
  date: { 
    width: '12%', 
    textAlign: 'center',
    fontSize: 10,
    color: '#475569'
  },
  nights: { 
    width: '10%', 
    textAlign: 'center',
    fontSize: 9,
    color: '#475569'
  },
  rate: { 
    width: '12%', 
    textAlign: 'right',
    fontSize: 9,
    color: '#475569'
  },
  vat: { 
    width: '8%', 
    textAlign: 'center',
    fontSize: 9,
    color: '#475569'
  },
  total: { 
    width: '11%', 
    textAlign: 'right',
    fontSize: 9,
    color: '#0f172a',
    fontWeight: 'medium'
  },
  totalsBox: {
    alignSelf: 'flex-end',
    width: 240,
    marginTop: 30,
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 9
  },
  totalLabel: {
    color: '#64748b'
  },
  totalValue: {
    color: '#0f172a',
    fontWeight: 'medium'
  },
  totalDivider: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    borderTopStyle: 'solid',
    paddingTop: 8,
    marginTop: 8
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0f172a'
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
            <Text style={styles.detailText}>{safeInvoice.property}</Text>
            <Text style={styles.detailText}>{safeInvoice.location}</Text>
            <Text style={styles.detailText}>P.O Box {safeInvoice.poBox}</Text>
            <Text style={styles.detailText}>TINN: {safeInvoice.tinnNumber}</Text>
            <Text style={styles.detailText}>Reg No: {safeInvoice.registrationNumber}</Text>
            <Text style={styles.detailText}>Tel: {safeInvoice.phone}</Text>
            <Text style={styles.detailText}>Account: {safeInvoice.accountNumber}</Text>
            <Text style={styles.detailText}>Swift: {safeInvoice.swiftCode}</Text>
          </View>

          <View style={styles.invoiceSection}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={styles.invoiceBox}>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Date:</Text>
                <Text style={styles.invoiceValue}>{new Date(safeInvoice.date).toLocaleDateString('en-GB')}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Due Date:</Text>
                <Text style={styles.invoiceValue}>{new Date(safeInvoice.dueDate).toLocaleDateString('en-GB')}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Invoice #:</Text>
                <Text style={styles.invoiceValue}>{safeInvoice.invoiceNumber}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Reservation:</Text>
                <Text style={styles.invoiceValue}>{safeInvoice.reservationNumber}</Text>
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
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${safeInvoice.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT (15%):</Text>
            <Text style={styles.totalValue}>${safeInvoice.tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalDivider]}>
            <Text style={styles.grandTotal}>Total:</Text>
            <Text style={styles.grandTotal}>${safeInvoice.total.toFixed(2)}</Text>
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