
const dotenv=require('dotenv')

dotenv.config()

module.exports={
    session:{
        secret:process.env.session_secret
    },
    connection:{
        password:process.env.db_dev_password||process.env.db_prod_password,
        user:process.env.db_dev_user||process.env.db_prod_user,
        host:process.env.db_dev_host||process.env.db_prod_host,
        database:process.env.db_dev_database||process.env.db_prod_database
    },
    mailGun:{
        userName:process.env.mailGun_userName,
        password:process.env.mailGun_password
    }
}