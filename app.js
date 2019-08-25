const express =require('express');
const app =express();
const morgan=require('morgan');
const bodyParser=require('body-parser')
const mysql = require('mysql');
const flash =require('connect-flash')
const passport=require('passport');
const cookieSession=require('cookie-session');

const dotenv=require('dotenv');





dotenv.config();

console.log(process.env.db_dev_user)


const keys = require('./config/keys');
const pool = require('./middleware/database')
const counter = require('./src/counter')

const Dymo = require('dymojs');
dymo = new Dymo();

const middleware=require('./middleware/index')




// cron.schedule("*/30 * * * * *", function() {
//     console.log("running a task every minute");
//   });


dotenv.config();

console.log(process.env.db_dev_user)
console.log(keys.connection.user)
//git test


app.set("view engine", "ejs")
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(flash())


//Setup public directory

app.use(express.static(__dirname+ "/public"));


app.use(express.static(__dirname+ "/public/src"));









var currentQC 




async function checkPrintNeed(){

    try{
        rows = await pool.query (`Select value from counters where type = "QC"`)

        if(currentQC != rows[0].value){
            currentQC = rows[0].value
            console.log(currentQC)
            let qcNum= 'asdasd'
            let userName = 'asdasdasd'           
            console.log(`IT SHOULD BE PRINTING NOW`)
            var labelXml = `<?xml version="1.0" encoding="utf-8"?>
            <DieCutLabel Version="8.0" Units="twips">
              <PaperOrientation>Portrait</PaperOrientation>
              <Id>Small30334</Id>
              <IsOutlined>false</IsOutlined>
              <PaperName>30334 2-1/4 in x 1-1/4 in</PaperName>
              <DrawCommands>
                <RoundRectangle X="0" Y="0" Width="3240" Height="1800" Rx="270" Ry="270" />
              </DrawCommands>
              <ObjectInfo>
                <TextObject>
                  <Name>Text</Name>
                  <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
                  <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
                  <LinkedObjectName />
                  <Rotation>Rotation0</Rotation>
                  <IsMirrored>False</IsMirrored>
                  <IsVariable>True</IsVariable>
                  <GroupID>-1</GroupID>
                  <IsOutlined>False</IsOutlined>
                  <HorizontalAlignment>Center</HorizontalAlignment>
                  <VerticalAlignment>Middle</VerticalAlignment>
                  <TextFitMode>ShrinkToFit</TextFitMode>
                  <UseFullFontHeight>True</UseFullFontHeight>
                  <Verticalized>False</Verticalized>
                  <StyledText>
                    <Element>
                      <String xml:space="preserve">QC NUM: ${qcNum}
            Verfied by : ${userName}
            
            </String>
                      <Attributes>
                        <Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" />
                        <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
                      </Attributes>
                    </Element>
                  </StyledText>
                </TextObject>
                <Bounds X="58" Y="86" Width="3123.77957447352" Height="1627" />
              </ObjectInfo>
              <ObjectInfo>
                <ImageObject>
                  <Name>GRAPHIC</Name>
                  <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
                  <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
                  <LinkedObjectName />
                  <Rotation>Rotation0</Rotation>
                  <IsMirrored>False</IsMirrored>
                  <IsVariable>False</IsVariable>
                  <GroupID>-1</GroupID>
                  <IsOutlined>False</IsOutlined>
                  <Image>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</Image>
                  <ScaleMode>Uniform</ScaleMode>
                  <BorderWidth>0</BorderWidth>
                  <BorderColor Alpha="255" Red="0" Green="0" Blue="0" />
                  <HorizontalAlignment>Center</HorizontalAlignment>
                  <VerticalAlignment>Center</VerticalAlignment>
                </ImageObject>
                <Bounds X="636.760563380284" Y="934.225352112678" Width="2018.02816901409" Height="720" />
              </ObjectInfo>
            </DieCutLabel>`;
        
        dymo.print('DYMO LabelWriter 450', labelXml)
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          throw err;
        });
        }
        
    }

    catch(err){
        console.log(err)
    }

}




setInterval(() => {
  console.log(`Run every 5 seconds`)
  checkPrintNeed()
}, 5000);





//Configure passport global object

// passportConfig(passport);


app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,        //Cookie takes one day to expire
    keys: [keys.session.secret]          //HASH is an environemnt variable
}));

app.use(require("express-session")({
    secret:keys.session.secret,
    resave:false,
    saveUninitialized:false

}));

app.use(passport.initialize());
app.use(passport.session())
// require('./routes/passport.js');          //Passport configuaration stored in this file



app.post("/",(req,res)=>{
    console.log('post request was sent from another nodejs severs')
})



process.on('unhandledRejection', (error, p) => {                 //I added this so that I can console log the unhandled rejection and where it is coming from. Before this I would just get UnhandledPromiseRejectionWarning: Unhandled promise rejection without knowing which promise was not handled
    console.log('=== UNHANDLED REJECTION ===');                  // Not good to have undhandled promise rejection in code. This will just help me locate it incase here is one
    console.dir(error.stack);
  });