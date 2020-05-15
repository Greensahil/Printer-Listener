const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser')
const mysql = require('mysql');
const flash = require('connect-flash')
const passport = require('passport');
const cookieSession = require('cookie-session');
const puppeteer = require('puppeteer');
let childProcess = require('child_process');

const dotenv = require('dotenv');
let fs = require('fs');
dotenv.config();

console.log(process.env.db_dev_user)

app.use(morgan('dev'))

//Setup public directory

app.use(express.static(__dirname+ "/public"));


app.use(express.static(__dirname+ "/public/src"));

const keys = require('./config/keys');
const pool = require('./middleware/database')
const counter = require('./src/counter')

//const Dymo = require('dymojs');
const Dymo = require('./myDymo')
let dymo = new Dymo();





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



async function checkBOLNeed() {
	let printerID, printerName
	try {

		//Figure out a way to retrieve workstation name from file
		// dymo.getPrinters()
		// 	.then((printersResponseText) => {
		// 		expect(printersResponseText).to.not.be.undefined;
		// 		expect(printersResponseText.length).to.be.greaterThan(0);
		// 		done();
		// 	});
		// printersname = await dymo.getPrinters()
		// console.log(printersname)
		//Get ID, PrinterName and XML
    	rows = await pool.query(`Select ID, Printer, XML from printer where Station = 'BOL'`)
		printerID = rows[0].ID
		printerName = rows[0].Printer


	// 	xml = rows[0].XML


	// 	// console.log(xml)

		rows = await pool.query(`Select orderNumber from printerqueue where PrinterID = ${printerID}`)
    	//console.log(rows)
		if (rows[0]) {
			for (let i = 0; i < rows.length; i++) {
				printPDF(rows[i].orderNumber)
				//printLabel(rows[i].orderNumber, xml,'DYMO LabelWriter 4XL (Copy 1)')				
			}
		}
	
	} catch (err) {
		console.log(err)
	}


}


async function checkPrintNeed() {
	let printerID, xml, printerName
	try {
    rows = await pool.query(`Select ID, Printer, XML from printer where Station = 'QC'`)
		printerID = rows[0].ID
		printerName = rows[0].Printer


		xml = rows[0].XML


		// console.log(xml)

		rows = await pool.query(`Select orderNumber from printerqueue where PrinterID = ${printerID}`)
    	console.log(rows)
		if (rows[0]) {
			for (let i = 0; i < rows.length; i++) {
				printLabel(rows[i].orderNumber, xml,printerName)
				//printLabel(rows[i].orderNumber, xml,'DYMO LabelWriter 4XL (Copy 1)')				
			}
		}
	} catch (err) {
		console.log(err)
	}


}

// dymo.getPrinters().then(function(data){
// 	console.log(data)
// })

async function printLabel(orderNumber, xml,printerName) {

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

		// console.log(orderDate)


		// console.log(qcNum)
		// console.log(userName)
		// console.log(orderDate)
		// console.log(partNumber)


		mapObj = {
			XXXQCNUMXXX: qcNum,
			XXXuserNameXXX: userName,
			XXXorderDateXXX: orderDate,
			XXXPARTNUMBERXXX: partNumber,
		}

		labelXml = xml.replace(/XXXQCNUMXXX|XXXuserNameXXX|XXXorderDateXXX|XXXPARTNUMBERXXX/gi, function (matched) {
			return mapObj[matched]
		})

		// console.log(labelXml)

		dymo.print(printerName, labelXml).
		then(async (result) =>{
			await pool.query(`Delete from printerqueue where orderNumber = '${qcNum}'`)
			console.log(result)
			} 
		);

		// dymo.print(printerName, labelXml)
		// .then((result) => {
		//   console.log(printerName)
		//   console.log(result);
		// })
		// .catch((err) => {
		//   throw err;
		// });

	} catch (err) {
		console.log(err)
	}

}

// async function printBOL(orderNumber,printerName) {

// 	try {
// 		printPDF(orderNumber)
// 	} catch (err) {
// 		console.log(err)
// 	}

// }



