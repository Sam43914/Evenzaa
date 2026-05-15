package com.example.stueventmanagement_application.eventmanagement.Service;

import com.example.stueventmanagement_application.eventmanagement.Model.Event;
import com.example.stueventmanagement_application.eventmanagement.Repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    @Autowired
    private EventRepository repo;

    public Event addEvent(Event event) {
        if (event.getRegisteredStudents() == null) {
            event.setRegisteredStudents(new ArrayList<>());
        }
        if (event.getCancelledStudents() == null) {
            event.setCancelledStudents(new ArrayList<>());
        }
        // Initialize availableSeats = totalSeats on creation
        if (event.getAvailableSeats() == 0 && event.getTotalSeats() > 0) {
            event.setAvailableSeats(event.getTotalSeats());
        }
        return repo.save(event);
    }

    public List<Event> getAllEvents() {
        return repo.findAll();
    }

    public Optional<Event> getById(String id) {
        return repo.findById(id);
    }

    public List<Event> getByStudent(Integer rollNo) {
        return repo.findByStudentRollNo(rollNo);
    }

    public List<Event> getCancelledByStudent(Integer rollNo) {
        return repo.findAll().stream()
                .filter(e -> e.getCancelledStudents() != null && e.getCancelledStudents().contains(rollNo))
                .toList();
    }

    public List<Event> getByMonth(int month) {
        return repo.findAll()
                .stream()
                .filter(e -> e.getDate().getMonthValue() == month)
                .toList();
    }

    public Event updateEvent(String id, Event newEvent, String facultyId) {
        Event existing = repo.findById(id).orElse(null);

        if (existing != null && existing.getFacultyId().equals(facultyId)) {
            existing.setName(newEvent.getName());
            existing.setVenue(newEvent.getVenue());
            existing.setDescription(newEvent.getDescription());
            existing.setDate(newEvent.getDate());
            existing.setTime(newEvent.getTime());
            // Update seats only if provided
            if (newEvent.getTotalSeats() > 0) {
                int delta = newEvent.getTotalSeats() - existing.getTotalSeats();
                existing.setTotalSeats(newEvent.getTotalSeats());
                existing.setAvailableSeats(Math.max(0, existing.getAvailableSeats() + delta));
            }
            return repo.save(existing);
        }
        return null;
    }

    public String deleteEvent(String id, String facultyId) {
        Event existing = repo.findById(id).orElse(null);

        if (existing != null && existing.getFacultyId().equals(facultyId)) {
            repo.deleteById(id);
            return "Deleted Successfully";
        }
        return "Unauthorized";
    }

    public String registerStudent(String eventId, Integer rollNo) {
        Event existing = repo.findById(eventId).orElse(null);
        if (existing != null) {
            if (existing.getRegisteredStudents() == null) {
                existing.setRegisteredStudents(new ArrayList<>());
            }
            if (existing.getCancelledStudents() == null) {
                existing.setCancelledStudents(new ArrayList<>());
            }

            if (existing.getRegisteredStudents().contains(rollNo)) {
                return "Already Registered";
            }

            // Check seat availability (0 totalSeats means unlimited)
            if (existing.getTotalSeats() > 0 && existing.getAvailableSeats() <= 0) {
                return "Housefull - No seats available";
            }

            // Remove from cancelled if re-registering
            existing.getCancelledStudents().remove(rollNo);

            existing.getRegisteredStudents().add(rollNo);

            // Decrease available seats
            if (existing.getTotalSeats() > 0) {
                existing.setAvailableSeats(existing.getAvailableSeats() - 1);
            }

            repo.save(existing);
            return "Successfully Registered";
        }
        return "Event Not Found";
    }

    public String cancelRegistration(String eventId, Integer rollNo) {
        Event existing = repo.findById(eventId).orElse(null);
        if (existing != null) {
            if (existing.getRegisteredStudents() == null || !existing.getRegisteredStudents().contains(rollNo)) {
                return "Not Registered";
            }

            existing.getRegisteredStudents().remove(rollNo);

            if (existing.getCancelledStudents() == null) {
                existing.setCancelledStudents(new ArrayList<>());
            }
            existing.getCancelledStudents().add(rollNo);

            // Increase available seats
            if (existing.getTotalSeats() > 0) {
                existing.setAvailableSeats(Math.min(existing.getTotalSeats(), existing.getAvailableSeats() + 1));
            }

            repo.save(existing);
            return "Registration Cancelled";
        }
        return "Event Not Found";
    }
}