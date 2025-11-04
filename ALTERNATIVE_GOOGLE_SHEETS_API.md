// Alternative approach: Direct Google Sheets API integration
// This is provided as an alternative to Google Apps Script if that continues to have issues

// 1. First, you'll need to enable the Google Sheets API in your Google Cloud Console
// 2. You'll need to create credentials (OAuth2 or API key)
// 3. Then you can use this approach:

const GOOGLE_SHEET_ID = '1Qr8c2_xdGeVVfVzXeZiJ5sXdO-IHBRjiZXgYT0a1MMU';
const API_KEY = 'YOUR_GOOGLE_API_KEY'; // Replace with your API key

// Function to append data to Google Sheet using Google Sheets API
async function appendToGoogleSheet(data) {
  try {
    // Format data as a row to append
    const values = [
      [
        data.user || '',
        data.role || '',
        data.checklistType || '',
        data.task || '',
        data.status || '',
        data.timestamp || '',
        data.remarks || '',
        data.supervisor || '',
        data.supervisorTimestamp || '',
        data.supervisorRemarks || ''
      ]
    ];

    const requestBody = {
      values: values
    };

    // Use fetch to call the Google Sheets API
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/A:J:append?valueInputOption=USER_ENTERED&key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log('Data appended successfully:', result);
      return result;
    } else {
      const error = await response.json();
      console.error('Error appending data:', error);
      throw new Error(`Google Sheets API error: ${JSON.stringify(error)}`);
    }
  } catch (error) {
    console.error('Error in appendToGoogleSheet:', error);
    throw error;
  }
}

// Example usage in your handleSubmit function
async function handleSubmitAlternative() {
  // ... your existing code to get tasks, user, type ...
  
  for (const task of tasks) {
    const payload = {
      user: user.name,
      role: user.role,
      checklistType: type,
      task: task.task,
      status: task.isCompleted ? 'Completed' : 'Pending',
      timestamp: new Date().toISOString(),
      remarks: task.remarks,
      supervisor: user.role === 'Supervisor' ? user.name : '',
      supervisorTimestamp: user.role === 'Supervisor' ? new Date().toISOString() : '',
      supervisorRemarks: task.supervisorRemarks
    };

    try {
      await appendToGoogleSheet(payload);
      console.log('Successfully added task to sheet:', task.task);
    } catch (error) {
      console.error('Error adding task to sheet:', task.task, error);
      alert(`Error submitting task "${task.task}": ${error.message}`);
    }
  }

  setIsSubmitted(true);
  alert('Checklist has been submitted successfully!');
  navigate('/dashboard');
}

// Note: This approach requires a Google Cloud Project with the Sheets API enabled
// and proper authentication set up, which may be more complex than the Apps Script approach