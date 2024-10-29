const mysql = require('mysql2/promise');

class Database{
    constructor(){
        this.connection = null;
    }

    async connect() {
        try {
            this.connection = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'transfertalk'
            });
            console.log('Connected to mysql as id ' + this.connection.threadId);
        } catch (error) {
            console.error('DB connection failed: ', error);
            throw error
        }
    }

    getConnection(){
        if(!this.connection){
            throw new Error('Database is not connected!');
        }
        return this.connection;
    }

    async query(sql, params){
        const conn = await this.connect();
        const [results] = await conn.execute(sql, params);
        return results;
    }
}

module.exports = new Database();