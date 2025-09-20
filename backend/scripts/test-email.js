const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");

const TOKEN = "9b8b2e592bcd65340311a4ee693817ae";

const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
  })
);

const sender = {
  address: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};

const recipients = [
  "yateronald@gmail.com",
];

console.log("Testing Mailtrap email configuration...");
console.log("Sender:", sender);
console.log("Recipients:", recipients);
console.log("Token:", TOKEN ? "✓ Token provided" : "✗ No token");

transport
  .sendMail({
    from: sender,
    to: recipients,
    subject: "You are awesome!",
    text: "Congrats for sending test email with Mailtrap!",
    category: "Integration Test",
  })
  .then((result) => {
    console.log("✅ Email sent successfully!");
    console.log("Result:", result);
  })
  .catch((error) => {
    console.error("❌ Failed to send email:");
    console.error("Error:", error.message);
    console.error("Full error:", error);
  });