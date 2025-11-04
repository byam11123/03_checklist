# Google Apps Script Setup for Checklist Application

## Overview
This guide explains how to set up the Google Apps Script backend for your checklist application to store data in Google Sheets.

## Setup Instructions

### Step 1: Access Google Apps Script
1. Go to [Google Apps Script](https://script.google.com/)
2. Click on "New Project"
3. Replace the default code with the content from `GoogleAppsScript.gs`

### Step 2: Create the Spreadsheet
1. In the script editor, run the `createSpreadsheet` function once (click the function name in the dropdown and press the play button)
2. Note down the Spreadsheet ID that appears in the logs (you'll see it in the "Executions" tab)
3. Replace `'YOUR_SPREADSHEET_ID_HERE'` in the script with your actual Spreadsheet ID

### Step 3: Test the Script
1. Save your script (Ctrl+S)
2. Click "Deploy" > "New Deployment"
3. Select "Web app" as the type
4. Set configurations:
   - Execute as: "Me"
   - Who has access: "Anyone" (or "Anyone with Google" for more security)
5. Click "Deploy"
6. Copy the provided Web App URL

### Step 4: Update Your Application
1. In your `.env.local` file, update the `VITE_APPSCRIPT_URL` with the deployment URL:
   ```
   VITE_APPSCRIPT_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
   ```
2. Redeploy your application

## Debugging Tips

### Common Issues:
1. **No CORS allowed**: Google Apps Script handles CORS differently. The script uses `no-cors` mode in the fetch call.
2. **Access Denied**: Make sure the script deployment is set to "Anyone" or "Anyone with Google account"
3. **Spreadsheet Access**: Ensure the spreadsheet sharing settings allow the Apps Script to write to it

### Enable Google Apps Script Logging:
1. In the Google Apps Script editor, go to View > Logs
2. Check the logs after running your checklist app to see if there are errors

### Testing the Endpoint:
You can test your endpoint with a simple POST request:
```javascript
fetch('YOUR_DEPLOYED_URL', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user: 'Test User',
    role: 'Officeboy',
    checklistType: 'opening',
    task: 'Light On',
    status: 'Completed',
    timestamp: new Date().toISOString(),
    remarks: 'Test remark',
    supervisor: '',
    supervisorRemarks: ''
  })
})
```

## Security Notes
- For production use, consider limiting access to "Anyone with Google account" instead of "Anyone"
- Consider adding authentication/authorization logic if needed
- Monitor your script's execution to prevent misuse