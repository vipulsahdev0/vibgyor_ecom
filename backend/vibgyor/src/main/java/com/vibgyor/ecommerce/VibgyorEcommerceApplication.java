package com.vibgyor.ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
public class VibgyorEcommerceApplication {

    public static void main(String[] args) {
        SpringApplication.run(VibgyorEcommerceApplication.class, args);
    }

}
