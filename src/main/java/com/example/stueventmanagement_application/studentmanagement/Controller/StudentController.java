package com.example.stueventmanagement_application.studentmanagement.Controller;

import com.example.stueventmanagement_application.studentmanagement.Model.LoginRequest;
import com.example.stueventmanagement_application.studentmanagement.Model.Student;
import com.example.stueventmanagement_application.studentmanagement.Repository.StudentRepository;
import com.example.stueventmanagement_application.studentmanagement.Service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/student")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class StudentController {

    @Autowired
    private StudentService service;
    
    @Autowired
    private StudentRepository repo;

    @PostMapping("/register")
    public Student register(@RequestBody Student student) {
        return service.register(student);
    }

    @PostMapping("/login")
    public Object login(@RequestBody LoginRequest request) {
        String token = service.login(request.getEmail(), request.getPassword());
        
        if (token != null) {
            Student student = repo.findByEmail(request.getEmail());
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("student", student);
            return response;
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("error", "Invalid credentials");
        return error;
    }

    @GetMapping("/events/{rollNo}")
    public Object getEvents(@PathVariable Integer rollNo) {
        return service.getStudentEvents(rollNo);
    }
}