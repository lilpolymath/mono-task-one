import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import style from './style.css';
import useFormFields from '../../hooks/use-form-fields';

const AUTH_URL = 'https://api.withmono.com/account/auth';
const ACCOUNT_URL = 'https://api.withmono.com/accounts/';

const Main = () => {
  const [fields, handleFieldChange] = useFormFields({
    email: '',
    amount: '',
  });

  // eslint-disable-next-line no-unused-vars
  const errorHandler = () => {};

  // const [userId, setUserId] = useState('');
  const [data, setData] = useState({
    creditHistory: {},
    debitHistory: {},
    balance: 0,
  });

  let options = {
    onSuccess(response) {
      console.log('onSuccess response', response);
      getClientData(response.code);
    },

    onClose() {
      alert('User closed the widget.');
    },
  };

  // eslint-disable-next-line no-undef
  const connect = new Connect('live_pk_VRkwrLzhC9cNbjn6YRXD', options);

  const getClientData = async code => {
    const getId = resCode => {
      return fetch(`${AUTH_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'mono-sec-key': 'live_sk_56VLRHZhF7dQxS0n9NBZ',
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
      console.log(USER_BASE_URL);

      const getBalance = async () => {
        return await fetch(`${USER_BASE_URL}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'mono-sec-key': 'live_sk_56VLRHZhF7dQxS0n9NBZ',
          },
        })
          .then(response => response.json())
          .then(res =>
            setData(prevState => {
              return { ...prevState, balance: res };
            })
          )
          .catch(error => {
            console.log(error);
          });
      };

      const getCredits = async () => {
        return await fetch(`${USER_BASE_URL}/credits`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'mono-sec-key': 'live_sk_56VLRHZhF7dQxS0n9NBZ',
          },
        })
          .then(response => response.json())
          .then(res =>
            setData(prevState => {
              return { ...prevState, creditHistory: res };
            })
          )
          .catch(error => {
            console.log(error);
          });
      };

      const getDebits = async () => {
        console.log(`${USER_BASE_URL}/debits`);
        return await fetch(`${USER_BASE_URL}/debits`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'mono-sec-key': 'live_sk_56VLRHZhF7dQxS0n9NBZ',
          },
        })
          .then(response => response.json())
          .then(res =>
            setData(prevState => {
              return { ...prevState, debitHistory: res };
            })
          )
          .catch(error => {
            console.log(error);
          });
      };

      await getBalance()
        .then(getCredits())
        .then(getDebits());
    };

    await getId(code);
  };

  const onSubmit = e => {
    console.log('fields', fields);
    connect.open();
    e.preventDefault();
    // if (fields.email.length > 0 && fields.amount > 1000) {
    // }
  };

  useEffect(() => {
    connect.setup();
  }, []);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div className={style.container}>
      <form>
        <label htmlFor='email'>Your Email</label>
        <br />
        <input
          type='email'
          name='email'
          id='username'
          autoComplete="off"
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
          autoComplete="off"
          onChange={handleFieldChange}
          value={fields.amount}
        />
        <br />
      </form>
      <button onClick={() => onSubmit()} type='submit'>
        Connect Acount
      </button>
    </div>
  );
};

export default Main;