async function printPDF(orderNumber) {
	try {
		const browser = await puppeteer.launch({
			headless: true
		});
		const page = await browser.newPage();
		await page.goto(`http://localhost:9000/BOL?orderNumber=${orderNumber}`, {
			waitUntil: 'networkidle0'
		});
		// const pdf = await page.pdf({ format: 'A4' });
		const pdfConfig = {
			path: 'BOL.pdf', // Saves pdf to disk. 
			format: 'A4',
			printBackground: true,
			margin: { // Word's default A4 margins
				top: '2.54cm',
				// bottom: '2.54cm',
				left: '0 cm',
				right: '0 cm'
			}
		};

		await page.emulateMedia('screen');
		const pdf = await page.pdf(pdfConfig); // Return the pdf buffer. Useful for saving the file not to disk. 
		await browser.close();


		// childProcess.exec('PDFtoPrinter.exe "BOL.pdf"', function (err, stdout, stderr) {
		// 	if (err) {
		// 		console.error(err);
		// 		return;
		// 	}
		// 	fs.unlink('BOL.pdf', function (err) {
		// 		if (err && err.code == 'ENOENT') {
		// 			// file doens't exist
		// 			console.info("File doesn't exist, won't remove it.");
		// 		} else if (err) {
		// 			// other errors, e.g. maybe we don't have enough permission
		// 			console.error("Error occurred while trying to remove file");
		// 		} else {
		// 			console.info(`removed`);
		// 		}
		// 	});
		// 	console.log(stdout);
		// 	// process.exit(0);// exit process once it is opened
		// 	// }) 

		// 	console.log(`${orderNumber} saved to the folder`)

		// 	return pdf;
		// })
	} catch (err) {
		console.log(err)
	}

}

let printerResponseTime = 2;


setInterval(() => {
	pool.query(`Select value from defaultConfig where config ='Response-time'`).then((rows) => {
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


setInterval(() => {
	checkBOLNeed()
}, 5000);



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


app.get('/BOL', async (req, res) => {
	let orderNumber = req.query.orderNumber    
	console.log(orderNumber)
	try{

		orderID = await pool.query(`Select orderID from orders where orderNumber = '${orderNumber}'`)
		//console.log(`Select orderID from orders where orderNumber = '${orderNumber}'`)
		templateData = await pool.query(`Select orders.*,Sum(QtyShipped) as QtyShipped,partNumber from orders 
					   left join orderdetail on orders.orderID = orderdetail.orderID	
					   left join parts on parts.partID = orderdetail.partID
					   where orders.orderID = ${orderID[0].orderID}
					   group by partNumber`)	
					   	
		//console.log(templateData)

		let customerOrderNumber = await pool.query(`Select orderNumber from orders where fulfillID = ${orderID[0].orderID}`)

		//console.log(`Select orderNumber from orders where fulfillID = ${orderID[0].orderID}`)
		// console.log(customerOrderNumber)

		res.render('BOLTemplate.ejs', {template:templateData,customerOrderNumber:customerOrderNumber[0].orderNumber})
		
		await pool.query(`Delete from printerqueue where orderNumber = '${orderNumber}'`)

	}
	catch(err){
		console.log(err)
	}
    
})

app.listen(process.env.PORT||9000,()=>{
    console.log('Server is running on 9000!')
})


process.on('unhandledRejection', (error, p) => { //I added this so that I can console log the unhandled rejection and where it is coming from. Before this I would just get UnhandledPromiseRejectionWarning: Unhandled promise rejection without knowing which promise was not handled
	console.log('=== UNHANDLED REJECTION ==='); // Not good to have undhandled promise rejection in code. This will just help me locate it incase here is one
	console.dir(error.stack);
});


// 

// labelXml = labelXml.Remove(0, _byteOrderMarkUtf8.Length);




// dymo.print('DYMO LabelWriter 4XL (Copy 1)', labelXml).then(result => console.log(result));


// var printJob = label.printAndPollStatus(printer.name, null, labelSet.toString(), function(printJob, printJobStatus)
// {
//    // output status
//    var statusStr = 'Job Status: ' + printJobStatus.statusMessage;
//    var result = (printJobStatus.status != dymo.label.framework.PrintJobStatus.ProcessingError 
//                 && printJobStatus.status != dymo.label.framework.PrintJobStatus.Finished);

//    // reenable when the job is done (either success or fail)
//    printButton.disabled = result;

//    return result;           
// }, 1000);

// console.log(printJob)