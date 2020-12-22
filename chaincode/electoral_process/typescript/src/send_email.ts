
export class SendEmail{
    private sender : any;
    private mailMounted : any;
    private nodemailer = require("nodemailer");

    constructor(from: string, to: string, subject: string, text: string)
    {
        this.mailMounted = {

            from,
            to,
            subject,
            text,
        };
        this.setSender(from);
    }

    sendMail(){
        this.sender.sendMail(this.mailMounted, function(error){        
            if (error)
                console.log(error);
            else
                console.log('Email enviado com sucesso.');
        });
    }

    setSender(email: string){
        console.log("Mail to send")
        this.sender = this.nodemailer.createTransport({
            host: "smtp.gmail.com",
            service: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth:{
                user: email,
                pass: '' 
            }
        });
    }
}

// new SendEmail('eduhenrique.a@gmail.com','eduardo.henriquealbuquerquedasilva@wexinc.com','Teste SEND_MAIL',' TURURUUUUUUUU').sendMail();