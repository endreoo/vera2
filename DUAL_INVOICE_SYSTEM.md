# Dual Invoice System

This document explains the new dual invoice system that allows users to choose between PDF and HTML invoice displays.

## Overview

The application now supports two different invoice display types, **both with PDF download capability**:

1. **PDF Invoice** - Professional PDF format, printable, email-ready
2. **HTML Preview** - Web-based display with PDF download option

## Features

### Invoice Type Selector
- **Location**: Top of the invoice generation form
- **Function**: Radio button selection between PDF and HTML
- **Default**: PDF (recommended for production use)
- **Note**: Both options support PDF download and email functionality

### PDF Invoice (New System)
- **Template**: `src/client/templates/InvoiceTemplate.tsx`
- **Technology**: @react-pdf/renderer
- **Features**:
  - Professional A4 page layout
  - Print-ready format
  - Email attachment support
  - Download functionality
  - Real booking data integration
  - Automatic email sending

### HTML Invoice (Old System Style)
- **Template**: `src/client/components/HtmlInvoiceTemplate.jsx`
- **Technology**: React + Tailwind CSS + @react-pdf/renderer
- **Features**:
  - Modern web-based display
  - Responsive design
  - Interactive elements
  - Real-time preview
  - **PDF download button included**
  - Same data source as PDF
  - Quick preview with PDF generation option

## Usage

### Selecting Invoice Type
1. Look for the "Invoice Display Type" section at the top of the form
2. Choose between:
   - **PDF Invoice**: Professional PDF format, printable, email-ready
   - **HTML Preview**: Web-based display with PDF download option
3. The selection affects how invoices are displayed when generated
4. **Both options support PDF download and email functionality**

### Generating Invoices
1. Select your preferred invoice type
2. Choose hotel and enter reservation number
3. Click "Generate Invoice"
4. View the invoice in your selected format

### Invoice Actions
Each generated invoice has action buttons:
- **PDF**: Download as PDF file (works for both types)
- **Email**: Send via email dialog (works for both types)
- **Preview**: View in selected format

### PDF Download Options

#### PDF Invoice Type
- PDF download button in the PDF viewer
- Direct PDF generation and download
- Professional PDF layout

#### HTML Invoice Type
- PDF download button in the HTML template header
- Converts HTML view to PDF for download
- Same professional PDF output as PDF type

## Technical Details

### Data Flow
```
Real Booking Data (eZee API)
    ↓
Invoice Object Creation
    ↓
Format Selection (PDF/HTML)
    ↓
Display/Download/Email
    ↓
PDF Generation (Both Types)
```

### Component Structure
```
Dashboard.jsx
├── InvoiceTypeSelector.jsx (Type selection)
├── InvoicePreview.jsx (PDF display + download)
├── HtmlInvoiceTemplate.jsx (HTML display + PDF download)
├── EmailDialog.jsx (Email functionality)
└── Settings.jsx (Email management)
```

### State Management
- `invoiceType`: 'pdf' | 'html' (stored in component state)
- Invoice data: Real booking data from eZee API
- Display logic: Conditional rendering based on type
- PDF generation: Available for both types

## Benefits

### PDF Invoice
- ✅ Professional appearance
- ✅ Print-ready
- ✅ Email attachment support
- ✅ Consistent formatting
- ✅ Industry standard
- ✅ Direct PDF download

### HTML Invoice
- ✅ Quick preview
- ✅ Interactive elements
- ✅ Responsive design
- ✅ Web-friendly
- ✅ **PDF download capability**
- ✅ Same professional PDF output

## Configuration

### Default Settings
- **Default Type**: PDF (recommended)
- **Email Integration**: Works with both types
- **Data Source**: Same real booking data for both
- **PDF Download**: Available for both types

### Customization
- PDF template: Modify `src/client/templates/InvoiceTemplate.tsx`
- HTML template: Modify `src/client/components/HtmlInvoiceTemplate.jsx`
- Type selector: Modify `src/client/components/InvoiceTypeSelector.jsx`

## Migration from Old System

### What's Preserved
- HTML invoice styling and layout
- User experience and workflow
- All existing functionality

### What's Enhanced
- Real booking data integration
- PDF generation capability for both types
- Email system integration
- Better error handling
- Improved UI/UX

### What's New
- Dual format support
- Type selection interface
- Enhanced action buttons
- Better invoice management
- **PDF download for both types**

## Best Practices

### For Production Use
- Use **PDF Invoice** as default for direct PDF workflow
- Use **HTML Preview** for quick checks with PDF download option
- Configure email recipients in Settings
- Use PDF for email attachments (both types generate same PDF)

### For Development
- Use **HTML Preview** for faster iteration
- Test both formats regularly
- Ensure data consistency between formats
- Verify PDF download works for both types

## Troubleshooting

### PDF Issues
- Check @react-pdf/renderer installation
- Verify PDF generation permissions
- Test with different browsers
- Ensure PDF download works for both invoice types

### HTML Issues
- Check Tailwind CSS classes
- Verify responsive design
- Test with different screen sizes
- Verify PDF download button functionality

### General Issues
- Ensure real booking data is available
- Check email configuration
- Verify authentication status
- Test PDF download for both invoice types

## Future Enhancements

### Potential Improvements
- Save user's preferred invoice type
- Add more invoice templates
- Support for different languages
- Enhanced customization options
- Batch invoice generation
- PDF preview before download

### Integration Possibilities
- Digital signature support
- Payment integration
- Cloud storage integration
- Advanced reporting features
- PDF watermarking options 