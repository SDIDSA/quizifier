var app = require('express')();
var http = require('http').createServer(app);
var cors = require('cors');
app.use(cors());

let sha1 = require('js-sha1');

const { Pool, Client } = require('pg');

const extractData = (url) => {
    let arr = url.split(':');
    let sec = arr[2].split('@');
    let third = arr[3].split('/');
    return {
        username:arr[1].replace('//',''),
        password:sec[0],
        host:sec[1],
        port:parseInt(third[0]),
        database:third[1]
    };
}

let data = extractData(process.env.DATABASE_URL || 'postgres://yuswtvsojvyqsb:98382c1bf55abc5af1620d519230cf9b64c83704c80842ea0df124b4924375e3@ec2-34-194-198-176.compute-1.amazonaws.com:5432/df9lk9en8l2gu7');

console.log(data);

const forms = new Pool({
    user: data.username,
    host: data.host,
    database: data.database,
    password: data.password,
    port: data.port,
    ssl: { rejectUnauthorized: false }
});

let correct = sha1('sdidsad99');
console.log(correct);

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
        let id = await generateFormId();
        await forms.query(`insert into forms values('${id}','${data.title}','${data.description}')`);
        for(let i = 0;i<data.sections.length;i++) {
            await forms.query(`insert into section values('${id}',${i},'${data.sections[i].text}')`);
            for(let j = 0;j<data.sections[i].questions.length;j++) {
                await forms.query(`insert into question values('${id}',${i},'${j}','${data.sections[i].questions[j].text}',${data.sections[i].questions[j].points})`);
                for(let k = 0;k<data.sections[i].questions[j].answers.length;k++) {
                    await forms.query(`insert into answer values('${id}',${i},'${j}','${k}','${data.sections[i].questions[j].answers[k].text}',${data.sections[i].questions[j].answers[k].correct ? 1:0})`);
                }
            }
        }
        res.end(id);
    }
});

app.post('/getQuiz', async (req,res) => {
    let id = req.query.id;

    let fo = await forms.query(`select * from forms where id='${id}'`);

    if(fo.rows.length === 0) {
        res.end('not found');
    }else {
        let row = fo.rows[0];
        let form = {
            tit:row.tit,
            desc:row.desc,
            sections:[]
        }

        let sects = await forms.query(`select * from section where form_id='${id}'`);

        for(let i = 0; i<sects.rows.length; i++) {
            form.sections.push({
                pos:sects.rows[i].pos,
                tit:sects.rows[i].tit,
                questions:[]
            });
        }

        let questions = await forms.query(`select * from question where form_id='${id}'`);

        for(let i = 0; i<questions.rows.length;i++) {
            let section = questions.rows[i].section;
            form.sections[section].questions.push({
                pos:questions.rows[i].pos,
                text:questions.rows[i].text,
                points:questions.rows[i].points,
                answers:[]
            });
        }

        let answers = await forms.query(`select * from answer where form_id='${id}'`);

        for(let i = 0; i<answers.rows.length;i++) {
            let section = answers.rows[i].section;
            let question = answers.rows[i].question;
            form.sections[section].questions[question].answers.push({
                pos:answers.rows[i].pos,
                text:answers.rows[i].text,
                correct:answers.rows[i].correct
            });
        }

        res.json(form);
    }
    res.end('');
});

app.post('/submitAnswers', async (req,res) => {
    let data = JSON.parse(req.query.data);

    res.end(id);
})

http.listen(process.env.PORT || 4242, function(){
    console.log(`listening on *:${process.env.PORT || 4242}`);
});


const generateFormId = async ()=> {
    let id = "";
    let used = true;

    while(used) {
        id = randomString(10);
        used = await checkFormId(id);
    }

    return id;
}

const checkFormId = async (id)=> {
    let res = await forms.query(`select * from forms where id = '${id}'`);

    if(res.rowCount === 0) {
        return false;
    }else {
        return true;
    }
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