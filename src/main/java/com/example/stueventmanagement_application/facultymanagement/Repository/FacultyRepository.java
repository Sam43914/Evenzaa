package com.example.stueventmanagement_application.facultymanagement.Repository;

import com.example.stueventmanagement_application.facultymanagement.Model.Faculty;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FacultyRepository extends MongoRepository<Faculty, String> {
    Faculty findByEmail(String email);
}