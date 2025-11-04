// Debugging utilities for the Checklist Application

// Test function to verify the Google Apps Script endpoint
function testAppScriptEndpoint() {
  const testPayload = {
    user: 'Test User',
    role: 'Officeboy',
    checklistType: 'opening',
    task: 'Light On',
    status: 'Completed',
    timestamp: new Date().toISOString(),
    remarks: 'Test remark',
    supervisor: '',
    supervisorRemarks: ''
  };

  fetch('YOUR_APP_SCRIPT_URL_HERE', {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testPayload)
  })
  .then(response => {
    console.log('Test response:', response);
    alert('Test request sent. Check console for details.');
  })
  .catch(error => {
    console.error('Test error:', error);
    alert('Test failed: ' + error.message);
  });
}

// Function to validate environment variables
function checkEnvironment() {
  const appScriptUrl = import.meta.env.VITE_APPSCRIPT_URL;
  
  if (!appScriptUrl) {
    console.error('VITE_APPSCRIPT_URL is not set in environment variables');
    return false;
  }
  
  console.log('App Script URL is configured:', appScriptUrl);
  return true;
}

// Function to simulate data submission without actually sending to Google Apps Script
function simulateSubmission(tasks, user, type) {
  console.group('=== SUBMISSION SIMULATION ===');
  console.log('User:', user.name);
  console.log('Role:', user.role);
  console.log('Checklist Type:', type);
  console.log('Tasks:');
  
  tasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.task}`);
    console.log(`   Status: ${task.isCompleted ? 'Completed' : 'Pending'}`);
    console.log(`   Remarks: ${task.remarks}`);
    console.log(`   Verified: ${task.isVerified}`);
    console.log(`   Supervisor Remarks: ${task.supervisorRemarks}`);
    console.log('   ---');
  });
  
  console.groupEnd();
  console.log('Simulation complete. No data was sent to Google Sheets.');
}

// Export debugging functions for use in the browser console
if (typeof window !== 'undefined') {
  (window as any).checklistDebug = {
    testAppScriptEndpoint,
    checkEnvironment,
    simulateSubmission
  };
}

export { testAppScriptEndpoint, checkEnvironment, simulateSubmission };