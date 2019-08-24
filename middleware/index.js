


const mysql = require('mysql');
const passport = require('passport');
const keys = require('../config/keys');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// const var1 = require('../routes/passport.js');
//all middleware object goes here

var middleware={}

const pool = mysql.createPool({
	connectionLimit: 10,
	host: keys.connection.host,
	user: keys.connection.user,
	password: keys.connection.password,
	database: keys.connection.database,
	dateStrings: true                        //Even when I cast datetime as date javascript still adds date at the end unless I return it as a string
})


//Adding this class so that I can use Promises on MySQL database. This class just wraps around the function and allows me to consume the promises

class Client {
    constructor( config ) {
		 this.pool = mysql.createPool({
			connectionLimit: 10,
			host: keys.connection.host,
			user: keys.connection.user,
			password: keys.connection.password,
			database: keys.connection.database,
			dateStrings: true                       
		})
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.pool.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.pool.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
}

//Middleware
middleware.isAdmin =function(req,res,next){
	//Check if the admin is set to true or not


	pool.query(`Select RoleID from userroles where UserID = ${req.user.id}`,function(err,rows,fields){
		if(err){
			console.log(err)
		}
		if(rows[0]){                  //This should not really happen, where the role is undefined. Every user should have a role, but checking it just in case
			if (rows[0].RoleID == 1){
				console.log(rows[0])
				console.log(req.user.id)
				return next()
			}
		}
		req.flash("message", "You need to have admin previledge to acccess this page")
		res.redirect('back');     //From express 4 onwards this should allow me to redirect to the same page the request came from.
	})
	
}

//This will be used to check weather a user is admin or not but unlike isAdmin this will not redirect back but will have next wheather or not the user is admin or not

middleware.checkAdmin=function(req,res,next){
	//Check if the admin is set to true or not

	if(req.user){
		pool.query(`Select RoleID from userroles where UserID = ${req.user.id}`,function(err,rows,fields){  
			if(err){
				console.log(err)
			}
			if(rows[0]){                  //This should not really happen, where the role is undefined. Every user should have a role, but checking it just in case
				if (rows[0].RoleID == 1){
					req.flash("checkAdmin","admin")
					return next()
				}
			}
			console.log("This user is not an admin")
			return next()     
		})
	}else{
		return next()
	}
	
	


}



//Middleware
middleware.isLoggedIn=function(req, res, next) {
	if (req.isAuthenticated()) {
		return next()

	}
	req.flash("message", "Please Login First!")
	res.redirect("/login")
}

module.exports = middleware;