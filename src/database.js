var db;
const chalk = require('chalk');
const dotenv = require('dotenv');
var database = require('mysql2');

dotenv.config();

function databaseConnection() {
	if (!db) {
		db = database.createPool({
			host: process.env.DB_HOST,
			database: process.env.DB_NAME,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			port: process.env.DB_PORT,
			waitForConnections: true,
			connectionLimit: 15,
			queueLimit: 0,
			maxIdle: 15,
			idleTimeout: 30000,
			enableKeepAlive: true,
			ssl: { rejectUnauthorized: false },
		});

		db.getConnection(err => {
			if (err) {
				console.log(chalk.red(`${chalk.bold('[REAPER]')} Error connecting to database: ${err}`));
			} else {
				console.log(chalk.green(`${chalk.bold('[REAPER]')} Connected to database!`));
			}
		});
	}

	return db;
}

module.exports = databaseConnection();
