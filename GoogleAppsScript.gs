function doPost(e) {
  try {
    // Handle both JSON and form data (Google Apps Script often processes data as string)
    var jsonString;
    if (e.postData && e.postData.contents) {
      jsonString = e.postData.contents;
    } else if (e.parameter && Object.keys(e.parameter).length > 0) {
      // If data comes as parameters, convert to JSON string
      var params = {};
      for (var key in e.parameter) {
        params[key] = e.parameter[key];
      }
      jsonString = JSON.stringify(params);
    } else {
      // If no data found, return error
      return ContentService
        .createTextOutput(JSON.stringify({result: 'error', message: 'No data received'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Parse the incoming JSON data
    var data = JSON.parse(jsonString);
    
    // Log the incoming data for debugging
    console.log('Incoming data:', JSON.stringify(data, null, 2));
    
    // Use your actual spreadsheet ID
    var ssId = '1Qr8c2_xdGeVVfVzXeZiJ5sXdO-IHBRjiZXgYT0a1MMU';
    var sheet = SpreadsheetApp.openById(ssId).getActiveSheet();
    
    // Ensure all required fields have defaults to prevent errors
    data.user = data.user || '';
    data.role = data.role || '';
    data.checklistType = data.checklistType || '';
    data.task = data.task || '';
    data.status = data.status || '';
    data.timestamp = data.timestamp || new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(',', '');
    data.remarks = data.remarks || '';
    data.supervisor = data.supervisor || '';
    data.supervisorTimestamp = data.supervisorTimestamp || '';
    data.supervisorRemarks = data.supervisorRemarks || '';
    data.completedTasks = data.completedTasks || 0;
    data.totalTasks = data.totalTasks || 0;
    data.completionPercentage = data.completionPercentage || 0;
    data.loginTime = data.loginTime || new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(',', '');
    
    // Check if headers exist, if not create them
    var headers = sheet.getRange(1, 1, 1, 18).getValues()[0];
    if (headers[0] !== 'DateSubmitted') {
      sheet.getRange(1, 1, 1, 18).setValues([[
        'DateSubmitted',
        'At',
        'UserType',
        'Task Name',
        'Status',
        'Remark',
        'Timestamp',
        'Completed Tasks',
        'Total Tasks',
        'Completion %',
        'Login Time',
        'Supervisor Review',
        'Supervisor Name',
        'Supervisor Verified',
        'Supervisor Remark',
        'Verified At',
        'Checklist Type',
        'Supervisor Timestamp'
      ]]);
    }
    
    // Find the next empty row
    var lastRow = sheet.getLastRow();
    
    // For simplicity, we'll add individual task records with defaults for aggregated fields
    // In a complete implementation, you would track completed/total tasks for the entire checklist
    sheet.getRange(lastRow + 1, 1, 1, 18).setValues([[
      new Date().toLocaleDateString() || '',  // DateSubmitted
      new Date().toLocaleTimeString() || '',  // At
      data.role || '',                        // UserType
      data.task || '',                        // Task Name
      data.status || '',                      // Status
      data.remarks || '',                     // Remark
      data.timestamp || '',                   // Timestamp (formatted as DD/MM/YYYY HH:MM:SS)
      '',                                     // Completed Tasks (calculated elsewhere)
      '',                                     // Total Tasks (calculated elsewhere)
      '',                                     // Completion % (calculated elsewhere)
      data.loginTime || '',                   // Login Time (formatted)
      data.supervisorRemarks || '',           // Supervisor Review
      data.supervisor || '',                  // Supervisor Name
      '',                                     // Supervisor Verified (would be set if supervisor approves)
      data.supervisorRemarks || '',           // Supervisor Remark
      data.supervisorTimestamp || '',         // Verified At
      data.checklistType || '',               // Checklist Type
      data.supervisorTimestamp || ''          // Supervisor Timestamp
    ]]);
    
    // Check if an entry for this user, checklist type, and date already exists
    // to prevent multiple submissions in the same day
    var today = new Date().toLocaleDateString();
    var existingEntry = false;
    
    if (lastRow > 1) { // If there's more than just the header row
      // Optimize by getting only the specific columns we need to check
      var dateRange = sheet.getRange(2, 1, lastRow - 1, 1);    // DateSubmitted column (A)
      var userRange = sheet.getRange(2, 3, lastRow - 1, 1);    // UserType column (C) 
      var typeRange = sheet.getRange(2, 17, lastRow - 1, 1);   // ChecklistType column (Q)
      
      var dateValues = dateRange.getValues();
      var userValues = userRange.getValues();
      var typeValues = typeRange.getValues();
      
      // Check each row to see if this user already submitted for this checklist type today
      for (var i = 0; i < dateValues.length; i++) {
        if (dateValues[i][0] === today && 
            userValues[i][0] === data.user && 
            typeValues[i][0] === data.checklistType) {
          existingEntry = true;
          console.log('Duplicate submission detected for user:', data.user, 'on date:', today, 'for checklist:', data.checklistType);
          break;
        }
      }
    }
    
    // If a submission already exists for today, return an error
    if (existingEntry) {
      console.log('Blocking duplicate submission for', data.user, 'on', today);
      
      var output = ContentService
        .createTextOutput(JSON.stringify({result: 'error', message: 'Submission already exists for today'}))
        .setMimeType(ContentService.MimeType.JSON);
      
      output.setHeaders({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      
      return output;
    }
    
    // Log the batch data for tracking
    console.log('Processing checklist submission:', data.checklistType, 'for user:', data.user, 'with', data.tasks.length, 'tasks');
    
    // Process each task in the batch submission
    for (var i = 0; i < data.tasks.length; i++) {
      var task = data.tasks[i];
      
      // Find the next empty row
      lastRow = sheet.getLastRow();
      console.log('Writing to row:', lastRow + 1);
      
      // Add individual task record
      var newRow = [
        today,                                // DateSubmitted
        new Date().toLocaleTimeString() || '',  // At
        data.user || '',                      // UserType
        task.taskName || '',                  // Task Name
        task.status || '',                    // Status
        task.remarks || '',                   // Remark
        data.timestamp || '',                 // Timestamp (formatted as DD/MM/YYYY HH:MM:SS)
        data.completedTasks || '',            // Completed Tasks 
        data.totalTasks || '',                // Total Tasks
        data.completionPercentage || '',      // Completion %
        data.loginTime || '',                 // Login Time (formatted)
        task.supervisorRemarks || '',         // Supervisor Review
        data.supervisor || '',                // Supervisor Name
        '',                                   // Supervisor Verified (would be set if supervisor approves)
        task.supervisorRemarks || '',         // Supervisor Remark
        data.supervisorTimestamp || '',       // Verified At
        data.checklistType || '',             // Checklist Type
        data.supervisorTimestamp || ''        // Supervisor Timestamp
      ];
      
      sheet.getRange(lastRow + 1, 1, 1, 18).setValues([newRow]);
      
      // Log successful entry
      console.log('Successfully added task to sheet:', task.taskName);
    }
    
    // Create response with CORS headers
    var output = ContentService
      .createTextOutput(JSON.stringify({result: 'success', message: 'Data recorded successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
    
    // Set CORS headers
    output.setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    
    return output;
  } catch (error) {
    // Log the error for debugging
    console.error('Error in doPost: ', error);
    console.error('Stack trace: ', error.stack);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({result: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to handle GET requests (for testing)
function doGet(e) {
  var htmlOutput = HtmlService.createHtmlOutput(
    '<h1>Checklist Data Logger</h1>' +
    '<p>Use POST requests to send checklist data.</p>' +
    '<p>Make sure to set your spreadsheet ID in the script.</p>' +
    '<p>For debugging, check the <a href="https://script.google.com/home/executions" target="_blank">execution logs</a>.</p>'
  );
  
  // Set CORS headers
  htmlOutput.addMetaTag('Access-Control-Allow-Origin', '*');
  return htmlOutput;
}

// Function to handle OPTIONS requests (for CORS preflight)
function doOptions(e) {
  // This function handles preflight requests
  return ContentService.createTextOutput(
    JSON.stringify({status: 'success', message: 'CORS preflight successful'})
  ).setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    });
}

// Function to create a new spreadsheet if needed (run once to initialize)
function createSpreadsheet() {
  try {
    var ss = SpreadsheetApp.create('Checklist Data - ' + new Date().toISOString().split('T')[0]);
    var sheet = ss.getActiveSheet();
    sheet.getRange(1, 1, 1, 10).setValues([[
      'User', 
      'Role', 
      'Checklist Type', 
      'Task', 
      'Status', 
      'Timestamp', 
      'Remarks', 
      'Supervisor', 
      'Supervisor Timestamp', 
      'Supervisor Remarks'
    ]]);
    
    console.log('Spreadsheet created with ID: ' + ss.getId());
    Logger.log('Spreadsheet created with ID: ' + ss.getId());
    
    // Return the ID for reference
    return ss.getId();
  } catch (error) {
    console.error('Error creating spreadsheet: ', error);
    console.error('Stack trace: ', error.stack);
    return null;
  }
}

// Test function to verify the script works
function testFunction() {
  var testRecord = {
    user: 'Test User',
    role: 'Officeboy',
    checklistType: 'opening',
    task: 'Test Task',
    status: 'Completed',
    timestamp: new Date().toISOString(),
    remarks: 'Test remarks',
    supervisor: '',
    supervisorTimestamp: '',
    supervisorRemarks: ''
  };
  
  // Log the test data
  console.log('Test data: ', testRecord);
  Logger.log('Test data: ', testRecord);
  
  return testRecord;
}