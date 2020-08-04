const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'carlos.alonsogtz@hotmail.es',
        subject: 'Welcome!',
        text: `Welcome to the Task-App, ${name}.`
    })
}

const sendFarewellEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'carlos.alonsogtz@hotmail.es',
        subject: 'Tschüß!',
        text: `Ciao ciao, ${name}!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendFarewellEmail
}