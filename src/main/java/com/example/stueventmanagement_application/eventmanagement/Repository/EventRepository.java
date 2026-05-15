package com.example.stueventmanagement_application.eventmanagement.Repository;

import com.example.stueventmanagement_application.eventmanagement.Model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByFacultyId(String facultyId);

    // This searches for events where the rollNo exists in the registeredStudents list
    @Query("{ 'registeredStudents': ?0 }")
    List<Event> findByStudentRollNo(Integer rollNo);
}