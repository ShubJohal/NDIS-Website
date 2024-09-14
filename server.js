const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS, etc.)
app.use(express.static(__dirname));

// Contact Us form submission
app.post('/send', (req, res) => {
    const { name, email, subject, message } = req.body;

    // Configure nodemailer
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'shubjohal@gmail.com', // Your Gmail
            pass: 'shuktppdvopduzmr'      // App password generated in Gmail
        }
    });

    // Email content
    let mailOptions = {
        from: email,
        to: 'shubjohal@gmail.com', // Your email address to receive messages
        subject: `Contact Us Form Submission: ${subject}`,
        text: `You have received a new message from ${name} (${email}):\n\n${message}`
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending message.');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Message sent successfully.');
        }
    });
});

// Referral form submission
app.post('/submit-referral', (req, res) => {
    const formData = req.body;

    // Generate PDF
    const doc = new PDFDocument({
        size: 'A4',
        margin: 50
    });

    const pdfPath = path.join(__dirname, `referral_${Date.now()}.pdf`);
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // Add logo to the header
    doc.image('images\smalllogo.jpg', 50, 45, { width: 100 })
        .fontSize(20)
        .text('For You For Life', 160, 50)
        .fontSize(10)
        .text('Email: info@foryouforlife.com | Phone: (123) 456-7890', 160, 70)
        .text('Website: www.foryouforlife.com', 160, 85);

    // Add pagination
    doc.on('pageAdded', () => {
        doc.image('images\smalllogo.jpg', 50, 45, { width: 100 });
        doc.fontSize(10).text(`Page ${doc.bufferedPageRange().count}`, 0, 10, { align: 'right' });
    });

    // Add headings and structure form data into sections
    doc.moveDown().fontSize(16).text('Referral Form Submission', { align: 'center' }).moveDown(2);

    doc.fontSize(14).text('Participant Details', { underline: true });
    doc.fontSize(12)
        .text(`Participant First Name: ${formData.firstName}`)
        .text(`Participant Last Name: ${formData.lastName}`)
        .text(`Date of Birth: ${formData.dob}`)
        .text(`Gender: ${formData.gender}`)
        .text(`Street: ${formData.street}`)
        .text(`Suburb: ${formData.suburb}`)
        .text(`State: ${formData.state}`)
        .text(`Postcode: ${formData.postcode}`)
        .text(`Contact Info: ${formData.contactInfo}`)
        .text(`Plan Start Date: ${formData.planStart}`)
        .text(`Plan End Date: ${formData.planEnd}`)
        .moveDown();

    doc.fontSize(14).text('Participant Strengths and Arrangements', { underline: true });
    doc.fontSize(12)
        .text(`Strengths: ${formData.strengths}`)
        .text(`Living Arrangements: ${formData.livingArrangements}`)
        .text(`NDIS Number: ${formData.ndisNumber}`)
        .text(`Primary Disability: ${formData.primaryDisability}`)
        .text(`Secondary Disabilities: ${formData.secondaryDisabilities}`)
        .text(`Communication: ${formData.communication}`)
        .moveDown();

    doc.fontSize(14).text('Funding and Service Information', { underline: true });
    doc.fontSize(12)
        .text(`Funding Allocated: ${formData.fundingAllocated}`)
        .text(`Hours / $ Amount Allocated: ${formData.fundingHours}`)
        .text(`Funding Arrangement: ${formData.fundingArrangement}`)
        .text(`Invoice Details: ${formData.invoiceDetails}`)
        .moveDown();

    doc.fontSize(14).text('Referral Reasons and Behaviors', { underline: true });
    doc.fontSize(12)
        .text(`Reason for Referral: ${formData.referralReason}`)
        .text(`Behaviors Of Concern: ${formData.behavioursOfConcern}`)
        .text(`Cultural Considerations: ${formData.culturalConsiderations}`)
        .moveDown();

    doc.fontSize(14).text('Interventions and Involvement', { underline: true });
    doc.fontSize(12)
        .text(`Who is Currently Involved: ${formData.currentInvolvement}`)
        .text(`Previous Interventions: ${formData.previousInterventions}`)
        .text(`Service Request: ${formData.serviceRequest}`)
        .text(`Safety Concerns: ${formData.safetyConcerns}`)
        .moveDown();

    doc.fontSize(14).text('Referrer Details', { underline: true });
    doc.fontSize(12)
        .text(`Referrer First Name: ${formData.referrerFirstName}`)
        .text(`Referrer Last Name: ${formData.referrerLastName}`)
        .text(`Role: ${formData.referrerRole}`)
        .text(`Organisation: ${formData.referrerOrganisation}`)
        .text(`Email: ${formData.referrerEmail}`)
        .text(`Phone: ${formData.referrerPhone}`)
        .text(`Date of Referral: ${formData.referralDate}`)
        .moveDown();

    doc.end();

    writeStream.on('finish', function () {
        // Once PDF is generated, send it via email
        sendEmailWithPDF(formData.referrerEmail, pdfPath, res);
    });
});

// Function to send email with PDF
function sendEmailWithPDF(toEmail, pdfPath, res) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'shubjohal@gmail.com', // Replace with your Gmail
            pass: 'shuktppdvopduzmr'  // Use App Password if using Gmail
        }
    });

    let mailOptions = {
        from: 'shubjohal@gmail.com',
        to: toEmail,
        subject: 'Referral Form Submission',
        text: 'Please find attached the referral form submission in PDF format.',
        attachments: [
            {
                filename: 'ReferralForm.pdf',
                path: pdfPath
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            fs.unlinkSync(pdfPath);  // Clean up PDF after sending email
            res.send('Referral form submitted successfully and email sent!');
        }
    });
}

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
