package fh.babackendspringcognito;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import java.time.LocalDateTime;

/**
 * Main Application Class for AWS Cognito Backend
 */
@Slf4j
@SpringBootApplication
@EnableConfigurationProperties
public class BaBackendSpringCognitoApplication {

    public static void main(String[] args) {
        SpringApplication.run(BaBackendSpringCognitoApplication.class, args);
    }
}


