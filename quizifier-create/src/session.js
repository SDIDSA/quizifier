import React, {useState} from 'react';
import './session.css';
import axios from 'axios';

const copyToClipboard = str => {
    var copyText = document.getElementById("quizlink");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
};

const createAnswer = ()=> {
    return {
        text:'',
        correct:true,
    }
}

const createQuestion = ()=> {
    return {
        text:'',
        answers:[createAnswer()],
        points:1
    };
}

const Answer = (props)=> {
    const deleteAnswer = () => {
        props.deleteAnswer(props.pos);
    }

    const setText = (txt)=> {
        props.setAnswer(props.pos, txt);
    }

    const setCorrect = ()=> {
        props.setCorrect(props.pos);
    }

    const alpha = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p'];
    return <div className='answer'>
        <span>{alpha[props.pos]} - </span>
        <input value={props.data.text} onChange={(event) => {setText(event.target.value)}} placeholder='entrez la réponse ici' />
        <span className={`stat${props.data.correct ? ' correct':''}`} onClick={setCorrect}/>
        {props.pos > 0 ? <span className='delete' onClick={deleteAnswer}/>:''}
    </div>;
}

const Question = (props) => {

    const incPoints = ()=> {
        props.incPoints(props.pos);
    }

    const decPoints = ()=> {
        props.decPoints(props.pos);
    }

    const setText = (val) => {
        props.updateText(props.pos, val);
    }

    const addAnswer = () => {
        props.addAnswer(props.pos);
    }

    const deleteAnswer = (index) => {
        props.deleteAnswer(props.pos, index);
    }

    const setAnswer = (index, text) => {
        props.setAnswer(props.pos, index, text);
    }

    const setCorrect = (index) => {
        props.setCorrect(props.pos, index);
    }

    return <div className='question'>
        <div className='top'>
            <textarea value={props.data.text} onChange={(event)=> {setText(event.target.value)}} className='questText' placeholder='entrez la question ici'/>
            <div className='points'>
                <span className='dec' onClick={decPoints}>-</span>
                <span className='val'> {props.data.points}</span>
                <span className='inc' onClick={incPoints}>+</span>
            </div>
        </div>
        
        <hr />

        <div className='answers'>
            {props.data.answers.map((val,index)=> <Answer setCorrect={setCorrect} setAnswer={setAnswer} deleteAnswer={deleteAnswer} key={index} pos={index} data={val}/>)}
            <button className='add' onClick={addAnswer}>
                ajouter une réponse
            </button>
        </div>

        <hr />

        <div className='bottom'>
            <span className='pos'>Question {props.pos + 1}</span>
            {props.pos > 0 ? <span className='delete' onClick={()=>props.deleteSelf(props.pos)}>
                <span className='icon'/>
                <span className='hint'>Supprimer</span>
            </span>:''}
        </div>
    </div>;
}

