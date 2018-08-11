# Discord Sweep

Sweep is a discord port in javascript of the popular IRC Bot SeeBorg found at https://github.com/hmage/seeborg 

This project aims to closely mimic the learning and answering mechanisms of the original bot and to preserve its quirks.  
Full feature parity is not an intended goal and as such you won't find certain features such as configuration by chat commands.

## Installation
```
git clone https://github.com/nimos/discord-sweep
cd discord-sweep
npm install
# Edit the contents of config.json
node sweep.js
```

## Configuration

| Key | default | description |
|-----|---------|-------------|
|discordToken| "" | Your bot's discord API token. You can get one at https://discordapp.com/developers |
|dictFile| "lines.txt" | The file where the bot saves its learned lines |
|triggers| ["sweep"] | Words that the bot always responds to |
|learning| true | If the bot should learn new words or not |
|replyRate| 0 | The percentage of message to randomly respond to. |
|max_context_depth| 15 | How many words to choose from each context at most. Lower settings will lead to more unique responses but answers will make less sense |
|min_context_depth| 5  | How many words to choose from each context at minimum. |
|autosave_seconds| 60 | How often it writes the learned lines to disk |
