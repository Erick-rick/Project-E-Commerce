const mongoose = require("mongoose"), Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { builtinModules } = require("module");
const secret = require("../config").secret;


const UsuarioSchema = new mongoose.Schema ({
    nome: {
        type: String,
        required: [true, "não pode ficar vazio."]
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        require: [true, "Não pode ficar vazia"],
        index: true,
        match: [/\S+@\S+\.\S+/, 'é invalido.']
    },
    loja: {
        type: Schema.Types.ObjectId,
        ref: "Loja",
        require: [true, "Não pode ficar vazia"],
    },
    permissao: {
        type: Array,
        default: ["cliente"]
    },
    hash: String,
    salt: String,
    recovery: {
        type: {

            token: String,
            data: Date
        },
        default: {}
    }
}, {timestamps: true });

//Validar o campo que são unique
UsuarioSchema.plugin(uniqueValidator, { message: "Já esta sendo utilizado!"});

//Criar senha para o usuario 
UsuarioSchema.methods.setSenha = function(password) {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex"); 
    //10000 - vezes de o valor vai ser misturado para combinação do hash, com padrao de 512 caracteres
};

// Valida senha do usuario 
UsuarioSchema.methods.validarSenha = function(password){
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
    return hash === this.hash;
};


UsuarioSchema.methods.gerarToken = function(){
    const hoje = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 15);
    //há cada 15 dias um novo token é gerado

    return jwt.sign({
        id: this._id,
        email: this.email,
        nome: this.nome,
        exp: parseFloat(exp.getTime() / 1000, 10)
    }, secret);
};

//Enviar o token p/ o usuário 
UsuarioSchema.methods.enviarAuthJSON = function(){
    return{
        nome: this.nome,
        email: this.email,
        loja: this.loja,
        role: this.permissao, //role = a permissão em ingles
        token: this.gerarToken()
    };
};

//Recuperar senha
UsuarioSchema.methods.criaTokenRecuperacaoSenha = function(){
    this.recovery = {};
    this.recovery.token = crypto.randomBytes(16).toString("hex");
    this.recovery.date = new Date( new Date().getTime() + 24*60*60*1000 ); //24hr*60min*60sec*1000milisec
    return this.recovery;
};

UsuarioSchema.methods.finalizarTokenRecuperacaoSenha = function(){
    this.recovery = { token: null, date: null };
    return this.recovery;
};

module.exports = mongoose.model("Usuario", UsuarioSchema)


