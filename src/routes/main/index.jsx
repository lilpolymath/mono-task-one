import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import style from './style.css';
import useFormFields from '../../hooks/use-form-fields';
import creditScore from '../../utils/credit-scoring';

const AUTH_URL = 'https://api.withmono.com/account/auth';
const ACCOUNT_URL = 'https://api.withmono.com/accounts/';

const SERCET_KEY = process.env.PREACT_APP_MONO_SECRET_KEY;
const PUBLIC_KEY = process.env.PREACT_APP_MONO_PUBLIC_KEY;

const Main = () => {
  const [fields, handleFieldChange] = useFormFields({
    email: '',
    amount: '',
  });

  const [disabled, setDisabled] = useState(true);

  const [response, setResponse] = useState(null);

  const date = new Date();
  const day = date.getDate();
  const dayFormatted = day.length > 1 ? day : `0${day}`;
  const dayPadded = day.length > 1 ? day : `0${day - 1}`;

  const month = date.getMonth();
  const monthFormatted = month.length > 1 ? month : `0${month}`;
  const monthPadded = month.length > 1 ? month : `0${month + 1}`;

  const year = date.getFullYear();
  const end = `${dayFormatted}-${monthPadded}-${year}`;
  const start = `${dayPadded}-${monthFormatted}-${year}`;

  const [data, setData] = useState({
    transactionHistory: [],
    balance: 0,
    threeMonths: [],
  });

  let options = {
    onSuccess(response) {
      console.log('onSuccess response', response);
      getClientData(response.code);
    },
  };

  // eslint-disable-next-line no-undef
  const connect = new Connect(`${PUBLIC_KEY}`, options);

  const getClientData = async code => {
    const getId = resCode => {
      return fetch(`${AUTH_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'mono-sec-key': `${SERCET_KEY}`,
        },
        body: JSON.stringify({ code: resCode }),
      })
        .then(response => response.json())
        .then(res => {
          console.log('Response', res);
          transactionDetails(res.id);
        })
        .catch(error => {
          console.log(error);
        });
    };

    const transactionDetails = async id => {
      const USER_BASE_URL = `${ACCOUNT_URL}${id}`;
      console.log('user base url', USER_BASE_URL);

      const TRANS_URL = `${USER_BASE_URL}/transactions/?filter&start=${start}&end=${end}`;
      console.log('transaction url', TRANS_URL);

      const getBalance = async () => {
        return await fetch(`${USER_BASE_URL}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'mono-sec-key': `${SERCET_KEY}`,
          },
        })
          .then(response => response.json())
          .then(res =>
            setData(prevState => {
              return { ...prevState, balance: res.balance };
            })
          )
          .catch(error => {
            console.log(error);
          });
      };

      const getRecentCredits = async () => {
        return await fetch(`${USER_BASE_URL}/credits`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'mono-sec-key': `${SERCET_KEY}`,
          },
        })
          .then(response => response.json())
          .then(res =>
            setData(prevState => {
              return { ...prevState, threeMonths: res.history.slice(0, 3) };
            })
          )
          .catch(error => {
            console.log(error);
          });
      };

      const getAllTransactions = async () => {
        return await fetch(`${TRANS_URL}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'mono-sec-key': `${SERCET_KEY}`,
          },
        })
          .then(response => response.json())
          .then(res => {
            setData(prevState => {
              return { ...prevState, transactionHistory: res.data };
            });
            setResponse(
              creditScore(
                fields.amount,
                data.balance,
                data.threeMonths,
                data.transactionHistory
              )
            );
          })
          .then(() => connect.close())
          .catch(error => {
            console.log(error);
          });
      };

      await getBalance()
        .then(() => getRecentCredits())
        .then(() => getAllTransactions());
    };

    await getId(code);
  };

  const onSubmit = e => {
    connect.open();
    e.preventDefault();

    console.log('gets here');
  };

  useEffect(() => {
    connect.setup();
  }, []);

  useEffect(() => {
    if (
      fields.email.match(
        /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      ) &&
      fields.amount.length > 3
    ) {
      setDisabled(false);
    }
  }, [fields]);

  useEffect(() => {
    response !== null && alert(response);
  }, [response]);

  return (
    <div className={style.container}>
      <h4>{response}</h4>
      <form action='javascript:void(0);'>
        <label htmlFor='email'>Your Email</label>
        <br />
        <input
          type='email'
          name='email'
          id='email'
          onChange={handleFieldChange}
          value={fields.name}
        />
        <br />
        <label htmlFor='amount'>How much do you want to borrow?</label>
        <br />
        <input
          type='number'
          name='amount'
          id='amount'
          onChange={handleFieldChange}
          value={fields.amount}
        />
        <br />
      </form>
      <button disabled={disabled} onClick={() => onSubmit()} type='submit'>
        Process Request
      </button>
    </div>
  );
};

export default Main;
