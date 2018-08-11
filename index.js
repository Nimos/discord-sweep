const Discord   = require('discord.js');
const fs        = require('fs');

const config = require('./config.json');
config.num_contexts = 0;

var dictionary = {
    "lines": {},
    "words": {}
};

var client;

// Initializes the bot
function startUp() {

    // Read dictionary file and parse lines
    loadDictionary();

    // Create discord client and connect
    client = new Discord.Client();

    // Set handlers for client events
    client.on('ready', () => {
      console.log(`Logged in as ${client.user.tag}!`);
    });

    client.on('message', handleMessage);


    // Log in to discord
    if (!config.discordToken) {
        console.log("ERROR: Please set a Discord API token in config.json!")
        console.log("You can create a token on https://discordapp.com/developers")
    } else {
        client.login(config.discordToken);
    }

    setInterval(saveDictionary, config.autosave_seconds*1000)
}       

// Reply to a message and/or learn its contents
function handleMessage(msg) {
    let reply = 0;
    let body = msg.content
    for (var t in config.triggers) {
        if (body.toLowerCase().includes(config.triggers[t].toLowerCase())) reply = 1;
        body = body.replace(config.triggers[t], "");
    }

    body = body.trim();

    if (msg.author != client.user && (reply || (Math.random()*100 < config.replyRate))) {
        response = buildReply(body);
        if (response && response != "") msg.reply(response);
    }

    if (config.learning && msg.author != client.user) {
        learnMessage(msg.content)
    }
}

// Load dictionary file from disk and learn lines
function loadDictionary() {
    try {
        var lines = fs.readFileSync(config.dictFile, "utf-8");
    } catch (e) {
        console.log("Could not read dictionary file", config.dictFile, ", creating a new one.")
        var lines = "";
    }

    lines = lines.split("\n");

    for (let l in lines) {
        learnLine(lines[l]);
    }
}


// Save dictionary lines to file
function saveDictionary() {
    try {
        var lines = [];
        for (var l in dictionary.lines) {
            lines.push(l);
        }
        fs.writeFileSync(config.dictFile, lines.join("\n"));
    } catch (e) {
        console.log("Could not open dictionary file", config.dictFile, ", can't save lines.")
    }
}


// Filter rules from SeeBorg's FilterMessage
function filterMessage(message) {
    message = message.replace("\t", " ");
    message = message.replace("\r", " ");
    message = message.replace("\"", "");
    message = message.replace("? ", "?.");
    message = message.replace("! ", "!.");
    return message.toLowerCase();
}

// Splits a message by punctuation and sends the individual sentences to learnLine
function learnMessage(message) {
    message = filterMessage(message);

    message = message.split(/[\.|\n]/)

    for (let m in message) {
        learnLine(message[m]);
    }
}

// Learns a new line
function learnLine(line) {

    // check to see if we've learned this line already
    if (dictionary.lines[line] != undefined) {
        dictionary.lines[line]++;
        return false;
    }

    // Mark line as known
    dictionary.lines[line] = 1;
    
    // For each word, remember its context
    let words = line.split(" ");
    for (let w in words) {
        if (dictionary.words[words[w]] != undefined) {
            dictionary.words[words[w]].push([line, w]);
        } else {
            dictionary.words[words[w]] = [[line, w]];
        }
    }
}


// Build a reply for a given message, according to SeeBorg's method
function buildReply(message) {
    let words = message.replace("?", "").split(" ")
    let known = []

    if (words.length == 0) return "";

    // Check for words we know
    for (let w in words) {
        if (dictionary.words[words[w]] != undefined) {
            known.push(words[w]);
        }
    }

    if (known.length == 0) return;

    // And select one known word at random to start building a reply
    var reply = [known[Math.floor(Math.random()*known.length)]]

    // Start building

    // build to left
    let done = false;
    while (!done) {
        var contexts = dictionary.words[reply[0]];
        var next = contexts[Math.floor(Math.random()*contexts.length)];
        var position = parseInt(next[1]);
        var ctxwords = next[0].split(" ");

        var depth = Math.floor(Math.random()*(config.max_context_depth-config.min_context_depth))+config.min_context_depth;
        for (let i = 1; i<=depth; i++) {

            if ((position-i) < 0) {
                done = true;
                break;
            } else {
                reply.unshift(ctxwords[position-i])
            }

            if (position-i == 0) {
                done = true;
                break;
            }
        }

    }

    // build to right
    done = false;
    while (!done) {
        var contexts = dictionary.words[reply[reply.length-1]];
        var next = contexts[Math.floor(Math.random()*contexts.length)];
        var position = parseInt(next[1]);
        var ctxwords = next[0].split(" ");

        let depth = Math.floor(Math.random()*(config.max_context_depth-config.min_context_depth))+config.min_context_depth;
        for (let i = 1; i<=depth; i++) {

            if ((position+i) >= ctxwords.length) {
                done = true;
                break;
            } else {
                reply.push(ctxwords[position+i])
            }
        }

    }

    return reply.join(" ");
}

startUp();