/* eslint-disable no-unused-vars */
const creditScore = (balance, request, threeMonthAverage) => {
  const data = [
    {
      _id: '5f2d7643b7f60b0db8f9a84b',
      type: 'debit',
      narration: 'Adedapo Ayobami Favour',
      amount: 1800000,
      date: '2020-07-02T22:05:00.000Z',
    },
    {
      _id: '5f2d7643b7f60b0db8f9a84c',
      type: 'credit',
      narration: 'Adedapo Ayobami Favour',
      amount: 1800000,
      date: '2020-07-02T10:25:00.000Z',
    },
    {
      _id: '5f2d7643b7f60b0db8f9a84d',
      type: 'debit',
      narration: 'Adedapo Ayobami Favour',
      amount: 5000,
      date: '2020-02-20T19:02:00.000Z',
    },
    {
      _id: '5f2d7643b7f60b0db8f9a84e',
      type: 'debit',
      narration: 'Gotv',
      amount: 125000,
      date: '2020-02-07T19:54:00.000Z',
    },
    {
      _id: '5f2d7643b7f60b0db8f9a84f',
      type: 'credit',
      narration: 'Adedapo Ayobami Favour',
      amount: 130000,
      date: '2020-02-07T19:51:00.000Z',
    },
  ];

  const debits = data.filter(transaction => transaction.type === 'debit');
  const credits = data.filter(transaction => transaction.type === 'credit');

  let creditLength = credits.history.length;
  let debitLength = debits.history.length;

  const creditWeight = 0.2;
  const debitWeight = 0.13;
  const balanceWeight = 0.3;
  const monthAverageWeight = (request / threeMonthAverage) * 0.4;
  const moreThan = data.filter(transactions => transactions.amount > request);
  const moreThanWeight = moreThan.length * 0.2;

  const score =
    balance * balanceWeight +
    debitWeight * debitLength +
    creditLength * creditWeight +
    monthAverageWeight +
    moreThanWeight;

  const response = score * request;

  return response;
};

export default creditScore;
