const Discord = require("discord.js");
const fetch = require("node-fetch");
const Database = require("@replit/database");
const keepAlive = require("./server");

const db = new Database();
const client = new Discord.Client();

const token = process.env['alem-bot-token'];

const sadWords = ["sad", "depressed", "unhappy", "angry"];

const starterEncouragments = [ 
[0, " Cheer up!"],
[1, " Hang in there."],
[2, " You are a great person/bot."]
]
console.log(starterEncouragments);
db.get("encouragments").then(encouragments =>{
  if(!encouragments || encouragments.length < 1 ){
    db.set("encouragments", starterEncouragments);
  }
});

db.get("responding").then(value =>{
  if(value == null){
    db.set("responding", true)
  }
})

function updateEmcouragements(encouragingMessage){
  db.get("encouragments").then(encouragments =>{
    encouragments.push([encouragments.length, encouragingMessage]);
    db.set("encouragments", encouragments);
  });
}

function deleteEncouragement(index){
  db.get("encouragments").then(encouragments =>{
    if(encouragments.length > index){
      encouragments.splice(index, 1);
      db.set("encouragments", encouragments);
    }
  });
}

function getQuote(){
  return fetch("https://zenquotes.io/api/random")
    .then(res => {
      return res.json();
    })
    .then(data =>{
      return data[0] ["q"] + " -" + data[0]["a"]
    })
}

client.on("ready", ()=>{
  console.log(`Logged in as ${client.user.tag}!!`)
});

client.on("message", msg =>{
  if (msg.author.bot){
    return;
  }

  if (msg.content === "$inspire"){
    getQuote().then(quote => msg.channel.send(quote));
  }

  db.get("responding").then(responding =>{
    if(responding && sadWords.some(word => msg.content.includes(word))){
      db.get("encouragments").then(encouragments =>{
      const encouragment = encouragments[Math.floor(Math.random() * encouragments.length)];
      msg.reply(encouragment);
      })    
    }
  })

  if(msg.content.startsWith("$new")){
    encouragingMessage = msg.content.split("$new ")[1];
    updateEmcouragements(encouragingMessage);
    msg.channel.send("New encouraging message added.");
  }

  if(msg.content.startsWith("$del")){
  index = parseInt(msg.content.split("$del ")[1]);
  deleteEncouragement(index);
  msg.channel.send("Encouraging message deleted.");

  }

  if(msg.content.startsWith("$list")){
    db.get("encouragments").then(encouragments => {
      msg.channel.send(encouragments);
      /*
      let number = 0;
      for(let i = 0; i < encouragments.length; i++){
        
        msg.channel.send(number + "." + " " + encouragments[i]);
        number+= 1;
      } anterior bloque de codigo que use para mandar cada mensaje con su numero de indice, el problema es que lo enviaba 1 a 1 y */
    });
  }

  if(msg.content.startsWith("$responding")){
    value = msg.content.split("responding ")[1];

    if(value.toLowerCase() == "true"){
      db.set("responding", true);
      msg.channel.send("Responding is on.")
    } else{
      db.set("responding", false);
      msg.channel.send("Responding is off.")
    }
  }

});

keepAlive();
client.login(token);
