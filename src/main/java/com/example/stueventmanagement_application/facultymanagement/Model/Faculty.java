package com.example.stueventmanagement_application.facultymanagement.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection="faculty")
public class Faculty {
    @Id
    private String id;
    private String facultyId;
    private String name;
    private String email;
    private String password;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}