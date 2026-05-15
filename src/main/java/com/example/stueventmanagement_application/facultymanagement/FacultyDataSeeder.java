package com.example.stueventmanagement_application.facultymanagement;

import com.example.stueventmanagement_application.facultymanagement.Model.Faculty;
import com.example.stueventmanagement_application.facultymanagement.Repository.FacultyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FacultyDataSeeder {

    @Bean
    CommandLineRunner initFacultyDatabase(FacultyRepository repo) {
        return args -> {
            // Check if this specific test faculty exists
            if (repo.findByEmail("faculty@ssn.edu.in") == null) {
                Faculty f = new Faculty();
                f.setEmail("faculty@ssn.edu.in");
                f.setPassword("password"); 
                f.setFacultyId("F001");
                repo.save(f);
                System.out.println("Ã¢Å“â€¦ GUARANTEED FACULTY CREATED: faculty@ssn.edu.in / password");
            } else {
                System.out.println("Ã¢Å“â€¦ FACULTY ALREADY EXISTS: faculty@ssn.edu.in");
            }
        };
    }
}