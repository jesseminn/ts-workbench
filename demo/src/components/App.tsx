import { useCount } from 'hello-npm-package';

const App: React.FC = () => {
    const { count, increment, decrement } = useCount(0);
    // const [count, setCount] = useState(0);

    return (
        <div>
            <p>Hello React!</p>
            <p>count: {count}</p>
            <button onClick={increment}>Increment</button>
            <button onClick={decrement}>Decrement</button>
        </div>
    );
};

export default App;
