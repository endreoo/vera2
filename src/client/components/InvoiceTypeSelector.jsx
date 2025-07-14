import React from 'react';

function InvoiceTypeSelector({ invoiceType, onTypeChange }) {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Invoice Display Type</h3>
      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="invoiceType"
            value="pdf"
            checked={invoiceType === 'pdf'}
            onChange={(e) => onTypeChange(e.target.value)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700">
            <span className="font-medium">PDF Invoice</span>
            <span className="text-gray-500 block">Professional PDF format, printable, email-ready</span>
          </span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="invoiceType"
            value="html"
            checked={invoiceType === 'html'}
            onChange={(e) => onTypeChange(e.target.value)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700">
            <span className="font-medium">HTML Preview</span>
            <span className="text-gray-500 block">Web-based display with PDF download option</span>
          </span>
        </label>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        💡 Both options support PDF download and email functionality
      </p>
    </div>
  );
}

export default InvoiceTypeSelector; 