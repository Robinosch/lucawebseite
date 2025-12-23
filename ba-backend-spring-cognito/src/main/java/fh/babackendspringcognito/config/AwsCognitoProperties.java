package fh.babackendspringcognito.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * AWS Cognito configuration properties.
 * Used for all AWS Cognito integration (H3a, H5, H6).
 */
@Configuration
@ConfigurationProperties(prefix = "aws")
@Data
public class AwsCognitoProperties {

    private String region;

    private Cognito cognito = new Cognito();

    @Data
    public static class Cognito {
        private String userPoolId;
        private String clientId;
        private String clientSecret;
        private String jwksUri;
        private String issuerUri;
    }
}

