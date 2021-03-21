
export class SendEmail{
    private sender : any;
    private mailMounted : any;
    private nodemailer = require("nodemailer");

    constructor(to: string, subject: string, text: string)
    {
        require('dotenv').config();

        this.mailMounted = {
            'from': process.env.EMAIL_SENDER,
            to,
            subject,
            text,
        };
        this.setSender();
    }

    sendMail(){
        this.sender.sendMail(this.mailMounted, function(error){        
            if (error)
                console.log(error);
            else
                console.log('Email enviado com sucesso.');
        });
    }

    setSender(){
        console.log("Mail to send")
        this.sender = this.nodemailer.createTransport({
            host: "smtp.gmail.com",
            service: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth:{
                user: process.env.EMAIL_SENDER,
                pass: process.env.EMAIL_PW
            }
        });
    }
}

//  new SendEmail('dui.0312@hotmail.com','Teste SEND_MAIL',' TURURUUUUUUUU').sendMail();