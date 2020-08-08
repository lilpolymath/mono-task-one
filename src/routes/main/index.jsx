import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import style from './style.css';
import useFormFields from '../../hooks/use-form-fields';
import creditScore from '../../utils/credit-scoring';
import { start, end } from '../../utils/date';

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

  const [data, setData] = useState({
    transactionHistory: [],
    balance: 0,
    threeMonths: [],
  });

  let options = {
    onSuccess(response) {
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
          transactionDetails(res.id);
          connect.close();
        })
        .catch(error => {
          console.log(error);
        });
    };

    const transactionDetails = async id => {
      const USER_BASE_URL = `${ACCOUNT_URL}${id}`;

      const TRANS_URL = `${USER_BASE_URL}/transactions/?filter&start=${start}&end=${end}`;

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
    e.preventDefault();
    console.log('fields');
    connect.open();
  };

  useEffect(() => {
    connect.setup();
  }, [connect]);

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

  return (
    <div className={style.container}>
      <h2 className={style.response}>{response}</h2>
      <form onSubmit={onSubmit}>
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
        <button disabled={disabled} type='submit'>
          Process Request
        </button>
      </form>
    </div>
  );
};

export default Main;
