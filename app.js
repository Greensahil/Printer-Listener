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

var reprintQC



async function checkPrintNeed(){
 
    try{
        qc = await pool.query (`Select value from counters where type = "QC"`);
        // currentQC =rows[0].value
        // console.log(currentQC)

        reprint = await pool.query(`Select value from reprint where type = "QC" `)
        console.log(reprint[0].value)
        if(currentQC != qc[0].value){
          currentQC = qc[0].value
          printLabel(currentQC)
        }
        if(reprintQC != reprint[0].value){
          reprintQC = reprint[0].value
          printLabel(reprintQC)
        }
        
    }

    catch(err){
        console.log(err)
    }

}


async function printLabel(qcValue){

  try{
    rows = await pool.query (`select userName, partNumber, OrderDate from orders
                                  inner join orderDetail on orders.orderID = orderDetail.orderID
                                  inner join users on orderDetail.userID = users.ID
                                  inner join parts on parts.partID = orderDetail.partID
                                  where orders.orderNumber= 'QC-${qcValue}';`)




            let qcNum= 'QC-' + qcValue
            let userName = rows[0].userName
            let partNumber=rows[0].partNumber
            let orderDate = rows[0].OrderDate

            
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
                    <String xml:space="preserve">${userName}
                    ${orderDate} 
                    ${partNumber}
                    </String>
                      <Attributes>
                        <Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" />
                        <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
                      </Attributes>
                    </Element>
                  </StyledText>
                </TextObject>
                <Bounds X="58" Y="86" Width="3125" Height="922" />
              </ObjectInfo>
              <ObjectInfo>
                <BarcodeObject>
                  <Name>Barcode</Name>
                  <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
                  <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
                  <LinkedObjectName />
                  <Rotation>Rotation0</Rotation>
                  <IsMirrored>False</IsMirrored>
                  <IsVariable>True</IsVariable>
                  <GroupID>-1</GroupID>
                  <IsOutlined>False</IsOutlined>
                  <Text>${qcNum}</Text>
                  <Type>Code128Auto</Type>
                  <Size>Medium</Size>
                  <TextPosition>Bottom</TextPosition>
                  <TextFont Family="Arial" Size="7.3125" Bold="False" Italic="False" Underline="False" Strikeout="False" />
                  <CheckSumFont Family="Arial" Size="7.3125" Bold="False" Italic="False" Underline="False" Strikeout="False" />
                  <TextEmbedding>None</TextEmbedding>
                  <ECLevel>0</ECLevel>
                  <HorizontalAlignment>Center</HorizontalAlignment>
                  <QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" />
                </BarcodeObject>
                <Bounds X="58" Y="1111.18115234375" Width="3123.77954101563" Height="600.944885253906" />
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
                <Bounds X="150" Y="150" Width="787.605633802817" Height="787.605633802817" />
              </ObjectInfo>
            </DieCutLabel>`

            console.log(`PRINTS`)
        
        dymo.print('DYMO LabelWriter 4XL', labelXml)
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          throw err;
        });

  }
  catch(err){
    console.log(err)
  }

}


var printerResponseTime 

setInterval(() => {
  pool.query(`Select value from printerconfig where config ='Response-time'`).then((rows)=>{
      if(rows[0].value != printerResponseTime){
          printerResponseTime = rows[0].value
      }
  })
  .catch((err)=>{
    console.log(err)
  })
}, 2000);






setInterval(() => {
  console.log(`Run every 2 seconds`)
  checkPrintNeed()
}, printerResponseTime);



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