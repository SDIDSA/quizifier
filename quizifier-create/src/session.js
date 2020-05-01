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
        correct:false,
    }
}

const createQuestion = ()=> {
    return {
        text:'',
        answers:[createAnswer()],
        points:1
    };
}

const createSection = ()=> {
    return {
        text:'',
        questions:[createQuestion()]
    }
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
        {props.size > 1 ? <span className='delete' onClick={deleteAnswer}/>:''}
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
            {props.data.answers.map((val,index)=> <Answer size={props.data.answers.length} setCorrect={setCorrect} setAnswer={setAnswer} deleteAnswer={deleteAnswer} key={index} pos={index} data={val}/>)}
            <button className='add' onClick={addAnswer}>
                ajouter une réponse
            </button>
        </div>

        <hr />

        <div className='bottom'>
            <span className='pos'>Question {props.pos + 1}</span>
            {props.size > 1 ? <span className='delete' onClick={()=>props.deleteSelf(props.pos)}>
                <span className='icon'/>
                <span className='hint'>Supprimer</span>
            </span>:''}
        </div>
    </div>;
}

const Section = (props)=> {

    const deleteSection = () => {
        props.deleteSection(props.pos);
    }

    const addQuest = () => {
        props.addQuest(props.pos);
    }

    const updateText = (question, text) => {
        props.updateText(props.pos, question, text);
    }

    const incPoints = (question) => {
        props.incPoints(props.pos, question);
    }

    const decPoints = (question) => {
        props.decPoints(props.pos, question);
    }

    const deleteQuest = (question) => {
        props.deleteQuest(props.pos, question);
    }

    const addAnswer = (question) => {
        props.addAnswer(props.pos, question);
    }

    const deleteAnswer = (question, answer) => {
        props.deleteAnswer(props.pos, question, answer);
    }

    const setAnswer = (question, answer, txt) => {
        props.setAnswer(props.pos, question, answer, txt);
    }

    const setCorrect = (question, answer) => {
        props.setCorrect(props.pos, question, answer);
    }

    const changed = (event) => {
        props.updateSection(props.pos, event.target.value);
    }

    return <div className='section'>
        <div className='head'>
            <button onClick={addQuest}>Ajouter<span class='ad'>une question</span></button>
            <button className={props.size === 1 ? 'dis':''} onClick={deleteSection}>Supprimer<span class='ad'>la section</span></button>
            <input placeholder='Nom de la section' onChange={changed} value={props.data.text}></input>
        </div>
        {props.data.questions.map((val,index) => <Question size={props.data.questions.length} setCorrect={setCorrect} setAnswer={setAnswer} deleteAnswer={deleteAnswer} addAnswer={addAnswer} incPoints={incPoints} decPoints={decPoints} updateText={updateText} deleteSelf={deleteQuest} key={index} pos={index} data={val}/>)}
    </div>;
}

