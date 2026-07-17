package com.example.Turf.model;

import jakarta.persistence.*;

@Entity
@Table(name = "players")
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // Links this player to the logged-in user's profile

    private String name;
    
    private String phone;
    
    private String role; // Batsman, Bowler, All-Rounder, Wicket Keeper
    
    private Integer matchesPlayed;

    // Constructors
    public Player() {}

    public Player(Long userId, String name, String phone, String role, Integer matchesPlayed) {
        this.userId = userId;
        this.name = name;
        this.phone = phone;
        this.role = role;
        this.matchesPlayed = matchesPlayed;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getMatchesPlayed() {
        return matchesPlayed;
    }

    public void setMatchesPlayed(Integer matchesPlayed) {
        this.matchesPlayed = matchesPlayed;
    }
}
