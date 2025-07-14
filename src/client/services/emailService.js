class EmailService {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async getAllEmails() {
    const response = await fetch(`${this.baseUrl}/veraclub/emails`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to load email addresses');
    }
    
    return await response.json();
  }

  async addEmail(email) {
    const response = await fetch(`${this.baseUrl}/veraclub/emails`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add email address');
    }
    
    return await response.json();
  }

  async addMultipleEmails(emails) {
    const response = await fetch(`${this.baseUrl}/veraclub/emails/bulk`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ emails })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add email addresses');
    }
    
    return await response.json();
  }

  async updateEmail(oldEmail, newEmail) {
    const response = await fetch(`${this.baseUrl}/veraclub/emails`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ oldEmail, newEmail })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update email address');
    }
    
    return await response.json();
  }

  async deleteEmail(email) {
    const encodedEmail = encodeURIComponent(email);
    const url = `${this.baseUrl}/veraclub/emails/${encodedEmail}`;
    
    console.log('Deleting email:', email);
    console.log('Encoded email:', encodedEmail);
    console.log('Delete URL:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    
    console.log('Delete response status:', response.status);
    console.log('Delete response headers:', response.headers);
    
    if (!response.ok) {
      let errorMessage = 'Failed to delete email address';
      
      if (response.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (response.status === 404) {
        errorMessage = 'Email address not found';
      } else {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
      }
      
      console.error('Delete failed:', errorMessage);
      throw new Error(errorMessage);
    }
    
    try {
      const result = await response.json();
      console.log('Delete successful:', result);
      return result;
    } catch (parseError) {
      console.log('Delete successful (no response body)');
      return { message: 'Email deleted successfully' };
    }
  }

  async sendEmail(emailData) {
    const response = await fetch(`${this.baseUrl}/email/send`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(emailData)
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }
    
    return await response.json();
  }

  // Helper method to validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper method to validate multiple emails
  validateEmails(emails) {
    const validEmails = [];
    const invalidEmails = [];
    
    emails.forEach(email => {
      if (this.validateEmail(email.trim())) {
        validEmails.push(email.trim());
      } else {
        invalidEmails.push({
          email: email.trim(),
          error: 'Invalid email format'
        });
      }
    });
    
    return { validEmails, invalidEmails };
  }
}

// Factory function to create email service instance
export const createEmailService = () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://veraclub.hotelonline.co:3000';
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return new EmailService(baseUrl, token);
};

export default EmailService; 