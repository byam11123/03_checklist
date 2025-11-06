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
    
    // Check if headers exist, if not create them
    var headers = sheet.getRange(1, 1, 1, 14).getValues()[0];
    if (headers[0] !== 'Date') {
      sheet.getRange(1, 1, 1, 14).setValues([[
        'Date',
        'Submitted At',
        'Login Time',
        'Name',
        'Role',
        'Checklist Type',
        'Tasks',
        'Completed Tasks',
        'Total Tasks',
        'Completion %',
        'Supervisor Name',
        'Supervisor Verified',
        'Supervisor Review',
        'Verified At'
      ]]);
      
      // Format the header row with colors and styling
      var headerRange = sheet.getRange(1, 1, 1, 14);
      headerRange.setBackground('#4F81BD'); // Blue background
      headerRange.setFontColor('#FFFFFF');   // White text
      headerRange.setFontWeight('bold');     // Bold text
      headerRange.setVerticalAlignment('middle');
      headerRange.setHorizontalAlignment('center');
      
      // Set specific column widths for better readability
      sheet.setColumnWidth(1, 120);  // Date
      sheet.setColumnWidth(2, 120);  // Submitted At
      sheet.setColumnWidth(3, 120);  // Login Time
      sheet.setColumnWidth(4, 120);  // Name
      sheet.setColumnWidth(5, 100);  // Role
      sheet.setColumnWidth(6, 120);  // Checklist Type
      sheet.setColumnWidth(7, 300);  // Tasks
      sheet.setColumnWidth(8, 100);  // Completed Tasks
      sheet.setColumnWidth(9, 100);  // Total Tasks
      sheet.setColumnWidth(10, 100); // Completion %
      sheet.setColumnWidth(11, 120); // Supervisor Name
      sheet.setColumnWidth(12, 120); // Supervisor Verified
      sheet.setColumnWidth(13, 150); // Supervisor Review
      sheet.setColumnWidth(14, 120); // Verified At
    }
    
    // Calculate completion statistics
    var completedTasks = data.tasks ? data.tasks.filter(task => task.status === 'Completed').length : 0;
    var totalTasks = data.tasks ? data.tasks.length : 0;
    var completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Consolidate all tasks into a single string or JSON format
    var tasksJson = JSON.stringify(data.tasks);
    
    if (data.role === 'Supervisor' && data.checklistId) {
  // Supervisor is updating an existing checklist - update supervisor columns AND tasks
  var updateRow = parseInt(data.checklistId);
  
  // Verify that we're not updating the header row
  if (updateRow < 2) {
    console.log('Error: Attempting to update header row. checklistId:', data.checklistId, 'updateRow:', updateRow);
    var output = ContentService
      .createTextOutput(JSON.stringify({result: 'error', message: 'Invalid checklist ID for update'}))
      .setMimeType(ContentService.MimeType.JSON);
    return output;
  }
  
  // Get current tasks from sheet
  var currentTasksJson = sheet.getRange(updateRow, 7).getValue(); // Column G (Tasks)
  var currentTasks = [];
  
  try {
    if (currentTasksJson) {
      currentTasks = JSON.parse(currentTasksJson);
    }
  } catch (e) {
    console.error('Error parsing existing tasks:', e);
  }
  
  // Update tasks with supervisor remarks from incoming data
  if (data.tasks && data.tasks.length > 0) {
    // Merge supervisor remarks into existing tasks
    for (var i = 0; i < currentTasks.length; i++) {
      if (data.tasks[i] && data.tasks[i].supervisorRemarks) {
        currentTasks[i].supervisorRemarks = data.tasks[i].supervisorRemarks;
      }
    }
  }
  
  // Convert updated tasks back to JSON
  var updatedTasksJson = JSON.stringify(currentTasks);
  
  // Update Tasks column (G) with supervisor remarks included
  sheet.getRange(updateRow, 7).setValue(updatedTasksJson);
  
  // Update supervisor-related columns (K, L, M, N)
  sheet.getRange(updateRow, 11, 1, 4).setValues([[
    data.supervisor || sheet.getRange(updateRow, 11).getValue(), // Supervisor Name (K)
    'Yes', // Supervisor Verified (L)
    data.supervisorRemarks || sheet.getRange(updateRow, 13).getValue(), // Supervisor Review (M)
    new Date().toLocaleString() // Verified At (N)
  ]]);
  
  console.log('Successfully updated supervisor columns and tasks for checklist at row', updateRow);
  
  // Create response
  var output = ContentService
    .createTextOutput(JSON.stringify({result: 'success', message: 'Supervisor verification updated successfully', updatedRow: updateRow}))
    .setMimeType(ContentService.MimeType.JSON);
  
  return output;
}
 else if (data.role === 'Officeboy') {
      // Office Boys: prevent duplicate submissions for the same checklist type in a day
      var today = new Date().toLocaleDateString();
      var existingEntry = false;
      
      var lastRow = sheet.getLastRow();
      
      if (lastRow > 1) { // If there's more than just the header row
        // Optimize by getting only the specific columns we need to check
        var dateRange = sheet.getRange(2, 1, lastRow - 1, 1);    // Date column (A)
        var userRange = sheet.getRange(2, 4, lastRow - 1, 1);    // Name column (D) 
        var typeRange = sheet.getRange(2, 6, lastRow - 1, 1);   // ChecklistType column (F)
        
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
        
        if (existingEntry) {
          var output = ContentService
            .createTextOutput(JSON.stringify({result: 'error', message: 'Submission already exists for today. Office boys cannot submit multiple ' + data.checklistType + ' checklists per day. Contact a supervisor for any updates.'}))
            .setMimeType(ContentService.MimeType.JSON);
          
          // Note: Google Apps Script handles CORS automatically for published web apps
          return output;
        }
      }
      
      // Add single record with consolidated tasks for office boy
      var newRow = [
        new Date().toLocaleDateString() || '',     // Date
        new Date().toLocaleTimeString() || '',     // Submitted At
        data.loginTime || '',                      // Login Time
        data.user || '',                           // Name
        data.role || '',                           // Role
        data.checklistType || '',                  // Checklist Type
        tasksJson,                                 // Tasks (consolidated as JSON)
        completedTasks,                            // Completed Tasks
        totalTasks,                                // Total Tasks
        completionPercentage + '%',                // Completion % (format as percentage string)
        '',                                        // Supervisor Name (K) - empty for now
        '',                                        // Supervisor Verified (L) - empty for now
        '',                                        // Supervisor Review (M) - empty for now
        ''                                         // Verified At (N) - empty for now
      ];
      
      sheet.getRange(lastRow + 1, 1, 1, 14).setValues([newRow]);
      
      // Log successful entry
      console.log('Successfully added checklist submission to sheet with', data.tasks.length, 'tasks');
    }
    
    // Create response
    var output = ContentService
      .createTextOutput(JSON.stringify({result: 'success', message: 'Data recorded successfully', recordsAdded: data.tasks.length}))
      .setMimeType(ContentService.MimeType.JSON);
    
    // Note: Google Apps Script handles CORS automatically for published web apps
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

