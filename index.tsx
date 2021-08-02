import { render } from 'react-dom';
import './index.scss';

// Components
import App from './src/App';

const body = document.querySelector('body');

render(<App />, body);
