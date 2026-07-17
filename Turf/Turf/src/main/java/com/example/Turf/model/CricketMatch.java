package com.example.Turf.model;

import jakarta.persistence.*;

@Entity
@Table(name = "matches")
public class CricketMatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;

    private String teamAName;
    private String teamBName;
    private int playerLimit; 
    private int maxOvers; 

    @Column(length = 1000) private String teamAPlayers; 
    @Column(length = 1000) private String teamBPlayers; 

    private String tossWinner;
    private String tossDecision;
    private int teamARuns = 0;
    private int teamAWickets = 0;
    private int teamAOvers = 0;
    private int teamABalls = 0;

    private int teamBRuns = 0;
    private int teamBWickets = 0;
    private int teamBOvers = 0;
    private int teamBBalls = 0;

    private String battingFirstTeam;  
    private String battingSecondTeam; 
    
    private String status = "SETUP";  // SETUP, TOSS, FIRST_INNINGS, SECOND_INNINGS, FINISHED
    private String winner;
    
    private boolean freeHit = false; // Tracks if the next ball is a free hit

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTeamAName() { return teamAName; }
    public void setTeamAName(String teamAName) { this.teamAName = teamAName; }
    public String getTeamBName() { return teamBName; }
    public void setTeamBName(String teamBName) { this.teamBName = teamBName; }
    public int getPlayerLimit() { return playerLimit; }
    public void setPlayerLimit(int playerLimit) { this.playerLimit = playerLimit; }
    public int getMaxOvers() { return maxOvers; }
    public void setMaxOvers(int maxOvers) { this.maxOvers = maxOvers; }
    public String getTeamAPlayers() { return teamAPlayers; }
    public void setTeamAPlayers(String teamAPlayers) { this.teamAPlayers = teamAPlayers; }
    public String getTeamBPlayers() { return teamBPlayers; }
    public void setTeamBPlayers(String teamBPlayers) { this.teamBPlayers = teamBPlayers; }
    
    public String getTossWinner() { return tossWinner; }
    public void setTossWinner(String tossWinner) { this.tossWinner = tossWinner; }
    
    // ADD THESE TWO LINES
    public String getTossDecision() { return tossDecision; }
    public void setTossDecision(String tossDecision) { this.tossDecision = tossDecision; }
    public int getTeamARuns() { return teamARuns; }
    public void setTeamARuns(int teamARuns) { this.teamARuns = teamARuns; }
    public int getTeamAWickets() { return teamAWickets; }
    public void setTeamAWickets(int teamAWickets) { this.teamAWickets = teamAWickets; }
    public int getTeamAOvers() { return teamAOvers; }
    public void setTeamAOvers(int teamAOvers) { this.teamAOvers = teamAOvers; }
    public int getTeamABalls() { return teamABalls; }
    public void setTeamABalls(int teamABalls) { this.teamABalls = teamABalls; }

    public int getTeamBRuns() { return teamBRuns; }
    public void setTeamBRuns(int teamBRuns) { this.teamBRuns = teamBRuns; }
    public int getTeamBWickets() { return teamBWickets; }
    public void setTeamBWickets(int teamBWickets) { this.teamBWickets = teamBWickets; }
    public int getTeamBOvers() { return teamBOvers; }
    public void setTeamBOvers(int teamBOvers) { this.teamBOvers = teamBOvers; }
    public int getTeamBBalls() { return teamBBalls; }
    public void setTeamBBalls(int teamBBalls) { this.teamBBalls = teamBBalls; }

    public String getBattingFirstTeam() { return battingFirstTeam; }
    public void setBattingFirstTeam(String battingFirstTeam) { this.battingFirstTeam = battingFirstTeam; }
    public String getBattingSecondTeam() { return battingSecondTeam; }
    public void setBattingSecondTeam(String battingSecondTeam) { this.battingSecondTeam = battingSecondTeam; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getWinner() { return winner; }
    public void setWinner(String winner) { this.winner = winner; }
    
    public boolean isFreeHit() { return freeHit; }
    public void setFreeHit(boolean freeHit) { this.freeHit = freeHit; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}