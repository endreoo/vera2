import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InvoicePreview from '../components/InvoicePreview';
import { InvoiceTemplate } from '../templates/InvoiceTemplate';
import HtmlInvoiceTemplate from '../components/HtmlInvoiceTemplate';
import InvoiceTypeSelector from '../components/InvoiceTypeSelector';
import Settings from '../components/Settings';
import EmailDialog from '../components/EmailDialog';
import { hotels } from '../data/hotels';
import { pdf } from '@react-pdf/renderer';
import { createEmailService } from '../services/emailService';

// Utility function to round to nearest 0.5 or whole number
const roundToNearestHalf = (value) => {
  return Math.round(value * 2) / 2;
};

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [selectedHotel, setSelectedHotel] = useState(hotels[0].id);
  const [reservationNumber, setReservationNumber] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedEmailInvoice, setSelectedEmailInvoice] = useState(null);
  const [invoiceType, setInvoiceType] = useState('pdf'); // 'pdf' or 'html'

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleGenerateInvoice = async () => {
    setError(null);
    setIsLoading(true);
    
    if (!reservationNumber) {
      setError('Please enter a reservation number');
      setIsLoading(false);
      return;
    }

    const selectedHotelData = hotels.find(h => h.id === selectedHotel);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://veraclub.hotelonline.co:3000';
      
      console.log('Making API call to:', `${apiUrl}/ezee/bookings`);
      console.log('Request payload:', {
        hotelId: selectedHotelData.hotelId,
        authKey: selectedHotelData.authKey,
        bookingId: reservationNumber
      });
      
      const response = await fetch(`${apiUrl}/ezee/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          hotelId: selectedHotelData.hotelId,
          authKey: selectedHotelData.authKey,
          bookingId: reservationNumber
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch booking data: ${response.status} ${response.statusText}`);
      }

      const bookingData = await response.json();
      console.log('Raw booking data:', bookingData);
      
      if (!bookingData?.Reservations?.Reservation || !Array.isArray(bookingData.Reservations.Reservation) || bookingData.Reservations.Reservation.length === 0) {
        throw new Error('No booking data found for this reservation number');
      }

      // Log detailed structure of first booking
      console.log('Detailed first booking:', JSON.stringify(bookingData.Reservations.Reservation[0], null, 2));

      // Process the first booking transaction
      const firstBooking = bookingData.Reservations.Reservation[0];
      
      if (!firstBooking?.BookingTran || !Array.isArray(firstBooking.BookingTran) || firstBooking.BookingTran.length === 0) {
        throw new Error('No booking transaction data found for this reservation');
      }

      // Get the first booking transaction
      const bookingTran = firstBooking.BookingTran[0];
      
      // Get rental info details
      const rentalInfo = bookingTran.RentalInfo;
      const paymentDetails = bookingTran.PaymentDetail;

      // Process all booking transactions
      const lineItems = bookingData.Reservations.Reservation
        .filter(booking => {
          const bookingTran = booking.BookingTran[0];
          // Check if booking is valid (not cancelled and has a rate)
          const ratePerNight = bookingTran.RentalInfo && Array.isArray(bookingTran.RentalInfo) && bookingTran.RentalInfo.length > 0 
            ? parseFloat(bookingTran.RentalInfo[0].RentPreTax) || 0 
            : parseFloat(bookingTran.RentPreTax) || 0;
          
          return ratePerNight > 0 && bookingTran.Status !== 'Cancelled';
        })
        .map(booking => {
          const bookingTran = booking.BookingTran[0];
          const startDate = new Date(bookingTran.Start);
          const endDate = new Date(bookingTran.End);
          const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          
          // Get rate per night from RentalInfo
          const ratePerNight = bookingTran.RentalInfo[0].RentPreTax;
          
          // Calculate subtotal and VAT
          const subtotal = roundToNearestHalf(ratePerNight * nights);
          const vatAmount = roundToNearestHalf(subtotal * 0.15);
          const total = roundToNearestHalf(subtotal * 1.15);
          
          // Get main guest details
          const mainGuest = `${bookingTran.Salutation} ${bookingTran.FirstName} ${bookingTran.LastName}`;
          
          // Get sharer details
          const sharers = bookingTran.Sharer && Array.isArray(bookingTran.Sharer)
            ? bookingTran.Sharer.map(s => `${s.Salutation} ${s.FirstName} ${s.LastName}`)
            : [];
          
          // Combine all guests
          const allGuests = [mainGuest, ...sharers].join(', ');
          
          // Create description with all details
          const description = [
            `${bookingTran.RoomTypeName} (Room ${bookingTran.RoomName})`,
            allGuests,
            `Voucher: ${bookingTran.VoucherNo}`
          ].filter(Boolean).join(', ');
          
          return {
            description: description,
            checkIn: bookingTran.Start,
            checkOut: bookingTran.End,
            nights: nights,
            ratePerNight: roundToNearestHalf(parseFloat(ratePerNight)),
            subtotal: subtotal,
            vat: vatAmount,
            total: total
          };
        });

      if (lineItems.length === 0) {
        throw new Error('No valid bookings found for this reservation number');
      }

      // Calculate grand totals
      const totalSubtotal = roundToNearestHalf(lineItems.reduce((sum, item) => sum + item.subtotal, 0));
      const totalVAT = roundToNearestHalf(lineItems.reduce((sum, item) => sum + item.vat, 0));
      const grandTotal = roundToNearestHalf(lineItems.reduce((sum, item) => sum + item.total, 0));

      // Generate invoice from booking data
      const newInvoice = {
        id: Date.now().toString(),
        invoiceNumber: `INV-${Date.now()}`,
        reservationNumber,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        customerName: firstBooking.BookedBy,
        customerEmail: firstBooking.Email || '',
        property: selectedHotelData.name,
        location: selectedHotelData.location,
        poBox: selectedHotelData.poBox,
        tinnNumber: selectedHotelData.tinnNumber,
        registrationNumber: selectedHotelData.registrationNumber,
        phone: selectedHotelData.phone,
        accountNumber: selectedHotelData.accountNumber,
        swiftCode: selectedHotelData.swiftCode,
        items: lineItems,
        subtotal: totalSubtotal,
        tax: totalVAT,
        total: grandTotal,
        notes: `Package: ${firstBooking.BookingTran[0].PackageName}`
      };

      setInvoices(prev => [newInvoice, ...prev]);
      setReservationNumber('');

      // Automatically send email
      try {
        console.log('Starting automatic email send...');
        const blob = await pdf(
          <InvoiceTemplate 
            hotel={newInvoice.property === 'Sunset Beach' ? 'Sunset Beach' : 'Zanzibar Village'}
            invoiceData={{
              date: new Date(newInvoice.date).toLocaleDateString('en-GB'),
              dueDate: new Date(newInvoice.dueDate).toLocaleDateString('en-GB'),
              invoiceNumber: newInvoice.invoiceNumber,
              reservation: newInvoice.reservationNumber,
              customerName: newInvoice.customerName,
              items: newInvoice.items.map(item => ({
                description: item.description,
                checkIn: new Date(item.checkIn).toLocaleDateString('en-GB'),
                checkOut: new Date(item.checkOut).toLocaleDateString('en-GB'),
                nights: item.nights,
                ratePerNight: item.ratePerNight,
                vat: 15,
                total: item.total
              })),
              subtotal: newInvoice.subtotal,
              vatAmount: newInvoice.tax,
              total: newInvoice.total
            }}
          />
        ).toBlob();
        
        // Get default emails using email service
        const emailService = createEmailService();
        const defaultEmails = await emailService.getAllEmails();
        
        if (defaultEmails.length === 0) {
          throw new Error('No email recipients configured. Please check Settings.');
        }
        
        // Convert blob to base64 using Promise
        const base64data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        // Send to all recipients
        for (const recipient of defaultEmails) {
          console.log('Sending email to:', recipient);
          const emailData = {
            to: recipient,
            subject: `Invoice #${newInvoice.invoiceNumber} from ${newInvoice.property}`,
            text: `Please find attached your Invoice #${newInvoice.invoiceNumber}.`,
            attachments: [{
              filename: `invoice-${newInvoice.invoiceNumber}.pdf`,
              content: base64data,
              encoding: 'base64',
              contentType: 'application/pdf'
            }]
          };

          await emailService.sendEmail(emailData);
        }
        console.log('Emails sent successfully to all recipients');
        alert('Invoice Generated and Sent');
      } catch (emailError) {
        console.error('Error sending automatic email:', emailError);
        alert('Invoice generated but email sending failed: ' + emailError.message);
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'Failed to generate invoice');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Veraclub Zanzibar Invoice</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Settings
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/login');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Settings Modal */}
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Email Dialog */}
      <EmailDialog 
        isOpen={showEmailDialog} 
        onClose={() => {
          setShowEmailDialog(false);
          setSelectedEmailInvoice(null);
        }}
        invoice={selectedEmailInvoice}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Invoice Generator</h1>
            </div>

            {/* Invoice Type Selector */}
            <InvoiceTypeSelector 
              invoiceType={invoiceType} 
              onTypeChange={setInvoiceType} 
            />

            <div className="mb-8">
              <div className="flex gap-4 items-center">
                <select
                  value={selectedHotel}
                  onChange={(e) => setSelectedHotel(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {hotels.map(hotel => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={reservationNumber}
                  onChange={(e) => setReservationNumber(e.target.value)}
                  placeholder="Enter Reservation Number"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleGenerateInvoice}
                  disabled={isLoading}
                  className={`px-4 py-2 ${isLoading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-lg transition-colors flex items-center gap-2`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    'Generate Invoice'
                  )}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-red-600">{error}</p>
              )}
            </div>

            {selectedInvoice ? (
              <div className="relative">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 rounded-full p-2 z-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {/* Display based on selected type */}
                {invoiceType === 'pdf' ? (
                  <InvoicePreview invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
                ) : (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <HtmlInvoiceTemplate invoice={selectedInvoice} />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Invoices</h2>
                    {invoices.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No invoices generated yet</p>
                    ) : (
                      <div className="space-y-3">
                        {invoices.map((invoice) => (
                          <div
                            key={invoice.id}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div 
                                className="flex-grow cursor-pointer"
                                onClick={() => setSelectedInvoice(invoice)}
                              >
                                <h3 className="font-medium text-gray-900">
                                  Invoice #{invoice.invoiceNumber}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {invoice.customerName} - {invoice.property}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Reservation: {invoice.reservationNumber}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  ${invoice.total.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(invoice.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedInvoice(invoice);
                                  // For PDF type, trigger download after a short delay
                                  // For HTML type, the download button is in the template
                                  if (invoiceType === 'pdf') {
                                    setTimeout(() => {
                                      document.getElementById('download-pdf-button')?.click();
                                      setSelectedInvoice(null);
                                    }, 100);
                                  } else {
                                    // For HTML type, just show the preview (download button is in template)
                                    // The download will be handled by the HtmlInvoiceTemplate component
                                  }
                                }}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center gap-1 text-sm"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                PDF
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEmailInvoice(invoice);
                                  setShowEmailDialog(true);
                                }}
                                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1 text-sm"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                Email
                              </button>
                              <button
                                onClick={() => setSelectedInvoice(invoice)}
                                className="px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-1 text-sm"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Preview
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Preview</h2>
                  <div className="text-center py-12 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2">Select an invoice to preview</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 