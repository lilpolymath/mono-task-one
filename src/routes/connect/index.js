import { useState } from 'preact/hooks';
import style from './style.css'

const TodoForm = () => {
  const [value, setValue] = useState('');

  const onSubmit = e => {
    alert('Submitted a todo');
    e.preventDefault();
  };

  const onInput = e => {
    const { value } = e.target;
    setValue(value);
  };

  return (
    <form class={style.form} onSubmit={onSubmit}>
      <input type='text' value={value} onInput={onInput} />
      <p>You typed this value: {value}</p>
      <button type='submit'>Submit</button>
    </form>
  );
};

export default TodoForm;