// Function to retrieve all checklist history
function doGet(e) {
  if (e.parameter.action === 'getHistory') {
    return getChecklistHistory(e);
  } else if (e.parameter.action === 'getDetail' && e.parameter.id) {
    return getChecklistDetail(e);
  } else {
    // Show the default page
    var htmlOutput = HtmlService.createHtmlOutput(
      '<h1>Checklist Data Logger</h1>' +
      '<p>Use POST requests to send checklist data.</p>' +
      '<p>Use GET requests with action parameter to retrieve data.</p>' +
      '<p>Examples:</p>' +
      '<ul>' +
      '<li>Get all history: ?action=getHistory</li>' +
      '<li>Get specific entry: ?action=getDetail&id=123</li>' +
      '</ul>'
    );
    
    // Set CORS headers
    htmlOutput.addMetaTag('Access-Control-Allow-Origin', '*');
    return htmlOutput;
  }
}

// Function to handle OPTIONS requests (for CORS preflight)
function doOptions(e) {
  // This function handles preflight requests
  var output = ContentService.createTextOutput(
    JSON.stringify({status: 'success', message: 'CORS preflight successful'})
  ).setMimeType(ContentService.MimeType.JSON);
  
  // Note: Google Apps Script handles CORS automatically for published web apps
  return output;
}

