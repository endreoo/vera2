# Email Management Setup

This document explains how the email management system works in the Veraclub Zanzibar Invoice application.

## Overview

The application uses a centralized email management system that allows users to:
- Configure email recipients for automatic invoice delivery
- Send invoices to multiple recipients
- Manage email addresses through a user-friendly interface

## API Endpoints

The application uses the following API endpoints for email management:

### Base URL
```
https://veraclub.hotelonline.co:3000
```

### Email Management Endpoints

1. **GET** `/veraclub/emails` - Get all configured email addresses
2. **POST** `/veraclub/emails` - Add a single email address
3. **POST** `/veraclub/emails/bulk` - Add multiple email addresses at once
4. **PUT** `/veraclub/emails` - Update an existing email address
5. **DELETE** `/veraclub/emails/{email}` - Delete a specific email address
6. **POST** `/email/send` - Send an email with attachments

## Features

### Settings Component
- **Location**: `src/client/components/Settings.jsx`
- **Purpose**: Manage email recipients for automatic invoice delivery
- **Features**:
  - View all current email recipients
  - Add/remove email addresses
  - Bulk operations for multiple emails
  - Clear all emails functionality
  - Real-time validation and error handling

### Email Service
- **Location**: `src/client/services/emailService.js`
- **Purpose**: Centralized service for all email-related API calls
- **Features**:
  - All CRUD operations for email management
  - Email validation
  - Error handling and authentication
  - Reusable across all components

### Email Dialog
- **Location**: `src/client/components/EmailDialog.jsx`
- **Purpose**: Send invoices to specific recipients
- **Features**:
  - Select from configured email addresses
  - Add custom email addresses
  - Send invoices with PDF attachments
  - Multiple recipient support

## Usage

### Configuring Email Recipients

1. Click the "Settings" button in the top navigation
2. Enter email addresses (one per line) in the text area
3. Click "Save" to update the configuration
4. The system will validate emails and show any errors

### Sending Invoices

#### Automatic Sending
- When generating a new invoice, it's automatically sent to all configured recipients
- If no recipients are configured, an error message is shown

#### Manual Sending
- Click the "Send Email" button on any invoice
- Select recipients from the dialog
- Add custom email addresses if needed
- Click "Send Emails" to deliver the invoice

### Email Validation

The system includes built-in email validation:
- Basic format validation (contains @ and domain)
- Duplicate prevention
- Invalid email filtering in bulk operations

## Error Handling

The system provides comprehensive error handling:
- Authentication errors (session expired)
- Network connectivity issues
- Invalid email formats
- API errors with descriptive messages

## Security

- All endpoints require Bearer token authentication
- Email addresses are validated before storage
- Session management with automatic token refresh

## Current Configuration

The system is configured to use:
- **Base URL**: `https://veraclub.hotelonline.co:3000`
- **Authentication**: JWT Bearer tokens
- **File Storage**: `/src/data/veraclub_emails.txt`

## Troubleshooting

### Common Issues

1. **"Session expired" errors**
   - Log out and log back in
   - Check if your token is valid

2. **"No email recipients configured"**
   - Go to Settings and add at least one email address
   - Ensure the email format is valid

3. **"Failed to send email"**
   - Check your internet connection
   - Verify the API server is running
   - Check browser console for detailed error messages

### Debug Information

The application logs detailed information to the browser console:
- API request/response details
- Email validation results
- Error messages and stack traces

## API Response Examples

### Get All Emails
```json
[
  "veraclubznzadmin@zanlink.com",
  "Veraclubznz@zitec.org",
  "direzione.zanzibar@zanlink.com"
]
```

### Bulk Add Emails
```json
{
  "validEmails": ["email1@example.com", "email2@example.com"],
  "invalidEmails": [
    {
      "email": "invalid-email",
      "error": "Invalid email format"
    }
  ]
}
```

### Send Email
```json
{
  "message": "Email sent successfully"
}
```

## Development

### Adding New Email Features

1. Use the `EmailService` class for all email operations
2. Follow the existing error handling patterns
3. Test with both valid and invalid email addresses
4. Ensure proper authentication is included

### Testing

The email functionality can be tested by:
1. Adding test email addresses in Settings
2. Generating test invoices
3. Verifying email delivery
4. Testing error scenarios (invalid emails, network issues)

## Support

For issues with the email system:
1. Check the browser console for error messages
2. Verify API server connectivity
3. Test with a simple email address first
4. Contact the development team with specific error details 