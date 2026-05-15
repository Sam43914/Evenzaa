package com.example.stueventmanagement_application.eventmanagement.Controller;

import com.example.stueventmanagement_application.eventmanagement.Model.Event;
import com.example.stueventmanagement_application.eventmanagement.Service.EventService;
import com.example.stueventmanagement_application.eventmanagement.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/events")
@CrossOrigin(origins = "*", allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class EventController {

    @Autowired
    private EventService service;

    // â”€â”€â”€ CREATE EVENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    @PostMapping("/")
    public Event addEvent(@RequestBody Event event,
                          @RequestHeader("Authorization") String token) {
        String facultyId = JwtUtil.validateToken(token.substring(7));
        event.setFacultyId(facultyId);
        return service.addEvent(event);
    }

    // â”€â”€â”€ GET ALL EVENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    @GetMapping("/")
    public List<Event> getAllEvents() {
        return service.getAllEvents();
    }

    // â”€â”€â”€ GET EVENT BY ID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    @GetMapping("/{id}")
    public Event getById(@PathVariable String id) {
        return service.getById(id).orElse(null);
    }

    // â”€â”€â”€ GET STUDENT'S REGISTERED EVENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    @GetMapping("/student/{rollNo}")
    public List<Event> getByStudent(@PathVariable Integer rollNo) {
        return service.getByStudent(rollNo);
    }

    // â”€â”€â”€ GET STUDENT'S CANCELLED EVENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    @GetMapping("/cancelled/{rollNo}")
    public List<Event> getCancelledByStudent(@PathVariable Integer rollNo) {
        return service.getCancelledByStudent(rollNo);
    }

    // â”€â”€â”€ GET EVENTS BY MONTH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    @GetMapping("/month/{month}")
    public List<Event> getByMonth(@PathVariable int month) {
        return service.getByMonth(month);
    }

    // â”€â”€â”€ REGISTER STUDENT FOR EVENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    @PostMapping("/register/{eventId}/{rollNo}")
    public Map<String, String> registerStudent(@PathVariable String eventId, @PathVariable Integer rollNo) {
        String result = service.registerStudent(eventId, rollNo);
        Map<String, String> response = new HashMap<>();
        response.put("message", result);
        return response;
    }

    // â”€â”€â”€ CANCEL STUDENT REGISTRATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    @PostMapping("/cancel/{eventId}/{rollNo}")
    public Map<String, String> cancelRegistration(@PathVariable String eventId, @PathVariable Integer rollNo) {
        String result = service.cancelRegistration(eventId, rollNo);
        Map<String, String> response = new HashMap<>();
        response.put("message", result);
        return response;
    }

    // â”€â”€â”€ UPDATE EVENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    @PutMapping("/{id}")
    public Event updateEvent(@PathVariable String id,
                             @RequestBody Event event,
                             @RequestHeader("Authorization") String token) {
        String facultyId = JwtUtil.validateToken(token.substring(7));
        return service.updateEvent(id, event, facultyId);
    }

    // â”€â”€â”€ DELETE EVENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    @DeleteMapping("/{id}")
    public Map<String, String> deleteEvent(@PathVariable String id,
                              @RequestHeader("Authorization") String token) {
        String facultyId = JwtUtil.validateToken(token.substring(7));
        String result = service.deleteEvent(id, facultyId);
        Map<String, String> response = new HashMap<>();
        response.put("message", result);
        return response;
    }
}