package com.example.stueventmanagement_application.eventmanagement;

import com.example.stueventmanagement_application.eventmanagement.Model.Event;
import com.example.stueventmanagement_application.eventmanagement.Repository.EventRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.ArrayList;

@Configuration
public class EventDataSeeder {

    @Bean
    CommandLineRunner initEventDatabase(EventRepository repo) {
        return args -> {
            if (repo.findAll().isEmpty()) {
                // Event 1: Hackathon
                Event e1 = new Event();
                e1.setName("Hackathon 2026");
                e1.setVenue("Room 303, Coding Complex");
                e1.setDescription("Annual SSN Coding Hackathon! Compete with the best minds across departments.");
                e1.setDate(LocalDate.of(2026, 4, 15));
                e1.setTime("09:00 AM");
                e1.setFacultyId("F001");
                e1.setTotalSeats(50);
                e1.setAvailableSeats(49);
                e1.setRegisteredStudents(new ArrayList<>());
                e1.getCancelledStudents();
                repo.save(e1);

                // Event 2: Cultural Fest
                Event e2 = new Event();
                e2.setName("Cultural Fest 2026");
                e2.setVenue("Main Auditorium");
                e2.setDescription("Annual cultural extravaganza featuring music, dance, drama and art from all departments.");
                e2.setDate(LocalDate.of(2026, 4, 20));
                e2.setTime("10:00 AM");
                e2.setFacultyId("F001");
                e2.setTotalSeats(200);
                e2.setAvailableSeats(200);
                e2.setRegisteredStudents(new ArrayList<>());
                repo.save(e2);

                // Event 3: Tech Summit
                Event e3 = new Event();
                e3.setName("Tech Summit 2026");
                e3.setVenue("Conference Hall B");
                e3.setDescription("Industry leaders speak on AI, Cloud, and emerging technologies. Networking opportunity!");
                e3.setDate(LocalDate.of(2026, 5, 5));
                e3.setTime("11:00 AM");
                e3.setFacultyId("F002");
                e3.setTotalSeats(100);
                e3.setAvailableSeats(100);
                e3.setRegisteredStudents(new ArrayList<>());
                repo.save(e3);

                System.out.println("Ã¢Å“â€¦ Evenza: 3 seed events created successfully.");
            }
        };
    }
}