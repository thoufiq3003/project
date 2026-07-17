package com.example.Turf.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ball_logs")
public class BallLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long matchId;
    private String innings; // "FIRST_INNINGS" or "SECOND_INNINGS"
    
    private String striker;
    private String bowler;

    // The exact numbers added during this specific ball (Deltas)
    private int teamRunsAdded;
    private int teamBallsAdded;
    private int teamWicketsAdded;
    
    private int strikerRunsAdded;
    private int strikerBallsAdded;
    
    private int bowlerBallsAdded;
    private int bowlerWicketsAdded;
    
    private boolean strikerWasOut;
    private boolean madeFreeHitActive; // Did THIS ball trigger a free hit?
    private boolean wasFreeHitActive;  // Was a free hit already active BEFORE this ball?

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
    public String getInnings() { return innings; }
    public void setInnings(String innings) { this.innings = innings; }
    public String getStriker() { return striker; }
    public void setStriker(String striker) { this.striker = striker; }
    public String getBowler() { return bowler; }
    public void setBowler(String bowler) { this.bowler = bowler; }
    public int getTeamRunsAdded() { return teamRunsAdded; }
    public void setTeamRunsAdded(int teamRunsAdded) { this.teamRunsAdded = teamRunsAdded; }
    public int getTeamBallsAdded() { return teamBallsAdded; }
    public void setTeamBallsAdded(int teamBallsAdded) { this.teamBallsAdded = teamBallsAdded; }
    public int getTeamWicketsAdded() { return teamWicketsAdded; }
    public void setTeamWicketsAdded(int teamWicketsAdded) { this.teamWicketsAdded = teamWicketsAdded; }
    public int getStrikerRunsAdded() { return strikerRunsAdded; }
    public void setStrikerRunsAdded(int strikerRunsAdded) { this.strikerRunsAdded = strikerRunsAdded; }
    public int getStrikerBallsAdded() { return strikerBallsAdded; }
    public void setStrikerBallsAdded(int strikerBallsAdded) { this.strikerBallsAdded = strikerBallsAdded; }
    public int getBowlerBallsAdded() { return bowlerBallsAdded; }
    public void setBowlerBallsAdded(int bowlerBallsAdded) { this.bowlerBallsAdded = bowlerBallsAdded; }
    public int getBowlerWicketsAdded() { return bowlerWicketsAdded; }
    public void setBowlerWicketsAdded(int bowlerWicketsAdded) { this.bowlerWicketsAdded = bowlerWicketsAdded; }
    public boolean isStrikerWasOut() { return strikerWasOut; }
    public void setStrikerWasOut(boolean strikerWasOut) { this.strikerWasOut = strikerWasOut; }
    public boolean isMadeFreeHitActive() { return madeFreeHitActive; }
    public void setMadeFreeHitActive(boolean madeFreeHitActive) { this.madeFreeHitActive = madeFreeHitActive; }
    public boolean isWasFreeHitActive() { return wasFreeHitActive; }
    public void setWasFreeHitActive(boolean wasFreeHitActive) { this.wasFreeHitActive = wasFreeHitActive; }
}