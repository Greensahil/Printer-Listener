const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser')
const mysql = require('mysql');
const flash = require('connect-flash')
const passport = require('passport');
const cookieSession = require('cookie-session');

const dotenv = require('dotenv');


dotenv.config();

console.log(process.env.db_dev_user)


const keys = require('./config/keys');
const pool = require('./middleware/database')
const counter = require('./src/counter')

const Dymo = require('dymojs');
dymo = new Dymo();

const middleware = require('./middleware/index')


// cron.schedule("*/30 * * * * *", function() {
//     console.log("running a task every minute");
//   });


dotenv.config();

console.log(process.env.db_dev_user)
console.log(keys.connection.user)
//git test


app.set("view engine", "ejs")
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(flash())


//Setup public directory

app.use(express.static(__dirname + "/public"));


app.use(express.static(__dirname + "/public/src"));


//Chech the pool table
//Retrive Workstaion name from file
//Select ID,PrinterName,XML where Workstaion name =  workstation name from file
// Store PrtinerName and XML in a variable
//Find and replace XML details
//Go to PrinterQueue table and slect all orderNumber that matches the pritnerID (Maybe create a loop)
//Delete the printerID from the loop once the printing is done
//Get all the info from the orderDetauls table inner join orders table on orderID


async function checkPrintNeed() {
	let printerID, xml, printerName
	try {

		//Figure out a way to retrieve workstation name from file

		//Get ID, PrinterName and XML
		rows = await pool.query(`Select ID, Printer, XML from printer where Station = 'QC'`)
		printerID = rows[0].ID
		printerName = rows[0].Printer


		xml = rows[0].XML


		// console.log(xml)

		rows = await pool.query(`Select orderNumber from printerqueue where PrinterID = ${printerID}`)

		if (rows[0]) {
			for (let i = 0; i < rows.length; i++) {
				printLabel(rows[i].orderNumber, xml)
			}

		}


	} catch (err) {
		console.log(err)
	}


}


async function printLabel(orderNumber, xml) {

	try {
		rows = await pool.query(`select userName, partNumber, OrderDate from orders
                                  inner join orderDetail on orders.orderID = orderDetail.orderID
                                  inner join users on orderDetail.userID = users.ID
                                  inner join parts on parts.partID = orderDetail.partID
                                  where orders.orderNumber= '${orderNumber}';`)


		let qcNum = orderNumber
		let userName = rows[0].userName
		let partNumber = rows[0].partNumber
		let orderDate = rows[0].OrderDate.split(" ")[0] //Removing the minutes, seconds and milliseconds so that it fits in the label

		console.log(orderDate)


		console.log(qcNum)
		console.log(userName)
		console.log(orderDate)
		console.log(partNumber)


		mapObj = {
			XXXqcNumXXX: qcNum,
			XXXuserNameXXX: userName,
			XXXorderDateXXX: orderDate,
			XXXpartNumberXXX: partNumber,
		}

		labelXml = xml.replace(/XXXqcNumXXX|XXXuserNameXXX|XXXorderDateXXX|XXXpartNumberXXX/gi, function (matched) {
			return mapObj[matched]
		})

		console.log(labelXml)

		console.log(`PRINTS ${qcNum}`)

		// dymo.print('DYMO LabelWriter 4XL', labelXml)
		// .then((result) => {
		//   console.log(result);
		// })
		// .catch((err) => {
		//   throw err;
		// });


		await pool.query(`Delete from printerqueue where orderNumber = '${qcNum}'`)


	} catch (err) {
		console.log(err)
	}

}


// async function checkPrintNeed(){

//     try{
//         qc = await pool.query (`Select value from counters where type = "QC"`);
//         // currentQC =rows[0].value
//         // console.log(currentQC)

//         reprint = await pool.query(`Select value from reprint where type = "QC" `)
//         console.log(reprint[0].value)
//         if(currentQC != qc[0].value){
//           currentQC = qc[0].value
//           printLabel(currentQC)
//         }
//         if(reprintQC != reprint[0].value){
//           reprintQC = reprint[0].value
//           printLabel(reprintQC)
//         }

//     }

//     catch(err){
//         console.log(err)
//     }

// }

var printerResponseTime

setInterval(() => {
	pool.query(`Select value from printerconfig where config ='Response-time'`).then((rows) => {
			if (rows[0].value != printerResponseTime) {
				printerResponseTime = rows[0].value
				setInterval(() => {
					console.log(`Run every ${printerResponseTime} seconds`)
					checkPrintNeed()
				}, printerResponseTime * 1000);
			}
		})
		.catch((err) => {
			console.log(err)
		})
}, 2000);


//Configure passport global object

// passportConfig(passport);


app.use(cookieSession({
	maxAge: 24 * 60 * 60 * 1000, //Cookie takes one day to expire
	keys: [keys.session.secret] //HASH is an environemnt variable
}));

app.use(require("express-session")({
	secret: keys.session.secret,
	resave: false,
	saveUninitialized: false

}));

app.use(passport.initialize());
app.use(passport.session())
// require('./routes/passport.js');          //Passport configuaration stored in this file


app.post("/", (req, res) => {
	console.log('post request was sent from another nodejs severs')
})


process.on('unhandledRejection', (error, p) => { //I added this so that I can console log the unhandled rejection and where it is coming from. Before this I would just get UnhandledPromiseRejectionWarning: Unhandled promise rejection without knowing which promise was not handled
	console.log('=== UNHANDLED REJECTION ==='); // Not good to have undhandled promise rejection in code. This will just help me locate it incase here is one
	console.dir(error.stack);
});