// Function to retrieve checklist history
function getChecklistHistory(e) {
  try {
    var ssId = '1Qr8c2_xdGeVVfVzXeZiJ5sXdO-IHBRjiZXgYT0a1MMU';
    var sheet = SpreadsheetApp.openById(ssId).getActiveSheet();
    
    var lastRow = sheet.getLastRow();
    var values = [];
    
    if (lastRow > 1) {
      values = sheet.getRange(2, 1, lastRow - 1, 14).getValues(); // Get all data rows
    }
    
    var entries = [];
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var tasks = [];
      try {
        // Parse the tasks JSON from the Tasks column (index 6)
        if (row[6]) {
          tasks = JSON.parse(row[6]);
        }
      } catch (e) {
        console.error('Error parsing tasks JSON:', e);
        // If parsing fails, create a basic task object
        tasks = [{taskName: 'Error parsing tasks', status: 'Error', remarks: e.message, supervisorRemarks: ''}];
      }
      
      // Format dates properly from Google Sheets - check if the values are dates or strings
      var rawDate = row[0];
      var formattedDate = '';
      if (rawDate instanceof Date) {
        formattedDate = Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "MM/dd/yyyy");
      } else if (rawDate) {
        // If it's already a string, use it as is
        formattedDate = rawDate.toString();
      }
      
      var rawTime = row[1];
      var formattedTime = '';
      if (rawTime instanceof Date) {
        formattedTime = Utilities.formatDate(rawTime, Session.getScriptTimeZone(), "HH:mm:ss");
      } else if (rawTime) {
        // If it's already a string, use it as is
        formattedTime = rawTime.toString();
      }

      entries.push({
        id: (i + 2).toString(), // Convert to string for consistency; +2 because data rows start at index 2 in sheet (after header)
        date: formattedDate,
        time: formattedTime,
        loginTime: (row[2] || '').toString(),
        name: (row[3] || '').toString(), // Original field name
        role: (row[4] || '').toString(), // Original field name
        checklistType: (row[5] || '').toString(),
        tasks: tasks,
        completedTasks: parseInt(row[7]) || 0,
        totalTasks: parseInt(row[8]) || 0,
        completionPercentage: parseInt(row[9]) || 0,
        supervisorName: (row[10] || '').toString(), // Original field name
        supervisorVerified: (row[11] || '').toString(),
        supervisorReview: (row[12] || '').toString(),
        verifiedAt: (row[13] || '').toString() // Original field name
      });
    }
    
    // Group entries by checklist submission (same date, user, and checklist type)
    var groupedEntries = groupEntriesByChecklist(entries);
    
    var output = ContentService
      .createTextOutput(JSON.stringify(groupedEntries))
      .setMimeType(ContentService.MimeType.JSON);
    
    // Note: Google Apps Script handles CORS automatically for published web apps
    // No need to manually set headers for CORS when deployed as web app
    return output;
  } catch (error) {
    console.error('Error in getChecklistHistory: ', error);
    var output = ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
    
    // Note: Google Apps Script handles CORS automatically for published web apps
    return output;
  }
}

