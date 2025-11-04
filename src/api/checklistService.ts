// api/checklistService.ts
import { ChecklistEntry } from '../types/checklist.d';

// Google Apps Script endpoints needed for history management
// 
// For the history feature to work properly with actual Google Sheets data,
// you need to add the following functions to your GoogleAppsScript.gs file:

/*
// Function to retrieve all checklist entries
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

// Function to handle delete requests
function doPost(e) {
  if (e.parameter.action === 'delete' && e.parameter.id) {
    return deleteChecklistEntry(e);
  }
  
  // Existing code for handling checklist submissions
  // ... existing doPost code ...
}

function getChecklistHistory(e) {
  try {
    var ssId = '1Qr8c2_xdGeVVfVzXeZiJ5sXdO-IHBRjiZXgYT0a1MMU';
    var sheet = SpreadsheetApp.openById(ssId).getActiveSheet();
    
    var lastRow = sheet.getLastRow();
    var values = [];
    
    if (lastRow > 1) {
      values = sheet.getRange(2, 1, lastRow - 1, 18).getValues(); // Get all data rows
    }
    
    var entries = [];
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      entries.push({
        id: i + 1, // Simple ID based on row number, in a real app you'd have a better ID system
        date: row[0] || '',       // DateSubmitted (column A)
        time: row[1] || '',       // At (column B)
        userType: row[2] || '',   // UserType (column C)
        taskName: row[3] || '',   // Task Name (column D)
        status: row[4] || '',     // Status (column E)
        remarks: row[5] || '',    // Remark (column F)
        timestamp: row[6] || '',  // Timestamp (column G)
        completedTasks: row[7] || '',    // Completed Tasks (column H)
        totalTasks: row[8] || '',        // Total Tasks (column I)
        completionPercentage: row[9] || '', // Completion % (column J)
        loginTime: row[10] || '',        // Login Time (column K)
        supervisorReview: row[11] || '', // Supervisor Review (column L)
        supervisorName: row[12] || '',   // Supervisor Name (column M)
        supervisorVerified: row[13] || '', // Supervisor Verified (column N)
        supervisorRemark: row[14] || '',   // Supervisor Remark (column O)
        verifiedAt: row[15] || '',         // Verified At (column P)
        checklistType: row[16] || '',      // Checklist Type (column Q)
        supervisorTimestamp: row[17] || '' // Supervisor Timestamp (column R)
      });
    }
    
    // Group entries by checklist submission (same date, user, and checklist type)
    var groupedEntries = groupEntriesByChecklist(entries);
    
    var output = ContentService
      .createTextOutput(JSON.stringify(groupedEntries))
      .setMimeType(ContentService.MimeType.JSON);
    
    output.setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    
    return output;
  } catch (error) {
    console.error('Error in getChecklistHistory: ', error);
    var output = ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
    
    output.setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    
    return output;
  }
}

// Group individual task entries into checklist submissions
function groupEntriesByChecklist(entries) {
  var grouped = {};
  
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    // Create a unique key for each checklist submission
    var key = entry.date + '|' + entry.userType + '|' + entry.checklistType;
    
    if (!grouped[key]) {
      grouped[key] = {
        id: key, // Using the key as ID, in production you'd want better IDs
        date: entry.date,
        time: entry.time,
        userType: entry.userType,
        checklistType: entry.checklistType,
        user: entry.supervisorName || entry.userType, // Simplified user identification
        tasks: [],
        completedTasks: 0,
        totalTasks: 0,
        completionPercentage: 0,
        supervisor: entry.supervisorName,
        supervisorTimestamp: entry.supervisorTimestamp
      };
    }
    
    grouped[key].tasks.push({
      taskName: entry.taskName,
      status: entry.status,
      remarks: entry.remarks,
      supervisorRemarks: entry.supervisorRemark
    });
    
    grouped[key].totalTasks++;
    if (entry.status === 'Completed') {
      grouped[key].completedTasks++;
    }
  }
  
  // Calculate completion percentage for each group
  var result = [];
  for (var key in grouped) {
    var group = grouped[key];
    group.completionPercentage = Math.round((group.completedTasks / group.totalTasks) * 100);
    result.push(group);
  }
  
  return result;
}

function getChecklistDetail(e) {
  // Implementation for getting specific checklist details
  // This would filter the data based on the provided ID
  // Similar to getChecklistHistory but filtered for specific entry
}

function deleteChecklistEntry(e) {
  // Implementation for deleting checklist entries
  // This would remove specific entries from the Google Sheet
  // Would need to identify which rows to delete based on the ID
}
*/

