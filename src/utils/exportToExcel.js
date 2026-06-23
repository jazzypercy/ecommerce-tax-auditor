import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName) => {
  // Convert JSON to Worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  // Create Workbook and append the sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "AuditData");
  // Trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
