import React, {useState} from 'react';
import './auth.css';
import axios from 'axios';
import sha1 from 'js-sha1';

const Field = (props) => {
    const[val, setVal] = useState('');
    const[shown, setShown] = useState(false);

    const onChange = (event)=> {
        setVal(event.target.value);
        props.changed(event.target.value);
    }

    const toggleShwon = (event)=> {
        setShown(!shown);
    }

    return <div className={`field ${shown ? 'shown':'hidden'}`}>
        <div className='wrapper'>
            <input placeholder=' ' type='text' className='text' onChange={onChange} value={val}/>
            <input placeholder=' ' type='password' className='password' onChange={onChange} value={val}/>
            <span className='placeholder'>{props.placeholder}</span>
            <span className='bot'/>
            <span className='underbot'/>
            <div onClick={toggleShwon} className='icon'>
                <img alt='eye' className='eye' src={require(`./images/eye.png`)} />
                <img alt='lid' className='lid' src={require(`./images/lid.png`)} />
            </div>
        </div>
    </div>;
}

const Auth = (props)=> {
    const [authKey, setAuthKey] = useState('');
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [loading, setLoading] = useState(false);

    const changed = (val)=> {
        if(val === ''){
            setAuthKey('');
        }else{
            setAuthKey(sha1(val));
        }
        setError(false);   
    }

    const submit =()=> {
        if(authKey===''){
            setErrorText('le mot de passe est requis');
            setError(true);
        }else{
            setError(false);
            setLoading(true);
            axios.post(props.api + 'auth?key='+authKey).then((data) => {
                setLoading(false);
                if(data.data === false){
                    setErrorText('Mot de passe incorrect');
                    setError(true);
                }else{
                    props.enter(authKey);
                }
            });
        }
    }

    return <div className='auth'>
        <div className='root'>
            <span className='hint'>vous devez être authentifié avant de pouvoir créer et modifier des formulaires</span>
            <Field changed={changed} placeholder={'Mot de passe'} />
            {!loading ? <span className={`error${!error ?' empty':''}`}>{errorText}</span>:''}
            {!loading ? <button onClick={submit}>
                Soumettre
               
                <span className='after' />
            </button> :''}
            
            {loading ? <span className='loading' />:''}
        </div>
        <span className='credits'>
            <a rel='noopener noreferrer' target='_blank' href='https://facebook.com/Sneeki.Breaki'>
                lukas owen
                <span className='after'/>
            </a>
            <span className='init'>made by</span>
        </span>
    </div>;
}

export default Auth;