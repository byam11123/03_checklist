export const remarkTemplates = {
// Officeboy Templates
officeboy: {
working: [
'All working fine',
'Checked and working',
'No issues',
'Everything OK',
'Completed successfully',
],
issues: [
'Not working properly',
'Needs repair',
'Broken/damaged',
'Out of order',
'Partially working',
],
maintenance: [
'Cleaned thoroughly',
'Requires cleaning',
'Maintenance needed',
'Filter needs replacement',
'Low stock - needs refill',
],
equipment: [
'Camera offline',
'Light not turning on',
'Printer jam',
'Internet connection issue',
'System not booting',
'Water dispenser empty',
'AC not cooling',
],
common: [
'Will fix tomorrow',
'Already reported to supervisor',
'Waiting for replacement',
'Done',
]
},

// Supervisor Templates
supervisor: {
positive: [
'Excellent work!',
'Well done!',
'Keep it up!',
'Good job!',
'Perfect!',
'Outstanding!',
],
neutral: [
'Noted',
'Acknowledged',
'Reviewed',
'Checked',
'Acceptable',
],
actionRequired: [
'Please fix this immediately',
'Needs attention',
'Incomplete - complete by tomorrow',
'Follow up required',
'Contact vendor',
'Schedule repair',
],
feedback: [
'Improve cleaning quality',
'More thorough inspection needed',
'Check all items carefully',
'Good but can be better',
],
common: [
'Camera not working - fix ASAP',
'Light issue reported to maintenance',
'Cleaning needs improvement',
'All good',
'Minor issues, acceptable',
'Check again tomorrow',
'Escalating to management',
]
}
};

export const getOfficebyTemplates = () => {
return {
...remarkTemplates.officeboy
};
};

export const getSupervisorTemplates = () => {
return {
...remarkTemplates.supervisor
};
};
