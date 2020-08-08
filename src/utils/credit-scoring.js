/* eslint-disable no-unused-vars */
const creditScore = (request, balance, threeMonths, transactionRecord) => {
  let credits, debits;

  let creditLength = 0;
  let debitLength = 0;

  if (transactionRecord.length > 0) {
    debits = transactionRecord.filter(
      transaction => transaction.type === 'debit'
    );

    credits = transactionRecord.filter(
      transaction => transaction.type === 'credit'
    );
    debitLength = debits.length;
    creditLength = credits.length;
  }

  let threeMonthAverage = threeMonths.reduce(
    (acc, { amount }) => amount + acc,
    0
  );

  threeMonthAverage = threeMonthAverage / threeMonths.length;

  const creditWeight = 0.2;
  const debitWeight = 0.13;
  const balanceWeight = 0.3;
  const monthAverageWeight = (request / threeMonthAverage) * 0.4;
  const moreThan = transactionRecord.filter(
    transactions => transactions.amount > request * 100
  );
  const moreThanWeight = moreThan.length * 0.2;

  const score =
    balance * balanceWeight +
    debitWeight * debitLength +
    creditLength * creditWeight +
    monthAverageWeight +
    moreThanWeight;

  const result = score * request;
  const eligible = `You are eligible to borrow up to #${result}.`;
  const ineligible = `You are currently unable to borrow ${request} at the moment. You can only borrow up to #${result ||
    0}.`;

  if (result > request) {
    return eligible;
  }

  return ineligible;
};

export default creditScore;
