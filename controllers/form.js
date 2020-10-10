const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.contactForm = (req, res) => {
  const { email, name, message } = req.body;

  const emailData = {
    to: process.env.EMAIL_TO,
    from: email,
    subject: `Contact from - ${process.env.APP_NAME}`,
    text: `Email received from contact form \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
    html: `
    <h4>Email received from contact form:</h4>
    <p>Sender name: ${name}</p>
    <p>Sender email: ${email}</p>
    <p>Sender message: ${message}</p>
    <hr/>
    <p>This email may contain sensitive information</p>
    <p>https://uclasecretariat.com</p>
    `,
  };
  sgMail
    .send(emailData)
    .then((sent) => {
      return res.json({
        success: true,
      });
    })
    .catch((error) => {
      console.log(error.response.body);
    });
};

exports.contactBlogAuthorForm = (req, res) => {
  const { authorEmail, email, name, message } = req.body;
  // console.log(req.body);

  let maillist = [authorEmail, process.env.EMAIL_TO];

  const emailData = {
    to: maillist,
    from: email,
    subject: `Someone messaged you from ${process.env.APP_NAME}`,
    text: `Email received from contact from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
    html: `
          <h4>Message received from:</h4>
          <p>name: ${name}</p>
          <p>Email: ${email}</p>
          <p>Message: ${message}</p>
          <hr />
          <p>This email may contain sensetive information</p>
          <p>https://seoblog.com</p>
      `,
  };

  sgMail
    .send(emailData)
    .then((sent) => {
      return res.json({
        success: true,
      });
    })
    .catch((error) => {
      console.log(error.response.body);
    });
};
