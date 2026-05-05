package com.hmi.alarm.config;

import com.hmi.alarm.entity.Role;
import com.hmi.alarm.entity.User;
import com.hmi.alarm.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder encoder) {
        return args -> {
            if (userRepository.count() > 0) {
                log.info("Users already exist, skipping seed");
                return;
            }

            User admin = new User("admin", "admin@hmi.local",
                    encoder.encode("admin123"), Role.ROLE_ADMIN);
            User operator = new User("operator", "operator@hmi.local",
                    encoder.encode("operator123"), Role.ROLE_OPERATOR);

            userRepository.save(admin);
            userRepository.save(operator);

            log.info("==============================================");
            log.info(" Default users seeded:");
            log.info("   ADMIN    -> username: admin    / password: admin123");
            log.info("   OPERATOR -> username: operator / password: operator123");
            log.info(" Please change these credentials in production!");
            log.info("==============================================");
        };
    }
}
