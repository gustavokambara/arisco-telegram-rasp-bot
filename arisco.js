const auth = require('./authtoken.json');
const config = require('./config.json');
const token = auth.token;
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token, { polling: true });
const exec = require('child_process').exec;

var allowedUsers = [112559128, 139443673, 11504381, 478389691];
const adminUsers = [112559128, 139443673]
const deniedCommands = ['rm', 'rmdir', 'rm -rf'];
const selfies = ['assets/arisco1.jpeg', 'assets/arisco2.jpeg']

function execute(command, callback) {
    exec(command, function(error, stdout, stderr){ callback(error, stdout, stderr); });
}

bot.onText(/\/raspberry (.+)/, (msg, match) => {
	const chatId = msg.chat.id;
	const command = match[1];

	console.log(msg);

	switch(command) {
		case 'getroms':
			if(!adminUsers.includes(chatId)) return;
			bot.sendMessage(chatId, 'Hold on, I\'m getting the roms...');

			execute('cd /opt/roms && curl \' + config.dropboxFolderUrl + \' -O -J -L &> /dev/null;', function(error, stdout, stderr){
				bot.sendMessage(chatId, 'I got the roms! Have fun');

				execute('cd /opt/roms; unzip -n roms.zip; rm -rf roms.zip', (error1, stdout1, stderr1) => {
					console.log('error: ', error1);
					console.log('stdout: ', stdout1);
				});
			});

			break;

		default:
			if(deniedCommands.includes(command) && 
				!adminUsers.includes(chatId)){
				bot.sendMessage(chatId, 'You are not allowed to perform this command!', {parse_mode: 'HTML'});
			}
			else{
				execute(command, (error, stdout, stderr) => {
					var out = stdout + stderr;
					bot.sendMessage(chatId, '<code>' +  out + '</code>', {parse_mode: 'HTML'});
				});
			}
			
	}
});

bot.onText(/\/selfie/, (msg, match) => {
	const chatId = msg.chat.id;
	var index = Math.round(Math.random() * (selfies.length - 0) + 0);
	bot.sendPhoto(chatId, selfies[index]);
});

bot.on('message', (msg) => {
	const chatId = msg.chat.id;
	console.log('Message received: ', msg);
});
