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
  const [id, setId] = useState(null);

  const [data, setData] = useState({
    transactionHistory: [],
    balance: null,
    threeMonths: [],
  });

  let options = {
    onSuccess(response) {
      getClientData(response.code);
    },
  };

  // eslint-disable-next-line no-undef
  const connect = new Connect(`${PUBLIC_KEY}`, options);

  const getClientData = async resCode => {
    return await fetch(`${AUTH_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'mono-sec-key': `${SERCET_KEY}`,
      },
      body: JSON.stringify({ code: resCode }),
    })
      .then(response => response.json())
      .then(res => {
        // setId(res.id);
        transactionDetails(res.id);
        connect.close();
      })
      .catch(error => {
        console.log(error);
      });
  };

  const transactionDetails = id => {
    const USER_BASE_URL = `${ACCOUNT_URL}${id}`;

    const TRANS_URL = `${USER_BASE_URL}/transactions/?filter&start=${start}&end=${end}`;

    console.log(TRANS_URL, USER_BASE_URL);
    const getBalance = async () => {
      const res = await fetch(`${USER_BASE_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'mono-sec-key': `${SERCET_KEY}`,
        },
      })
        .then(response => {
          return response.json();
        })
        .catch(error => {
          console.log(error);
        });

      return res;
    };

    const getRecentCredits = async () => {
      const res = await fetch(`${USER_BASE_URL}/credits`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'mono-sec-key': `${SERCET_KEY}`,
        },
      })
        .then(response => {
          return response.json();
        })
        .catch(error => {
          console.log(error);
        });

      return res;
    };

    const getAllTransactions = async () => {
      const res = await fetch(`${TRANS_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'mono-sec-key': `${SERCET_KEY}`,
        },
      })
        .then(response => {
          return response.json();
        })
        .catch(error => {
          console.log(error);
        });

      return res;
    };

    Promise.all([getBalance(), getRecentCredits(), getAllTransactions()]).then(
      values => {
        setData(prevState => {
          return {
            ...prevState,
            balance: values[0].balance,
            threeMonths:
              (values[1].history && values[1].history.slice(0, 3)) || [],
            transactionHistory: values[2].data,
          };
        });
      }
    );
  };

  const onSubmit = e => {
    e.preventDefault();
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

  useEffect(() => {
    if (
      (fields.amount && data.threeMonth && data.transactionHistory) ||
      data.balance === 0
    ) {
      const result = creditScore(
        fields.amount,
        data.balance,
        data.threeMonths,
        data.transactionHistory
      );
      setResponse(result);
    }
  }, [data, fields]);

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
