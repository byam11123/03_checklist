# Troubleshooting Guide for Google Apps Script Integration

## Common Issues and Solutions

### Issue 1: Data not appearing in Google Sheets

**Possible Causes & Solutions:**
1. **Spreadsheet ID not configured**:
   - Make sure you've replaced `'YOUR_SPREADSHEET_ID_HERE'` in the Google Apps Script with your actual Google Sheet ID
   - The Sheet ID is in the URL of your Google Sheet: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`

2. **Wrong deployment settings**:
   - When deploying your Apps Script, make sure under "Execute as" you select "Me"
   - For "Who has access", select "Anyone" (or "Anyone with Google account" for more security)

3. **Sharing settings on the spreadsheet**:
   - Ensure the spreadsheet is shared with the Apps Script
   - The spreadsheet should be accessible to the account running the script

### Issue 2: CORS errors

**Solutions:**
1. The updated script now includes proper CORS headers in both `doPost` and `doOptions` functions
2. If you're still having issues, ensure your deployment is properly configured

### Issue 3: No response from the script

**Solutions:**
1. Check the Google Apps Script execution logs:
   - Go to [Google Apps Script Executions](https://script.google.com/home/executions)
   - Look for recent executions and check for errors

2. Use the test endpoint:
   - Visit your deployed script URL in a browser to see the test page

### Issue 4: Network or fetch errors

**Solutions:**
1. Check your browser's developer console (F12) for network errors
2. Verify that your `VITE_APPSCRIPT_URL` in `.env.local` is correct
3. Ensure the URL doesn't end with a slash

## Testing the Integration

### Step 1: Test the Script Directly
1. In Google Apps Script editor, run the `testFunction()` to verify basic functionality
2. Check the logs to ensure the function runs without errors

### Step 2: Manual Test with cURL (if available)
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"user":"Test User","role":"Officeboy","checklistType":"opening","task":"Test Task","status":"Completed","timestamp":"2023-01-01T00:00:00.000Z","remarks":"Test","supervisor":"","supervisorRemarks":""}' \
  YOUR_DEPLOYED_URL
```

### Step 3: Check the Execution Logs
After submitting data from your app:
1. Go to [Google Apps Script Executions](https://script.google.com/home/executions)
2. Look for your script execution
3. Check if there are any error messages

## Debugging Commands for Browser Console

You can use these commands in your browser's console to test connectivity:

```javascript
// Check if environment variable is set
console.log('App Script URL:', import.meta.env.VITE_APPSCRIPT_URL);

// Test basic connectivity
fetch(import.meta.env.VITE_APPSCRIPT_URL, {
  method: 'OPTIONS', // CORS preflight
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => console.log('OPTIONS response:', response))
.catch(error => console.error('OPTIONS error:', error));

// Send a test payload
const testPayload = {
  user: 'Test User',
  role: 'Officeboy',
  checklistType: 'opening',
  task: 'Test Task',
  status: 'Completed',
  timestamp: new Date().toISOString(),
  remarks: 'Test remarks',
  supervisor: '',
  supervisorRemarks: ''
};

fetch(import.meta.env.VITE_APPSCRIPT_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload)
})
.then(async response => {
  console.log('POST response status:', response.status);
  return response.text();
})
.then(data => console.log('POST response data:', data))
.catch(error => console.error('POST error:', error));
```

## Ensuring Successful Data Submission

1. **Verify Spreadsheet Access**:
   - Make sure the Google Sheet exists and is accessible
   - Check that your Google account has write permissions

2. **Check for Duplicate Deployments**:
   - Ensure you're using the most recent deployment URL
   - Delete old deployments if no longer needed

3. **Monitor Quotas**:
   - Google Apps Script has daily quotas
   - Check if you've exceeded your daily execution time limit

4. **Verify Script Authorization**:
   - When first running the script, Google may ask for authorization
   - Make sure to approve all requested permissions