// Indian Currency System Number To Words Utility
// Converts numerical values (e.g. 3975) to formal Indian Rupee text
// e.g. "Rupees Three Thousand Nine Hundred Seventy-Five Only"

export function convertNumberToIndianRupees(amount: number): string {
  if (amount === 0) return 'Rupees Zero Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teenDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertChunk(num: number): string {
    let str = '';
    if (num >= 100) {
      str += singleDigits[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 10 && num <= 19) {
      str += teenDigits[num - 10] + ' ';
    } else if (num >= 20 || num === 10) {
      str += tensDigits[Math.floor(num / 10)] + ' ';
      if (num % 10 > 0) {
        str += singleDigits[num % 10] + ' ';
      }
    } else if (num > 0) {
      str += singleDigits[num] + ' ';
    }
    return str;
  }

  let num = Math.floor(Math.abs(amount));
  let result = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const hundred = num;

  if (crore > 0) {
    result += convertChunk(crore) + 'Crore ';
  }
  if (lakh > 0) {
    result += convertChunk(lakh) + 'Lakh ';
  }
  if (thousand > 0) {
    result += convertChunk(thousand) + 'Thousand ';
  }
  if (hundred > 0) {
    result += convertChunk(hundred);
  }

  const cleanResult = result.trim();
  return cleanResult ? `Rupees ${cleanResult} Only` : 'Rupees Zero Only';
}
