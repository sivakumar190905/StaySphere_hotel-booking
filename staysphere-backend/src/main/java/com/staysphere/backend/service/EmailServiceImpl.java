package com.staysphere.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Override
    public void sendEmail(String to, String subject, String body) {
        String format = "\n" +
                "======================================================================\n" +
                "STAYSPHERE EMAIL DISPATCH SERVICE\n" +
                "======================================================================\n" +
                "TO:      {}\n" +
                "SUBJECT: {}\n" +
                "BODY:\n" +
                "{}\n" +
                "======================================================================\n";
        logger.info(format, to, subject, body);
    }

    @Override
    public void sendPasswordResetCode(String to, String code) {
        String timestamp = java.time.LocalDateTime.now().toString().substring(0, 19);
        String format = "\n" +
                "======================================================================\n" +
                "EMAIL VERIFICATION\n" +
                "Recipient: {}\n" +
                "Verification Code: {}\n" +
                "Timestamp: {}\n" +
                "======================================================================\n";
        logger.info(format, to, code, timestamp);
    }

    @Override
    public void sendEmailVerificationCode(String to, String code) {
        String timestamp = java.time.LocalDateTime.now().toString().substring(0, 19);
        String format = "\n" +
                "======================================================================\n" +
                "EMAIL VERIFICATION\n" +
                "Recipient: {}\n" +
                "Verification Code: {}\n" +
                "Timestamp: {}\n" +
                "======================================================================\n";
        logger.info(format, to, code, timestamp);
    }
}
