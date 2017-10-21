const TelegramBot = require('node-telegram-bot-api');
const json = require('./config.json');
var exec = require('child_process').exec;

const arisco = new TelegramBot(json.authorizationToken, { polling: true });
const INDEX_COMMAND = 1;

function execute(command, callback) {
    exec(command, function(error, stdout, stderr){ callback(error, stdout, stderr); });
}

arisco.onText(/\/raspberry (.+)/, (msg, match) => {
	const chatId = msg.chat.id;
	const command = match[INDEX_COMMAND];

	var getCustomCommand = () => {
		for(var i = 0; i < json.config.customCommands.length; i++) {
			if(json.config.customCommands[i][command] !== undefined) {
				return json.config.customCommands[i][command];
			}
		}
		return null;
	}

	var customCommand = getCustomCommand();

	if(customCommand !== null) {
		if(!json.config.adminUsers.includes(chatId)) { 
			arisco.sendMessage(chatId, 'You are not allowed to perform this command!');
			return;
		}
		
		console.log('Executing custom command: ', customCommand);
		execute(customCommand, function(error, stdout, stderr){
			arisco.sendMessage(chatId, '<code>' + stdout + stderr + '</code>', { parse_mode: 'HTML' });
		});
	}
	else {

		if(json.config.deniedCommands.includes(command) && 
			!json.config.adminUsers.includes(chatId)) {
			arisco.sendMessage(chatId, 'You are not allowed to perform this command!');
			return;
		}

		execute(command, function (error, stdout, stderr){
			arisco.sendMessage(chatId, '<code>' + stdout + stderr + '</code>', { parse_mode: 'HTML' });
		});

	}
});

arisco.onText(/\/selfie/, (msg, match) => {
	const chatId = msg.chat.id;
	var index = Math.round(Math.random() * (json.config.selfies.length - 0) + 0);

	if( index <= json.config.selfies.length)
		arisco.sendPhoto(chatId, json.config.selfies[index]);
});

arisco.on('message', (msg) => {
	console.log('Message received: ', msg);
});
