import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { InvoiceTemplate } from '../templates/InvoiceTemplate';

function HtmlInvoiceTemplate({ invoice }) {
  if (!invoice) return null;

  // Transform the invoice data to match the old system's format
  const transformedItems = invoice.items.map(item => ({
    description: item.description,
    quantity: item.nights,
    unitPrice: item.ratePerNight,
    total: item.total
  }));

  const handleDownloadPDF = async () => {
    try {
      console.log('Starting PDF generation from HTML template...');
      
      // Transform data for PDF template
      const pdfInvoiceData = {
        date: new Date(invoice.date).toLocaleDateString('en-GB'),
        dueDate: new Date(invoice.dueDate).toLocaleDateString('en-GB'),
        invoiceNumber: invoice.invoiceNumber,
        reservation: invoice.reservationNumber,
        customerName: invoice.customerName,
        items: invoice.items.map(item => ({
          description: item.description,
          checkIn: new Date(item.checkIn).toLocaleDateString('en-GB'),
          checkOut: new Date(item.checkOut).toLocaleDateString('en-GB'),
          nights: item.nights,
          ratePerNight: item.ratePerNight,
          vat: 15,
          total: item.total
        })),
        subtotal: invoice.subtotal,
        vatAmount: invoice.tax,
        total: invoice.total
      };

      const blob = await pdf(
        <InvoiceTemplate 
          hotel={invoice.property === 'Sunset Beach' ? 'Sunset Beach' : 'Zanzibar Village'} 
          invoiceData={pdfInvoiceData} 
        />
      ).toBlob();
      
      console.log('PDF generated successfully from HTML template');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF from HTML template:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      {/* Header with Download Button */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-lg">VZ</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Veraclub Zanzibar LTD</h1>
          <p className="text-gray-600">{invoice.location || 'Kiwengwa-Zanzibar (Tanzania)'}</p>
          <p className="text-gray-600">Property: {invoice.property}</p>
          <p className="text-gray-600">{invoice.poBox || 'P.O Box 2529'}</p>
          <p className="text-gray-600">TINN: {invoice.tinnNumber || '300-101-496'}</p>
          <p className="text-gray-600">Registration Number: {invoice.registrationNumber || 'Z0000007238'}</p>
          <p className="text-gray-600">{invoice.phone || '0779-414986'}</p>
          <p className="text-gray-600">Account Number: {invoice.accountNumber || '0400392000'}</p>
          <p className="text-gray-600">Swift Code: {invoice.swiftCode || 'PBZATZTZ'}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download PDF
            </button>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h2>
          <p className="text-gray-600">Invoice #: {invoice.invoiceNumber}</p>
          <p className="text-gray-600">Reservation #: {invoice.reservationNumber}</p>
          <p className="text-gray-600">Date: {new Date(invoice.date).toLocaleDateString('en-GB')}</p>
          <p className="text-gray-600">Due Date: {new Date(invoice.dueDate).toLocaleDateString('en-GB')}</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h3>
        <p className="text-gray-800 font-medium">{invoice.customerName}</p>
        {invoice.customerEmail && (
          <p className="text-gray-600">{invoice.customerEmail}</p>
        )}
      </div>

      {/* Items */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4">Description</th>
            <th className="text-right py-3 px-4">Nights</th>
            <th className="text-right py-3 px-4">Rate/Night</th>
            <th className="text-right py-3 px-4">VAT</th>
            <th className="text-right py-3 px-4">Total</th>
          </tr>
        </thead>
        <tbody>
          {transformedItems.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-3 px-4">
                <div className="text-sm text-gray-900">{item.description}</div>
              </td>
              <td className="text-right py-3 px-4 text-gray-600">{item.quantity}</td>
              <td className="text-right py-3 px-4 text-gray-600">
                ${item.unitPrice.toFixed(2)}
              </td>
              <td className="text-right py-3 px-4 text-gray-600">15%</td>
              <td className="text-right py-3 px-4 font-medium text-gray-900">
                ${item.total.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">VAT (15%):</span>
            <span className="text-gray-900">${invoice.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
            <span>Total:</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Notes:</h4>
          <p className="text-gray-600">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Thank you for choosing Veraclub Zanzibar!</p>
        <p className="mt-1">For any questions, please contact us at {invoice.phone || '0779-414986'}</p>
      </div>
    </div>
  );
}

export default HtmlInvoiceTemplate; 