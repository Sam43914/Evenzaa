package com.example.stueventmanagement_application.studentmanagement;

import com.example.stueventmanagement_application.studentmanagement.Model.Student;
import com.example.stueventmanagement_application.studentmanagement.Repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StudentDataSeeder {

    @Bean
    CommandLineRunner initStudentDatabase(StudentRepository repo) {
        return args -> {
            if (repo.findByEmail("stu@ssn.edu.in") == null) {
                Student s = new Student();
                s.setName("Test Student");
                s.setEmail("stu@ssn.edu.in");
                s.setPassword("password");
                s.setRollNo(23001);
                s.setPhone("9876543210");
                s.setDepartment("Computer Science");
                repo.save(s);
                System.out.println("Ã¢Å“â€¦ TEST STUDENT CREATED: stu@ssn.edu.in / password");
            }
        };
    }
}