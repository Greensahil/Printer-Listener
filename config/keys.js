
const dotenv=require('dotenv')

dotenv.config()

dbState = process.env.dbState.toLowerCase();
console.log(`The database state is ${dbState}`)
module.exports={
    session:{
        secret:process.env.session_secret
    },
    connection:{
        password:(dbState == "prod") ? process.env.db_prod_password :process.env.db_dev_password,
        user:(dbState== "prod") ? process.env.db_prod_user:process.env.db_dev_user,
        host:(dbState== "prod") ? process.env.db_prod_host:process.env.db_dev_host,
        database:(dbState== "prod") ? process.env.db_prod_database:process.env.db_dev_database
    },
    mailGun:{
        userName:process.env.mailGun_userName,
        password:process.env.mailGun_password
    }
}





