package com.example.stueventmanagement_application.eventmanagement.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "events")
public class Event {

    @Id
    private String id;
    private String name;
    private String venue;
    private String description;
    private LocalDate date;
    private String time;
    private String facultyId;
    private int totalSeats;
    private int availableSeats;

    // To store student roll numbers (registered)
    private List<Integer> registeredStudents = new ArrayList<>();

    // To store student roll numbers who cancelled
    private List<Integer> cancelledStudents = new ArrayList<>();

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }

    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }

    public int getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(int availableSeats) { this.availableSeats = availableSeats; }

    public List<Integer> getRegisteredStudents() { return registeredStudents; }
    public void setRegisteredStudents(List<Integer> registeredStudents) {
        this.registeredStudents = registeredStudents;
    }

    public List<Integer> getCancelledStudents() { return cancelledStudents; }
    public void setCancelledStudents(List<Integer> cancelledStudents) {
        this.cancelledStudents = cancelledStudents;
    }
}