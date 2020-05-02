import React,{useState,useEffect} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams
} from "react-router-dom";
import axios from 'axios';

import './app.css';

const alpha = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z'.toUpperCase().split(",");
const univs = [
                'ESCF Constantine',
                'ESC Kolea',
                'EHEC Kolea ',
                'ESGEN Kolea',
                'ENSSEA Kolea',
                'ESE Oran',
                'ESM Tlemcen',
                'ESSG  Annaba'
              ];

const getCh = (score, total, choix) => {
  let moy = score * 20 / total;
  if(moy >= 15) {
    return univs[choix[0]];
  }else if(moy >= 10) {
    return univs[choix[1]];
  }else if(moy >= 8) {
    return univs[choix[2]];
  }else if(moy >= 5) {
    return univs[choix[3]];
  }else{
    return "Orienté vers l'Université";
  }
}

const Answer = (props) => {
  const selectAnswer = () => {
    props.selectAnswer(props.pos);
  }

  return <div className={`answer${props.answer === props.pos ? ' selectd':''}`} onClick={selectAnswer}>
    <span className='letter'>{alpha[props.pos]}<span className='six'><span className='shape'/></span></span>
    <span className='val'>{props.data.text}</span>
  </div>;
}

const Question = (props) => {
  const selectAnswer = (answer) => {
    props.selectAnswer(props.pos, answer);
  }

  return <div className='question'>
    <div className='top'>
      <span className='text'>{props.data.text}</span>
      <span className='points'>{props.data.points} points</span>
    </div>
    <hr/>
    {props.data.answers.map((val, index) => <Answer key={index} selectAnswer={selectAnswer} answer={props.answer} pos={index} data={val}/>)}
    <hr/>
    <div className='bottom'>
      <span className='id'>Question {props.pos + 1}</span>
    </div>
  </div>;
}

const Section = (props) => {
  const selectAnswer = (question, answer)=> {
    props.selectAnswer(props.pos, question, answer);
  }

  return <div className='section'>
    <div className='head'>{props.data.tit}</div>
    {props.data.questions.map((val,index) => <Question key={index} selectAnswer={selectAnswer} answer={props.answers[index]} pos={index} data={val}/>)}
  </div>;
}

const Open = (props) => {
  const [errorText, setErrortext] = useState('');
  const [error, setError] = useState(false);

  const scr = (val)=> {
    let elem = document.getElementById('head');
    if(val > 100) {
      elem.classList.add('collapsed');
    }else if(val < 64){
      elem.classList.remove('collapsed');
    }
  }

  const submit = () => {
    let res = true;
    props.answers.forEach(sec => {
      sec.forEach(ans => {
        if(ans === -1) {
          res = false;
        }
      })
    });
    if(!res) {
      setErrortext(`Vous n'avez pas répondu à toutes les questions`);
      setError(true);
    }else{
      setError(false);
      props.submitAnswers();
    }
  }

  return <div className='open' onScroll={(event)=>scr(event.target.scrollTop)}>
    <div id='head' className='header'>
      <span className='tit'>{props.tit}</span>
      <span className='desc'>{props.desc}</span>
    </div>

    {props.sections.map((val,index) => <Section key={index} selectAnswer={props.selectAnswer} answers={props.answers[index]} pos={index} data={val}/>)}
  
    <div className='bottom'>
      <span className={`error${error ? ' shown':''}`}>{errorText}</span>
      <button onClick={submit}>soumettre</button>
    </div>
  </div>;
}

const Correction = (props) => {
  const [tq, setTq] = useState(0);
  const [ca, setCa] = useState(0);
  const [sc, setSc] = useState(0);
  const [tot, setTot] = useState(0);

  useEffect(()=> {
    let tqn = 0;
    let coa = 0;
    let score = 0;
    let total = 0;

    for(let a = 0;a<props.sections.length;a++) {
      let section = props.sections[a];
      let answers = props.answers[a];

      for(let i = 0;i<section.questions.length;i++) {
        tqn++;

        let question = section.questions[i];
        let cor = false;

        for(let j = 0;j<question.answers.length;j++) {
          let answer = question.answers[j];

          if(answer.correct === 1) {
            if(answers[i] === j) {
              coa++;
              cor = true;
            }
          }
        }

        total += question.points;
        score += cor ? question.points : 0;
      }
    }

    setTq(tqn);
    setCa(coa);
    setSc(score);
    setTot(total);

  }, [props])

  const isCorrect = (section, quest) => {
    for(let i = 0;i<props.sections[section].questions[quest].answers.length;i++) {
      if(props.sections[section].questions[quest].answers[i].correct === 1) {
        if(props.answers[section][quest] === i) {
          return true;
        }else{
          return false;
        }
      }
    } 
  }

  return <div className='correction'>
    <div className='summary'>
      <span className='title'>{props.tit}</span>
      <span className='line'>
        Vous avez
        <span className='number good'>{ca}</span>
        {`bonne${ca === 1 ? '':'s'} réponse${ca === 1 ? '':'s'}`} et
        <span className='number bad'>{tq - ca}</span>
        {`mauvaise${(tq - ca) === 1 ? '':'s'} réponse${(tq - ca) === 1 ? '':'s'}`}.
      </span>
      <span className='line'>
        Vous avez obtenu
        <span className={`number ${sc >= tot / 2 ? 'good':'bad'}`}>{sc * 20 / tot}</span>
        /<span className='number'>20</span>points.
      </span>

      <span className='line'>
        Vous aurez
        <span className='number good'> {getCh(sc, tot,props.choix)}.</span>
      </span>
    </div>

    <div className='detailed'>
      {props.sections.map((section, si) => {
        return <div className='section'>
          <div className='head'>{section.tit}</div>
          {section.questions.map((question, qi) => {
            return <div key={qi} className={`question ${isCorrect(si, qi) ? 'correct':'incorrect'}`}>
              <div className='top'>
                <span className='txt'>{question.text}</span>
                <span className='points'>{question.points} points</span>
              </div>

              {question.answers.map((answer, ai) => {
                return <div key={ai} className={`answer${answer.correct === 1 ? ' correct':' incorrect'}${props.answers[si][qi] === ai ? ' selected':''}`}>{alpha[ai] + ' - ' + answer.text}</div>;
              })}
            </div>;
          })}
        </div>
      })}
    </div>
  </div>;
}

