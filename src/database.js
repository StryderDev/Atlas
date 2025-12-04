const chalk = require('chalk');
const { SQL } = require('bun');

db_Spyglass = new SQL({
	adapter: 'mysql',
	hostname: Bun.env.DB_HOST,
	database: 'bread',
	username: Bun.env.DB_USER,
	password: Bun.env.DB_PASS,
	port: Bun.env.DB_PORT,
	max: 20,
	idleTimeout: 30,
	maxLifetime: 3600,
	connectionTimeout: 10,
	ssl: { rejectUnauthorized: false },

	onconnect: () => {
		console.log(chalk.green(`${chalk.bold('[SPYGLASS]')} Connected to the database successfully.`));
	},
	onerror: err => {
		console.log(chalk.red(`${chalk.bold('[SPYGLASS]')} Database connection error: ${err}`));
	},
});

module.exports = db_Spyglass();
