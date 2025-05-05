const XLSX = require('xlsx');
const path = require('path');

exports.readExcelFile = async (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    return data;
  } catch (error) {
    throw new Error(`Error reading Excel file: ${error.message}`);
  }
};

exports.parseTransactions = (data) => {
  // This function adapts to the flexible column structure
  const transactions = [];
  
  // Try to detect column names based on common patterns
  const columnMappings = {
    date: ['date', 'transaction date', 'execution date', 'date comptable', 'date valeur'],
    description: ['description', 'message', 'communication', 'detail', 'commentaire'],
    amount: ['amount', 'montant', 'value', 'sum'],
    type: ['type', 'transaction type', 'credit/debit'],
    category: ['category', 'categoryorie', 'label', 'type'],
    paymentMethod: ['payment method', 'mode', 'payment type', 'method'],
    reference: ['reference', 'ref', 'number', 'no']
  };
  
  // First, identify which columns correspond to which fields
  const detectedColumns = {};
  const lowercaseKeys = Object.keys(data[0] || {}).map(key => key.toLowerCase());
  
  for (const [field, possibleValues] of Object.entries(columnMappings)) {
    for (const possible of possibleValues) {
      const matchingCol = lowercaseKeys.find(col => col.includes(possible));
      if (matchingCol) {
        // Find the original key case
        detectedColumns[field] = Object.keys(data[0]).find(key => key.toLowerCase() === matchingCol);
        break;
      }
    }
  }
  
  // Parse each row
  for (const row of data) {
    const transaction = {
      date: row[detectedColumns.date],
      description: row[detectedColumns.description] || '',
      amount: Math.abs(parseFloat(row[detectedColumns.amount] || '0')),
      type: detectTransactionType(row, detectedColumns),
      category: row[detectedColumns.category] || 'Uncategorized',
      paymentMethod: mapPaymentMethod(row[detectedColumns.paymentMethod] || 'other'),
      reference: row[detectedColumns.reference] || '',
      sourceFile: path.basename(row.sourceFile || 'unknown'),
      originalId: generateOriginalId(row, detectedColumns)
    };
    
    // Skip invalid transactions
    if (!transaction.date || !transaction.amount || transaction.amount === 0) {
      continue;
    }
    
    transactions.push(transaction);
  }
  
  return transactions;
};

const detectTransactionType = (row, columns) => {
  // Check if there's an explicit type column
  if (columns.type && row[columns.type]) {
    const type = row[columns.type].toString().toLowerCase();
    if (type.includes('credit') || type.includes('debit')) {
      return type.includes('credit') ? 'income' : 'expense';
    }
  }
  
  // Check amount column for +/- indicators
  if (columns.amount && row[columns.amount]) {
    const amount = row[columns.amount].toString();
    if (amount.includes('+') || !amount.includes('-')) {
      return 'income';
    } else {
      return 'expense';
    }
  }
  
  // Default based on positive/negative amount
  const amount = parseFloat(row[columns.amount] || '0');
  return amount > 0 ? 'income' : 'expense';
};

const mapPaymentMethod = (method) => {
  const methodString = method.toString().toLowerCase();
  
  if (methodString.includes('cash') || methodString.includes('espece')) return 'cash';
  if (methodString.includes('credit') || methodString.includes('carte')) return 'credit';
  if (methodString.includes('debit') || methodString.includes('bankcontact')) return 'debit';
  if (methodString.includes('transfer') || methodString.includes('virement')) return 'transfer';
  if (methodString.includes('check') || methodString.includes('cheque')) return 'check';
  
  return 'other';
};

const generateOriginalId = (row, columns) => {
  // Create a unique identifier based on available data
  const parts = [];
  
  if (row[columns.date]) parts.push(new Date(row[columns.date]).getTime());
  if (row[columns.amount]) parts.push(Math.abs(parseFloat(row[columns.amount])));
  if (row[columns.description]) parts.push(row[columns.description].slice(0, 10));
  if (row[columns.reference]) parts.push(row[columns.reference]);
  
  return parts.join('|');
};

exports.exportToExcel = (transactions, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(transactions);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  return buffer;
};
