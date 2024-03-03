const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const path = require("path");
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.post("/api/submit-form", upload.single("file"), (req, res) => {
    const formData = req.body;
    const uploadedFile = req.file;

    const recipientEmail = formData.email;

    const mailOptions = {
        from: process.env.EMAIL_USER, // Update with a valid email address
        to: recipientEmail,
        subject: "Form Submission with Attachment",
        text: JSON.stringify(formData),
        attachments: [
            {
                filename: uploadedFile.originalname,
                content: uploadedFile.buffer,
            },
        ],
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error("Error sending email:", error);
            return res.status(500).json({ error: "Error sending email." });
        } else {
            console.log("Email sent:", info.response);
            res.json({
                message: "Form submitted successfully and email sent.",
                formData: formData,
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
