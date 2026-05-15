package com.example.stueventmanagement_application.studentmanagement.Repository;

import com.example.stueventmanagement_application.studentmanagement.Model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudentRepository extends MongoRepository<com.example.stueventmanagement_application.studentmanagement.Model.Student, String> {
    Student findByEmail(String email);
}