// Function to retrieve specific checklist details
function getChecklistDetail(e) {
  try {
    var id = e.parameter.id;
    var ssId = '1Qr8c2_xdGeVVfVzXeZiJ5sXdO-IHBRjiZXgYT0a1MMU';
    var sheet = SpreadsheetApp.openById(ssId).getActiveSheet();
    
    var lastRow = sheet.getLastRow();
    
    if (lastRow < 2) {
      // No data rows
      return ContentService
        .createTextOutput(JSON.stringify({error: 'No checklist found'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Parse the ID to get the row number
    // The ID format from getChecklistHistory is: row number as string (e.g., "2", "3")
    var rowNumber = parseInt(id);
    
    if (isNaN(rowNumber) || rowNumber < 2 || rowNumber > lastRow) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Invalid checklist ID'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the specific row data
    var row = sheet.getRange(rowNumber, 1, 1, 14).getValues()[0];
    
    // Parse tasks JSON from the Tasks column (index 6)
    var tasks = [];
    try {
      if (row[6]) {
        tasks = JSON.parse(row[6]);
      }
    } catch (parseError) {
      console.error('Error parsing tasks JSON:', parseError);
      tasks = [{taskName: 'Error parsing tasks', status: 'Error', remarks: parseError.message, supervisorRemarks: ''}];
    }
    
    // Format dates properly
    var rawDate = row[0];
    var formattedDate = '';
    if (rawDate instanceof Date) {
      formattedDate = Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "MM/dd/yyyy");
    } else if (rawDate) {
      formattedDate = rawDate.toString();
    }
    
    var rawTime = row[1];
    var formattedTime = '';
    if (rawTime instanceof Date) {
      formattedTime = Utilities.formatDate(rawTime, Session.getScriptTimeZone(), "HH:mm:ss");
    } else if (rawTime) {
      formattedTime = rawTime.toString();
    }
    
    // Build the checklist entry object
    var entry = {
      id: id,
      date: formattedDate,
      time: formattedTime,
      loginTime: (row[2] || '').toString(),
      name: (row[3] || '').toString(),
      role: (row[4] || '').toString(),
      checklistType: (row[5] || '').toString(),
      tasks: tasks,
      completedTasks: parseInt(row[7]) || 0,
      totalTasks: parseInt(row[8]) || 0,
      completionPercentage: parseInt(row[9]) || 0,
      supervisorName: (row[10] || '').toString(),
      supervisorVerified: (row[11] || '').toString(),
      supervisorReview: (row[12] || '').toString(),
      verifiedAt: (row[13] || '').toString()
    };
    
    var output = ContentService
      .createTextOutput(JSON.stringify(entry))
      .setMimeType(ContentService.MimeType.JSON);
    
    return output;
  } catch (error) {
    console.error('Error in getChecklistDetail: ', error);
    console.error('Stack trace: ', error.stack);
    
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


// Since each row now represents a complete checklist submission, 
// we don't need to group individual task entries.
// We'll simply return the entries as they are.
function groupEntriesByChecklist(entries) {
  // Each entry is already a complete checklist submission with all tasks in the 'tasks' field
  for (var i = 0; i < entries.length; i++) {
    // Add a user field for compatibility with frontend
    entries[i].user = entries[i].name;  // Map name to user
    entries[i].userType = entries[i].role;  // Map role to userType
    entries[i].supervisor = entries[i].supervisorName;  // Map supervisorName to supervisor
    entries[i].supervisorTimestamp = entries[i].verifiedAt;  // Map verifiedAt to supervisorTimestamp
  }
  return entries;
}

// Function to create a new spreadsheet if needed (run once to initialize)
function createSpreadsheet() {
  try {
    var ss = SpreadsheetApp.create('Checklist Master Data - ' + new Date().toISOString().split('T')[0]);
    var sheet = ss.getActiveSheet();
    
    // Set up the master sheet headers
    sheet.getRange(1, 1, 1, 14).setValues([[
      'Date',
      'Submitted At',
      'Login Time',
      'Name',
      'Role',
      'Checklist Type',
      'Tasks',
      'Completed Tasks',
      'Total Tasks',
      'Completion %',
      'Supervisor Name',
      'Supervisor Verified',
      'Supervisor Review',
      'Verified At'
    ]]);
    
    // Format the header row with colors and styling
    var headerRange = sheet.getRange(1, 1, 1, 14);
    headerRange.setBackground('#4F81BD'); // Blue background
    headerRange.setFontColor('#FFFFFF');   // White text
    headerRange.setFontWeight('bold');     // Bold text
    headerRange.setVerticalAlignment('middle');
    headerRange.setHorizontalAlignment('center');
    
    // Set specific column widths for better readability
    sheet.setColumnWidth(1, 120);  // Date
    sheet.setColumnWidth(2, 120);  // Submitted At
    sheet.setColumnWidth(3, 120);  // Login Time
    sheet.setColumnWidth(4, 120);  // Name
    sheet.setColumnWidth(5, 100);  // Role
    sheet.setColumnWidth(6, 120);  // Checklist Type
    sheet.setColumnWidth(7, 300);  // Tasks
    sheet.setColumnWidth(8, 100);  // Completed Tasks
    sheet.setColumnWidth(9, 100);  // Total Tasks
    sheet.setColumnWidth(10, 100); // Completion %
    sheet.setColumnWidth(11, 120); // Supervisor Name
    sheet.setColumnWidth(12, 120); // Supervisor Verified
    sheet.setColumnWidth(13, 150); // Supervisor Review
    sheet.setColumnWidth(14, 120); // Verified At
    
    console.log('Master spreadsheet created with ID: ' + ss.getId());
    Logger.log('Master spreadsheet created with ID: ' + ss.getId());
    
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
    tasks: [
      {taskName: 'Test Task 1', status: 'Completed', remarks: 'Test remark 1', supervisorRemarks: ''},
      {taskName: 'Test Task 2', status: 'Pending', remarks: 'Test remark 2', supervisorRemarks: ''}
    ],
    timestamp: new Date().toISOString(),
    completedTasks: 1,
    totalTasks: 2,
    completionPercentage: 50,
    loginTime: new Date().toISOString(),
    supervisor: '',
    supervisorTimestamp: '',
    supervisorRemarks: ''
  };
  
  // Log the test data
  console.log('Test data: ', testRecord);
  Logger.log('Test data: ', testRecord);
  
  return testRecord;
}