const Choix = (props) => {
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState(false);

  const submit = ()=> {
    let res = props.submitChoix();
    if(res === 'ok') {
      setError(false);
    }else{
      setErrorText(res);
      setError(true);
    }
  }

  return <div className='choix'>
    <span className='hint'>
      Classer les écoles dans lesquelles vous souhaitez étudier
    </span>

    {[0,1,2,3].map((val) => {
      return <div key={val} className='line'>
        <span className='num'>{val + 1}</span>
        <select value={props.choix[val]} onChange={(event)=> props.setChoix(val, event.target.value)}>
          <option value={-1} hidden>-- Sélectionner une école --</option>
          {univs.map((univ, uin) => <option key={uin} value={uin}>{univ}</option>)}
        </select>
      </div>
    })}
    <div className='bottom'>
      <span className={`error${error ? ' shown':''}`}>{errorText}</span>
      <button onClick={submit}>Suivant</button>
    </div>
  </div>
}

const Quiz = (props) => {
  let { id } = useParams();
  let { action } = useParams();

  const [choix, setChoix] = useState([-1,-1,-1,-1]);

  const [state, setState] = useState('choix');

  const [tit, setTit] = useState('');
  const [desc, setDesc] = useState('');
  const [sections, setSections] = useState([]);
  const [answers, setAnswers] = useState([]);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    axios.post(props.api + 'getQuiz?id='+id).then(data => {
      let quiz = data.data;
      console.log(quiz);
      setTit(quiz.tit);
      setDesc(quiz.desc);
      setSections(quiz.sections);

      if(action === 'open'){
        let ans = [];
        for(let i = 0;i<quiz.sections.length;i++) {
          let secAns = [];

          for(let j = 0; j<quiz.sections[i].questions.length;j++) {
            secAns.push(-1);
          }

          ans.push(secAns);
        }
        setAnswers(ans);
      }else if(action==='correct'){
        let str = window.location.href;
        let params = str.split('?')[1].split('&');

        for(let i = 0;i<params.length;i++) {
          params[i] = params[i].split("=")[1];
        }

        setAnswers(JSON.parse(params[0]));
        setChoix(JSON.parse(params[1]));
      }
      
      document.title = quiz.tit;

      setReady(true);
    });
  }, []);

  const selectAnswer = (section, question, answer)=> {
    let newAnswers = [];
    for(let i = 0;i<answers.length;i++){
      newAnswers.push(answers[i]);
    }
    newAnswers[section][question] = answer;
    setAnswers(newAnswers);
  }

  const submitAnswers = ()=> {
    document.location = `/${id}/correct?answers=${JSON.stringify(answers)}&choix=${JSON.stringify(choix)}`;
  }

  const setCh = (pos, ch) => {
    let newChoix = [];
    for(let i = 0;i<choix.length;i++){
      if(i === pos) {
        newChoix.push(parseInt(ch));
      }else{
        newChoix.push(choix[i]);
      }
    }
    setChoix(newChoix);
  }

  const submitChoix = ()=> {
    let allSel = true;
    for(let i = 0;i<choix.length;i++) {
      if(choix[i] === -1) {
        allSel = false;
      }
    }

    if(!allSel) {
      return 'Vous n\'avez pas sélectionné tous les choix';
    }

    let moreThanOnce = true;

    for(let i = 0;i<choix.length;i++) {
      for(let j = 0;j<choix.length;j++) {
        if(i !== j && choix[i] === choix[j]) {
          moreThanOnce = false;
        }
      }
    }

    if(!moreThanOnce) {
      return 'vous ne pouvez pas sélectionner la même école plus d\'une fois';
    }

    setState('quiz');

    return 'ok';
  }

  return <div className="app">
      {ready && action === 'open' ? (
          state==='choix' ? <Choix setChoix={setCh} submitChoix={submitChoix} choix={choix}/>:<Open submitAnswers={submitAnswers} selectAnswer={selectAnswer} answers={answers} tit={tit} desc={desc} sections={sections}/>
        ):''}
      {ready && action === 'correct' ? <Correction choix={choix} answers={answers} tit={tit} desc={desc} sections={sections}/>:''}
      {!ready ? <div className='loading'>
        <span className='loader'/>
      </div>:''}
  </div>;
}

function App(props) {
  return (
    <Router>
        <Switch>
          <Route path="/:id/:action" children={<Quiz api={props.api}/>} />
        </Switch>
    </Router>
  );
}

export default App;