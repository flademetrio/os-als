package br.com.osals;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan("br.com.osals")
public class OsAlsApplication {

    public static void main(String[] args) {
        SpringApplication.run(OsAlsApplication.class, args);
    }
}
