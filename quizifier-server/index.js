var app = require('express')();
var http = require('http').createServer(app);
var cors = require('cors');
app.use(cors());

let sha1 = require('js-sha1');

const sqlite3 = require('sqlite3').verbose();

let forms = new sqlite3.Database('./forms.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
});

let correct = sha1('sdidsad99');

const verifyKey = (key)=> {
    return String(key) === String(correct);
}

app.get('/', (req,res)=> {
    res.end('nothing to see here');
});

app.post('/auth', (req,res) => {
    setTimeout(()=> {
        res.end(verifyKey(req.query.key) ? 'true':'false');
    }, 500);
});

app.post('/create', async (req,res) => {
    let data = JSON.parse(decodeURIComponent(req.query.data));
    if(verifyKey(data.key)) {
        let id = await generateQuizId();

        let success = true;
        
        await forms.run(`insert into quiz values('${id}',"${data.title}","${data.description}")`, [], function(err){
            if(err) {
                console.log(`insert into quiz values('${id}',"${data.title}","${data.description}")`)
                console.log(err);
                success = false;
            }
        });

        if(!success) {
            res.end('fail');
            return;
        }

        for(let i = 0;i<data.questions.length;i++) {
            let quest = data.questions[i];

            await forms.run(`insert into question values('${id}',${i},${quest.points},"${quest.text}")`, [], function(err){
                if(err) {
                    console.log(`insert into question values('${id}',${i},${quest.points},"${quest.text}")`)
                    console.log(err);
                    success = false;
                }
            });

            for(let j = 0;j<quest.answers.length;j++) {
                let answer = quest.answers[j];
    
                await forms.run(`insert into answer values('${id}',${i},${j},${answer.correct ? 1:0},"${answer.text}")`, [], function(err){
                    if(err) {
                        console.log(`insert into answer values('${id}',${i},${j},${answer.correct ? 1:0},"${answer.text}")`)
                        console.log(err);
                        success = false;
                    }
                });
            }
        }

        if(!success) {
            res.end('fail');
            return;
        }

        res.end(id);
    }else{
        res.end('bad_key');
    }
});

app.post('/getQuiz', async (req,res) => {
    let id = req.query.id;

        forms.all(`select * from quiz where id='${id}'`,[], (err, quizes) => {
            if(quizes.length === 0) {
                res.end('not found');
            }else {
                let title = quizes[0].title;
                let description = quizes[0].description;
    
                forms.all(`select * from question where quiz_id='${id}' order by pos`, [], (err, quests) => {
                    if(quests.length === 0) {
                        res.end('no questions');
                    }else {
                        let questions = [];
                        quests.forEach(quest => {
                            questions.push(
                                {
                                    text:quest.question,
                                    points:quest.points,
                                    answers:[]
                                });
                        });
    
                        forms.all(`select * from answer where quiz_id='${id}' order by question_pos,pos`, [], (err, ans) => {
                            ans.forEach(answer => {
                                console.log(answer.question_pos);
                                questions[answer.question_pos].answers.push(
                                    {
                                        text:answer.answer,
                                        correct:answer.correct
                                    });
                            });
                            let qu = {id:id, title:title, description:description, questions:questions};
                            res.json(qu);
                        });
                    }
                });
            }
        });
});

app.post('/submitAnswers', async (req,res) => {
    let data = JSON.parse(req.query.data);
    
    let id = await generateAnswerId(data.id);

    res.end(id);
})

http.listen(process.env.PORT || 4242, function(){
    console.log(`listening on *:${process.env.PORT || 4242}`);
});

const generateAnswerId = async (quizid) => {
    let potentialId = '';
    let used = true;
    while(used) {
        potentialId = randomString(6);
        used = await checkAnswerId(potentialId,quizid);
    }
    return potentialId;
}

const checkAnswerId = async (id,quizid) => {
    let res = false;
    await forms.all("SELECT * FROM answers where quiz_id='"+quizid+"'", function(err,rows){
        if(err) return 'error';
        rows.forEach(function (row) { 
            if(row.id === id) {
                res = true;
            }
        });
    });
    return res;
}

const generateQuizId = async () => {
    let potentialId = '';
    let used = true;
    while(used) {
        potentialId = randomString(6);
        used = await checkQuizId(potentialId);
    }
    return potentialId;
}

const checkQuizId = async (id) => {
    let res = false;
    await forms.all("SELECT * FROM quiz", function(err,rows){
        if(err) return 'error';
        rows.forEach(function (row) { 
            if(row.id === id) {
                res = true;
            }
        });
    });
    return res;
}

const randomString = (length) => {
    let validChars = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,0,1,2,3,4,5,6,7,8,9'.split(',');
    let res = '';
    for(let i = 0;i<length;i++) {
        let index = parseInt(Math.random() * validChars.length).toFixed(0);
        res = res + validChars[index];
    }
    return res;
}