const Create = (props) => {
    const [tit, setTit] = useState('');
    const [desc, setDesc] = useState('');

    const [sections, setSections] = useState([createSection()]);

    const [id, setId] = useState('');

    const [state, setState] = useState('title');

    const [loading, setLoading] = useState(false);

    const changeState = (state) => {
        setState(state);
    }

    const addSection = ()=> {
        setSections(prevState => ([...prevState, createSection()]));
    }

    const deleteSection = (section) => {
        let newSex = [];
        for(let i = 0;i<sections.length;i++){
            if(i !== section){
                newSex.push(sections[i]);
            }
        }
        setSections(newSex);
    }

    const updateSection = (section, text) => {
        let newSex = [];
        for(let i = 0;i<sections.length;i++){
            newSex.push(sections[i]);
            if(i === section){
                newSex[i].text = text;
            }
        }
        setSections(newSex);
    }

    const addQuest = (section) => {
        let newSex = [];
        for(let i = 0;i<sections.length;i++){
            newSex.push(sections[i]);
            if(i === section){
                newSex[i].questions.push(createQuestion());
            }
        }
        setSections(newSex);
    }

    const updateText = (section, question, text) => {
        let newSex = [];
        for(let i = 0;i<sections.length;i++){
            newSex.push(sections[i]);
            if(i === section){
                newSex[i].questions[question].text = text;
            }
        }
        setSections(newSex);
    }

    const incPoints = (section, question) => {
        let newSex = [];
        for(let i = 0;i<sections.length;i++){
            newSex.push(sections[i]);
            if(i === section){
                newSex[i].questions[question].points++;
            }
        }
        setSections(newSex);
    }

    const decPoints = (section, question) => {
        let newSex = [];
        for(let i = 0;i<sections.length;i++){
            newSex.push(sections[i]);
            if(i === section){
                newSex[i].questions[question].points--;
            }
        }
        setSections(newSex);
    }

    const deleteQuest = (section, question) => {
       let newSex = [];
        for(let i = 0;i<sections.length;i++){
            if(i !== section){
                newSex.push(sections[i]);
            }else {
                let newSection = {
                    text:sections[i].text,
                    questions:[]
                };
                for(let j = 0;j<sections[i].questions.length;j++) {
                    if(j !== question) {
                        newSection.questions.push(sections[i].questions[j]);
                    }
                }
                newSex.push(newSection);
            }
        }
        setSections(newSex);
    }

    const addAnswer = (section, question) => {
        let newSex = [];
        for(let i = 0;i<sections.length;i++){
            newSex.push(sections[i]);
            if(i === section){
                newSex[i].questions[question].answers.push(createAnswer());
            }
        }
        setSections(newSex);
    }

    const deleteAnswer = (section, question, answer) => {
        let newSex = [];
        for(let i = 0;i<sections.length;i++){
            if(i !== section){
                newSex.push(sections[i]);
            }else {
                let newSection = {
                    text:sections[i].text,
                    questions:[]
                };
                for(let j = 0;j<sections[i].questions.length;j++) {
                    if(j !== question) {
                        newSection.questions.push(sections[i].questions[j]);
                    }else{
                        let newQuestion = {
                            text:sections[i].questions[j].text,
                            answers:[],
                            points:sections[i].questions[j].points
                        };

                        for(let k = 0;k<sections[i].questions[j].answers.length;k++) {
                            if(k !== answer) {
                                newQuestion.answers.push(sections[i].questions[j].answers[k]);
                            }
                        }

                        newSection.questions.push(newQuestion);
                    }
                }
                newSex.push(newSection);
            }
        }
        setSections(newSex);
    }

    const setAnswer = (section, question, answer, txt) => {
        let newSex = [];
        for(let i = 0;i<sections.length;i++){
            newSex.push(sections[i]);
            if(i === section){
                newSex[i].questions[question].answers[answer].text = txt;
            }
        }
        setSections(newSex);
    }

    const setCorrect = (section, question, answer) => {
        let newSex = [];
        for(let i = 0;i<sections.length;i++){
            newSex.push(sections[i]);
            if(i === section){
                newSex[i].questions[question].answers[answer].correct = !newSex[i].questions[question].answers[answer].correct;
            }
        }
        setSections(newSex);
    }

    const submit = ()=>  {
        setLoading(true);
        let data = JSON.stringify({key:props.authKey,title: tit,description: desc,sections:sections});
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
                <button className='addQuest' onClick={addSection}>
                    ajouter
                    <span className='after'/>
                </button>
                <button className={`submit${loading ? ' dis':''}`} onClick={submit}>
                    soumettre
                    <span className='after'/>
                </button>
                <span className={`load${loading ? ' dis':''}`}>Loading...</span>
            </div>
            <div className='qlist'>
                {
                sections.map((val,index) => <Section size={sections.length} updateSection={updateSection} addQuest={addQuest} setCorrect={setCorrect} setAnswer={setAnswer} deleteAnswer={deleteAnswer} addAnswer={addAnswer} incPoints={incPoints} decPoints={decPoints} updateText={updateText} deleteQuest={deleteQuest} deleteSection={deleteSection} key={index} pos={index} data={val}/>)
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