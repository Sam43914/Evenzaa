package com.example.stueventmanagement_application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication(scanBasePackages = "com.example")
@RestController
public class StuEventManagementApplication {

    @Value("${server.port:8080}")
    private String port;

    public static void main(String[] args) {
        System.out.println("Starting application... checking Railway deployment config");
        SpringApplication.run(StuEventManagementApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @PostConstruct
    public void init() {
        System.out.println("=========================================");
        System.out.println("Application started successfully");
        System.out.println("Port configured to: " + port);
        System.out.println("=========================================");
    }

}