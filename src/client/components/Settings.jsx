import React, { useState, useEffect } from 'react';

function Settings({ isOpen, onClose }) {
  const [emails, setEmails] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const apiUrl = 'http://37.27.142.148:5171';

  useEffect(() => {
    if (isOpen) {
      loadEmails();
    }
  }, [isOpen]);

  const loadEmails = async () => {
    try {
      const response = await fetch(`${apiUrl}/settings/emails`, {
        headers: {
          'Accept': 'text/plain'
        }
      });
      if (response.ok) {
        const text = await response.text();
        console.log('Loaded emails:', text);
        setEmails(text || '');
      } else {
        const error = await response.text();
        console.error('Server error:', error);
      }
    } catch (error) {
      console.error('Failed to load emails:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('Saving emails:', emails);
      
      const response = await fetch(`${apiUrl}/settings/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: emails.trim()
      });
      
      const responseText = await response.text();
      console.log('Server response:', response.status, responseText);
      
      if (response.ok) {
        alert('Email recipients saved!');
        onClose();
      } else {
        throw new Error(responseText || 'Failed to save');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert(error.message || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Invoice Recipients</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter email addresses (one per line):
          </label>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="example@email.com"
          />
          <p className="mt-1 text-sm text-gray-500">These emails will receive all generated invoices</p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings; 