// For now, we'll enhance the service to be closer to what will be implemented:
export const checklistService = {
  async fetchChecklistHistory(): Promise<ChecklistEntry[]> {
    // In a real implementation, this would call your Google Apps Script endpoint:
    // const response = await fetch(`${VITE_APPSCRIPT_URL}?action=getHistory`);
    // const data = await response.json();
    
    // For now, return mock data that better represents grouped checklists
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData: ChecklistEntry[] = [
          {
            id: '2025-11-03_opening_john',
            date: '11/03/2025',
            time: '08:30:15',
            userType: 'Officeboy',
            checklistType: 'opening',
            user: 'John Doe',
            tasks: [
              { taskName: 'Light On', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Camera On', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Internet On', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'System On', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Printers On', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Floor cleaned (YES/NO)', status: 'Completed', remarks: 'Cleaned properly', supervisorRemarks: '' },
              { taskName: 'Water Bottles (Filled/Not)', status: 'Completed', remarks: 'Filled', supervisorRemarks: '' },
              { taskName: 'Water RO - On', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Workstation Cleaned', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Bathroom checked (1. water taps 2. handwash 3. freshner)', status: 'Completed', remarks: 'All good', supervisorRemarks: '' },
            ],
            completedTasks: 10,
            totalTasks: 10,
            completionPercentage: 100,
            supervisor: '',
            supervisorTimestamp: ''
          },
          {
            id: '2025-11-03_closing_jane',
            date: '11/03/2025',
            time: '18:45:30',
            userType: 'Officeboy',
            checklistType: 'closing',
            user: 'Jane Smith',
            tasks: [
              { taskName: 'Light OFF', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Camera OFF', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Internet OFF', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'System OFF', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Printers OFF', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Water RO - OFF', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Files cleared from Workstation', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Almirah closed', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Balcony door closed', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Office locked', status: 'Completed', remarks: '', supervisorRemarks: '' },
            ],
            completedTasks: 10,
            totalTasks: 10,
            completionPercentage: 100,
            supervisor: 'Supervisor Bob',
            supervisorTimestamp: '11/03/2025, 19:15:20'
          },
          {
            id: '2025-11-02_opening_mike',
            date: '11/02/2025',
            time: '09:15:45',
            userType: 'Officeboy',
            checklistType: 'opening',
            user: 'Mike Johnson',
            tasks: [
              { taskName: 'Light On', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Camera On', status: 'Pending', remarks: 'Camera not working', supervisorRemarks: 'Need to fix camera' },
              { taskName: 'Internet On', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'System On', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Printers On', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Floor cleaned (YES/NO)', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Water Bottles (Filled/Not)', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Water RO - On', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Workstation Cleaned', status: 'Completed', remarks: '', supervisorRemarks: '' },
              { taskName: 'Bathroom checked (1. water taps 2. handwash 3. freshner)', status: 'Completed', remarks: '', supervisorRemarks: '' },
            ],
            completedTasks: 9,
            totalTasks: 10,
            completionPercentage: 90,
            supervisor: 'Supervisor Bob',
            supervisorTimestamp: '11/02/2025, 10:30:15'
          }
        ];
        resolve(mockData);
      }, 500);
    });
  },

  async fetchChecklistDetail(id: string): Promise<ChecklistEntry | null> {
    const entries = await this.fetchChecklistHistory();
    return entries.find(entry => entry.id === id) || null;
  },

  async deleteChecklist(id: string): Promise<boolean> {
    // In a real implementation, this would call your Google Apps Script
    // to delete the entry from Google Sheets
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock deletion - in real app, this would call the delete endpoint
        console.log(`Deleting checklist with id: ${id}`);
        resolve(true);
      }, 300);
    });
  }
};