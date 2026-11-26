//Importação de cada uma das aplcações

const dns = require('dns');

dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
]);


const express = require('express');
const ejs = require('ejs');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const mongoose = require('mongoose');

//Criação do servido
const app = express();
const server = http.createServer(app);

//Link do socket IO
const io = socketIO(server);

//Configuração das pastas
console.log(path.join(__dirname));

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

//Conexão com o Mongo DB
function connectDB() {
    let dbUrl = 'mongodb+srv://juniorbj2604_db_user:fXVCGTrMWhurR4bA@clusterbacana.xnfyqcf.mongodb.net/';

    mongoose.connect(dbUrl);
    mongoose.connection.on('error',console.error.bind(console, 'Erro de conexão:'));
    mongoose.connection.once('open', function () {console.log('Atlas MongoDB conectado!');});
}

connectDB();

//Estrura dos Posts
let Post = mongoose.model('Post', {
    titulo: String,
    post: String,
    data_hora: String
});

//Conexão com o Socket.IO
io.on('connection', socket => {
    console.log('Usuário conectado: ' + socket.id);

    //Executa a busca por mensagens anteriores assim que o chat é iniciado
    Post.find({})
        .then(posts => {
            socket.emit('previousMessage', posts);
        })
        .catch(err => {
            console.log('Erro ao buscar posts: ' + err);
        });

    //Recebimento de uma nova mensagem
    socket.on('sendMessage', data => {
        //Criação de um documento para ser salvo no MongoDB
        let post = new Post(data);

        post.save()
            .then(postSalvo => {
                socket.broadcast.emit('receivedMessage', postSalvo);
            })
            .catch(err => {
                console.log('Erro ao salvar post: ' + err);
            });
    });
});

server.listen(3000, () => {
    console.log(
        'Chat rodando aqui -> http://localhost:3000'
    );
});
