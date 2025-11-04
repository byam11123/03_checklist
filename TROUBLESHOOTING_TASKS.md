# Troubleshooting: Only 5 Tasks Showing in Sheet

## Issue Description
When submitting checklists, only 5 tasks are appearing in the Google Sheet instead of all 10 tasks for each checklist.

## Root Cause Analysis
This issue can occur due to several factors:

1. **Browser Request Limitations**: Browsers may limit the number of simultaneous requests
2. **Google Apps Script Execution Timeouts**: Multiple rapid requests might cause some to fail
3. **Network Issues**: Some requests might fail silently in 'no-cors' mode
4. **Google Sheets API Limitations**: Concurrent writes to the same sheet might cause issues

## Solution Implemented
I've updated the frontend to use a sequential approach instead of parallel requests, which should help ensure all tasks are submitted properly.

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser developer tools (F12)
2. Go to the "Console" tab
3. Complete and submit a checklist
4. Look for logs showing "Payload for task:" for all tasks
5. Verify you see 10 logs for opening checklist or 10 for closing checklist

### Step 2: Check Google Apps Script Execution Logs
1. Go to: https://script.google.com/home/executions
2. Look for recent executions of your doPost function
3. Click on an execution to see logs
4. Look for logs showing "Processing task:" for each task
5. Verify you see logs for all 10 tasks

### Step 3: Check Your Google Sheet
1. Go to your Google Sheet: https://docs.google.com/spreadsheets/d/1Qr8c2_xdGeVVfVzXeZiJ5sXdO-IHBRjiZXgYT0a1MMU/edit
2. Verify if all tasks are being recorded

### Step 4: Test with Manual Script Execution
1. In your Google Apps Script editor, add a test function:

```
function testMultipleEntries() {
  // Simulate 10 different tasks
  var tasks = [
    'Light On', 'Camera On', 'Internet On', 'System On', 'Printers On',
    'Floor cleaned (YES/NO)', 'Water Bottles (Filled/Not)', 'Water RO - On', 
    'Workstation Cleaned', 'Bathroom checked (1. water taps 2. handwash 3. freshner)'
  ];
  
  for (var i = 0; i < tasks.length; i++) {
    var data = {
      user: 'Test User',
      role: 'Officeboy',
      checklistType: 'opening',
      task: tasks[i],
      status: 'Completed',
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(',', ''),
      remarks: 'Test remark',
      supervisor: '',
      supervisorTimestamp: '',
      supervisorRemarks: '',
      completedTasks: 10,
      totalTasks: 10,
      completionPercentage: 100,
      loginTime: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(',', '')
    };
    
    console.log('Testing task:', data.task);
    // You could call your doPost function directly with this data for testing
  }
}
```

## Additional Verification
1. The frontend now uses sequential requests instead of parallel to avoid potential issues
2. Both frontend and backend have enhanced logging
3. The application should now submit all 10 tasks for each checklist type

## Expected Behavior
When you submit a completed checklist, you should see:
- 10 separate entries in your Google Sheet (one for each task)
- 10 corresponding logs in the Google Apps Script execution logs
- 10 "Request sent for task:" messages in your browser console