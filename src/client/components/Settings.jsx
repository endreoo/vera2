import React, { useState, useEffect } from 'react';
import { createEmailService } from '../services/emailService';

function Settings({ isOpen, onClose }) {
  const [emails, setEmails] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadEmails();
    }
  }, [isOpen]);

  const loadEmails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const emailService = createEmailService();
      const emails = await emailService.getAllEmails();
      console.log('Loaded emails:', emails);
      setEmails(emails.join('\n'));
    } catch (error) {
      console.error('Failed to load emails:', error);
      setError(error.message || 'Failed to load email addresses. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const emailList = emails
        .split('\n')
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));
      
      if (emailList.length === 0) {
        setError('Please enter at least one valid email address.');
        return;
      }

      console.log('Saving emails:', emailList);
      
      const emailService = createEmailService();
      
      // First, get current emails to see what needs to be removed
      const currentEmails = await emailService.getAllEmails();
      console.log('Current emails:', currentEmails);
      
      // Remove emails that are no longer in the list
      for (const currentEmail of currentEmails) {
        if (!emailList.includes(currentEmail)) {
          console.log('Deleting email:', currentEmail);
          try {
            await emailService.deleteEmail(currentEmail);
            console.log('Successfully deleted:', currentEmail);
          } catch (deleteError) {
            console.error('Failed to delete email:', currentEmail, deleteError);
            // Continue with other deletions even if one fails
          }
        }
      }
      
      // Add new emails that aren't already in the list
      const emailsToAdd = emailList.filter(email => !currentEmails.includes(email));
      if (emailsToAdd.length > 0) {
        console.log('Adding new emails:', emailsToAdd);
        const result = await emailService.addMultipleEmails(emailsToAdd);
        console.log('Bulk operation result:', result);
        
        if (result.invalidEmails && result.invalidEmails.length > 0) {
          // Show warning about invalid emails but still show success
          const invalidEmails = result.invalidEmails.map(item => item.email).join(', ');
          setSuccess(`Email addresses saved successfully! Invalid emails were skipped: ${invalidEmails}`);
        } else {
          setSuccess('Email addresses saved successfully!');
        }
      } else {
        setSuccess('Email addresses saved successfully!');
      }
      
      // Reload emails to show the current state
      await loadEmails();
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to save:', error);
      setError(error.message || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to remove all email addresses?')) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      const emailService = createEmailService();
      const existingEmails = await emailService.getAllEmails();
      
      console.log('Clearing all emails:', existingEmails);
      
      // Delete all existing emails
      for (const email of existingEmails) {
        console.log('Deleting email:', email);
        try {
          await emailService.deleteEmail(email);
          console.log('Successfully deleted:', email);
        } catch (deleteError) {
          console.error('Failed to delete email:', email, deleteError);
          // Continue with other deletions even if one fails
        }
      }
      
      setEmails('');
      setSuccess('All email addresses have been removed.');
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to clear emails:', error);
      setError(error.message || 'Failed to clear email addresses');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSingle = async (emailToDelete) => {
    if (!confirm(`Are you sure you want to remove "${emailToDelete}"?`)) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      const emailService = createEmailService();
      await emailService.deleteEmail(emailToDelete);
      
      // Remove from the textarea
      const emailList = emails.split('\n').filter(email => email.trim() !== emailToDelete);
      setEmails(emailList.join('\n'));
      
      setSuccess(`Email "${emailToDelete}" has been removed.`);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to delete email:', error);
      setError(error.message || 'Failed to delete email address');
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
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter email addresses (one per line):
          </label>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            disabled={isLoading}
            className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
            placeholder="example@email.com&#10;another@email.com"
          />
          <p className="mt-1 text-sm text-gray-500">
            These emails will receive all generated invoices
          </p>
          {isLoading && (
            <p className="mt-1 text-sm text-blue-600">Loading email addresses...</p>
          )}
        </div>

        {/* Show current emails with delete buttons */}
        {emails.trim() && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current Recipients:</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {emails.split('\n').filter(email => email.trim()).map((email, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm">{email.trim()}</span>
                  <button
                    onClick={() => handleDeleteSingle(email.trim())}
                    disabled={isSaving}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    title="Delete this email"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between gap-3">
          <button
            onClick={handleClearAll}
            disabled={isSaving || isLoading}
            className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
          >
            Clear All
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings; 