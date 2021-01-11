import { render } from 'react-dom';
import './style.scss';

// Components
import App from './lib/App';

const body = document.querySelector('body');

render(<App />, body);