const Create = (props) => {
    const [tit, setTit] = useState('');
    const [desc, setDesc] = useState('');

    const [questions, setQuestions] = useState([createQuestion()]);

    const [id, setId] = useState('');

    const [state, setState] = useState('title');

    const changeState = (state) => {
        setState(state);
    }

    const addQuest = () => {
        setQuestions(prevState => (
           [...prevState, createQuestion()]
        ))
    }

    const updateText = (index, text) => {
        let newQuestions = [];
        for(let i = 0;i<questions.length;i++){
            newQuestions.push(questions[i]);
            if(i === index) {
                newQuestions[i].text = text;
            }
        }
        setQuestions(newQuestions);
    }

    const incPoints = (index) => {
        let newQuestions = [];
        for(let i = 0;i<questions.length;i++){
            newQuestions.push(questions[i]);
            if(i === index) {
                newQuestions[i].points++;
            }
        }
        setQuestions(newQuestions);
    }

    const decPoints = (index) => {
        let newQuestions = [];
        for(let i = 0;i<questions.length;i++){
            newQuestions.push(questions[i]);
            if(i === index) {
                newQuestions[i].points--;
            }
        }
        setQuestions(newQuestions);
    }

    const deleteQuest = (index) => {
        let newQuestions = [];
        for(let i = 0;i<questions.length;i++){
            if(i !== index){
                newQuestions.push(questions[i]);
            }
        }
        setQuestions(newQuestions);
    }

    const addAnswer = (index) => {
        let newQuestions = [];
        for(let i = 0;i<questions.length;i++){
            newQuestions.push(questions[i]);
            if(i === index) {
                let answer = createAnswer();
                answer.correct =false;
                newQuestions[i].answers.push(answer);
            }
        }
        setQuestions(newQuestions);
    }

    const deleteAnswer = (question,answer) => {
        let newQuestions = [];
        for(let i = 0;i<questions.length;i++){
            newQuestions.push(questions[i]);
            if(i === question) {
                let oldAnswers = questions[i].answers;
                let newAnswers = [];
                for(let j = 0;j<oldAnswers.length;j++) {
                    if(j !== answer) {
                        newAnswers.push(oldAnswers[j]);
                    }
                }
                newQuestions[i].answers = newAnswers;
            }
        }
        setQuestions(newQuestions);
    }

    const setAnswer = (question, answer, txt) => {
        let newQuestions = [];
        for(let i = 0;i<questions.length;i++){
            newQuestions.push(questions[i]);
            if(i === question) {
                newQuestions[i].answers[answer].text = txt;
            }
        }
        setQuestions(newQuestions);
    }

    const setCorrect = (question, answer) => {
        let newQuestions = [];
        for(let i = 0;i<questions.length;i++){
            newQuestions.push(questions[i]);
            if(i === question) {
                for(let j = 0;j<questions[i].answers.length;j++) {
                    newQuestions[i].answers[j].correct = false;
                }
                newQuestions[i].answers[answer].correct = true;
            }
        }
        setQuestions(newQuestions);
    }

    const submit = ()=>  {
        let data = JSON.stringify({key:props.authKey,title: tit,description: desc,questions:questions});
        axios.post(props.api + 'create?data=' + encodeURIComponent(data))
            .then(data=> {
                let res = data.data;
                if(res === 'bad_key') {
                    props.badKey();
                }else{
                    setId(res);
                    setState('link');
                }
            });
    }

    return <div className='create'>
        {state==='title' ? <span className='back' onClick={()=>props.changeState('home')}/>:''}
        {state==='title' ? <span className='header'>création de quiz</span>:''}
        {state==='title' ? <input value={tit} onChange={(event)=> {setTit(event.target.value)}} type='text' placeholder='titre du quiz' className='title' />:''}
        {state==='title' ? <textarea value={desc} onChange={(event)=> {setDesc(event.target.value)}} placeholder='description du quiz' className='description'/>:''}
        {state==='title' ? <button onClick={()=> changeState('questions')}>Suivant <span className='after'/></button>:''}      

        {state==='questions' ? <div className='questions'>
            <span className='back' onClick={()=>changeState('title')}/>
            <span className='titDisp'>{tit}</span>
            <div className='top'>
                <button className='addQuest' onClick={addQuest}>
                    ajouter
                    <span className='after'/>
                </button>
                <button className='submit' onClick={submit}>
                    soumettre
                    <span className='after'/>
                </button>
            </div>
            <div className='qlist'>
                {
                questions.map((val,index) => <Question setCorrect={setCorrect} setAnswer={setAnswer} deleteAnswer={deleteAnswer} addAnswer={addAnswer} incPoints={incPoints} decPoints={decPoints} updateText={updateText} deleteSelf={deleteQuest} key={index} pos={index} data={val}/>)
                }
            </div>
        </div> : ''}

        {state==='link' ? 
            <div className='link'>
                <span className='hint'>Votre quiz a été créé avec succès, utilisez ce lien pour le partager</span>
                <input id='quizlink' className='href' value={'https://quizifier.herokuapp.com/'+id+'/open'} readOnly/>
                <button className='copy' onClick={copyToClipboard}>Copier le lien<span className='after'></span></button>
            </div> : ''}
    </div>;
}

const Home = (props) => {
    return <div className='home'>
    <button className='create' onClick={()=>props.changeState('create')}>
        créer un quiz
        <span className='icon'/>
        <span className='after'/>
    </button>
</div>;
}

const Session = (props)=> {
    const [quizes, setQuizes] = useState([]);
    const [state, setState] = useState('home');

    const changeState = (newState) => {
        setState(newState);
    }

    return <div className='session'>
        {state === 'home' ? 
            <Home changeState={changeState}/>
            :
            (state === 'create' ? 
                <Create changeState={changeState} badKey={props.badKey} api={props.api} authKey={props.authKey}/>
                :
                '')}
    </div>;
}

export default Session;