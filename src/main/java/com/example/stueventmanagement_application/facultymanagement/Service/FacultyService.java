package com.example.stueventmanagement_application.facultymanagement.Service;

import com.example.stueventmanagement_application.facultymanagement.Model.Faculty;
import com.example.stueventmanagement_application.facultymanagement.Repository.FacultyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FacultyService {

    @Autowired
    private FacultyRepository repo;

    public Faculty register(Faculty f) {
        return repo.save(f);
    }

    public Faculty login(String email, String password) {
        Faculty f = repo.findByEmail(email);
        if (f != null && f.getPassword().equals(password)) {
            return f;
        }
        return null;
    }

    public java.util.List<Faculty> getAllFaculty() {
        return repo.findAll();
    }

    public Faculty getFacultyById(String id) {
        return repo.findById(id).orElse(null);
    }

    public Faculty updateFaculty(String id, Faculty newFaculty) {
        Faculty existing = getFacultyById(id);
        if (existing != null) {
            existing.setFacultyId(newFaculty.getFacultyId());
            existing.setName(newFaculty.getName());
            existing.setEmail(newFaculty.getEmail());
            if (newFaculty.getPassword() != null && !newFaculty.getPassword().isEmpty()) {
                existing.setPassword(newFaculty.getPassword());
            }
            return repo.save(existing);
        }
        return null;
    }

    public void deleteFaculty(String id) {
        repo.deleteById(id);
    }
}