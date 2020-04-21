import React, {useState} from 'react';
import './app.css';
import Auth from './auth.js';
import Session from './session.js';

let api = "https://quizifier-server.herokuapp.com/"

const App = (props)=> {
    const [out, setOut] = useState(true);
    const [authKey, setAuthKey] = useState('');

    const enter = (key)=> {
        setOut(false);
        setAuthKey(key);
    }

    const badKey = () => {
        setOut(true);
    }

    return <div className='app'>
        {out ? <Auth enter={enter} api={api}/>:<Session badKey={badKey} authKey={authKey} api={api}/>}
    </div>;
}

export default App;