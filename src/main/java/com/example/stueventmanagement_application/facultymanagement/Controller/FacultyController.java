package com.example.stueventmanagement_application.facultymanagement.Controller;


import com.example.stueventmanagement_application.facultymanagement.Model.Faculty;
import com.example.stueventmanagement_application.facultymanagement.Service.FacultyService;
import com.example.stueventmanagement_application.facultymanagement.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/faculty")
@CrossOrigin(origins = "*")
public class FacultyController {

    @Autowired
    private FacultyService service;

    // Standard REST GET
    @org.springframework.web.bind.annotation.GetMapping
    public java.util.List<Faculty> getAllFaculty() {
        return service.getAllFaculty();
    }

    // Standard REST POST
    @PostMapping
    public Faculty addFaculty(@RequestBody Faculty f) {
        return service.register(f);
    }

    // Standard REST PUT
    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public Faculty updateFaculty(@org.springframework.web.bind.annotation.PathVariable String id, @RequestBody Faculty f) {
        return service.updateFaculty(id, f);
    }

    // Standard REST DELETE
    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public void deleteFaculty(@org.springframework.web.bind.annotation.PathVariable String id) {
        service.deleteFaculty(id);
    }

    // Existing Legacy Register
    @PostMapping("/register")
    public Faculty register(@RequestBody Faculty f) {
        return service.register(f);
    }

    // Existing Login
    @PostMapping("/login")
    public String login(@RequestBody Faculty f) {
        Faculty user = service.login(f.getEmail(), f.getPassword());

        if (user != null) {
            return JwtUtil.generateToken(user.getFacultyId());
        }
        return "Invalid credentials";
    }
}