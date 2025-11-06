// api/checklistService.ts
import type { ChecklistEntry } from '../types/checklist';

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
    const VITE_APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_URL;
    
    if (!VITE_APPSCRIPT_URL) {
      console.warn('VITE_APPSCRIPT_URL is not set. Using mock data.');
      // Return mock data as fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockData: ChecklistEntry[] = [
            {
              id: '2025-11-03_opening_john',
              date: '11/03/2025',
              time: '08:30:15',
              role: 'Officeboy',
              checklistType: 'opening',
              name: 'John Doe',
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
              supervisorName: '',
              verifiedAt: ''
            },
            {
              id: '2025-11-03_closing_jane',
              date: '11/03/2025',
              time: '18:45:30',
              role: 'Officeboy',
              checklistType: 'closing',
              name: 'Jane Smith',
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
              supervisorName: 'Supervisor Bob',
              verifiedAt: '11/03/2025, 19:15:20'
            },
            {
              id: '2025-11-02_opening_mike',
              date: '11/02/2025',
              time: '09:15:45',
              role: 'Officeboy',
              checklistType: 'opening',
              name: 'Mike Johnson',
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
              supervisorName: 'Supervisor Bob',
              verifiedAt: '11/02/2025, 10:30:15'
            }
          ];
          resolve(mockData);
        }, 500);
      });
    } else {
      try {
        // Call your Google Apps Script endpoint to get the real data
        const response = await fetch(`${VITE_APPSCRIPT_URL}?action=getHistory`);
        
        // With no-cors, we can't check the response status, but we can get the text
        const responseText = await response.text();
        
        // Try to parse the JSON response
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Error parsing response from Google Apps Script:', responseText);
          throw new Error(`Invalid response from Google Apps Script. Please check that your Google Apps Script is properly deployed and the URL is correct. Response: ${responseText.substring(0, 200)}...`);
        }
        
        // Check if the response contains an error
        if (data.error) {
          console.error('Error from Google Apps Script:', data.error);
          throw new Error(`Google Apps Script error: ${data.error}. Please verify your Google Apps Script is correctly deployed and accessible.`);
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching checklist history:', error);
        // Re-throw with more helpful message
        throw error instanceof Error ? error : new Error('Failed to fetch checklist history. Please check your Google Apps Script configuration.');
      }
    }
  },

  async fetchChecklistDetail(id: string): Promise<ChecklistEntry | null> {
    const VITE_APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_URL;
    
    if (!VITE_APPSCRIPT_URL) {
      console.warn('VITE_APPSCRIPT_URL is not set. Using mock data.');
      const entries = await this.fetchChecklistHistory();
      
      // For mock data, we might get an ID that's not in the expected format
      // Try to find by exact ID match first
      const exactMatch = entries.find(entry => entry.id === id);
      if (exactMatch) {
        return exactMatch;
      }
      
      // If there's no exact match, return the first entry as fallback
      // Or look for an entry that might match based on partial information
      return entries.length > 0 ? entries[0] : null;
    }

    try {
      const response = await fetch(`${VITE_APPSCRIPT_URL}?action=getDetail&id=${id}`);
      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing detail response from Google Apps Script:', responseText);
        throw new Error(`Invalid detail response from Google Apps Script. Please check that your Google Apps Script is properly deployed and the URL is correct. Response: ${responseText.substring(0, 200)}...`);
      }
      
      if (data.error) {
        console.error('Error from Google Apps Script:', data.error);
        throw new Error(`Google Apps Script error: ${data.error}. Please verify your Google Apps Script is correctly deployed and accessible.`);
      }
      
      // If data is an array and has one item, return the first item
      if (Array.isArray(data) && data.length > 0) {
        return data[0] as ChecklistEntry;
      }
      
      return data as ChecklistEntry;
    } catch (error) {
      console.error('Error fetching checklist detail:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch checklist detail. Please check your Google Apps Script configuration.');
    }
  },

  async deleteChecklist(id: string): Promise<boolean> {
    const VITE_APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_URL;
    
    if (!VITE_APPSCRIPT_URL) {
      console.warn('VITE_APPSCRIPT_URL is not set. Cannot delete.');
      return false;
    }

    try {
      await fetch(VITE_APPSCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          id: id
        })
      });
      
      // Note: With no-cors, we can't verify the response, so we assume success
      console.log(`Checklist ${id} deletion request sent`);
      return true;
    } catch (error) {
      console.error('Error deleting checklist:', error);
      return false;
    }
  },
  
  async updateChecklist(id: string, updatedData: any): Promise<boolean> {
    const VITE_APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_URL;
    
    if (!VITE_APPSCRIPT_URL) {
      console.warn('VITE_APPSCRIPT_URL is not set. Cannot update.');
      return false;
    }

    try {
      // For supervisor reviews, we need to format the data correctly
      // The Google Apps Script expects specific field names
      const formattedData = {
        checklistId: id, // This is used in the Google Apps Script to identify the row to update
        action: 'update',
        user: updatedData.user || '',
        role: 'Supervisor', // Indicate that this is a supervisor update
        checklistType: updatedData.checklistType || '',
        tasks: updatedData.tasks || [],
        supervisor: updatedData.supervisor || '',
        supervisorTimestamp: updatedData.supervisorTimestamp || '',
        supervisorRemarks: updatedData.supervisorReview || updatedData.supervisorRemarks || '',
        // Additional fields that may be needed
        date: updatedData.date || '',
        time: updatedData.time || '',
        loginTime: updatedData.loginTime || '',
        name: updatedData.name || updatedData.user || '',
        completedTasks: updatedData.completedTasks || 0,
        totalTasks: updatedData.totalTasks || 0,
        completionPercentage: updatedData.completionPercentage || 0,
        supervisorVerified: 'Yes' // Mark as verified when supervisor reviews
      };

      await fetch(VITE_APPSCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script requires no-cors mode from web applications
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData)
      });
      
      // Note: With no-cors, we can't verify the response, so we assume success
      console.log(`Checklist ${id} update request sent with data:`, formattedData);
      return true;
    } catch (error) {
      console.error('Error updating checklist:', error);
      return false;
    }
  }
};