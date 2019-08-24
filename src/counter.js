//This module will contain function that will be used to retrieve the next number in the counters table. It also increments the last counter value by 1


const mysql = require('mysql');
const pool=require('../middleware/database')


module.exports= async function getNext(orderType){
	let newCounter
	let returnNumber
	try{
		if(orderType == 'QC'){                                                           //When doing Quality Check
			await pool.query(`Update counters set value = value + 1 where type = 'QC'`)
			newCounter = await pool.query(`Select value from counters where type = 'QC'`)
			returnNumber= 'QC - ' + newCounter[0].value
		}

		else if(orderType == 'Receive'){													//When an item ships
			 await pool.query(`Update counters set value = value + 1 where type = 'Receive'`)
			 newCounter = await pool.query(`Select value from counters where type = 'Receive'`)
			 returnNumber= 'Receive - ' + newCounter[0].value
		}
	
		else if(orderType == 'Shipper'){													//When an item ships
			await pool.query(`Update counters set value = value + 1 where type = 'Shipper'`)
			 newCounter = await pool.query(`Select value from counters where type = 'Shipper'`)
			 returnNumber= 'Ship - ' + newCounter[0].value
		}
	
		else if(orderType == 'Adjust'){														//When a manual inventory adjustment is made
			await pool.query(`Update counters set value = value + 1 where type = 'Adjust'`)
			newCounter =await pool.query(`Select value from counters where type = 'Adjust'`)
			returnNumber= 'Adj - ' + newCounter[0].value
		}

		else if(orderType == 'Assembly'){													//When a cardboard assembly is created
			await pool.query(`Update counters set value = value + 1 where type = 'Assembly'`)
			newCounter =await pool.query(`Select value from counters where type = 'Assembly'`)
			returnNumber= 'Assem - ' + newCounter[0].value
		}
		else if(orderType == 'Order'){
			await pool.query(`Update counters set value = value + 1 where type = 'Order'`)
			newCounter =await pool.query(`Select value from counters where type = 'Order'`)
			returnNumber= 'Order - ' + newCounter[0].value
		}
		else if(orderType == 'Pull-Order'){
			await pool.query(`Update counters set value = value + 1 where type = 'Pull-Order'`)
			newCounter =await pool.query(`Select value from counters where type = 'Pull-Order'`)
			returnNumber= 'Pull-Order - ' + newCounter[0].value
		}
		else if(orderType == 'Cardboard'){
			await pool.query(`Update counters set value = value + 1 where type = 'Cardboard'`)
			newCounter =await pool.query(`Select value from counters where type = 'Cardboard'`)
			returnNumber= 'Cardboard - ' + newCounter[0].value
		}
		else if(orderType == 'Dunnage'){
			await pool.query(`Update counters set value = value + 1 where type = 'Dunnage'`)
			newCounter =await pool.query(`Select value from counters where type = 'Dunnage'`)
			returnNumber= 'Dunnage - ' + newCounter[0].value
		}
		else if(orderType == 'Other'){
			await pool.query(`Update counters set value = value + 1 where type = 'Other'`)
			newCounter =await pool.query(`Select value from counters where type = 'Other'`)
			returnNumber= 'Other - ' + newCounter[0].value
		}
		else{
			throw new Error("Invalid orderType supplied to getNextNumber function")
		}
		
		return returnNumber
	}
	catch(err){
		console.log(err)
	}
}

//How to consume

//This function returns a promise that can be consumed with .then() or other promise consuming methods



//Example:

// counter('QC').then(val => {
//     console.log(val);
// }).catch(err => {
//     console.log(err);
// });