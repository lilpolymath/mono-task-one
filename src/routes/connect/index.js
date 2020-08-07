import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import style from './style.css';

const ConnectAccount = () => {
  // const [value, setValue] = useState('');

  let options = {
    onSuccess(response) {
      handleResponse(JSON.stringify(response));
    },

    onClose() {
      alert('User closed the widget.');
    },
  };

  const connect = new Connect('live_pk_VRkwrLzhC9cNbjn6YRXD', options);

  const onSubmit = e => {
    connect.open();
    e.preventDefault();
  };

  const handleResponse = code => {
    console.log(code);
  };

  useEffect(() => {
    connect.setup();
  }, [connect]);

  return (
    <section>
      <h3>Connect your account with Mono</h3>
      <button className={style.button} onClick={onSubmit} type='submit'>
        Submit
      </button>
    </section>
  );
};

export default ConnectAccount;
