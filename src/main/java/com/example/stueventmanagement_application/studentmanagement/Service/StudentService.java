package com.example.stueventmanagement_application.studentmanagement.Service;

import com.example.stueventmanagement_application.studentmanagement.Model.Student;
import com.example.stueventmanagement_application.studentmanagement.Repository.StudentRepository;
import com.example.stueventmanagement_application.studentmanagement.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class StudentService {

    @Autowired
    private StudentRepository repo;

    @Autowired
    private RestTemplate restTemplate;

    // Register
    public Student register(Student student) {
        return repo.save(student);
    }

    // Login + JWT
    public String login(String email, String password) {
        Student student = repo.findByEmail(email);

        if (student != null && student.getPassword().equals(password)) {
            String subject = (student.getRollNo() != null) ? student.getRollNo().toString() : student.getEmail();
            return JwtUtil.generateToken(subject);
        }
        return null;
    }

    // View Events (calls Event Service)
    public Object getStudentEvents(Integer rollNo) {
        String url = "http://localhost:8085/events/student/" + rollNo;

        ResponseEntity<Object> response =
                restTemplate.getForEntity(url, Object.class);

        return response.getBody();
    }
}